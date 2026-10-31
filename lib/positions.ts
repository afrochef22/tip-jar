import type { Position } from "../types/models";

export const POSITIONS: Position[] = ["Bartender", "Bar Back", "Cook", "No Position"];

const known: readonly unknown[] = POSITIONS;
export const isPosition = (value: unknown): value is Position => known.includes(value);
