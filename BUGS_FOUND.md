# Bugs found during the TypeScript migration

Found while converting. None of these were fixed: the migration doesn't change
behavior. Each one was checked against the JavaScript on `main` and behaves
the same there.

## 1. Credit split crashes when no bartender worked and cents are left over

**Fixed** after the migration: the leftover-cents step is skipped when there
are no bartenders, and the warning from #2 reports the unpaid cents. Tests in
`tests/tipSplit.test.mjs`.

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

**Fixed:** `splitCreditTips` returns a warning with the unpaid amount, shown
on the new-breakdown page and in the edit window, and neither one saves a
breakdown with no bartenders.

- **File:** `lib/tipSplit.ts`, plus `components/CreditTipCalculation.tsx`, which
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

**Resolved:** the record (`66008f5c8a51b3d9da6778df`, created 2024-03-24) is
no longer in the database; it's missing from the 2026-10-31 backup. The
checks from #4 now reject a breakdown without a date.

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

**Fixed** after the migration: both routes check the body with
`lib/breakdownInput.ts` and return 400 on a bad date, amount, note or worker
line. Amounts and tip outs are saved as numbers from now on. All 465 real
breakdowns in the 2026-10-23 backup pass the checks (only the null record in
#3 doesn't), so old records can still be edited. The old string amounts are
still in the database until they're cleaned up.

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

## 5. A second fill-in added from the same form comes through unticked

**Fixed:** the form resets with `emptyFillIn()`, the same state it starts
with. The placeholder in `addEmployeeModal.tsx` is gone too.

- **File:** `components/AddGuestEmployee.tsx`, `handleAddEmployee`
- **Problem:** After a fill-in is added, the form state is reset to a
  different shape: `{ firstName, lastName, position: [], active: true,
  tipsCollected: [{ amount: Number, date: Date }] }`. That has no `checked`
  or `workingPosition`, and `tipsCollected` holds the `Number` and `Date`
  constructors themselves. If the manager adds another fill-in before the
  page reloads, it's passed to the shift list with `checked: undefined`, so
  its box shows unticked and the "N selected" count leaves it out, even
  though it was added to the working list. (`types/models.ts` allows
  `WorkerOption.checked` to be `undefined` because of this.)
- **Suggested fix:** Reset to the same initial state the form starts with
  (`checked: true`, `workingPosition: position`, `tipsBroughtIn: 0`,
  `tippedHours: 0`, `tipOut: 0`), ideally from one shared `emptyFillIn()`
  function. `components/addEmployeeModal.tsx` uses the same
  `{ amount: Number, date: Date }` placeholder; it's harmless there because
  `JSON.stringify` drops it, but it can go too.

## 6. `SelectNonActiveBarBack` passes "barBack" as a position (unused component)

**Fixed:** the file was deleted.

- **File:** `components/SelectNonActiveBarBack.tsx`
- **Problem:** Its rows call `onClick(employee, "barBack", ...)`. The real
  position is `"Bar Back"`, so a bar back picked here would be saved with a
  working position that no page matches. Nothing imports this component
  today, so it has no effect yet.
- **Suggested fix:** Delete the file. `SelectNonActiveEmployee` does the same
  job for every position.

## 7. Edit window's hours boxes use `type="number"`, which react-number-format doesn't support

**Fixed:** the hours boxes are text boxes with `inputMode="decimal"` (the
number keyboard on phones), and `NumberTypeInput` is gone.

- **File:** `components/UpdateTipBreakDownModal.tsx` (the cook, bar back and
  bartender hours inputs)
- **Problem:** `NumericFormat` only supports `type` `text`, `tel` or
  `password` (that's how its types are written). It tracks the cursor with
  `setSelectionRange`, which browsers don't allow on number inputs, so typing
  in these boxes can behave oddly. The conversion keeps `type="number"`
  exactly as before (through `customInput`) so nothing changes.
- **Suggested fix:** Drop `NumberTypeInput` and use `type="text"` with the
  existing `inputMode="decimal"`, which still brings up the number keyboard
  on phones. Test the hours boxes on a phone afterwards.

## 8. A mistyped id in a detail page's URL sends an error alert email

**Fixed:** both pages now return a 404 for an invalid id before touching the
database.

- **Files:** `pages/getEmployee/[id].tsx` and
  `pages/getSelectedTipBreakDown/[id].tsx`, `getServerSideProps`.
- **Problem:** Neither page checks the id before `new ObjectId(id)`, which
  throws on anything that isn't a valid id (e.g. `/getSelectedTipBreakDown/abc`).
  The catch block reports it as a server error, so `ALERT_EMAIL` gets an email
  for what is only a bad link, and the page shows "not found" text with a 200
  status instead of a 404. `RegisterPage/[id]` and `reset-password/[id]`
  already check the id first.
- **Suggested fix:** Start both with `if (!isObjectId(id)) return { notFound: true };`
  (from `lib/objectId`).
