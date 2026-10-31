# Bugs found during the TypeScript migration

Found while converting. None of these were fixed: the migration doesn't change
behavior. Each one was checked against the JavaScript on `main` and behaves
the same there.

## 1. Credit split crashes when no bartender worked and cents are left over

- **File:** `lib/tipSplit.ts` (was `lib/tipSplit.mjs`), the "hand out any cents
  still left over" loop.
- **Problem:** The leftover cents go to `adjustedBartenders[index]`, picked from
  `shuffledIndexes`. With no bartenders that list is empty, so `index` is
  `undefined` and the line throws `TypeError: Cannot read properties of
  undefined (reading 'tipOut')`. The whole breakdown page then fails to render.
  Repro: $100 credit tips, no bartenders, 3 bar backs, bar back % = 100. Each
  bar back gets $33.33, the 1¢ left over has no bartender to go to, and the
  split crashes.
- **Suggested fix:** Skip the leftover-cents step when `adjustedBartenders` is
  empty, and give the cents to the bar backs (or return them as `leftover`
  like `splitCashTips` does). Add a test for the no-bartender case.

## 2. With no bartenders, the bartenders' share is not paid to anyone

- **File:** `lib/tipSplit.ts`, plus `components/CreditTipCalculation.js`, which
  lets the form be submitted with no bartenders selected.
- **Problem:** Bartenders get whatever is left after the cooks and bar backs.
  When no bartender is selected that remainder disappears without a warning:
  $100 tips, 3 bar backs at 15% pays out $15.00 and the other $85.00 isn't on
  the breakdown. The function's existing `warning` only covers the cooks'
  share being too big.
- **Suggested fix:** Either require at least one bartender on the credit form,
  or have `splitCreditTips` return a `warning` (like the cooks one) when
  `bartenders` is empty and the bartender share is more than 0.

## 3. One saved tip breakdown has every field set to null (data)

- **File:** the `tipBreakdown` collection (seen in the 2026-10-23 backup).
  Types: `types/models.ts`.
- **Problem:** One document has `show`, `date`, `totalTips`, `foodSales`,
  `barBackPercentage`, `cookTips`, `barBackTips`, `BartenderTips` and the
  `tipsPer*` fields all `null`. The code assumes these are set (for example
  `breakdown.cookTips.map(...)`), so any page that loads this record in full
  can throw. The types treat these fields as always present, matching the
  other 465 records, rather than spreading null checks through the app for
  one bad record.
- **Suggested fix:** Look at the record (`npm run backup` first) and delete
  it if it's junk. To stop more like it, `addTipBreakDown` already rejects a
  missing show or date, so this record is probably from before that check.

## 4. The breakdown API routes save amounts and worker lists without checking them

- **Files:** `pages/api/addTipBreakDown.ts`, `pages/api/UpdateTipBreakDown/[id].ts`
- **Problem:** Apart from the show, the date (add only) and each worker's `id`,
  the request body is saved exactly as sent. `totalTips`, `foodSales`,
  `totalBarSales` and every worker's `tipOut`, `tippedHours` and
  `workingPosition` can be any JSON value. This is how strings got into the
  data: the backup has `totalTips` saved as a string on 6 breakdowns and
  `amount` as a string on 56 `tipsCollected` entries, which is why the types
  have to allow `number | string`. `UpdateTipBreakDown` also doesn't check
  that `date` is a string before using it in a database query and saving it,
  so a manager's request with `"date": {"$ne": null}` would run as a query
  operator.
- **Suggested fix:** Check the body in both routes before saving: amounts are
  finite numbers (or numeric strings converted with `Number`), `date` is a
  `MM/d/yyyy` string, `workingPosition` is one of the three positions, and
  `tippedHours` is a number. Return 400 otherwise. Once old records are
  cleaned up (a script like `scripts/migrate-tipout-numbers.js`), the
  `SavedAmount` type in `types/models.ts` can become `number`.
