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

- [ ] **2.1 Stop duplicate breakdowns on refresh / Back**
  - Files: `components/TipBreakDown.js:39-44, 311`, `pages/TipBreakDownPage.js:74-79`
  - Problem: page auto-submits on mount. Duplicate check only sees 20 oldest records because of `.sort().limit(20)`.
  - Fix: remove `.limit(20)`. Better: move the duplicate check server-side into `addTipBreakDown` (`findOne({ show, date })`, return 409). Also stop auto-submitting on mount: re-enable the Submit button and confirmation dialog (currently commented out at lines 587-617) so refresh does not resubmit.
  - Verify: submit a breakdown, press browser Back, confirm no second record in `tipBreakdown`.

- [ ] **2.2 Handle failed submit**
  - File: `components/TipBreakDown.js:46-52, 364-390`
  - Problem: on a non-OK response the code pushes `/getSelectedTipBreakDown/undefined`.
  - Fix: only navigate when an id comes back. Set `submitError` and `setSubmitting(false)` otherwise.

- [ ] **2.3 Guard detail page against missing fields**
  - Files: `pages/getSelectedTipBreakDown/[id].js:14, 61, 67, 73`, `pages/api/removeTipBreakDown/[id].js:37`
  - Fix: move the `!breakDown` return above the `ShiftDate()` line. Use `(Number(x) || 0).toFixed(2)` for `totalBarSales`, `totalTips`, `foodSales`. Default `cookTips`, `barBackTips`, `BartenderTips` to `[]` in the API.
  - Verify: open `/getSelectedTipBreakDown/notanid` and an old record. No crash.

- [ ] **2.4 Allow zero values on edit**
  - File: `pages/api/UpdateTipBreakDown/[id].js:29-49`
  - Problem: truthiness checks drop 0 for `totalTips`, `foodSales`, `barBackPercentage`, `totalBarSales`.
  - Fix: use `!== undefined` checks. Delete the no-op cook/barback/bartender remapping at lines 53-107 and just assign the arrays.
  - Verify: edit a breakdown, set food sales to 0, reopen, confirm 0 persisted.

- [ ] **2.5 Allow 0% bar back and $0 tips in credit calculator**
  - File: `components/CreditTipCalculation.js:56-63`
  - Problem: effect only navigates when `barBackPercentage && totalTips` are truthy. Submit spinner hangs.
  - Fix: navigate directly inside `handleCalculate` instead of via the effect. Delete the effect. Use `!== null` checks.
  - Verify: set bar back % to 0, submit, page advances.

- [ ] **2.6 Store bartender tipOut as a number**
  - Files: `components/TipBreakDown.js:273-279`, `components/UpdateTipBreakDownModal.js:360-366`, `components/CashTipBreakDown.js:160-166`
  - Problem: `.toFixed(2)` converts to string before saving. Cooks and bar backs are numbers.
  - Fix: `obj.tipOut = Number(Number(obj.tipOut).toFixed(2))`. Then remove the prop-mutating workaround in `TipsTotalsSpreadSheet.js:116-124` and `CCTipsTotals.js:123-131` and use `Number(tip.amount)` where read.
  - Optional migration: one-off script to convert existing string amounts.

- [ ] **2.7 Spreadsheet links point to wrong breakdown**
  - Files: `components/TipsTotalsSpreadSheet.js:225-229`, `pages/CCTipsTotals.js:269-273`
  - Problem: `showIdMap` ignores date, so a band on two nights links both columns to the later record.
  - Fix: filter by `tip.date === date` before building the map.
  - Verify: create two breakdowns with the same show name on different dates, click each column header.

- [ ] **2.8 Return proper responses on API/SSR errors**
  - Files: `pages/api/getEmployees.js:15`, `pages/api/removeEmployee/[id].js:26`, `pages/Dashboard.js`, `pages/employees.js`, `pages/TipBreakDownPage.js`, `pages/getAllTipBreakDowns.js`
  - Fix: `res.status(500).json(...)` in the catch. Drop the extra `result` arg. Return `{ props: { ... : [] } }` or `{ notFound: true }` from every `getServerSideProps` catch.

---

## Phase 3: UI bugs (medium)

- [ ] **3.1 Band fetch failure crashes page**
  - File: `components/CurrentShift.js:323-338`
  - Fix: `setBandPerformingToday(data.bandPerformingToday || [])`, and `setIsLoading(false)` in both `.catch` and `.finally`. Show the "Enter an event" input whenever the list is empty, regardless of session.

- [x] **3.2 Calculator breaks after pressing `=`**
  - File: `components/CCTipsInput.js:22, 31, 57`
  - Fix: `setInputValue(String(roundedResult))`. Depends on 1.6.

- [ ] **3.3 Cash edit modal shows stale values**
  - File: `components/UpdateCashTipBreakDownModal.js:45-66`
  - Problem: state seeded from first-render props. On refresh `router.query` is empty on first render.
  - Fix: in `toggle()`, when opening, reset all `new*` state from current props. In `pages/CashTipBreakDownPage.js`, render nothing until `router.isReady`.

