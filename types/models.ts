import type { ObjectId } from "mongodb";

// Shapes of the documents in the TeragramBallroom database, checked against a
// backup of the real data (2026-10-23). Older records saved some amounts as
// strings, so those fields allow both.

export type Position = "Bartender" | "Bar Back" | "Cook" | "No Position";
export type WorkingPosition = Exclude<Position, "No Position">;

// A dollar amount as saved: usually a number, a string on some older records.
export type SavedAmount = number | string;

// One shift an employee was paid for: an entry in `employee.tipsCollected`.
export type Shift = {
	date: string; // "MM/d/yyyy", see lib/shiftDate
	amount: SavedAmount;
	workingPosition: WorkingPosition;
	show: string;
	tipBreakdownId: string;
	tippedHours?: number;
	updatedat?: Date;
};

// `employees` collection. `position` is a list: one person can work more than
// one role.
export type EmployeeDoc = {
	_id: ObjectId;
	firstName: string;
	lastName: string;
	position: Position[];
	active: boolean;
	createdat: Date;
	tipsCollected: Shift[];
	email?: string;
	username?: string;
	password?: string;
	googleId?: string;
	firstSignInDate?: Date;
	token?: string;
	tokenExpiration?: Date;
	resetTokenHash?: string;
	resetTokenExpiration?: Date;
};

// One worker's line on a tip breakdown (cookTips, barBackTips, BartenderTips).
export type ShiftWorker = {
	id: string; // the employee's _id as a string
	label: string; // display name
	position: Position[];
	active: boolean;
	checked: boolean;
	workingPosition: WorkingPosition;
	tippedHours: number;
	tipOut: SavedAmount;
	tipsBroughtIn?: number;
};

// `tipBreakdown` collection: one show's credit card tip split.
export type TipBreakdownDoc = {
	_id: ObjectId;
	show: string;
	showKey: string; // see lib/showKey
	date: string; // "MM/d/yyyy"
	totalTips: SavedAmount;
	foodSales: SavedAmount;
	barBackPercentage: number;
	cookTips: ShiftWorker[];
	barBackTips: ShiftWorker[];
	BartenderTips: ShiftWorker[];
	tipsPerCook: number | null;
	tipsPerBarBack: number | null;
	tipsPerBartender: number | null;
	totalBarSales?: SavedAmount;
	shiftNotes?: string;
	createdat: Date;
	updatedat?: Date;
};

// What a value looks like after JSON.stringify, which is how getServerSideProps
// and the API routes send documents to the browser: ObjectIds and Dates
// become strings.
export type Json<T> = T extends ObjectId | Date
	? string
	: T extends (infer U)[]
		? Json<U>[]
		: T extends object
			? { [K in keyof T]: Json<T[K]> }
			: T;

export type Employee = Json<EmployeeDoc>;
export type TipBreakdown = Json<TipBreakdownDoc>;

// The projections in lib/employeeFields and lib/breakdownFields.
export type PublicEmployee = Pick<Employee, "_id" | "firstName" | "lastName" | "position" | "active">;
export type PublicEmployeeWithTips = PublicEmployee & Pick<Employee, "tipsCollected">;
export type ManagerEmployee = Omit<Employee, "password" | "token">;

export type BreakdownSummary = Pick<TipBreakdown, "_id" | "show" | "date" | "totalTips">;
export type BreakdownCardWorker = Pick<ShiftWorker, "id" | "label" | "tipOut">;
export type BreakdownCard = BreakdownSummary &
	Pick<TipBreakdown, "totalBarSales"> & {
		cookTips: BreakdownCardWorker[];
		barBackTips: BreakdownCardWorker[];
		BartenderTips: BreakdownCardWorker[];
	};
