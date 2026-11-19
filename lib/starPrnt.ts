// Turns slip lines (see lib/receipt.ts) into what a Star mC-Print3 prints, and
// checks slip lines that arrive from the browser before they are queued.
// No database or network code here, so it can be tested on its own.
import { SLIP_WIDTH, printable } from "./receipt.ts";
import type { SlipLine } from "./receipt.ts";

const ESC = 0x1b;
const GS = 0x1d;
const MAX_LINES = 150;

// Media types the printer is told it can be sent.
export const STARPRNT = "application/vnd.star.starprnt";
export const PLAIN_TEXT = "text/plain";

// Large lines print double size, so they hold half as many characters.
const widthOf = (line: SlipLine) => (line.large ? SLIP_WIDTH / 2 : SLIP_WIDTH);

// Accepts only what lib/receipt.ts produces: a modest number of short lines of
// basic Latin text. Anything else is refused, so the public print button can't
// be used to push arbitrary data at the printer.
export function cleanSlipLines(input: unknown): SlipLine[] | null {
	if (!Array.isArray(input) || input.length === 0 || input.length > MAX_LINES) return null;
	const lines: SlipLine[] = [];
	for (const item of input) {
		if (!item || typeof item !== "object" || typeof (item as SlipLine).text !== "string") return null;
		const { text, center, large, bold } = item as SlipLine;
		const clean: SlipLine = { text: printable(text).length ? text.replace(/\s+$/, "") : "" };
		clean.text = clean.text.replace(/[^\x20-\x7e]/g, "?");
		if (clean.text.length > widthOf({ text, large })) return null;
		if (center) clean.center = true;
		if (large) clean.large = true;
		if (bold) clean.bold = true;
		lines.push(clean);
	}
	return lines;
}

// StarPRNT bytes: reset, then each line with its alignment and style, then
// feed the paper past the blade and cut.
export function toStarPrnt(lines: SlipLine[]): Buffer {
	const parts: Buffer[] = [Buffer.from([ESC, 0x40])];
	for (const line of lines) {
		parts.push(Buffer.from([ESC, GS, 0x61, line.center ? 1 : 0]));
		if (line.bold) parts.push(Buffer.from([ESC, 0x45]));
		if (line.large) parts.push(Buffer.from([ESC, 0x69, 1, 1]));
		parts.push(Buffer.from(`${line.text}\n`, "latin1"));
		if (line.large) parts.push(Buffer.from([ESC, 0x69, 0, 0]));
		if (line.bold) parts.push(Buffer.from([ESC, 0x46]));
	}
	parts.push(Buffer.from([ESC, GS, 0x61, 0]), Buffer.from("\n\n"), Buffer.from([ESC, 0x64, 0x03]));
	return Buffer.concat(parts);
}

// Fallback if the printer rejects the formatted version: plain text, centred
// by padding. No bold or large text.
export function toPlain(lines: SlipLine[]): string {
	return (
		lines
			.map((line) => (line.center ? " ".repeat(Math.max(0, (widthOf(line) - line.text.length) >> 1)) + line.text : line.text))
			.join("\n") + "\n\n\n"
	);
}
