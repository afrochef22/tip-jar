import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import type { UpdateFilter } from "mongodb";
import bcrypt from "bcrypt";
import { getApiSession } from "../../../lib/auth";
import { reportError } from "../../../lib/alert";
import { isList, isObjectId } from "../../../lib/field";
import { isPosition } from "../../../lib/positions";
import type { EmployeeDoc, Position } from "../../../types/models";

const SALT_ROUNDS = 10;

// Fields a logged-out person may set while completing registration.
const REGISTRATION_FIELDS = ["username", "email", "password"];

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const id = req.query.id;
	const data: Record<string, unknown> = { ...req.body };

	if (!isObjectId(id)) {
		return res.status(400).json({ error: "Invalid Employee ID", id });
	}
	if (req.method !== "PATCH") {
		return res.status(405).json({ message: "Method Not Allowed" });
	}

	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");
		const employees = db.collection<EmployeeDoc>("employees");
		const filter = { _id: new ObjectId(id) };

		const employee = await employees.findOne(filter);
		if (!employee) {
			return res.status(404).json({ error: "Employee not found" });
		}

		const isRegistration = data.token !== undefined;
		const session = isRegistration ? null : await getApiSession(req, res);
		const $set: {
			firstName?: string;
			lastName?: string;
			position?: Position[];
			active?: boolean;
			email?: string;
			username?: string;
			password?: string;
			firstSignInDate?: Date;
		} = {};
		const $unset: { token?: ""; tokenExpiration?: "" } = {};

		if (session) {
			// Manager edit.
			if (typeof data.firstName === "string" && data.firstName.trim())
				$set.firstName = data.firstName.trim();
			if (typeof data.lastName === "string" && data.lastName.trim())
				$set.lastName = data.lastName.trim();
			if (isList(data.position)) {
				if (!data.position.every(isPosition)) {
					return res.status(400).json({ error: "Invalid position" });
				}
				$set.position = data.position;
			}
			if (typeof data.active === "boolean") $set.active = data.active;
			if (typeof data.email === "string" && data.email.trim())
				$set.email = data.email.trim();
			if (typeof data.username === "string" && data.username.trim())
				$set.username = data.username.trim();
			if (typeof data.password === "string" && data.password)
				$set.password = await bcrypt.hash(data.password, SALT_ROUNDS);
		} else {
			// Registration from an emailed link. The token must match and be unexpired.
			const token = data.token;
			const expiresAt = employee.tokenExpiration
				? new Date(employee.tokenExpiration)
				: null;
			const tokenValid =
				typeof token === "string" &&
				token.length > 0 &&
				employee.token === token &&
				expiresAt &&
				expiresAt > new Date();
			if (!tokenValid) {
				return res.status(401).json({ error: "Registration link is invalid" });
			}

			const extra = Object.keys(data).filter(
				(k) => k !== "token" && !REGISTRATION_FIELDS.includes(k)
			);
			if (extra.length) {
				return res.status(400).json({ error: "Unexpected fields", extra });
			}
			if (
				typeof data.username !== "string" ||
				!data.username.trim() ||
				typeof data.password !== "string" ||
				!data.password
			) {
				return res
					.status(400)
					.json({ error: "Username and password are required" });
			}

			$set.username = data.username.trim();
			$set.password = await bcrypt.hash(data.password, SALT_ROUNDS);
			if (typeof data.email === "string" && data.email.trim())
				$set.email = data.email.trim();
			$set.firstSignInDate = new Date();
			// Single-use link.
			$unset.token = "";
			$unset.tokenExpiration = "";
		}

		if ($set.username) {
			const clash = await employees.findOne({
				username: $set.username,
				_id: { $ne: employee._id },
			});
			if (clash) {
				return res.status(409).json({ error: "Username already taken" });
			}
		}

		const update: UpdateFilter<EmployeeDoc> = {};
		if (Object.keys($set).length) update.$set = $set;
		if (Object.keys($unset).length) update.$unset = $unset;
		if (!Object.keys(update).length) {
			return res.status(400).json({ error: "Nothing to update" });
		}

		await employees.updateOne(filter, update);

		// Saved tip breakdowns keep each person's name for display. Bring them
		// up to date so a fixed name shows on old shows too (people are matched
		// by id; the name is only what's shown).
		if (session && ($set.firstName || $set.lastName)) {
			const name = `${$set.firstName ?? employee.firstName} ${$set.lastName ?? employee.lastName}`;
			// Untyped: the field paths below are built from the list name.
			const breakdowns = db.collection("tipBreakdown");
			for (const list of ["BartenderTips", "barBackTips", "cookTips"]) {
				await breakdowns.updateMany(
					{ [list]: { $elemMatch: { id, label: { $ne: name } } } },
					{ $set: { [`${list}.$[person].label`]: name } },
					{ arrayFilters: [{ "person.id": id }] }
				);
			}
		}

		res.status(200).json({ message: "Employee updated successfully" });
	} catch (error) {
		await reportError("updateEmployee", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
