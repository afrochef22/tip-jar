# Tip Jar Fix Plan

Work top to bottom. Each item has the files involved, what is wrong, the fix, and how to verify.
Check the box when done. Commit after each phase.

---

## Phase 1: Security (critical)

- [x] **1.1 Add auth to every API route**
  - Files: all of `pages/api/*` except `auth/[...nextauth].js` and `FindBandPerformingToday.js`
  - Problem: no route checks for a session. Anyone can add/edit/delete employees and breakdowns, set passwords, and send emails.
  - Fix: create `lib/requireAuth.js` that wraps a handler with `getServerSession(req, res, authOptions)` and returns 401 when missing. Export `authOptions` from `[...nextauth].js`. Apply to: `addEmployee`, `getEmployees`, `getEmployee/[id]`, `updateEmployee/[id]`, `removeEmployee/[id]`, `removeTipBreakDown/[id]`, `sendEmail`.
  - Decision needed: `addTipBreakDown` and `UpdateTipBreakDown` are used by unauthenticated staff at end of shift. Options: keep them open but only for today's shift date (server-side `ShiftDate()` check), or require login. Pick one before implementing.
  - Verify: `curl -X DELETE localhost:3000/api/removeEmployee/<id>` returns 401 when logged out.

- [x] **1.2 Fix Google sign-in account linking**
  - File: `pages/api/auth/[...nextauth].js:117-153`
  - Problem: unknown Google users are linked to the first employee whose `firstName` matches `profile.given_name`, overwriting `googleId` and `email`. Any Google user with a matching first name logs in as that employee.
  - Fix: remove the `updateOne` by first name. Only allow sign-in when `employees.findOne({ email: profile.email })` already exists. Set `googleId` on that record if not set. Return `false` otherwise.
  - Verify: sign in with a Google account whose email is not in `employees`. Must be rejected.

- [x] **1.3 Registration token hygiene**
  - Files: `components/Register.js:44-56`, `pages/api/updateEmployee/[id].js`
  - Problem: token stays valid for 7 days after registration. Username uniqueness is never checked.
  - Fix: in the registration PATCH, also send `token: null, tokenExpiration: null` (API must allow `$unset`). Move token/expiry validation server-side into the PATCH handler (reject if `data.token` mismatch or expired) instead of trusting the client. Add a `findOne({ username })` conflict check that returns 409.
  - Verify: register once, reload the same link, expect redirect to `/TokenExpired`.

- [x] **1.4 Protect sensitive pages**
  - File: `middleware.js:16`
  - Problem: `/getEmployee/[id]`, `/employees` sub-pages, `/RegisterPage` data exposure.
  - Fix: extend matcher to `["/employees", "/Dashboard", "/getEmployee/:path*"]`. Decide whether `/CCTipsTotals` and `/getAllTipBreakDowns` should stay public (staff use them without login today).
  - Verify: visit `/getEmployee/<id>` logged out, expect redirect to sign-in.

- [x] **1.5 Stop logging session and token**
  - File: `pages/api/auth/[...nextauth].js:77, 116, 125`
  - Fix: delete the `console.log` calls.

- [x] **1.6 Remove `eval` from calculator**
  - File: `components/CCTipsInput.js:41`
  - Fix: split `inputValue` on `+`, `Number()` each part, sum. Reject anything that fails `/^\d*\.?\d{0,2}$/`.

---

## Phase 2: Data integrity (high)

- [x] **2.1 Stop duplicate breakdowns on refresh / Back**
  - Files: `components/TipBreakDown.js:39-44, 311`, `pages/TipBreakDownPage.js:74-79`
  - Problem: page auto-submits on mount. Duplicate check only sees 20 oldest records because of `.sort().limit(20)`.
  - Fix: remove `.limit(20)`. Better: move the duplicate check server-side into `addTipBreakDown` (`findOne({ show, date })`, return 409). Also stop auto-submitting on mount: re-enable the Submit button and confirmation dialog (currently commented out at lines 587-617) so refresh does not resubmit.
  - Verify: submit a breakdown, press browser Back, confirm no second record in `tipBreakdown`.

