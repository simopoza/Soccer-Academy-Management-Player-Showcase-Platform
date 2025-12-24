# Matches Management Implementation Summary

Date: 2025-12-24

This document records the work performed to implement and improve "matches management" across the backend and frontend of the Soccer Academy Management project. It gathers the goals, changes made, technical decisions, and next steps so other contributors can understand the current state and follow up.

## 1. Conversation Overview

- Primary objectives:
  - Add API calls and frontend wiring for matches management.
  - Replace `match_type` with a `competition` enum (`Friendly`, `Cup`, `League`) and add `location` (Home/Away).
  - Seed the DB with varied match data (completed/upcoming/results) for UI testing.
  - Remove the Type column from the frontend table and use `location` for Home/Away filtering.
  - Apply linter-driven frontend cleanup (runtime-focused, Option B).
  - Add React Query, skeleton loading, client-side pagination, caching and optimistic updates with cache merging.
  - Persist free-text team names when `team_id` is null, and display them correctly in the UI.
  - Order matches newest-first in responses.

- Flow summary: feature design → frontend extraction (hook + components) → React Query migration → optimistic updates → backend schema & validators updates → bug fixes & linter cleanup.

## 2. Technical Foundation

- Backend:
  - Node.js + Express with MySQL database.
  - `Matches` table updated (schema changes in `backend/schema.sql`):
    - `location` ENUM('Home','Away')
    - `competition` ENUM('Friendly','Cup','League')
    - `team_name` VARCHAR(100) NULL (free-text fallback when `team_id` is NULL)
    - `team_id` INT NULL
    - `team_goals` INT, `opponent_goals` INT
  - Validators: express-validator rules updated to accept nullable `team_id` and to validate `location` and `competition`.
  - Controllers: SELECTs return `COALESCE(m.team_name, t.name) AS team_name`, addMatch prevents duplicate identical inserts, and getMatches now orders by `m.date DESC`.

- Frontend:
  - React + Vite, Chakra UI and TanStack React Query (v5 object API) for server state.
  - New data hook `useMatches` (frontend/src/hooks/useMatches.js): fetch, map, filter, paginate, optimistic add/update/delete using `useMutation` with `onMutate`/`onError`/`onSuccess` to perform cache merges and rollbacks.
  - Presentation component `MatchesTable` (frontend/src/components/admin/MatchesTable.jsx) and `matchFields` constant (frontend/src/constants/matchFields.js) for form definitions.
  - matchService (frontend/src/services/matchService.js) wraps Axios calls: `getMatches`, `getMatchById`, `addMatch`, `updateMatch`, `deleteMatch`.

## 3. Key Files Added / Modified

- Added (frontend):
  - `frontend/src/hooks/useMatches.js` — central hook for matches data and behavior (fetching, mapping, filters, pagination, optimistic mutations).
  - `frontend/src/components/admin/MatchesTable.jsx` — presentational table component.
  - `frontend/src/constants/matchFields.js` — form field definitions (including `location`, `competition`, and goals).

- Modified (frontend):
  - `frontend/src/pages/admin/AdminMatchesPage.jsx` — refactored to be UI-only and use the `useMatches` hook and `MatchesTable`.
  - `frontend/src/services/matchService.js` — ensured payload includes `team_name`, `team_goals`, `opponent_goals`, and `team_id`.

- Modified (backend):
  - `backend/validators/matchesValidator.js` — now allows `team_id` to be nullable on create/update, validates `location` and `competition`.
  - `backend/controllers/matchesController.js` — returns `COALESCE(team_name, Teams.name)` and prevents exact duplicate inserts.
  - `backend/schema.sql` — updated `Matches` schema: added `team_name`, set `location` ENUM('Home','Away'), and ensured goals fields exist.

## 4. Patterns and Decisions

- Separation of concerns: data logic lives in `useMatches` hook; UI is presentational (`AdminMatchesPage` and `MatchesTable`).
- React Query v5 object-signature used for `useQuery` and `useMutation` to avoid runtime mismatch from earlier v4-style code.
- Optimistic UI implementation details:
  - `onMutate` inserts a temporary match row into the local cache so the UI feels instant.
  - `onError` rolls back to the previous cache snapshot.
  - `onSuccess` merges the server response into the cache by replacing the temporary row with the authoritative server row or merging updated fields.
  - Server-side duplicate-check prevents the optimistic flow from creating duplicates when the user accidentally submits twice.

## 5. Problems Encountered & Resolutions

