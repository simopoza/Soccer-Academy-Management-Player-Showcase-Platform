Match & Stats Real-time / Playing Status Design

Summary of ideas

- Add a "Playing" status to matches; admin sets match start time and duration.
- While a match is "Playing", adding player stats should update the match result (live score).
- For Completed matches, allow adding academy scorers (players) that affect the final result.

Design suggestions and improvements

1. Match timing model
- Store `scheduled_start` (DATETIME) and `duration_minutes` (INT).
- Optionally store `started_at` and `ended_at` for manual control.

2. Status handling
- Extend `status` values: `Upcoming | Playing | Completed | Cancelled`.
- Two approaches:
  - Computed: server derives `Playing` when now is within `scheduled_start` + `duration_minutes`.
  - Admin-controlled: provide endpoints to `start` and `stop` a match. (Recommended for control and testing.)

3. Authoritative score source
- Compute match score from `Stats` aggregation (sum of `goals` by team) rather than incremental updates.
- On any stat create/update/delete for a match, run `recomputeMatchScore(match_id)` in a DB transaction to aggregate goals and update `Matches.team_goals` / `Matches.opponent_goals`.

4. Player affiliation
- Use `player.team_id` and `match` participants (e.g., `participant_home_id`, `participant_away_id`) to determine whether a stat-goal belongs to the academy team.
- If affiliation is ambiguous, require admins to select which side the player represents for that match.

5. Participation list (optional)
- Maintain a `match_participants` table so only listed players can receive live stats. Helps validation and roster management.

6. UI changes
- `Match Management`: add `scheduled_start` and `duration_minutes` fields.
- Add Start/Stop controls and visually show `Playing` badge.
- When adding stats on a playing match, show immediate score update (toast/inline refresh).
- For completed matches, provide a "record scorers" workflow that creates/updates `Stats` rows.

7. Edge cases & validation
- Timezones: store timestamps in UTC and localize on display.
- Concurrent updates: use DB transactions and recompute full score after each stat change to avoid drift.
- Opponent scorers: decide whether to record opponent scorers as pseudo-player rows or only update `opponent_goals` on the match.

8. Real-time UX (optional)
- For live updates, add WebSocket or SSE to push changes to clients watching the match.

Minimal, safe implementation plan

1. DB migration
- Add `scheduled_start` (DATETIME) and `duration_minutes` (INT) to `Matches`.
- Optionally add `started_at` and `ended_at` if using admin-controlled start/stop.
- Add `Playing` to `status` or change `status` to VARCHAR.

2. Backend
- Add endpoints: `POST /matches/:id/start` and `POST /matches/:id/stop` to set `started_at`/`ended_at` and change status.
- Implement `recomputeMatchScore(match_id)` to sum `goals` from `Stats` for that match and update the `Matches` score columns inside a transaction.
- Call `recomputeMatchScore` from `statsController` after stat create/update/delete.

3. Frontend
- Add `scheduled_start` and `duration_minutes` inputs to match forms.
- Add Start/Stop buttons and `Playing` badge in match list/details.
- After stats changes, refresh match and stats lists (or use optimistic updates + background refetch).

4. Testing & rollout
- Provide migration SQL and unit tests for `recomputeMatchScore` and status transitions.
- Manual testing: simulate starting a match, add several stats for players, verify match score updates, then stop/complete the match and verify final score and scorers list.

Questions

- Do you prefer automatic `Playing` detection (based on scheduled start + duration) or admin-controlled Start/Stop? (Admin-controlled recommended.)
- Should we treat all `player.team_id === match.team_id` as academy players by default, or maintain a per-match participants list?
- How do you want to record opponent scorers: as pseudo-players or as direct increments to `opponent_goals`?

Next steps

- I can implement the DB migration and backend `recomputeMatchScore` and wire it into `statsController` (safe, transactional approach).
- Or I can start with the UI additions only (read/display), then implement score recomputation once the DB/backed pieces are ready.

Tell me which route you prefer and I will start implementing the changes with migrations, controllers, and frontend updates.
