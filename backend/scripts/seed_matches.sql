-- Seed script for Teams and Matches to test admin UI (matches management)
-- WARNING: this script deletes existing Teams and Matches rows. BACKUP before running.

SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM Matches;
DELETE FROM Teams;
SET FOREIGN_KEY_CHECKS = 1;

-- Insert sample teams with deterministic IDs
INSERT INTO Teams (id, name, age_limit, coach, founded, status, player_count)
VALUES
  (1, 'Eagles U16', 16, 'Coach A', '2008', 'Active', 18),
  (2, 'Hawks U18', 18, 'Coach B', '2006', 'Active', 20),
  (3, 'Falcons U14', 14, 'Coach C', '2010', 'Active', 16);

-- Insert matches (mix of past completed, recent completed with different results, and upcoming)
-- Use ISO datetime strings; adjust timezone as needed for your DB server.

-- Completed matches (past) with various results
INSERT INTO Matches (date, opponent, location, competition, team_goals, opponent_goals, team_id)
VALUES
  ('2024-11-01 15:00:00', 'Lions U16', 'Home', 'League', 3, 2, 1), -- Win
  ('2024-11-05 16:30:00', 'Wolves U16', 'Away', 'League', 1, 1, 1), -- Draw
  ('2024-10-20 14:00:00', 'Sharks U14', 'Away', 'Friendly', 0, 2, 3), -- Loss
  ('2024-09-15 17:00:00', 'Bears U18', 'Home', 'Cup', 2, 1, 2); -- Win

-- Recent completed and edge cases (no goals recorded -> treated as 0-0)
INSERT INTO Matches (date, opponent, location, competition, team_goals, opponent_goals, team_id)
VALUES
  ('2025-01-10 19:00:00', 'Tigers U18', 'Away', 'Cup', 0, 0, 2),
  ('2025-02-20 10:30:00', 'Rovers U16', 'Home', 'Friendly', 4, 3, 1);

-- Upcoming matches (future dates)
INSERT INTO Matches (date, opponent, location, competition, team_goals, opponent_goals, team_id)
VALUES
  ('2026-01-10 15:00:00', 'United U16', 'Home', 'League', 0, 0, 1),
  ('2026-02-05 16:00:00', 'City U18', 'Away', 'Cup', 0, 0, 2),
  ('2026-03-12 11:00:00', 'County U14', 'Home', 'Friendly', 0, 0, 3);

-- Additional entries to cover edge cases: same-day past, and far future
INSERT INTO Matches (date, opponent, location, competition, team_goals, opponent_goals, team_id)
VALUES
  (DATE_SUB(NOW(), INTERVAL 1 DAY), 'Local U16', 'Away', 'Friendly', 2, 0, 1),
  (DATE_ADD(NOW(), INTERVAL 30 DAY), 'Academy All-Stars', 'Home', 'League', 0, 0, 2);

-- Verify counts
SELECT COUNT(*) as total_matches FROM Matches;
SELECT COUNT(*) as total_teams FROM Teams;

-- End of seed script
