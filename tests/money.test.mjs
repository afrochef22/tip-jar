import { test } from "node:test";
import assert from "node:assert/strict";
import { money, tipPercent } from "../lib/money.js";

test("money adds commas and cents", () => {
	assert.equal(money(6601.5), "6,601.50");
	assert.equal(money(undefined), "0.00");
});

test("tipPercent is tips over bar sales, one decimal", () => {
	assert.equal(tipPercent(1200, 6000), "20.0%");
	assert.equal(tipPercent(1234.56, 6789), "18.2%");
	assert.equal(tipPercent(undefined, 500), "0.0%");
});

test("tipPercent is null without bar sales", () => {
	assert.equal(tipPercent(500, 0), null);
	assert.equal(tipPercent(500, undefined), null);
	assert.equal(tipPercent(500, ""), null);
});
