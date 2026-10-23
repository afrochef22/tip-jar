import { test } from "node:test";
import assert from "node:assert/strict";
import { splitCreditTips } from "../lib/tipSplit.mjs";

const people = (...hours) =>
	hours.map((tippedHours, i) => ({ id: `p${i}`, label: `P${i}`, tippedHours }));

const split = (input, random) =>
	splitCreditTips(
		{
			totalTips: 0,
			foodSalesTotal: 0,
			barBackPercentage: 15,
			bartenders: [],
			barBacks: [],
			cooks: [],
			...input,
		},
		random
	);

const payouts = (result) => [
	...result.bartenders.map((p) => p.tipOut),
	...result.barBacks.map((p) => p.tipOut),
	...result.cooks.map((p) => p.tipOut),
];
const cents = (result) =>
	Math.round(payouts(result).reduce((acc, n) => acc + n, 0) * 100);

// Repeatable stand-in for Math.random.
const seeded = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

test("even split between bartenders", () => {
	const result = split({ totalTips: 300, bartenders: people(0, 0, 0) });
	assert.deepEqual(payouts(result), [100, 100, 100]);
});

test("odd cent goes to one bartender, total stays exact", () => {
	const result = split({ totalTips: 100, bartenders: people(0, 0, 0) });
	assert.deepEqual([...payouts(result)].sort(), [33.33, 33.33, 33.34]);
	assert.equal(cents(result), 10000);
});

test("single bartender gets everything", () => {
	const result = split({ totalTips: 123.45, bartenders: people(0) });
	assert.deepEqual(payouts(result), [123.45]);
});

test("bar back takes the bar back percentage", () => {
	const result = split({
		totalTips: 200,
		barBackPercentage: 15,
		bartenders: people(0, 0),
		barBacks: people(0),
	});
	assert.deepEqual(payouts(result), [85, 85, 30]);
});

test("cooks get 15% of food sales off the top, bar backs a share of the rest", () => {
	const result = split({
		totalTips: 260,
		foodSalesTotal: 400,
		barBackPercentage: 10,
		bartenders: people(0, 0),
		barBacks: people(0),
		cooks: people(0),
	});
	// cooks 60, bar back 10% of 200 = 20, bartenders split 180
	assert.deepEqual(payouts(result), [90, 90, 20, 60]);
});

test("food sales are ignored when no cook is working", () => {
	const result = split({
		totalTips: 100,
		foodSalesTotal: 1000,
		bartenders: people(0),
	});
	assert.deepEqual(payouts(result), [100]);
});

test("bartenders split by hours when hours are entered", () => {
	const result = split({ totalTips: 120, bartenders: people(6, 2) });
	assert.deepEqual(payouts(result), [90, 30]);
	assert.equal(result.tipsPerBartender, 15);
});

test("bar backs and cooks split by hours too", () => {
	const result = split({
		totalTips: 400,
		foodSalesTotal: 1000,
		barBackPercentage: 20,
		bartenders: people(0),
		barBacks: people(3, 1),
		cooks: people(4, 2),
	});
	// cooks 150 over 6 hrs; bar backs 20% of 250 = 50 over 4 hrs
	assert.deepEqual(payouts(result), [200, 37.5, 12.5, 100, 50]);
});

test("zero tips pays zero", () => {
	const result = split({
		totalTips: 0,
		bartenders: people(0, 0),
		barBacks: people(0),
	});
	assert.deepEqual(payouts(result), [0, 0, 0]);
});

test("payouts always add up to the exact total (20,000 random shifts)", () => {
	const rnd = seeded(42);
	const crew = (n, byHours) =>
		people(...Array.from({ length: n }, () => (byHours ? Math.round(rnd() * 16) / 2 + 0.5 : 0)));
	for (let i = 0; i < 20000; i++) {
		const input = {
			totalTips: Math.round(rnd() * 300000) / 100,
			foodSalesTotal: rnd() < 0.5 ? Math.round(rnd() * 200000) / 100 : 0,
			barBackPercentage: Math.floor(rnd() * 25),
			bartenders: crew(1 + Math.floor(rnd() * 6), rnd() < 0.5),
			barBacks: crew(Math.floor(rnd() * 3), rnd() < 0.5),
			cooks: crew(Math.floor(rnd() * 3), rnd() < 0.5),
		};
		const result = split(input, seeded(i + 1));
		assert.equal(cents(result), Math.round(input.totalTips * 100), JSON.stringify(input));
		for (const n of payouts(result)) {
			assert.equal(Math.round(n * 100) / 100, n, `not whole cents: ${n}`);
		}
	}
});

test("bartenders never differ by more than a cent on an even split", () => {
	const rnd = seeded(7);
	for (let i = 0; i < 5000; i++) {
		const result = split(
			{
				totalTips: Math.round(rnd() * 300000) / 100,
				barBackPercentage: Math.floor(rnd() * 25),
				bartenders: people(...Array(1 + Math.floor(rnd() * 6)).fill(0)),
				barBacks: people(...Array(Math.floor(rnd() * 3)).fill(0)),
			},
			seeded(i + 1)
		);
		const tips = result.bartenders.map((p) => Math.round(p.tipOut * 100));
		assert.ok(Math.max(...tips) - Math.min(...tips) <= 1, String(tips));
	}
});

test("warns when the cooks' share is more than the tips", () => {
	const result = split({
		totalTips: 50,
		foodSalesTotal: 400,
		bartenders: people(0),
		cooks: people(0),
	});
	assert.match(result.warning, /\$60\.00.*\$50\.00/);
	assert.equal(result.bartenders[0].tipOut, -10);
});

test("no warning on a normal shift", () => {
	const result = split({
		totalTips: 260,
		foodSalesTotal: 400,
		bartenders: people(0),
		cooks: people(0),
	});
	assert.equal(result.warning, null);
});
