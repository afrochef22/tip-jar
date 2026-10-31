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