- [x] **2.2 Handle failed submit**
  - File: `components/TipBreakDown.js:46-52, 364-390`
  - Problem: on a non-OK response the code pushes `/getSelectedTipBreakDown/undefined`.
  - Fix: only navigate when an id comes back. Set `submitError` and `setSubmitting(false)` otherwise.

- [x] **2.3 Guard detail page against missing fields**
  - Files: `pages/getSelectedTipBreakDown/[id].js:14, 61, 67, 73`, `pages/api/removeTipBreakDown/[id].js:37`
  - Fix: move the `!breakDown` return above the `ShiftDate()` line. Use `(Number(x) || 0).toFixed(2)` for `totalBarSales`, `totalTips`, `foodSales`. Default `cookTips`, `barBackTips`, `BartenderTips` to `[]` in the API.
  - Verify: open `/getSelectedTipBreakDown/notanid` and an old record. No crash.

- [x] **2.4 Allow zero values on edit**
  - File: `pages/api/UpdateTipBreakDown/[id].js:29-49`
  - Problem: truthiness checks drop 0 for `totalTips`, `foodSales`, `barBackPercentage`, `totalBarSales`.
  - Fix: use `!== undefined` checks. Delete the no-op cook/barback/bartender remapping at lines 53-107 and just assign the arrays.
  - Verify: edit a breakdown, set food sales to 0, reopen, confirm 0 persisted.

- [x] **2.5 Allow 0% bar back and $0 tips in credit calculator**
  - File: `components/CreditTipCalculation.js:56-63`
  - Problem: effect only navigates when `barBackPercentage && totalTips` are truthy. Submit spinner hangs.
  - Fix: navigate directly inside `handleCalculate` instead of via the effect. Delete the effect. Use `!== null` checks.
  - Verify: set bar back % to 0, submit, page advances.

- [x] **2.6 Store bartender tipOut as a number**
  - Files: `components/TipBreakDown.js:273-279`, `components/UpdateTipBreakDownModal.js:360-366`, `components/CashTipBreakDown.js:160-166`
  - Problem: `.toFixed(2)` converts to string before saving. Cooks and bar backs are numbers.
  - Fix: `obj.tipOut = Number(Number(obj.tipOut).toFixed(2))`. Then remove the prop-mutating workaround in `TipsTotalsSpreadSheet.js:116-124` and `CCTipsTotals.js:123-131` and use `Number(tip.amount)` where read.
  - Optional migration: one-off script to convert existing string amounts.

- [x] **2.7 Spreadsheet links point to wrong breakdown**
  - Files: `components/TipsTotalsSpreadSheet.js:225-229`, `pages/CCTipsTotals.js:269-273`
  - Problem: `showIdMap` ignores date, so a band on two nights links both columns to the later record.
  - Fix: filter by `tip.date === date` before building the map.
  - Verify: create two breakdowns with the same show name on different dates, click each column header.

- [x] **2.8 Return proper responses on API/SSR errors**
  - Files: `pages/api/getEmployees.js:15`, `pages/api/removeEmployee/[id].js:26`, `pages/Dashboard.js`, `pages/employees.js`, `pages/TipBreakDownPage.js`, `pages/getAllTipBreakDowns.js`
  - Fix: `res.status(500).json(...)` in the catch. Drop the extra `result` arg. Return `{ props: { ... : [] } }` or `{ notFound: true }` from every `getServerSideProps` catch.

---

## Phase 3: UI bugs (medium)

- [x] **3.1 Band fetch failure crashes page**
  - File: `components/CurrentShift.js:323-338`
  - Fix: `setBandPerformingToday(data.bandPerformingToday || [])`, and `setIsLoading(false)` in both `.catch` and `.finally`. Show the "Enter an event" input whenever the list is empty, regardless of session.

