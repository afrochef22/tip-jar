import { ObjectId } from "mongodb";

// Helpers for reading values whose shape isn't known: request bodies, caught
// errors, and lists sent by the browser. Each gives the same result as the
// plain JavaScript it replaces.

const hasKey = <K extends string>(value: object, key: K): value is Record<K, unknown> => key in value;

// `value?.[key]`: undefined when value is null, undefined or has no such field.
export function field(value: unknown, key: string): unknown {
	if ((typeof value === "object" || typeof value === "function") && value !== null && hasKey(value, key)) {
		return value[key];
	}
	return undefined;
}

// `value[key]`: like field(), but throws on null or undefined as JavaScript does.
export function prop(value: unknown, key: string): unknown {
	if (value === null || value === undefined) {
		throw new TypeError(`Cannot read properties of ${value} (reading '${key}')`);
	}
	return field(value, key);
}

// Array.isArray without turning the value into any[].
export const isList = (value: unknown): value is unknown[] => Array.isArray(value);

// ObjectId.isValid checks input of any type (anything it can't use is just
// invalid), so it can be given request data directly. This is still the
// ObjectId class; the type only widens what isValid may be called with.
const checkAnything: { isValid(value: unknown): boolean } = ObjectId;
export const isObjectId = (value: unknown): value is Parameters<typeof ObjectId.isValid>[0] =>
	checkAnything.isValid(value);
