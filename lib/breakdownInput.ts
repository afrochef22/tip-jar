// Checks for the tip breakdown a browser sends to addTipBreakDown and
// UpdateTipBreakDown, so amounts are saved as numbers and a date is a date.
// Each check returns a message for a 400 response, or "" when the value is
// fine. Worker ids are checked in the routes (lib/objectId needs mongodb).
import type { WorkingPosition } from "../types/models";

// The shift date format from lib/shiftDate: "MM/d/yyyy", e.g. "10/31/2026".
export const isShiftDate = (value: unknown): value is string =>
	typeof value === "string" && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value);

// A dollar amount, percentage or rate. The forms send numbers; older records
// have numeric strings, which still pass (and are saved as numbers).
export const isAmount = (value: unknown): value is number | string =>
	(typeof value === "number" && Number.isFinite(value)) ||
	(typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value)));

// For a value checkAmounts passed: saved as a number. null stays null (many
// older breakdowns have null tipsPerCook or tipsPerBarBack when nobody worked
// that role), and a field that wasn't sent stays unset.
export const toAmount = (value: unknown) => (isAmount(value) ? Number(value) : value === null ? null : undefined);

const LISTS: [string, WorkingPosition][] = [
	["cookTips", "Cook"],
	["barBackTips", "Bar Back"],
	["BartenderTips", "Bartender"],
];

// One list of workers (cookTips, barBackTips or BartenderTips). Every worker
// needs a name, the position the list is for, a tip out and, when sent,
// hours as a number. Returns the workers with tipOut saved as a number, or
// an error message.
export function readWorkers(
	list: unknown,
	listName: string
): { workers: Record<string, unknown>[]; error: string } {
	const position = LISTS.find(([name]) => name === listName)?.[1];
	const fail = (error: string) => ({ workers: [], error });
	if (!Array.isArray(list)) return fail(`${listName} must be a list`);
	const workers: Record<string, unknown>[] = [];
	for (const item of list) {
		if (typeof item !== "object" || item === null) return fail(`${listName} has an invalid worker`);
		const worker: Record<string, unknown> = { ...item };
		const { label, workingPosition, tipOut, tippedHours } = worker;
		if (typeof label !== "string") return fail(`${listName} has a worker with no name`);
		if (workingPosition !== position) return fail(`${label} in ${listName} should be a ${position}`);
		if (!isAmount(tipOut)) return fail(`${label} has an invalid tip out`);
		if (tippedHours !== undefined && !(typeof tippedHours === "number" && Number.isFinite(tippedHours))) {
			return fail(`${label} has invalid hours`);
		}
		workers.push({ ...worker, tipOut: Number(tipOut) });
	}
	return { workers, error: "" };
}

// The amounts on a breakdown. `required` names the ones that must be sent.
export const AMOUNT_FIELDS = [
	"totalTips",
	"foodSales",
	"barBackPercentage",
	"totalBarSales",
	"tipsPerCook",
	"tipsPerBarBack",
	"tipsPerBartender",
] as const;

export function checkAmounts(body: Record<string, unknown>, required: readonly string[] = []): string {
	for (const key of AMOUNT_FIELDS) {
		const value = body[key];
		if (value === undefined || value === null) {
			if (required.includes(key)) return `${key} is required`;
			continue;
		}
		if (!isAmount(value)) return `${key} must be a number`;
	}
	return "";
}

// Shift notes are text; the edit form leaves them out when there are none.
export const checkNotes = (value: unknown): string =>
	value === undefined || value === null || typeof value === "string" ? "" : "shiftNotes must be text";
