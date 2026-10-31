import { ObjectId } from "mongodb";

// ObjectId.isValid checks input of any type (anything it can't use is just
// invalid), so it can be given request data directly. This is still the
// ObjectId class; the type only widens what isValid may be called with.
const checkAnything: { isValid(value: unknown): boolean } = ObjectId;
export const isObjectId = (value: unknown): value is Parameters<typeof ObjectId.isValid>[0] =>
	checkAnything.isValid(value);
