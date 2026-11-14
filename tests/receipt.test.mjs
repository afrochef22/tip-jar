import { test } from "node:test";
import assert from "node:assert/strict";
import { breakdownSlip, printable, wrap, SLIP_WIDTH } from "../lib/receipt.ts";
import { cleanAddress, readPrinterReply, slipXml } from "../lib/printer.ts";

const worker = (label, tippedHours, tipOut) => ({ label, tippedHours, tipOut });
const breakDown = {
	show: "A Band With A Really Long Name And Their Very Special Guests From Out Of Town",
	date: "11/14/2026",
	totalTips: 1320.3,
	totalBarSales: "6601.5",
	foodSales: 450,
	barBackPercentage: 15,
	BartenderTips: [worker("José Rivera-Montgomery the Third of Somewhere", 6.5, 123456.78), worker("Sam Lee", 6, 247.5)],
	barBackTips: [worker("Jo Kim", 0, 59.4)],
	cookTips: [],
	shiftNotes: "Register 2 closed early — recount needed",
};

test("every slip line fits the paper", () => {
	for (const line of breakdownSlip(breakDown, "11/14/26, 11:42 PM")) {
		assert.ok(line.text.length <= (line.large ? SLIP_WIDTH / 2 : SLIP_WIDTH), line.text);
	}
});

test("slip shows saved amounts, leaves out percentages and empty roles", () => {
	const text = breakdownSlip(breakDown, "now").map((line) => line.text).join("\n");
	assert.match(text, /Bar Sales +\$6,601\.50\n/);
	assert.match(text, /Total Tips +\$1,320\.30\n/);
	assert.match(text, /Sam Lee +6 hrs +\$247\.50\n/);
	assert.match(text, /Jo Kim +\$59\.40\n/); // no hours for bar backs
	assert.match(text, /\$123,456\.78/);
	assert.doesNotMatch(text, /%|per h|COOKS|hrs +\$59/);
});

test("printable keeps to characters the printer has", () => {
	assert.equal(printable("  José’s\n“Band” — 🎸 "), "Jose's \"Band\" - ??");
	assert.deepEqual(wrap("aaa bbb cccccccc d", 7), ["aaa bbb", "ccccccc", "c d"]);
});

test("printer address is cleaned up or rejected", () => {
	assert.equal(cleanAddress(" https://192.168.1.171/ "), "192.168.1.171");
	assert.equal(cleanAddress("printer.local:8043"), "printer.local:8043");
	assert.equal(cleanAddress("192.168.1.171/?x=<script>"), "192.168.1.171");
	assert.equal(cleanAddress("not an address"), null);
	assert.equal(cleanAddress(""), null);
});

test("print job escapes text and ends with a cut", () => {
	const xml = slipXml([{ text: "Tom & <Jerry>", large: true, center: true }]);
	assert.match(xml, /align="center" dw="true" dh="true" em="false">Tom &amp; &lt;Jerry&gt;&#10;<\/text>/);
	assert.match(xml, /<cut type="feed"\/><\/epos-print>/);
});

test("printer replies become readable messages", () => {
	const reply = (attrs) => `<s:Envelope><s:Body><response ${attrs} status="1"></response></s:Body></s:Envelope>`;
	assert.equal(readPrinterReply(reply('success="true" code=""')).ok, true);
	assert.match(readPrinterReply(reply('success="false" code="EPTR_REC_EMPTY"')).message, /out of paper/);
	assert.match(readPrinterReply(reply('success="false" code="WEIRD"')).message, /WEIRD/);
	assert.equal(readPrinterReply("<html>router login</html>").ok, false);
});

test("food sales line is left out when there were none", () => {
	const lines = (foodSales) => breakdownSlip({ ...breakDown, foodSales }, "now").map((line) => line.text).join("\n");
	assert.match(lines(450), /Food Sales +\$450\.00/);
	assert.doesNotMatch(lines(0), /Food Sales/);
	assert.doesNotMatch(lines("0"), /Food Sales/);
});
