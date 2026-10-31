import { test } from "node:test";
import assert from "node:assert/strict";
import { splitCashTips } from "../lib/cashSplit.ts";

const people = (...hours) => hours.map((h, i) => ({ name: `P${i}`, hours: h }));

const split = (input) =>
	splitCashTips({ tipsCollected: 0, barBackPercentage: 15, bartenders: [], barBacks: [], ...input });

const total = (r) =>
	Math.round([...r.bartenders, ...r.barBacks].reduce((a, p) => a + p.tipOut, 0) * 100) + Math.round(r.leftover * 100);

test("bartenders get equal whole dollars, the rest goes to the bar back", () => {
	const r = split({ tipsCollected: 523, barBackPercentage: 15, bartenders: people("", "", ""), barBacks: people("") });
	// 15% = 78.45; bartenders split 444.55 -> 148 each; bar back gets 523 - 444 = 79
	assert.deepEqual(r.bartenders.map((p) => p.tipOut), [148, 148, 148]);
	assert.deepEqual(r.barBacks.map((p) => p.tipOut), [79]);
	assert.equal(r.leftover, 0);
});

test("coins in the total go to the bar back", () => {
	const r = split({ tipsCollected: 100.5, barBackPercentage: 10, bartenders: people("", ""), barBacks: people("") });
	assert.deepEqual(r.bartenders.map((p) => p.tipOut), [45, 45]);
	assert.deepEqual(r.barBacks.map((p) => p.tipOut), [10.5]);
});

test("two bar backs split the rest, spare dollar to the first", () => {
	const r = split({ tipsCollected: 301, barBackPercentage: 20, bartenders: people("", ""), barBacks: people("", "") });
	// bartenders split 240.80 -> 120 each; bar backs get 61 -> 31 and 30
	assert.deepEqual(r.bartenders.map((p) => p.tipOut), [120, 120]);
	assert.deepEqual(r.barBacks.map((p) => p.tipOut), [31, 30]);
});

test("spare dollar goes to the bar back with the most hours", () => {
	const r = split({ tipsCollected: 301, barBackPercentage: 20, bartenders: people("", ""), barBacks: people("2", "4") });
	// 61 by hours: 20.33 -> 20, 40.67 -> 40, spare 1 to the 4-hour bar back
	assert.deepEqual(r.barBacks.map((p) => p.tipOut), [20, 41]);
});

test("bartenders by hours get whole dollars", () => {
	const r = split({ tipsCollected: 200, barBackPercentage: 15, bartenders: people("5", "3"), barBacks: people("") });
	// 170 by hours: 106.25 -> 106, 63.75 -> 63; bar back 31
	assert.deepEqual(r.bartenders.map((p) => p.tipOut), [106, 63]);
	assert.deepEqual(r.barBacks.map((p) => p.tipOut), [31]);
	assert.equal(r.tipsPerBartender, 21.25);
});

test("no bar back: bartenders still equal, leftover is reported", () => {
	const r = split({ tipsCollected: 100, bartenders: people("", "", "") });
	assert.deepEqual(r.bartenders.map((p) => p.tipOut), [33, 33, 33]);
	assert.equal(r.leftover, 1);
});

test("bar back never gets less than their percentage", () => {
	const r = split({ tipsCollected: 999.99, barBackPercentage: 15, bartenders: people("", "", "", ""), barBacks: people("") });
	assert.ok(r.barBacks[0].tipOut >= 150);
});

test("zero tips pays zero", () => {
	const r = split({ bartenders: people("", ""), barBacks: people("") });
	assert.deepEqual([...r.bartenders, ...r.barBacks].map((p) => p.tipOut), [0, 0, 0]);
});

test("20,000 random shifts: exact total, whole-dollar bartenders, equal on even splits", () => {
	let seed = 99;
	const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
	for (let i = 0; i < 20000; i++) {
		const byHours = rnd() < 0.5;
		const crew = (n, h) => people(...Array.from({ length: n }, () => (h ? String(Math.round(rnd() * 16) / 2 + 0.5) : "")));
		const input = {
			tipsCollected: rnd() < 0.5 ? Math.round(rnd() * 2000) : Math.round(rnd() * 200000) / 100,
			barBackPercentage: Math.floor(rnd() * 25),
			bartenders: crew(1 + Math.floor(rnd() * 6), byHours),
			barBacks: crew(Math.floor(rnd() * 3), rnd() < 0.5),
		};
		const r = split(input);
		const msg = JSON.stringify(input);
		assert.equal(total(r), Math.round(input.tipsCollected * 100), msg);
		for (const p of r.bartenders) assert.ok(Number.isInteger(p.tipOut), msg);
		for (const p of r.barBacks) assert.ok(p.tipOut >= 0, msg);
		if (!byHours) assert.equal(new Set(r.bartenders.map((p) => p.tipOut)).size, 1, msg);
		if (input.barBacks.length) {
			assert.equal(r.leftover, 0, msg);
			const pool = Math.round(input.tipsCollected * input.barBackPercentage) / 100;
			assert.ok(r.barBacks.reduce((a, p) => a + p.tipOut, 0) >= pool - 0.005, msg);
		}
	}
});

test("reports how much extra the bar backs get", () => {
	const r = split({ tipsCollected: 523, barBackPercentage: 15, bartenders: people("", "", ""), barBacks: people("") });
	assert.equal(r.barBackShare, 78.45);
	assert.equal(r.barBackExtra, 0.55);
});
