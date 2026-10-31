import { test } from "node:test";
import assert from "node:assert/strict";
import {
	checkAmounts,
	checkNotes,
	isShiftDate,
	readWorkers,
	toAmount,
} from "../lib/breakdownInput.ts";

const bartender = (extra) => ({
	id: "64b000000000000000000001",
	label: "Sam Lee",
	workingPosition: "Bartender",
	tippedHours: 6,
	tipOut: 120.5,
	...extra,
});

test("shift dates in the app's format pass", () => {
	for (const date of ["10/31/2026", "03/5/2026", "1/1/2027"]) assert.ok(isShiftDate(date));
});

test("anything else as a date fails, including query operators", () => {
	for (const date of [{ $ne: null }, "2026-10-31", "", null, 20261031, ["10/31/2026"]]) {
		assert.equal(isShiftDate(date), false);
	}
});

test("amounts: numbers and numeric strings pass, the rest fail", () => {
	assert.equal(checkAmounts({ totalTips: 100, foodSales: "250.5", tipsPerCook: null }), "");
	assert.match(checkAmounts({ totalTips: "abc" }), /totalTips/);
	assert.match(checkAmounts({ foodSales: { $gt: 0 } }), /foodSales/);
	assert.match(checkAmounts({ totalBarSales: "" }), /totalBarSales/);
});

test("required amounts must be sent", () => {
	assert.match(checkAmounts({}, ["totalTips"]), /totalTips is required/);
	assert.match(checkAmounts({ totalTips: null }, ["totalTips"]), /totalTips is required/);
});

test("amounts are saved as numbers; null stays null, missing stays unset", () => {
	assert.equal(toAmount("12.50"), 12.5);
	assert.equal(toAmount(7), 7);
	assert.equal(toAmount(null), null);
	assert.equal(toAmount(undefined), undefined);
});

test("notes must be text when sent", () => {
	assert.equal(checkNotes("Busy night"), "");
	assert.equal(checkNotes(undefined), "");
	assert.match(checkNotes({ a: 1 }), /text/);
});

test("workers keep their fields, with tipOut as a number", () => {
	const { workers, error } = readWorkers([bartender({ tipOut: "88.25", checked: true })], "BartenderTips");
	assert.equal(error, "");
	assert.deepEqual(workers, [bartender({ tipOut: 88.25, checked: true })]);
});

test("a negative bartender tip out is allowed (the cooks' share warning case)", () => {
	assert.equal(readWorkers([bartender({ tipOut: -10 })], "BartenderTips").error, "");
});

test("workers with bad fields are rejected", () => {
	const bad = [
		[bartender({ tipOut: "lots" }), /tip out/],
		[bartender({ tipOut: null }), /tip out/],
		[bartender({ tippedHours: "6" }), /hours/],
		[bartender({ label: undefined }), /no name/],
		[bartender({ workingPosition: "Cook" }), /should be a Bartender/],
		["Sam", /invalid worker/],
	];
	for (const [worker, message] of bad) {
		assert.match(readWorkers([worker], "BartenderTips").error, message);
	}
	assert.match(readWorkers("everyone", "cookTips").error, /must be a list/);
});

test("hours can be left out", () => {
	assert.equal(readWorkers([bartender({ tippedHours: undefined })], "BartenderTips").error, "");
});
