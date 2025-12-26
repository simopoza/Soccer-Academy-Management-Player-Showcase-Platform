Matches API — Manual Test Plan
================================

Purpose
-------
This document lists manual tests (normal flows + edge cases) for the Matches creation/update flows and related Participants behavior. For each test case the expected HTTP response status and expected DB or JSON output is provided.

Notes about current behavior (as of changes in repo):
- `POST /api/matches` requires `opponent` (free-text) but `team_id`, `team_goals`, `opponent_goals`, and participant ids are optional. The controller will auto-resolve/create `Participants` for the opponent and will auto-link a home `Participant` when `team_id` corresponds to a club-backed Participant.
- The application normalizes opponent names by trimming, collapsing internal whitespace and lowercasing (app normalization). The DB also stores a generated `external_key` (currently LOWER(TRIM(external_name)) — note possible whitespace-collapse mismatch).
- Unique indexes exist on `Participants.external_key` and `Participants.club_id`.

Test categories
---------------
1) Normal / happy-path tests
2) Validation / client error tests
3) Participant and DB uniqueness tests
4) Update flows
5) Concurrency / race-condition tests
6) Edge cases and fuzz tests

How to run
----------
- Start backend: `cd backend && npm run dev`
- Use `curl` or Postman to hit endpoints. Example create request shown for many tests.
- Inspect DB tables with `mysql` client: `SELECT * FROM Participants ORDER BY id DESC LIMIT 10;` and `SELECT * FROM Matches ORDER BY id DESC LIMIT 10;`

------
1) Normal / happy-path tests
------

- Test: Create match with `team_id` (club) and `opponent` (new free-text)
  - Request:
    POST /api/matches
    Body: { "date":"2025-12-25", "opponent":"New Opponent FC", "location":"Home", "competition":"Friendly", "team_id": 1 }
  - Expected HTTP: 201 Created
  - Expected JSON: match object with fields: id, date (ISO), opponent: "New Opponent FC", location: "Home", competition: "Friendly", team_id: 1, team_name: <club name>, team_goals: 0, opponent_goals: 0, participant_home_id: <id for club participant>, participant_away_id: <new participant id>
  - DB: New Participants row created for opponent (if not existed); Matches row linking both participants.

- Test: Create match with only `opponent` free-text (no team_id)
  - Request: POST /api/matches Body: { "date":"2025-12-26", "opponent":"Lone Opponent", "location":"Away", "competition":"Friendly" }
  - Expected HTTP: 201 Created
  - Expected JSON: match object; `team_id` null, `team_name` null (unless controller attempts to resolve via other fields), `participant_away_id` created.

- Test: Create match when a Participant for the opponent already exists (case-insensitive)
  - Precondition: Participants contains external_name "Existing FC" (external_key normalized present).
  - Request: POST with opponent "existing fc" (different case)
  - Expected: The controller should reuse the existing Participant for away participant (no duplicate participant row). The Match will be created (201) using existing participant_away_id.

------
2) Validation / client error tests
------

- Test: Missing required `opponent` on create
  - Request: POST /api/matches Body without `opponent`
  - Expected HTTP: 400 Bad Request
  - Expected JSON: validation errors array similar to:
    {
      "errors": [
        { "type": "field", "msg": "opponent is required", "path": "opponent", "location": "body" }
      ]
    }

- Test: Invalid `location` value
  - Request: location: "Somewhere"
  - Expected HTTP: 400
  - Expected JSON: validation error for `location` (must be 'Home' or 'Away').

- Test: Negative goals provided
  - Request: team_goals: -1
  - Expected HTTP: 400
  - Expected JSON: validation error stating `team_goals must be a non-negative integer`.

- Test: Non-integer `team_id`
  - Request: team_id: "abc"
  - Expected HTTP: 400 with validation error for `team_id`.

------
3) Participant and DB uniqueness tests
------

- Test: Ensure unique external_key prevents duplicate participants (manual SQL verification)
  - Steps:
    - Run: `SELECT external_key, COUNT(*) c FROM Participants GROUP BY external_key HAVING c > 1;` — expect 0 rows.
    - Create a participant via POST /api/matches with opponent containing excessive spaces and different case: e.g., "New  Opponent  FC" and then again "new opponent   fc".
  - Expected: The controller should normalize and DB unique index should ensure at most one Participant row for the normalized key. If race occurs, controller will retry on ER_DUP_ENTRY and return a created match.

