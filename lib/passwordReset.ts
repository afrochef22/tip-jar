import { createHash, randomBytes } from "crypto";

// Password reset links: the email gets a random token; the database only keeps
// its SHA-256 hash, so someone who reads the database can't use it to reset a
// password. Links work once and expire after an hour.
export const RESET_TTL_MINUTES = 60;
export const MIN_PASSWORD_LENGTH = 8;

export const newResetToken = () => randomBytes(32).toString("hex");
export const hashResetToken = (token: unknown) => createHash("sha256").update(String(token)).digest("hex");

// True when `token` matches the employee's unexpired reset link.
// `employee` is whatever the database returned, so its reset fields are checked
// before they're used.
export function resetTokenValid(
	employee: { resetTokenHash?: unknown; resetTokenExpiration?: unknown } | null | undefined,
	token: unknown
) {
	return (
		typeof token === "string" &&
		token.length > 0 &&
		typeof employee?.resetTokenHash === "string" &&
		employee.resetTokenHash === hashResetToken(token) &&
		employee.resetTokenExpiration instanceof Date &&
		employee.resetTokenExpiration > new Date()
	);
}