- [ ] **3.4 Delete confirmation closes the whole edit modal**
  - File: `components/UpdateTipBreakDownModal.js:905-910`
  - Fix: pass `toggle={toggleConfirmation}` to `DeleteDialog`. In `handleDelete`, set `showConfirmation` false before closing.

- [ ] **3.5 Edit modal ignores cooks-absent case**
  - File: `components/UpdateTipBreakDownModal.js:140`
  - Fix: `const cooksTips = cookTipsData.length === 0 ? 0 : foodSales * 0.15;`

- [ ] **3.6 Edit modal shows stale data after update**
  - File: `components/UpdateTipBreakDownModal.js:25-46`
  - Problem: `useState(breakDown.x)` never re-syncs after `router.push` refetches.
  - Fix: add a `useEffect` on `breakDown._id`/`breakDown.updatedat` that resets state, or key the modal by `breakDown.updatedat` in the parent.

- [ ] **3.7 Session warning timer leak**
  - File: `components/SessionExpirationWarning.js:6, 22, 88-107, 431`
  - Fix: delete the render-body `setInterval` (lines 102-107). Remove the nonexistent `refreshSession` import and `expires` destructure. Make the modal `isOpen={showWarning}` and have both buttons set it false. `handleStaySignedIn` should call `useSession().update()` (next-auth v4.22+) to extend the JWT.

- [ ] **3.8 Validate staff counts in cash calculator**
  - Files: `pages/CashTipCalculator.js:247, 268`, `components/UpdateCashTipBreakDownModal.js:355, 380`
  - Fix: `pattern="[1-9][0-9]*"`, `min="1"`, `parseInt`. Reject 0 with a message.

- [ ] **3.9 Edge cases in date handling**
  - Files: `pages/CCTipsTotals.js:33-39`, `components/DateRange.js:9`
  - Fix: ignore `onChange` when `e.target.value` is empty. Use `DateTime.now().setZone("America/Los_Angeles")` in `getPayrollDates`. Make the two date inputs controlled so the Prev/Next buttons update them.

---

## Phase 4: Cleanup (low)

- [ ] **4.1 Remove dead code**
  - `pages/api/extendSession.js` (uses nonexistent `req.session`)
  - `pages/api/auth.js` (empty passport stub, shadows `/api/auth`)
  - `components/SelectNonActiveCook.js` (empty), `components/SelectNonActiveBarBack.js`, and `NonActivePostionHandler` in `AddGuestEmployee.js:149-187`
  - `RegisterButton` in `AddGuestEmployee.js:23-27` (no return)
  - `components/GetAllTipBreakdowns.js` and its import/log in `TipBreakDown.js:12, 16`
  - Moroccan branch after `return` in `CurrentShift.js:281-298`, unused `ShiftDay`, `const test`
  - Commented-out blocks in `SessionExpirationWarning.js`, `StandardCreditTipCalculator.js`, `BartenderHourlyInput.js`, `HourlyCashInput.js`
  - `toggleConfirmation` in `UpdateCashTipBreakDownModal.js:221` (references undeclared state)
  - Unused `Bartenders` at bottom of `NonPositionedEmployee.js`

- [ ] **4.2 Remove stray imports**
  - `pages/_app.js:10` `session` from passport
  - `pages/api/auth/[...nextauth].js:4, 6, 10` GithubProvider, AzureADProvider, useRouter
  - `pages/api/getEmployee/[id].js:2` userRouter
  - `pages/api/UpdateTipBreakDown/[id].js:1` BarBacks component
  - `components/SelectBartender.js:5-6` `on` from events, `e` from cors
  - `getStartDate`, `getEndDate` in `TipsTotalsSpreadSheet.js` and `CCTipsTotals.js` (do not exist)

- [ ] **4.3 Remove unused dependencies**
  - `react-router-dom`, `passport`, `passport-local`, `cors`, `tailwindcss`, `node-fetch` (Node 18+ has global fetch)
  - Pin `next` to an exact major instead of `latest`.

- [ ] **4.4 Strip console.log noise**
  - Nearly every file. Keep `console.error` in catch blocks.

- [ ] **4.5 Small fixes**
  - `UpdateTipBreakDownModal.js:635` `type="textrea"` -> `"textarea"`
  - `pages/getAllTipBreakDowns.js:92` move `key` to the `Col`
  - `pages/api/sendEmail.js:14` build link from `process.env.NEXTAUTH_URL`
  - `pages/_document.js:14` `crossOrigin="anonymous"`
  - `components/Register.js:132` `type="submit "` trailing space
  - `components/AllTipBreakDowns.js:132, 156` add the same `Number(x) || 0` guards already added to `getAllTipBreakDowns.js`
  - `pages/getEmployee/[id].js:121`, `components/EmployeeList.js:9, 15` guard `employee.position || []`

- [ ] **4.6 Deduplicate spreadsheet**
  - `components/TipsTotalsSpreadSheet.js` and `pages/CCTipsTotals.js` are ~340-line copies. Make `CCTipsTotals` render `TipsTotalsSpreadSheet` with a `showDateInputs` prop.

- [ ] **4.7 NextAuth adapter writes to the wrong database**
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
