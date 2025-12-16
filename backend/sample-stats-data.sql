-- ===============================================
-- Sample Stats Data for Performance Chart
-- ===============================================

USE soccer_school;

-- Insert sample stats for recent matches
-- Note: Adjust player_id values based on your actual Players table

-- For match 1 (Eagles U16 vs City Academy - Won 3-1)
INSERT INTO Stats (player_id, match_id, goals, assists, minutes_played, rating) VALUES
(1, 1, 1, 1, 90, 8.5),
(2, 1, 2, 0, 90, 9.0),
(3, 1, 0, 2, 90, 8.0),
(4, 1, 0, 0, 90, 7.5);

-- For match 2 (Hawks U18 vs United Youth - Draw 2-2)
INSERT INTO Stats (player_id, match_id, goals, assists, minutes_played, rating) VALUES
(1, 2, 1, 0, 90, 7.5),
(2, 2, 1, 1, 90, 8.0),
(3, 2, 0, 1, 90, 7.0),
(4, 2, 0, 0, 90, 6.5);

-- For match 3 (Falcons U14 vs Riverside FC - Lost 1-3)
INSERT INTO Stats (player_id, match_id, goals, assists, minutes_played, rating) VALUES
(1, 3, 1, 0, 90, 7.0),
(2, 3, 0, 0, 90, 6.0),
(3, 3, 0, 1, 90, 6.5),
(4, 3, 0, 0, 90, 5.5);

-- For match 4 (Eagles U12 vs Valley Stars - Won 4-0)
INSERT INTO Stats (player_id, match_id, goals, assists, minutes_played, rating) VALUES
(1, 4, 2, 1, 90, 9.5),
(2, 4, 1, 2, 90, 9.0),
(3, 4, 1, 1, 90, 8.5),
(4, 4, 0, 0, 90, 8.0);

-- For match 5 (Eagles U16 vs Mountain FC - Draw 2-2)
INSERT INTO Stats (player_id, match_id, goals, assists, minutes_played, rating) VALUES
(1, 5, 1, 0, 90, 7.5),
(2, 5, 1, 1, 90, 8.0),
(3, 5, 0, 1, 90, 7.5),
(4, 5, 0, 0, 90, 7.0);

-- Add more sample stats for other recent matches (adjust as needed)
-- Continue adding stats for matches 6-20 with varying ratings between 5.0-9.5
INSERT INTO Stats (player_id, match_id, goals, assists, minutes_played, rating) VALUES
(1, 10, 1, 1, 90, 8.0),
(2, 10, 0, 1, 90, 7.5),
(1, 11, 2, 0, 90, 8.5),
(2, 11, 1, 1, 90, 8.0),
(1, 12, 0, 0, 90, 6.5),
(2, 12, 1, 0, 90, 7.0),
(1, 13, 3, 1, 90, 9.5),
(2, 13, 0, 2, 90, 8.5),
(1, 14, 1, 1, 90, 8.0),
(2, 14, 1, 0, 90, 7.5);

-- Note: This assumes you have at least 4 players in your Players table
-- If you don't have players yet, you need to create them first
-- You can check existing players with: SELECT * FROM Players LIMIT 5;
