// Reads a field such as `code` or `message` off a caught error, which can be
// anything that was thrown. Same result as `error?.code` in plain JavaScript.
const hasKey = <K extends string>(value: object, key: K): value is Record<K, unknown> => key in value;

export function errorField(error: unknown, key: string): unknown {
	if ((typeof error === "object" || typeof error === "function") && error !== null && hasKey(error, key)) {
		return error[key];
	}
	return undefined;
}