- React Query runtime error: "defaultMutationOptions is not a function" — resolved by migrating mutations to the v5 object-signature API.
- Vite parse error in `useMatches.js` due to a syntax/closing-brace mistake — fixed by correcting the function return and syntax.
- Frontend showed "Academy" for free-text team names because `team_name` wasn't persisted — fixed by adding `team_name` column and sending `team_name` in the add/update payloads; controllers now return `COALESCE(m.team_name, t.name)`.
- Duplicate rows on repeated adds: addressed by server-side duplicate detection in addMatch and by refining the optimistic update flow.
- Validation errors for `team_id: null`: validators updated to accept nullable `team_id` and to only verify team existence when `team_id` is provided.

## 6. Progress & Current State

- Completed:
  - Frontend: `useMatches` hook with optimistic cache-merge, `MatchesTable` and `matchFields` added, AdminMatchesPage refactored, client-side pagination, skeleton loaders, and linter-driven fixes applied.
  - Backend: schema updated in `schema.sql` (added `team_name`, `location` enum), controllers updated for `team_name` handling and duplicate-checks, validators accept nullable `team_id`.

- Partially complete / Pending:
  - DB migration on a running/production database (ALTER TABLE to add `team_name`) must be executed manually in the deployment environment.
  - Optionally refine server-side pagination (currently client-side paging with full fetch).
  - Full domain model refactor (participants/clubs/competitions/seasons) is only proposed — not implemented.

## 7. Recommended Next Steps (Migration / Model Options)

Three approaches were discussed for making the domain model more realistic (teams/participants/competitions):

- Option A — Incremental (recommended):
  - Add `Clubs` and `Participants` tables and backfill participants for existing `Teams` and free-text `team_name` values.
  - Update `Matches` to reference participant IDs (`participant_home_id`, `participant_away_id`) or add optional `participant_id` columns while keeping `team_name` for fallback.
  - Update controllers and `useMatches` to accept participant ids gradually.
  - Low risk, easier rollback, minimal immediate disruption.

- Option B — Full refactor:
  - Replace `Matches` with a participant-backed schema and add `Competitions` and `Seasons` entities.
  - Requires comprehensive migration scripts, DB downtime plan, and frontend rewrite.
  - Best long-term model but higher short-term cost.

- Option C — UX-first prototype:
  - Improve frontend UX first (autocomplete pickers for teams, participant lookups, clearer season/competition UI), then change DB later when UX confirms requirements.
  - Faster to iterate, avoids heavy DB work until the model is clear.

Recommended: Option A as the pragmatic, incremental approach.

## 8. Recent Operations & Commits

- Programmatic edits and new files were committed locally with a descriptive commit message: "feat(matches): optimistic updates + cache-merge; extract MatchesTable and matchFields".
- Files created: `frontend/src/hooks/useMatches.js`, `frontend/src/components/admin/MatchesTable.jsx`, `frontend/src/constants/matchFields.js`.
- Key edits: `backend/controllers/matchesController.js`, `backend/validators/matchesValidator.js`, `backend/schema.sql`, `frontend/src/pages/admin/AdminMatchesPage.jsx`, and `frontend/src/services/matchService.js`.

## 9. How to Verify Locally

1. Backend:
   - Ensure the DB schema is updated (apply `backend/schema.sql` changes or run ALTER TABLE to add `team_name` and adjust `location` / `competition` enums).
   - Restart the backend server: from `/home/mannahri/Desktop/SAMPSP/backend` run:

```bash
npm install
npm run dev
```

2. Frontend:
   - From `frontend/` install dependencies and run the dev server:

```bash
cd frontend
npm install
npm run dev
```

3. Use the Admin Matches page: add/edit/delete matches, confirm optimistic updates, and check that free-text `team_name` persists and displays when `team_id` is null.

## 10. Notes and Caveats

- The `backend/schema.sql` file was modified to include `team_name` and to set `location` to an ENUM. If you have a live database, apply schema migrations carefully and back up data.
- Server-side pagination was not implemented; the current implementation uses client-side pagination. For large data sets, add server-side paging.
- The domain refactor to participants/competitions/seasons remains a recommended future project — the incremental approach is the safest route.

## 11. Next Actions (if you want me to continue)

- If you choose Option A (incremental): I can scaffold migration SQL (CREATE TABLE `Clubs`, `Participants`), write backfill scripts, and update controllers to accept participant IDs while preserving backward compatibility.
- If you choose Option B (full refactor): I can draft a migration plan with schema changes, sample migration scripts, and a list of frontend changes required.
- If you choose Option C (UX-first): I can prototype improved admin UI elements (autocomplete team pickers, competition/season selectors) and wire them to the current API.

---

If you'd like any section expanded (migration scripts, sample SQL for backfill, or a smaller summary file), tell me which and I'll add it.
