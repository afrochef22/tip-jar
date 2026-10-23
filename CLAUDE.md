# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tip Jar is a Next.js (Pages Router) application for managing tip distribution at Teragram Ballroom. It handles employee management, tip calculation (cash and credit), tip breakdown tracking, and shift management. The app uses MongoDB as its database and NextAuth.js for authentication.

## Commands

- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm start` — Start production server
- `npm test` — Run the tests in `tests/` with Node's built-in test runner (no extra packages)
- `npm run backup` — Save every database collection to `backups/<timestamp>/` (gitignored)
- `npm run restore -- <backup folder>` — Preview a restore; add `--yes` to do it (saves the current data first), `--only a,b` for some collections

No linter is configured. The credit tip split lives in `lib/tipSplit.mjs` and is shared by `TipBreakDown` and `UpdateTipBreakDownModal`; change it there and run `npm test`. The cash split (whole dollars for bartenders, leftover to bar backs) lives in `lib/cashSplit.mjs`.

## Architecture

**Routing:** Uses Next.js Pages Router (`pages/` directory), not the App Router. Pages are a mix of `.js` and `.tsx` files.

**Database:** MongoDB via the native driver (not Mongoose). The shared client connection is in `lib/mongodb.ts` and uses a global variable pattern for HMR in development. The database name is `TeragramBallroom` with collections including `employees` and `tipBreakdown`.

**Authentication:** NextAuth.js v4 with JWT session strategy, configured in `pages/api/auth/[...nextauth].js`. Supports Google, Email, and Credentials providers. The MongoDB adapter stores auth data. Middleware in `middleware.js` protects `/employees` and `/Dashboard` routes using `getToken`.

**Data fetching:** Pages use `getServerSideProps` for server-side data fetching (e.g., `Dashboard.js`, `employees.js`). Client-side fetching uses SWR and Axios against API routes.

**API routes:** All in `pages/api/`. CRUD operations for employees (`addEmployee`, `getEmployees`, `getEmployee/[id]`, `updateEmployee/[id]`, `removeEmployee/[id]`) and tip breakdowns (`addTipBreakDown`, `UpdateTipBreakDown/[id]`, `removeTipBreakDown/[id]`). Also includes `sendEmail` (Nodemailer) and `FindBandPerformingToday` (web scraping with Cheerio).

**Styling:** Bootstrap 5 + Reactstrap for UI components, CSS Modules for component-specific styles, global CSS in `styles/globals.css`, Font Awesome icons.

**Key page flow:** Index (login) → Dashboard (tip breakdowns overview + spreadsheet) → SelectWorkingEmployee → TipBreakDownPage (credit tips) / CashTipBreakDownPage → CCTipsTotals (credit card tip totals).

**Employee roles:** The tip calculation system distinguishes between Bartenders, BarBacks, and Cooks, each with their own selection and hourly input components.

## Environment Variables

Required in `.env.local`: `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, Google OAuth credentials, and email server config for the Email provider.

Optional: `ALERT_EMAIL` (set in Vercel) gets an email when a server error happens, at most one per kind of error per hour. Server-side catch blocks call `reportError` from `lib/alert.js` instead of `console.error`; `instrumentation.js` covers uncaught errors.
