# Tip Jar: What's Next

This follows on from `GAME_PLAN.md`, which is done — every bug found in the
original code review is fixed and committed. This file covers what's still
missing: one real bug in the same family as things already fixed, some
security housekeeping intentionally deferred, and a set of operational and
product gaps that are worth deciding on rather than leaving unexamined.

Ordered roughly by how much it matters. Check items off as they're done.

---

## 0. Follow-ups from the 2026-10-22 audit (do these first)

The audit fixed and deployed: employee secrets leaking on public pages,
duplicate tip breakdowns (plus removing the five 2024 duplicates), silent
save/delete failures, and page size/speed. What's left:

- [x] **Resend registration links to the 6 employees with pending ones** (done 2026-10-23)
  - Until 2026-10-22, `/SelectWorkingEmployee` and `/CCTipsTotals` put every employee's registration token in the public page source. Resending a link replaces the token, so the old (possibly copied) one stops working.
- [x] **Have anyone with a password change it** (done 2026-10-23)
  - Password hashes were in the same public page data. bcrypt makes them slow to crack, not impossible.
- [ ] **Open the Dashboard once while signed in and confirm it looks normal**
  - It now loads less breakdown data and couldn't be checked without a sign-in.
- [ ] **Decide whether every signed-in user should be a manager**
  - There are no roles: anyone who completes registration can see and edit everything, including payroll and employees. Fine if only managers ever get registration links; worth a `role` field if staff do.
- [ ] **Happy Hour can only be submitted once per day**
  - Kept on purpose (one button). On a night with two happy hours (e.g. 10/20: "Happy Hour Cafe" and "Happy Hour Main"), the second has to be typed into "Enter an event", which logged-out staff only see on nights with no show.
- [ ] **Load the spreadsheet one pay period at a time** (later, if it feels slow)
  - `CCTipsTotals` is still ~389 KB, mostly every employee's full `tipsCollected` history, and grows every shift. Fixing it means the pay-period arrows fetch data as you move between periods. Skipped for now as the riskiest change on the payroll page for a modest gain.
- [ ] **Deploys: production only updates from GitHub `main`**
  - Branch pushes only make Vercel previews. 14 commits sat unpushed on local `main` from 2026-09-17 to 2026-10-22, so production ran old code the whole time. After finishing work, check `git log origin/main..main` is empty.

---

## 1. Deleting an employee with real history erases them from past payroll totals (real bug)