- Test: Club-backed participant uniqueness
  - Steps:
    - Verify `Participants` contains one row per `club_id` (unique index ux_participants_club_id).
    - Try manual insert that violates uniqueness (should fail): `INSERT INTO Participants (club_id) VALUES (1);` when one already exists.
  - Expected: DB rejects duplicate club_id with duplicate-key error.

------
4) Update flows
------

- Test: Update opponent to an existing Participant (by name)
  - Request: PUT /api/matches/:id Body: { "opponent": "Existing FC" }
  - Expected: 200 OK; match updated to reference existing participant_away_id for that participant.

- Test: Update `team_id` to a club with a club-backed Participant
  - Request: PUT with `team_id` set to club id
  - Expected: 200 OK; `participant_home_id` auto-linked if there is club-backed Participant; `team_name` resolved to team/club name.

- Test: Update a match with no fields
  - Request: PUT with empty body
  - Expected: 400 Bad Request with message "No fields provided to update".

------
5) Concurrency / race-condition tests (manual / simulated)
------

- Test: Two concurrent `POST /api/matches` creating the same `opponent` at the same time
  - Steps: Fire two POST requests concurrently with identical opponent value that does not yet exist in Participants.
  - Expected: One or both requests should succeed; the code catches ER_DUP_ENTRY and re-queries — net result should be only one new Participant row (unique index enforced) and two matches created (unless the exact match row also already exists). There should be no uncaught 500 due to duplicate-key.

- Test: Concurrent create that attempts to create duplicate Matches (same date/opponent/teams)
  - Steps: Send two identical POST requests for the same match information.
  - Expected: Controller `findExistingMatch` will detect the existing match (if the insert happened first) and return existing match (200) for the second request. No partial inconsistent state.

------
6) Edge cases and fuzz tests
------

- Test: Opponent name with leading/trailing whitespace and multiple internal spaces
  - Request: opponent: "  Weird   Opponent  FC  "
  - Expected: controller normalizes names to single internal spaces and lowercase for matching; DB `external_key` should match app normalization (note DB may not collapse whitespace unless migration applied). Validate that duplicate creation is avoided.

- Test: Very long opponent name (over 150 chars)
  - Request: opponent string > 150 characters
  - Expected: depends on DB column size (external_name varchar(150)). Long strings will be truncated or rejected by DB; controller does not currently validate length — API may return 500 if DB rejects. Recommended: test and add validation if necessary.

- Test: null/empty date
  - Request: date omitted or empty string
  - Expected: accepted; controller treats blank date as null and creates match with null date.

- Test: Delete match and re-create
  - Steps: DELETE /api/matches/:id then re-post same match
  - Expected: Delete returns 200; re-post creates a new Match and re-uses existing Participant rows where appropriate.

------
DB verification queries (handy snippets)
------

- Check participants created for an opponent:
  ```sql
  SELECT id, club_id, external_name, external_key, created_at
  FROM Participants
  WHERE external_name LIKE '%Opponent%'
  ORDER BY id DESC LIMIT 10;
  ```

- Check recent matches:
  ```sql
  SELECT * FROM Matches ORDER BY created_at DESC LIMIT 10;
  ```

- Verify unique external_key index has no duplicates:
  ```sql
  SELECT external_key, COUNT(*) c FROM Participants GROUP BY external_key HAVING c > 1;
  ```

- Verify unique club_id index:
  ```sql
  SELECT club_id, COUNT(*) c FROM Participants WHERE club_id IS NOT NULL GROUP BY club_id HAVING c > 1;
  ```

------
Expected API error format
------

Validation errors from express-validator are returned in the shape used by this project, e.g.:

{
  "errors": [
    { "type": "field", "msg": "opponent is required", "path": "opponent", "location": "body" },
    ...
  ]
}

Server errors (unexpected) are returned as:
{
  "message": "Internal server error"
}

If you choose to add controller mapping for DB duplicate errors a future response may be 409 Conflict with a short message:
{
  "message": "Duplicate participant or unique constraint violation"
}

------
Notes / Recommendations
------
- Align DB generated `external_key` with app normalization (collapse internal whitespace with `REGEXP_REPLACE`) to avoid whitespace-edge cases.
- Consider adding a length validation for `opponent` to avoid DB errors when very long strings are supplied.
- Add integration tests to automate the most common flows (create match, update match, duplicate participant prevention, concurrency simulation).

If you want, I can also:
- Create a migration to change `external_key` to use `REGEXP_REPLACE` (if your MySQL supports it),
- Add controller mapping for duplicate errors to return 409 Conflict,
- Or scaffold automated integration tests that run these scenarios against a test DB.

---
File: `docs/MATCHES_TEST_PLAN.md`
