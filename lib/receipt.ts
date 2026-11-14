// Lays out the printed slip for a saved tip breakdown: plain lines of text
// that fit 80mm paper (48 characters per line in the printer's normal font).
// Nothing here talks to the printer; lib/printer.ts sends the lines.
// It only reads the saved numbers. The tip split itself is in lib/tipSplit.
import { money } from "./money.ts";
import type { TipBreakdown } from "../types/models";

export const SLIP_WIDTH = 48;

// Large lines print double size, so they hold half as many characters.
export type SlipLine = { text: string; center?: boolean; large?: boolean; bold?: boolean };

type Worker = { label?: string; tippedHours?: number | string; tipOut?: unknown };

const RULE = "-".repeat(SLIP_WIDTH);
const AMOUNT_WIDTH = 12; // fits "$999,999.99" with a space before it
const HOURS_WIDTH = 10;

// The printer's built-in font is basic Latin: "José" prints as "Jose", and
// anything else it can't print becomes "?".
export const printable = (value: unknown) =>
	String(value ?? "")
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/[‘’]/g, "'")
		.replace(/[“”]/g, '"')
		.replace(/[–—]/g, "-")
		.replace(/\s+/g, " ")
		.replace(/[^\x20-\x7e]/g, "?")
		.trim();

const fit = (value: string, width: number) =>
	value.length > width ? value.slice(0, width) : value.padEnd(width);

// "Bar Sales                    $6,601.50"
const totalRow = (label: string, amount: unknown) =>
	fit(label, SLIP_WIDTH - AMOUNT_WIDTH) + `$${money(amount)}`.padStart(AMOUNT_WIDTH);

// Breaks long text (show names, notes) into lines of at most `width`.
export function wrap(value: string, width: number): string[] {
	const lines: string[] = [];
	let line = "";
	for (let word of value.split(" ")) {
		while (word.length > width) {
			if (line) lines.push(line);
			lines.push(word.slice(0, width));
			word = word.slice(width);
			line = "";
		}
		if (!line) line = word;
		else if (line.length + 1 + word.length <= width) line += ` ${word}`;
		else {
			lines.push(line);
			line = word;
		}
	}
	if (line) lines.push(line);
	return lines;
}

// "Show: A Very Long Name" with the following lines indented under the name.
const labelled = (label: string, value: string): SlipLine[] =>
	wrap(value, SLIP_WIDTH - label.length).map((text, index) => ({
		text: (index === 0 ? label : " ".repeat(label.length)) + text,
	}));

// One role: a heading, then a line per person. The hours column is left out
// when nobody in the role has hours, the same as on the breakdown page.
function roleSection(title: string, workers: Worker[]): SlipLine[] {
	if (workers.length === 0) return [];
	const showHours = workers.some((worker) => Number(worker.tippedHours) > 0);
	const nameWidth = SLIP_WIDTH - AMOUNT_WIDTH - (showHours ? HOURS_WIDTH : 0);
	return [
		{ text: title, bold: true },
		...workers.map((worker) => ({
			text:
				fit(printable(worker.label), nameWidth) +
				(showHours ? `${Number(worker.tippedHours) || 0} hrs`.padStart(HOURS_WIDTH) : "") +
				`$${money(worker.tipOut)}`.padStart(AMOUNT_WIDTH),
		})),
		{ text: RULE },
	];
}

export function breakdownSlip(breakDown: TipBreakdown, printedAt: string): SlipLine[] {
	const notes = printable(breakDown.shiftNotes);
	return [
		{ text: "TERAGRAM BALLROOM", center: true, large: true },
		{ text: "CREDIT CARD TIPS", center: true },
		{ text: RULE },
		...labelled("Show: ", printable(breakDown.show)),
		{ text: `Date: ${printable(breakDown.date)}` },
		{ text: RULE },
		// Older breakdowns were saved without bar sales.
		...(Number(breakDown.totalBarSales) > 0
			? [{ text: totalRow("Bar Sales", breakDown.totalBarSales) }]
			: []),
		{ text: totalRow("Total Tips", breakDown.totalTips) },
		...(Number(breakDown.foodSales) > 0
			? [{ text: totalRow("Food Sales", breakDown.foodSales) }]
			: []),
		{ text: RULE },
		...roleSection("BARTENDERS", breakDown.BartenderTips ?? []),
		...roleSection("BAR BACKS", breakDown.barBackTips ?? []),
		...roleSection("COOKS", breakDown.cookTips ?? []),
		...(notes ? labelled("Notes: ", notes) : []),
		{ text: `Printed ${printedAt}` },
	];
}

export function testSlip(address: string, printedAt: string): SlipLine[] {
	return [
		{ text: "TIP JAR", center: true, large: true },
		{ text: "Test print", center: true },
		{ text: RULE },
		{ text: "If you can read this, the printer is set up." },
		{ text: `Printer address: ${printable(address)}` },
		{ text: `Printed ${printedAt}` },
	];
}