- [x] **3.2 Calculator breaks after pressing `=`**
  - File: `components/CCTipsInput.js:22, 31, 57`
  - Fix: `setInputValue(String(roundedResult))`. Depends on 1.6.

- [x] **3.3 Cash edit modal shows stale values**
  - File: `components/UpdateCashTipBreakDownModal.js:45-66`
  - Problem: state seeded from first-render props. On refresh `router.query` is empty on first render.
  - Fix: in `toggle()`, when opening, reset all `new*` state from current props. In `pages/CashTipBreakDownPage.js`, render nothing until `router.isReady`.

- [x] **3.4 Delete confirmation closes the whole edit modal**
  - File: `components/UpdateTipBreakDownModal.js:905-910`
  - Fix: pass `toggle={toggleConfirmation}` to `DeleteDialog`. In `handleDelete`, set `showConfirmation` false before closing.

- [x] **3.5 Edit modal ignores cooks-absent case**
  - File: `components/UpdateTipBreakDownModal.js:140`
  - Fix: `const cooksTips = cookTipsData.length === 0 ? 0 : foodSales * 0.15;`

- [x] **3.6 Edit modal shows stale data after update**
  - File: `components/UpdateTipBreakDownModal.js:25-46`
  - Problem: `useState(breakDown.x)` never re-syncs after `router.push` refetches.
  - Fix: add a `useEffect` on `breakDown._id`/`breakDown.updatedat` that resets state, or key the modal by `breakDown.updatedat` in the parent.

- [x] **3.7 Session warning timer leak**
  - File: `components/SessionExpirationWarning.js:6, 22, 88-107, 431`
  - Fix: delete the render-body `setInterval` (lines 102-107). Remove the nonexistent `refreshSession` import and `expires` destructure. Make the modal `isOpen={showWarning}` and have both buttons set it false. `handleStaySignedIn` should call `useSession().update()` (next-auth v4.22+) to extend the JWT.

- [x] **3.8 Validate staff counts in cash calculator**
  - Files: `pages/CashTipCalculator.js:247, 268`, `components/UpdateCashTipBreakDownModal.js:355, 380`
  - Fix: `pattern="[1-9][0-9]*"`, `min="1"`, `parseInt`. Reject 0 with a message.

- [x] **3.9 Edge cases in date handling**
  - Files: `pages/CCTipsTotals.js:33-39`, `components/DateRange.js:9`
  - Fix: ignore `onChange` when `e.target.value` is empty. Use `DateTime.now().setZone("America/Los_Angeles")` in `getPayrollDates`. Make the two date inputs controlled so the Prev/Next buttons update them.

---

## Phase 4: Cleanup (low)

- [x] **4.1 Remove dead code**
  - `pages/api/extendSession.js` (uses nonexistent `req.session`)
  - `pages/api/auth.js` (empty passport stub, shadows `/api/auth`)
  - `components/SelectNonActiveCook.js` (empty), `components/SelectNonActiveBarBack.js`, and `NonActivePostionHandler` in `AddGuestEmployee.js:149-187`
  - `RegisterButton` in `AddGuestEmployee.js:23-27` (no return)
  - `components/GetAllTipBreakdowns.js` and its import/log in `TipBreakDown.js:12, 16`
  - Moroccan branch after `return` in `CurrentShift.js:281-298`, unused `ShiftDay`, `const test`
  - Commented-out blocks in `SessionExpirationWarning.js`, `StandardCreditTipCalculator.js`, `BartenderHourlyInput.js`, `HourlyCashInput.js`
  - `toggleConfirmation` in `UpdateCashTipBreakDownModal.js:221` (references undeclared state)
  - Unused `Bartenders` at bottom of `NonPositionedEmployee.js`

