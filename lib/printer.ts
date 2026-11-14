// Sends a slip from the browser straight to an Epson TM-m30II on the same
// network, using the printer's built-in ePOS-Print service over HTTPS (the
// same request Epson's JavaScript SDK makes). The site's server is never
// involved: it can't see the venue's network.
//
// The printer's address is different at each location, so it is saved on the
// device (localStorage), not in the code or the database.
import type { SlipLine } from "./receipt.ts";

const STORAGE_KEY = "printerAddress";
// How long the printer waits on its own job, and how long we wait for it.
const PRINTER_TIMEOUT_MS = 8000;
const REQUEST_TIMEOUT_MS = 12000;

export type PrintResult = {
	ok: boolean;
	message: string;
	// Set when the printer's certificate may need accepting: the page to open.
	trustUrl?: string;
	// Set when no printer address is saved on this device.
	needsSetup?: boolean;
};

// "https://192.168.1.171/" -> "192.168.1.171". Null when it isn't an address.
export function cleanAddress(input: string): string | null {
	const address = input
		.trim()
		.replace(/^https?:\/\//i, "")
		.replace(/\/.*$/, "");
	return /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?(:\d{1,5})?$/i.test(address) ? address : null;
}

// Private browsing and blocked site data make localStorage throw.
export function savedPrinterAddress(): string {
	try {
		return window.localStorage.getItem(STORAGE_KEY) || "";
	} catch {
		return "";
	}
}

export function savePrinterAddress(address: string): boolean {
	try {
		window.localStorage.setItem(STORAGE_KEY, address);
		return true;
	} catch {
		return false;
	}
}

const escapeXml = (value: string) =>
	value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// The print job: every line with its own alignment and size, then feed the
// paper past the blade and cut.
export function slipXml(lines: SlipLine[]): string {
	const body = lines
		.map(
			(line) =>
				`<text align="${line.center ? "center" : "left"}" dw="${!!line.large}" dh="${!!line.large}" em="${!!line.bold}">` +
				`${escapeXml(line.text)}&#10;</text>`
		)
		.join("");
	return (
		'<?xml version="1.0" encoding="utf-8"?>' +
		'<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body>' +
		'<epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">' +
		'<text lang="en" smooth="true"/>' +
		body +
		'<cut type="feed"/>' +
		"</epos-print></s:Body></s:Envelope>"
	);
}

// What the printer says when it gets the job but can't print it.
const PRINTER_PROBLEMS: Record<string, string> = {
	EPTR_REC_EMPTY: "The printer is out of paper. Load a new roll and try again.",
	EPTR_COVER_OPEN: "The printer's cover is open. Close it and try again.",
	EPTR_CUTTER: "The printer's paper cutter is jammed. Turn the printer off, clear it, and turn it back on.",
	EPTR_MECHANICAL: "The printer has a mechanical problem (possibly a paper jam). Turn it off, check the paper, and turn it back on.",
	EPTR_AUTOMATICAL: "The printer stopped itself (it may be overheated). Wait a minute and try again.",
	EPTR_UNRECOVERABLE: "The printer has an error it can't recover from. Turn it off and on again.",
	EX_TIMEOUT: "The printer took too long to print. Check that it has paper and the cover is closed.",
	EX_BADPORT: "The printer is busy or not ready. Wait a moment and try again.",
	DeviceNotFound: "The printer answered but isn't ready to print. Turn it off and on again.",
};

// Reads the printer's reply: <response success="true" code="" .../>.
export function readPrinterReply(reply: string): PrintResult {
	const response = /<response\b[^>]*>/.exec(reply)?.[0];
	if (!response) {
		return { ok: false, message: "Something answered at that address, but it doesn't look like the printer. Check the address." };
	}
	if (/\bsuccess="(true|1)"/.test(response)) return { ok: true, message: "Sent to the printer." };
	const code = /\bcode="([^"]*)"/.exec(response)?.[1] || "";
	return {
		ok: false,
		message: PRINTER_PROBLEMS[code] || `The printer could not print${code ? ` (${code})` : ""}. Check the paper and the cover, then try again.`,
	};
}

export async function printSlip(lines: SlipLine[], address = savedPrinterAddress()): Promise<PrintResult> {
	if (!address) {
		return { ok: false, needsSetup: true, message: "No printer is set up on this device yet." };
	}
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
	try {
		const response = await fetch(
			`https://${address}/cgi-bin/epos/service.cgi?devid=local_printer&timeout=${PRINTER_TIMEOUT_MS}`,
			{
				method: "POST",
				// Exactly the headers the printer allows from another site.
				headers: {
					"Content-Type": "text/xml; charset=utf-8",
					"If-Modified-Since": "Thu, 01 Jan 1970 00:00:00 GMT",
					SOAPAction: '""',
				},
				body: slipXml(lines),
				signal: controller.signal,
			}
		);
		if (!response.ok) {
			return {
				ok: false,
				message: `Something answered at ${address}, but it refused the print job (error ${response.status}). Check that this is the printer's address.`,
			};
		}
		return readPrinterReply(await response.text());
	} catch (error) {
		if (controller.signal.aborted) {
			return {
				ok: false,
				message: `No answer from the printer at ${address}. Check that the printer is turned on, that the address is right, and that this device is on the same network as the printer.`,
			};
		}
		// The browser doesn't say why a connection failed, so list the causes.
		return {
			ok: false,
			trustUrl: `https://${address}`,
			message:
				`Could not connect to the printer at ${address}. Check that the printer is turned on, ` +
				"that the address is right, and that this device is on the same network. " +
				"If all of that is fine, this browser may not trust the printer's certificate yet: " +
				"open the printer's page, choose to visit the website anyway, then come back and try again.",
		};
	} finally {
		clearTimeout(timer);
	}
}

// "11/14/2026, 11:42 PM", for the bottom of the slip.
export const printedAtNow = () =>
	new Date().toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" });