- [x] **Make `removeEmployee` refuse to hard-delete anyone with tip history; steer to deactivating instead**
  - File: `pages/api/removeEmployee/[id].js`
  - Corrected understanding (the first draft of this item had the mechanism wrong): each shift's breakdown record (`tipBreakdown`) already stores the employee's name, position, and tip amount directly, so it stays fully accurate forever no matter what happens to the employee document later — that part was never broken.
  - The real problem is the payroll spreadsheet (`CCTipsTotals`, and the Dashboard's pay-period view). It builds its totals by reading `tipsCollected` off every employee's own document (`employees.find({})` with no filter on `active`). A _deactivated_ employee still shows up correctly in past pay periods, exactly as it should. But if the employee document is _deleted_ outright, their entire tip history vanishes from that spreadsheet along with it — so someone who quit and had their record deleted would silently disappear from last month's payroll totals, even though the shift-by-shift detail pages still show their name.
  - Fix: in `removeEmployee`, check the employee's `tipsCollected` before deleting. If it's non-empty, reject the delete (409) with a message telling the manager to deactivate instead (`active: false`) — which the app already fully supports and which keeps the person correctly in all historical views. Only allow a hard delete when `tipsCollected` is empty (a genuine mistake, like a fill-in typo that was never actually paid out).
  - Done 2026-10-23: deletes with tip history get a 409 telling the manager to uncheck Active; tested on a throwaway record (409 with history, 200 without, 404 after).
  - Verify: try to delete an employee with tip history, confirm it's refused and told to deactivate instead; deactivate them and confirm they still appear correctly in a past pay period's spreadsheet total; delete an employee with zero tip history and confirm that still works.

---

## 2. Security housekeeping left on purpose

- [ ] **Decide on the `bcrypt` and `uuid` major-version bumps**
  - Context: `npm audit fix` (no `--force`) already took vulnerabilities from 26 down to 9. The remaining 9 all need `bcrypt` 5→6 or `uuid` 9→14, both breaking changes I didn't want to apply silently.
  - `bcrypt` sits on the password-hashing path (`updateEmployee` API, credentials sign-in) — a version bump needs a real test of registering and signing in with a password afterward, since the native binding can change.
  - `uuid` generates registration tokens (`sendEmail` API) — lower risk, mostly an import-style change, but still worth testing a registration link end to end after bumping.
  - Decision needed: bump both now (I can do it and verify both flows), bump neither, or bump just `uuid` since it's lower-risk.

---

## 3. Confirm there's an actual backup / recovery plan for the database

- [x] **Find out what MongoDB host this uses and whether backups are on**
  - Answer (2026-10-23): MongoDB Atlas free tier, which has no backups. Instead, `npm run backup` (`scripts/backup.js`) saves every collection to `backups/<timestamp>/` as Extended JSON. That folder is gitignored because it holds password hashes. Run it weekly and before any script that writes to live data. There is no restore script yet.
  - This session made several irreversible writes directly to production: deleting duplicate employee records, converting ~2,750 stored tip values from strings to numbers. Both were done carefully with dry runs, but "carefully" isn't the same as "recoverable."
  - Action: check whether the Mongo cluster (Atlas or otherwise) has continuous backups / point-in-time recovery turned on. If not, turn it on — for most hosts this is a checkbox, not a project.
  - No code change here, just confirming an operational fact.

---

## 4. No error visibility once deployed

- [ ] **Add basic error monitoring (e.g. Sentry) or at minimum confirm someone actually reads Vercel's logs**
  - Every failure path in this app ends at `console.error`, which on Vercel only surfaces in deployment logs. If the database has a bad moment during a Friday night shift, staff sees a generic error screen and nobody finds out unless someone happens to go looking afterward.
  - Minimal version: wire up a free-tier Sentry project for the API routes (a few lines in each `catch` block, or a wrapper like the `requireSession` helper already used for auth). Bigger version: proper structured logging plus an alert.
  - Decision needed: is this worth the setup for an app this size, or is "check the Dashboard the next morning" good enough given how the venue operates?

---

## 5. No rate limiting on the endpoints logged-out staff can hit

- [ ] **Add basic rate limiting to `addTipBreakDown` and `UpdateTipBreakDown`**
  - These intentionally stay open to logged-out staff for the current shift (that was a deliberate decision earlier in this project). The only guard against abuse is the duplicate check on show name + date.
  - Someone could still spam distinct show names, or hammer the endpoint for other reasons, with nothing to slow them down.
  - Fix: a lightweight IP-based rate limit (many options — Vercel's own, or a simple in-memory/Upstash-Redis token bucket) on the two logged-out-accessible write routes. Low urgency for a small venue, but cheap to add.

---

## 6. The band lookup is a fragile scrape with no fallback signal

- [ ] **Make `FindBandPerformingToday` fail loudly instead of silently**
  - File: `pages/api/FindBandPerformingToday.js`
  - It scrapes `teragramballroom.com`'s HTML by CSS class name (`.twelve`, `.tw-name`, `.tw-event-date`). If the venue's website gets redesigned, this returns an empty list with no error — staff just sees "No show Today" and has to type the show name manually, with nothing telling them _why_ the picker stopped working.
  - Partly done (2026-10-22): the lookup now times out after 8s, and a failed lookup tells staff "Couldn't load today's show. Enter it below." instead of "No show Today". Still open: a scrape that succeeds but finds nothing because the site's HTML changed still looks like a dark night.
  - Fix: at minimum, distinguish "the site returned zero shows" from "the scrape structure looks wrong" (e.g., if the fetch succeeds but finds zero `.twelve` elements at all, that's suspicious and worth a distinct log line or even a visible note in the UI, versus a legitimately dark night).
  - Bigger fix, if the venue has one: use a real API/RSS feed from their ticketing platform instead of scraping HTML, if one exists.

---

## 7. No automated tests

- [x] **At least cover the tip-splitting math** (credit tips done 2026-10-23)
  - Done: the credit split moved to `lib/tipSplit.mjs` (one copy instead of two) with tests in `tests/tipSplit.test.mjs` (`npm test`), including 20,000 random shifts that must add up to the exact total. Found and fixed: the new-breakdown page was a cent off the total on about 1 in 235 shifts. Also fixed: the odd cent was picked with `Math.random()` on both server and browser, which caused React hydration errors on the review page; it is now stable per shift.
  - Still open: `CashTipBreakDown.js` has its own similar copy with no tests. Also, if cooks' 15% of food sales is more than the credit tips, bartenders come out negative; nothing warns about it.
  - `CLAUDE.md` documents "no test runner configured" as the current state, but that's worth revisiting: the rounding/distribution logic in `TipBreakDown.js`, `UpdateTipBreakDownModal.js`, and `CashTipBreakDown.js` is the one place in this app where a silent bug costs someone real money, and it's also the most complex calculation in the codebase (decimal rounding, redistributing leftover cents across bartenders).
  - Minimal version: pull the calculation logic into pure functions (it's mostly already separable) and add a handful of Jest/Vitest tests for the common cases — even split, uneven split, zero bar backs, zero cooks, single employee, rounding edge cases.
  - This is the biggest effort item on this list. Worth doing incrementally rather than all at once.

---

## 8. Smaller product gaps

- [ ] **Self-service password reset.** Right now, a person who forgets their password needs a manager to resend their registration link, which lets them set a new password through the same flow as initial registration. That works, but it's manager-mediated. A "forgot password" link on the sign-in page would remove that dependency, if worth the effort for how often it actually comes up.
- [ ] **CSV export from the tip spreadsheet.** `CCTipsTotals` and the Dashboard's pay-period view are read-only tables; whoever runs payroll is presumably retyping totals into another system by hand. A "Download CSV" button would be a small, high-value addition if that's actually happening.
- [ ] **Add a `.env.example` file.** `CLAUDE.md` lists the required environment variables in prose, but there's no template file. A `.env.example` with the variable names (no real values) makes new setup faster and is a five-minute addition.

---

## 9. Actual browser verification

- [ ] **Look at this app in a real browser, especially on a phone.**
  - Everything fixed and verified across this whole engagement was checked through production builds, `curl`, direct database queries, and code review — never by clicking through the UI in an actual browser. That's a real gap: I can vouch for the code being correct, not for how it looks or feels to use.
  - Since this is a bar-staff tool almost certainly used on a phone behind a bar, a real pass through the credit/cash tip flows, the fill-in employee flow, and the manager pages on a phone-sized screen would catch anything a build can't.

---

## Suggested order

0. Item 0's first two bullets (resend links, password changes) — the leak is closed, but treat what leaked as exposed.
1. Item 1 (`removeEmployee` fix) — it's a real bug, same family as what's already been fixed, and it's small.
2. Item 3 (confirm backups) — not code, just find out the fact and act on it if the answer is bad.
3. Item 2 (bcrypt/uuid) — needs your decision on how much risk to take on, then a focused session to bump and test.
4. Items 4-6 (monitoring, rate limiting, scrape resilience) — cheap, worth doing as one batch.
5. Item 9 (browser pass) — do this whenever you're next actually using the app, no need to schedule it separately.
6. Items 7-8 (tests, product features) — biggest effort, lowest urgency; pick these up when there's a slower week.