- [x] **4.2 Remove stray imports**
  - `pages/_app.js:10` `session` from passport
  - `pages/api/auth/[...nextauth].js:4, 6, 10` GithubProvider, AzureADProvider, useRouter
  - `pages/api/getEmployee/[id].js:2` userRouter
  - `pages/api/UpdateTipBreakDown/[id].js:1` BarBacks component
  - `components/SelectBartender.js:5-6` `on` from events, `e` from cors
  - `getStartDate`, `getEndDate` in `TipsTotalsSpreadSheet.js` and `CCTipsTotals.js` (do not exist)

- [x] **4.3 Remove unused dependencies**
  - `react-router-dom`, `passport`, `passport-local`, `cors`, `tailwindcss`, `node-fetch` (Node 18+ has global fetch)
  - Pin `next` to an exact major instead of `latest`.

- [x] **4.4 Strip console.log noise**
  - Nearly every file. Keep `console.error` in catch blocks.

- [x] **4.5 Small fixes**
  - `UpdateTipBreakDownModal.js:635` `type="textrea"` -> `"textarea"`
  - `pages/getAllTipBreakDowns.js:92` move `key` to the `Col`
  - `pages/api/sendEmail.js:14` build link from `process.env.NEXTAUTH_URL`
  - `pages/_document.js:14` `crossOrigin="anonymous"`
  - `components/Register.js:132` `type="submit "` trailing space
  - `components/AllTipBreakDowns.js:132, 156` add the same `Number(x) || 0` guards already added to `getAllTipBreakDowns.js`
  - `pages/getEmployee/[id].js:121`, `components/EmployeeList.js:9, 15` guard `employee.position || []`

- [ ] **4.6 Deduplicate spreadsheet**
  - `components/TipsTotalsSpreadSheet.js` and `pages/CCTipsTotals.js` are ~340-line copies. Make `CCTipsTotals` render `TipsTotalsSpreadSheet` with a `showDateInputs` prop.

- [x] **4.7 NextAuth adapter writes to the wrong database**
  - File: `pages/api/auth/[...nextauth].js` `MongoDBAdapter(clientPromise)`
  - Problem: the adapter uses the connection string's default database, which is `test`, so `users` / `accounts` / `verification_tokens` live outside `TeragramBallroom`.
  - Fix: `MongoDBAdapter(clientPromise, { databaseName: "TeragramBallroom" })`. Existing Google users will be re-created on next sign-in; employee linking is unaffected because it keys on the employee `email`.

- [ ] **4.8 Tooling**
  - Add `next.config.js` with `reactStrictMode: true`.
  - Add ESLint (`next lint`) to catch unused imports and hook violations.

---

## Order of commits

1. Phase 1 (one commit per item, these are the risky ones)
2. Phase 2 items 2.1-2.5, then 2.6-2.8
3. Phase 3
4. Phase 4 as one or two sweeps

## Decisions (2026-09-17)

1. Breakdown submit, edit, and delete stay open for logged-out staff, restricted server-side to the current shift date. Managers can touch any date.
2. `/CCTipsTotals` and `/getAllTipBreakDowns` stay public.
3. Assume existing data has string `tipOut` / `amount` values. 2.6 needs a migration script.

## Progress notes

- Phase 1 done. New files: `lib/auth.js` (session helpers), `lib/shiftDate.js` (pure shift-date logic, re-exported from `components/CurrentShift.js`).
  - Guest fill-ins can still be created logged out, but only with `active: false`.
  - Registration tokens are now generated and stored by `/api/sendEmail`; the client no longer writes them. The link is single-use and validated server-side.
  - `1.3` username uniqueness returns 409; `Register.js` shows the message.
  - Registration links are also consumed by a Google sign-in (the sign-in callback clears `token`/`tokenExpiration`), and `RegisterPage` validates the token server-side so a used link redirects to `/TokenExpired` before rendering.

