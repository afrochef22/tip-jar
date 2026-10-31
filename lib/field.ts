// Helpers for reading values whose shape isn't known: request bodies, caught
// errors, lists sent by the browser, and API responses. Each gives the same
// result as the plain JavaScript it replaces. The browser uses these too, so
// nothing server-only belongs here (isObjectId is in lib/objectId).

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


// For JSON from this app's own API routes, read in the browser.

// The field when it's a string, otherwise undefined. For optional messages.
export function text(value: unknown, key: string): string | undefined {
	const found = field(value, key);
	return typeof found === "string" ? found : undefined;
}

// A string field the route always sends. Throws, into the caller's existing
// catch, if the response isn't what the route sends.
export function stringField(value: unknown, key: string): string {
	const found = field(value, key);
	if (typeof found !== "string") throw new TypeError(`Expected "${key}" in the response`);
	return found;
}

// A list of strings, as sent by the API.
export const isStringList = (value: unknown): value is string[] =>
	isList(value) && value.every((item) => typeof item === "string");
