import type { Json } from "../types/models";

// What getServerSideProps has always done to send documents to the page:
// a JSON round trip, which turns ObjectIds and Dates into strings. Json<T>
// describes the result.
export function toJson<T>(value: T): Json<T> {
	return JSON.parse(JSON.stringify(value));
}

// A value this app's own pages put in the URL with JSON.stringify (the shift
// screens pass the working employees and hours this way). The type is what
// those pages put there; the value isn't checked, so a hand-edited URL can
// still break the page, as before. JSON.parse would turn a repeated query
// key (an array) into a string the same way String() does.
export function fromQuery<T>(value: string | string[]): T {
	return JSON.parse(String(value));
}
