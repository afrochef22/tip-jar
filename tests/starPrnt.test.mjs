import assert from "node:assert/strict";
import test from "node:test";
import { cleanSlipLines, toPlain, toStarPrnt } from "../lib/starPrnt.ts";

const lines = [
	{ text: "TERAGRAM BALLROOM", center: true, large: true },
	{ text: "Bar Sales                    $6,601.50", bold: true },
];

test("starprnt: starts with a reset, ends with a feed and cut", () => {
	const bytes = toStarPrnt(lines);
	assert.deepEqual([...bytes.subarray(0, 2)], [0x1b, 0x40]);
	assert.deepEqual([...bytes.subarray(-3)], [0x1b, 0x64, 0x03]);
});

test("starprnt: text, centring, bold and double size are all in the job", () => {
	const bytes = toStarPrnt(lines);
	assert.ok(bytes.includes(Buffer.from("TERAGRAM BALLROOM\n")));
	assert.ok(bytes.includes(Buffer.from([0x1b, 0x1d, 0x61, 0x01])), "centre");
	assert.ok(bytes.includes(Buffer.from([0x1b, 0x69, 1, 1])), "double size on");
	assert.ok(bytes.includes(Buffer.from([0x1b, 0x45])), "bold on");
});

test("plain text: centred lines are padded, and ends with spare feed", () => {
	const text = toPlain([{ text: "HI", center: true }, { text: "left" }]);
	assert.equal(text, " ".repeat(23) + "HI\nleft\n\n\n");
});

test("cleanSlipLines: accepts what the receipt code makes", () => {
	assert.deepEqual(cleanSlipLines(lines), lines);
});

test("cleanSlipLines: refuses empty, huge, long or non-slip input", () => {
	assert.equal(cleanSlipLines([]), null);
	assert.equal(cleanSlipLines("hello"), null);
	assert.equal(cleanSlipLines([{ text: 5 }]), null);
	assert.equal(cleanSlipLines([{ text: "x".repeat(49) }]), null);
	assert.equal(cleanSlipLines([{ text: "x".repeat(25), large: true }]), null);
	assert.equal(cleanSlipLines(Array.from({ length: 151 }, () => ({ text: "a" }))), null);
});

test("cleanSlipLines: control characters can't reach the printer", () => {
	const [line] = cleanSlipLines([{ text: "a\x1bb\x00c" }]);
	assert.equal(line.text, "a?b?c");
});

import { CLOUD_PRINTER, printSlip } from "../lib/printer.ts";

test("printing to the Star sends the slip to the site's queue, not the venue network", async () => {
	const calls = [];
	globalThis.fetch = async (url, options) => {
		calls.push({ url, options });
		return { ok: true, json: async () => ({ ok: true }) };
	};
	const result = await printSlip(lines, CLOUD_PRINTER);
	assert.equal(result.ok, true);
	assert.equal(calls.length, 1);
	assert.equal(calls[0].url, "/api/printQueue");
	assert.deepEqual(JSON.parse(calls[0].options.body), { lines });
});

test("printing to the Star shows the site's message when it refuses", async () => {
	globalThis.fetch = async () => ({ ok: false, status: 429, json: async () => ({ error: "Too many tries." }) });
	const result = await printSlip(lines, CLOUD_PRINTER);
	assert.deepEqual(result, { ok: false, message: "Too many tries." });
});