- Phase 2 done.
  - `TipBreakDown.js` no longer auto-submits on mount; Submit/Back buttons and the confirmation dialog are back, and a failed submit shows an error instead of navigating to `/undefined`. Fixed a real bug found along the way: the duplicate-show check read `allTipBreakdowns.allTipBreakdowns` (always undefined), so it never actually caught duplicates client-side.
  - `addTipBreakDown` API now also rejects a duplicate `{show, date}` server-side (409) as a second line of defense, and coerces `tipOut` to a number when writing `tipsCollected`.
  - `UpdateTipBreakDown` API now copies fields with `!== undefined` instead of truthiness, so 0 and empty string survive an edit. Removed the dead no-op remap of `cookTips`/`barBackTips`/`bartenderTips`.
  - `getSelectedTipBreakDown/[id].js` checks `!breakDown` before touching any field, defaults the three tip arrays to `[]`, and formats all dollar amounts with `Number(x) || 0`.
  - `CreditTipCalculation.js`: removed the effect that gated navigation on `barBackPercentage && totalTips` being truthy (blocked 0% bar back and $0 tips); `handleCalculate` now builds the query and pushes directly.
  - Bartender `tipOut` is now stored as a `Number` everywhere it's written (`TipBreakDown.js`, `UpdateTipBreakDownModal.js`, `CashTipBreakDown.js`), matching cooks/bar backs. Removed the prop-mutating `forEach` workaround in both spreadsheet files; reads now do `Number(...)` inline.
  - `showIdMap` in both spreadsheet files now filters by `tip.date === date` before mapping show name to id, so a repeat show name on a different date links to the right breakdown.
  - `getServerSideProps` catch blocks in `Dashboard.js`, `employees.js`, `getAllTipBreakDowns.js`, `TipBreakDownPage.js` now return `{ props: { ...: [] } }` instead of `undefined`.
  - New `scripts/migrate-tipout-numbers.js` (dry-run by default, `--apply` to write) converts string `tipOut`/`amount` values to numbers. Ran it against production: **448 tipBreakdown docs / 1396 values** and **17 employee docs / 1361 values** were converted; a follow-up dry run confirmed 0 remaining string values.
  - Minor cleanup while in these files: removed the unused `GetAllTipBreakdowns` import/log from `TipBreakDown.js`, the dead `data` object in `CreditTipCalculation.js`'s form handler, and now-unused `useEffect` imports in both.

- Phase 3 done.
  - `CurrentShift.js`: a failed or malformed `/api/FindBandPerformingToday` response now falls back to `[]` and always clears the loading spinner via `.finally()`, instead of leaving the page stuck loading forever.
  - `CashTipBreakDownPage.js` renders `null` until `router.isReady`, so the cash breakdown view (and the edit modal it seeds) never mounts with a one-frame `NaN`/empty snapshot of the query string on a hard refresh.
  - `UpdateCashTipBreakDownModal.js`'s `toggle()` now resyncs every field (counts, staff arrays, percentage, hours-toggle switches) from current props on open, not just tips collected, so reopening the modal never shows a previous edit's leftovers.
  - `UpdateTipBreakDownModal.js`: the delete confirmation dialog's Cancel button now closes only the confirmation (`toggleConfirmation`) instead of the whole edit modal (`toggle`), which used to leave `showConfirmation` stuck `true` for next time.
  - `getSelectedTipBreakDown/[id].js` now keys `UpdateTipBreakDownModal` on `breakDown.updatedat` (falling back to `_id`), forcing it to remount with fresh state after a save, instead of keeping stale `useState` values from before the update.
  - `SessionExpirationWarning.js` rewritten: removed the render-body `setInterval` that leaked a new timer on every render, the nonexistent `refreshSession` import and `expires` destructure, and the dead `modal`/`swr` plumbing. One effect now polls every 30s, shows the warning inside 5 minutes of expiry, and signs out immediately once actually expired. "Stay Signed In" calls `useSession().update()` to refresh the session instead of a no-op bare `mutate()` from `swr`.
  - Staff-count inputs (`CashTipCalculator.js`, `UpdateCashTipBreakDownModal.js`) now require a whole number of at least 1 (`pattern="[1-9][0-9]*"`, `min="1"`, `parseInt`), and the change handlers no longer regenerate the staff array for 0 or invalid input, so a 0-count no longer sets up a later divide-by-zero.
  - `CCTipsTotals.js` date pickers are now controlled (`value={startDate.toISODate()}`), so Previous/Next Pay Period visibly updates them, and clearing a date input no longer sets state to an invalid Luxon `DateTime` that silently broke every downstream comparison.
  - `DateRange.js`'s `getPayrollDates()` now anchors "today" to `America/Los_Angeles` instead of the server/browser's local zone, so the pay-period boundary is the same whether it runs server-side (UTC) or client-side. Removed a module-level `getPayrollDates()` call and two `console.log`s that ran as a side effect of importing the file.
  - Note: item 3.5 (cooks-absent guard in the edit modal) was already fixed as part of the Phase 2 patch.

