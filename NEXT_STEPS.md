# Tip Jar: What's Next

This follows on from `GAME_PLAN.md`, which is done — every bug found in the
original code review is fixed and committed. This file covers what's still
missing: one real bug in the same family as things already fixed, some
security housekeeping intentionally deferred, and a set of operational and
product gaps that are worth deciding on rather than leaving unexamined.

Ordered roughly by how much it matters. Check items off as they're done.

---

## 1. Deleting an employee orphans their tip history (real bug)

- [ ] **Fix `removeEmployee` to clean up references, the same way the employee-merge script does**
  - File: `pages/api/removeEmployee/[id].js`
  - Problem: deleting an employee just does `deleteOne` on the `employees` collection. Every `tipBreakdown` document where that employee appears in `cookTips`/`barBackTips`/`BartenderTips` still has their old `id`, now pointing at nobody. This is the same shape of problem that created the Adrian Sandoval/Will Munroe/Schuyler Grimsman duplicates, just from the delete side instead of the create side.
  - Fix: before deleting, either (a) refuse to delete an employee who has any `tipBreakdown` references or non-empty `tipsCollected`, and require deactivating instead of deleting, or (b) allow it but strip/flag the dangling `id` in those historical records so it's clear the person is gone rather than silently broken. (a) is safer for a tool tracking real pay history — recommend that as the default, with a manager override if they really mean to delete someone who was only ever a one-off mistake (e.g., a fill-in typo with zero paid shifts).
  - Verify: try to delete an employee with tip history, confirm it's refused with a clear message; delete one with none, confirm it still works.

---

## 2. Security housekeeping left on purpose

- [ ] **Decide on the `bcrypt` and `uuid` major-version bumps**
  - Context: `npm audit fix` (no `--force`) already took vulnerabilities from 26 down to 9. The remaining 9 all need `bcrypt` 5→6 or `uuid` 9→14, both breaking changes I didn't want to apply silently.
  - `bcrypt` sits on the password-hashing path (`updateEmployee` API, credentials sign-in) — a version bump needs a real test of registering and signing in with a password afterward, since the native binding can change.
  - `uuid` generates registration tokens (`sendEmail` API) — lower risk, mostly an import-style change, but still worth testing a registration link end to end after bumping.
  - Decision needed: bump both now (I can do it and verify both flows), bump neither, or bump just `uuid` since it's lower-risk.

---

## 3. Confirm there's an actual backup / recovery plan for the database

- [ ] **Find out what MongoDB host this uses and whether backups are on**
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
  - It scrapes `teragramballroom.com`'s HTML by CSS class name (`.twelve`, `.tw-name`, `.tw-event-date`). If the venue's website gets redesigned, this returns an empty list with no error — staff just sees "No show Today" and has to type the show name manually, with nothing telling them *why* the picker stopped working.
  - Fix: at minimum, distinguish "the site returned zero shows" from "the scrape structure looks wrong" (e.g., if the fetch succeeds but finds zero `.twelve` elements at all, that's suspicious and worth a distinct log line or even a visible note in the UI, versus a legitimately dark night).
  - Bigger fix, if the venue has one: use a real API/RSS feed from their ticketing platform instead of scraping HTML, if one exists.

---

## 7. No automated tests

- [ ] **At least cover the tip-splitting math**
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

1. Item 1 (`removeEmployee` fix) — it's a real bug, same family as what's already been fixed, and it's small.
2. Item 3 (confirm backups) — not code, just find out the fact and act on it if the answer is bad.
3. Item 2 (bcrypt/uuid) — needs your decision on how much risk to take on, then a focused session to bump and test.
4. Items 4-6 (monitoring, rate limiting, scrape resilience) — cheap, worth doing as one batch.
5. Item 9 (browser pass) — do this whenever you're next actually using the app, no need to schedule it separately.
6. Items 7-8 (tests, product features) — biggest effort, lowest urgency; pick these up when there's a slower week.