- Phase 4a done (4.1, 4.2, 4.5, 4.7 — dead code, stray imports, small fixes, NextAuth adapter database).
  - Removed `pages/api/extendSession.js` and `pages/api/auth.js` (both dead: the former used a nonexistent `req.session`, the latter was an empty passport stub shadowing the real `/api/auth` route). Removed empty `components/SelectNonActiveCook.js` and unused `components/GetAllTipBreakdowns.js`.
  - Removed the broken `RegisterButton` (no `return`, always rendered nothing) and its usage, and the dead `NonActivePostionHandler` in `AddGuestEmployee.js` (never called; referenced `SelectNonActiveBarBack`/`SelectNonActiveCook` without importing them). Left `components/SelectNonActiveBarBack.js` itself in place — it's a real, complete, working component, just orphaned, so removing it felt like a bigger call than clearing genuinely broken/empty stubs; it has no effect on the app since nothing imports it.
  - Removed the dead second `Bartenders` declaration at the bottom of `NonPositionedEmployee.js`, the dead `toggleConfirmation` in `UpdateCashTipBreakDownModal.js` (referenced `showConfirmation` state that doesn't exist in that component), and the commented-out JSX blocks in `StandardCreditTipCalculator.js`, `BartenderHourlyInput.js`, `HourlyCashInput.js`.
  - Removed stray/broken imports: `session` from `passport` in `pages/_app.js`; `on` from `events` and `e` from `cors` in `SelectBartender.js`; the nonexistent `getStartDate`/`getEndDate` from both spreadsheet files' `DateRange` import.
  - Small fixes: `type="textrea"` → `"textarea"`; moved a `key` prop from a nested `Card` onto the actual `.map()`-returned `Col` in `getAllTipBreakDowns.js`; `crossOrigin="true"` → `"anonymous"` in `_document.js`; added the same `Number(x) || 0` display guards to `AllTipBreakDowns.js` that `getAllTipBreakDowns.js` already had; guarded `employee.position` with `|| []` in `getEmployee/[id].js` and `EmployeeList.js` for records that predate that field.
  - `MongoDBAdapter` now passes `{ databaseName: "TeragramBallroom" }` so NextAuth's own `users`/`accounts`/`verification_tokens` collections land in the app's database instead of the connection string's default (`test`). Google users get re-created there on next sign-in; employee linking is unaffected since it keys on the employee's `email`, not the adapter's `users` collection.
  - Noticed but not touched: `next build` now warns that the `middleware.js` convention is deprecated in favor of `proxy.js`. Left as-is since it still works and is auth-critical; worth a deliberate follow-up rather than folding into this cleanup pass.

- Phase 4b done (4.3 — unused dependencies).
  - `pages/api/FindBandPerformingToday.js` now uses the global `fetch` (Node 18+) instead of a dynamic `import("node-fetch")`. Verified live against the real venue site through the running dev server.
  - Removed from `package.json`: `react-router-dom`, `passport`, `passport-local`, `cors`, `tailwindcss`, `node-fetch` (all confirmed zero usages after Phase 4a). Also removed `swr` and `react-select`, which turned out to be fully unused too — `swr` only because the Phase 3 `SessionExpirationWarning` rewrite removed its one call site; `react-select` was never used anywhere. Pinned `next` to `^16.1.1` instead of `latest`.
  - Ran `npm install` (122 packages removed) and a safe `npm audit fix` (no `--force`), which took vulnerabilities from 26 down to 9. The remaining 9 all need a major-version bump (`bcrypt` 5→6, `uuid` 9→14) or have no fix at all (`@auth/core`, `cookie`) — left alone since `bcrypt` is on the password-hashing path and `uuid` generates registration tokens, both worth a deliberate, tested upgrade rather than a silent one in a cleanup pass.
  - Found and removed 3 dead `@tailwind base/components/utilities;` lines at the top of `styles/globals.css`: there's no `tailwind.config.js` or `postcss.config.js` anywhere in the repo, so these never did anything even before `tailwindcss` was removed from `package.json` — Turbopack just started warning about the unknown at-rule where the previous bundler had silently ignored it.
  - `npm install` also let Next.js auto-migrate `tsconfig.json`'s `moduleResolution` from `node` to `bundler` (its own recommended setting for the resolved Next 16.3.5); left as applied.
  - `npm install` briefly took down the dev server that was running throughout this session (it depended on packages that had just been removed from `node_modules`); restarted it and confirmed it comes back up clean on port 3000.

- Phase 4c done (4.4 — console.log noise).
  - Wrote a paren/string/comment-aware script (kept at hand, not committed) that removed 124 standalone `console.log(...)` statements across 24 files, including multi-line calls, without touching `console.error`. It flagged 9 occurrences it wouldn't touch automatically; all 9 turned out to be already-commented-out `// console.log(...)` debris, which were then removed by hand along with the rest.
  - Caught and fixed one real mistake from that manual pass: removing a comment sandwiched between two statements in `pages/api/UpdateTipBreakDown/[id].js` ate the wrong newline and merged `updatedTipAmount = Number(barBack.tipOut);` and the following line onto one physical line (still valid JS, caught by reviewing the diff rather than the build, since it doesn't need a newline between statements).
  - Normalized a handful of resulting double-blank-lines back to single blank lines in the 5 files where a removed `console.log` had blank lines on both sides.
  - Verified with `git diff`: every changed file is purely subtractive (0 insertions across all 27 touched files) aside from the merged-line fix, and a search confirmed no removed line contains anything other than blank lines or parts of a `console.log(...)` call.

## Follow-up requests (outside the numbered plan)

- **Fixed:** tip breakdown card showing a white background instead of dark. Cause: Bootstrap's `.card` class and the app's custom `.backgroundColor` class had equal CSS specificity, so whichever loaded last in the bundle won. Made it a compound selector (`.cardContainer.backgroundColor`) in `AllTipBreakDowns.module.css` so it always wins. This was not something introduced by Phases 1-3 (confirmed by diffing every commit against no CSS/className changes) — likely a pre-existing ordering issue.
- **Fixed:** allow 0 bar backs in the cash calculator. Item 3.8 had required both bar back and bartender counts to be at least 1 to prevent a divide-by-zero. The bar back math (`components/CashTipBreakDown.js`) already special-cased `numberOfBarBacks === 0` to route 100% of tips to bartenders, so relaxed the bar back count input back to `min="0"` in both `pages/CashTipCalculator.js` and `components/UpdateCashTipBreakDownModal.js`, while keeping the bartender count at `min="1"` (there's no equivalent zero-bartender path — tips have to go to someone). Verified with a dry run that the payout math produces no `NaN` with 0 bar backs.
