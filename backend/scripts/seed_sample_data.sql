-- Sample seed data for Teams, Players, Matches, and Stats
-- Run this against the `soccer_school` database (the schema file creates it).

USE soccer_school;

-- NOTE: This seed assumes the `Teams` table already contains the Remontada_* teams
-- from your existing data. We'll reference existing team ids directly.
-- Map local variables to the known team ids (adjust if your IDs differ):
SET @team_u10 = 1; -- Remontada_U10
SET @team_u12 = 2; -- Remontada_U12
SET @team_u14 = 3; -- Remontada_U14
SET @team_u16 = 4; -- Remontada_U16

-- ---------- Players ----------
-- ---------- Players ----------
-- Insert a larger roster (multiple players per team) so pagination and queries can be tested.
INSERT INTO Players (first_name, last_name, date_of_birth, height, weight, strong_foot, position, team_id) VALUES
  ('Ethan', 'Santos',    '2016-04-10', 120.0, 26.0, 'Right', 'ST', @team_u10),
  ('Liam', 'Garcia',     '2016-09-21', 118.0, 25.0, 'Left',  'GK', @team_u10),
  ('Sophia', 'Lopez',    '2016-02-02', 119.0, 25.5, 'Right', 'RW', @team_u10),
  ('Mia', 'Fernandez',   '2016-12-11', 117.0, 24.5, 'Left',  'LW', @team_u10),
  ('Evelyn', 'Young',    '2015-07-22', 123.0, 27.0, 'Right', 'LW', @team_u10),

  ('Mason', 'Hernandez', '2014-02-03', 130.0, 30.0, 'Right', 'CM', @team_u12),
  ('Noah', 'Martinez',   '2014-07-13', 132.0, 31.0, 'Right', 'CB', @team_u12),
  ('Ava', 'Singh',      '2014-05-21', 129.0, 29.5, 'Left',  'ST', @team_u12),
  ('Isabella', 'Brown',  '2014-10-30', 131.0, 30.5, 'Right', 'GK', @team_u12),
  ('Henry', 'Wang',     '2013-11-02', 138.0, 34.0, 'Left',  'RB', @team_u12),

  ('Lucas', 'Patel',    '2012-01-18', 145.0, 38.0, 'Left',  'RW', @team_u14),
  ('Oliver', 'Khan',    '2012-11-05', 148.0, 39.0, 'Right', 'LB', @team_u14),
  ('Charlotte', 'Ali',  '2012-08-17', 146.0, 37.5, 'Right', 'CM', @team_u14),
  ('Amelia', 'Garcia',  '2012-03-09', 144.0, 36.8, 'Left',  'ST', @team_u14),
  ('Luna', 'Diaz',      '2011-05-05', 150.0, 41.0, 'Right', 'CAM', @team_u14),

  ('Aiden', 'Lopez',    '2010-06-20', 160.0, 45.0, 'Right', 'CM', @team_u16),
  ('James', 'Nguyen',   '2010-12-02', 162.0, 47.0, 'Left',  'ST', @team_u16),
  ('Benjamin', 'Reed',  '2010-04-01', 159.0, 44.0, 'Right', 'CB', @team_u16),
  ('Harper', 'Jones',   '2010-09-14', 161.0, 46.0, 'Left',  'GK', @team_u16),
  ('Samuel', 'Lopez',   '2009-02-27', 165.0, 50.0, 'Right', 'ST', @team_u16),

  ('Chloe', 'Patel',    '2013-01-14', 135.0, 33.0, 'Left', 'CM', @team_u12),
  ('Owen', 'Murphy',   '2011-12-20', 151.0, 42.0, 'Right', 'LB', @team_u14);

-- capture player ids into variables for later reference (select most recent matching rows)
SET @p1  = (SELECT id FROM Players WHERE first_name='Ethan'     AND last_name='Santos'   ORDER BY id DESC LIMIT 1);
SET @p2  = (SELECT id FROM Players WHERE first_name='Liam'      AND last_name='Garcia'   ORDER BY id DESC LIMIT 1);
SET @p3  = (SELECT id FROM Players WHERE first_name='Sophia'    AND last_name='Lopez'    ORDER BY id DESC LIMIT 1);
SET @p4  = (SELECT id FROM Players WHERE first_name='Mia'       AND last_name='Fernandez'ORDER BY id DESC LIMIT 1);
SET @p5  = (SELECT id FROM Players WHERE first_name='Evelyn'    AND last_name='Young'    ORDER BY id DESC LIMIT 1);
SET @p6  = (SELECT id FROM Players WHERE first_name='Mason'     AND last_name='Hernandez'ORDER BY id DESC LIMIT 1);
SET @p7  = (SELECT id FROM Players WHERE first_name='Noah'      AND last_name='Martinez' ORDER BY id DESC LIMIT 1);
SET @p8  = (SELECT id FROM Players WHERE first_name='Ava'       AND last_name='Singh'    ORDER BY id DESC LIMIT 1);
SET @p9  = (SELECT id FROM Players WHERE first_name='Isabella'  AND last_name='Brown'    ORDER BY id DESC LIMIT 1);
SET @p10 = (SELECT id FROM Players WHERE first_name='Henry'     AND last_name='Wang'     ORDER BY id DESC LIMIT 1);
SET @p11 = (SELECT id FROM Players WHERE first_name='Lucas'     AND last_name='Patel'    ORDER BY id DESC LIMIT 1);
SET @p12 = (SELECT id FROM Players WHERE first_name='Oliver'    AND last_name='Khan'     ORDER BY id DESC LIMIT 1);
SET @p13 = (SELECT id FROM Players WHERE first_name='Charlotte' AND last_name='Ali'      ORDER BY id DESC LIMIT 1);
SET @p14 = (SELECT id FROM Players WHERE first_name='Amelia'    AND last_name='Garcia'   ORDER BY id DESC LIMIT 1);
SET @p15 = (SELECT id FROM Players WHERE first_name='Luna'      AND last_name='Diaz'     ORDER BY id DESC LIMIT 1);
SET @p16 = (SELECT id FROM Players WHERE first_name='Aiden'     AND last_name='Lopez'    ORDER BY id DESC LIMIT 1);
SET @p17 = (SELECT id FROM Players WHERE first_name='James'     AND last_name='Nguyen'   ORDER BY id DESC LIMIT 1);
SET @p18 = (SELECT id FROM Players WHERE first_name='Benjamin'  AND last_name='Reed'     ORDER BY id DESC LIMIT 1);
SET @p19 = (SELECT id FROM Players WHERE first_name='Harper'    AND last_name='Jones'    ORDER BY id DESC LIMIT 1);
SET @p20 = (SELECT id FROM Players WHERE first_name='Samuel'    AND last_name='Lopez'    ORDER BY id DESC LIMIT 1);
SET @p21 = (SELECT id FROM Players WHERE first_name='Chloe'     AND last_name='Patel'    ORDER BY id DESC LIMIT 1);
SET @p22 = (SELECT id FROM Players WHERE first_name='Owen'      AND last_name='Murphy'   ORDER BY id DESC LIMIT 1);

-- ---------- Matches ----------
-- Insert a larger set of matches across the teams (home/away, different dates)
INSERT INTO Matches (date, opponent, location, competition, team_name, team_goals, opponent_goals, team_id) VALUES
  ('2025-04-01 10:00:00', 'Remontada_U12', 'Home',    'League',   'Remontada_U10', 2, 1, @team_u10),
  ('2025-04-02 11:30:00', 'Remontada_U16', 'Home',    'League',   'Remontada_U14', 0, 3, @team_u14),
  ('2025-03-28 09:30:00', 'Remontada_U14', 'Away',    'Friendly', 'Remontada_U10', 1, 1, @team_u10),
  ('2025-03-20 15:00:00', 'Remontada_U10', 'Away',    'Cup',      'Remontada_U12', 1, 2, @team_u12),
  ('2025-03-15 09:00:00', 'Remontada_U16', 'Home',    'League',   'Remontada_U12', 2, 2, @team_u12),
  ('2025-03-10 14:00:00', 'Remontada_U12', 'Away',    'Friendly', 'Remontada_U14', 0, 1, @team_u14),
  ('2025-02-28 10:30:00', 'Remontada_U14', 'Home',    'League',   'Remontada_U16', 3, 2, @team_u16),
  ('2025-02-20 16:00:00', 'Remontada_U10', 'Home',    'Cup',      'Remontada_U16', 1, 0, @team_u16),
  ('2025-02-12 12:00:00', 'Remontada_U16', 'Away',    'League',   'Remontada_U14', 2, 2, @team_u14),
  ('2025-01-30 09:30:00', 'Remontada_U12', 'Home',    'League',   'Remontada_U10', 4, 2, @team_u10),
  ('2025-01-22 11:00:00', 'Remontada_U10', 'Away',    'Friendly', 'Remontada_U12', 0, 0, @team_u12),
  ('2025-01-10 10:00:00', 'Remontada_U14', 'Home',    'Friendly','Remontada_U16', 2, 1, @team_u16);

-- capture match ids for reference
SET @m1  = (SELECT id FROM Matches WHERE date='2025-04-01 10:00:00' AND team_id=@team_u10 LIMIT 1);
SET @m2  = (SELECT id FROM Matches WHERE date='2025-04-02 11:30:00' AND team_id=@team_u14 LIMIT 1);
SET @m3  = (SELECT id FROM Matches WHERE date='2025-03-28 09:30:00' AND team_id=@team_u10 LIMIT 1);
SET @m4  = (SELECT id FROM Matches WHERE date='2025-03-20 15:00:00' AND team_id=@team_u12 LIMIT 1);
SET @m5  = (SELECT id FROM Matches WHERE date='2025-03-15 09:00:00' AND team_id=@team_u12 LIMIT 1);
SET @m6  = (SELECT id FROM Matches WHERE date='2025-03-10 14:00:00' AND team_id=@team_u14 LIMIT 1);
SET @m7  = (SELECT id FROM Matches WHERE date='2025-02-28 10:30:00' AND team_id=@team_u16 LIMIT 1);
SET @m8  = (SELECT id FROM Matches WHERE date='2025-02-20 16:00:00' AND team_id=@team_u16 LIMIT 1);
SET @m9  = (SELECT id FROM Matches WHERE date='2025-02-12 12:00:00' AND team_id=@team_u14 LIMIT 1);
SET @m10 = (SELECT id FROM Matches WHERE date='2025-01-30 09:30:00' AND team_id=@team_u10 LIMIT 1);
SET @m11 = (SELECT id FROM Matches WHERE date='2025-01-22 11:00:00' AND team_id=@team_u12 LIMIT 1);
SET @m12 = (SELECT id FROM Matches WHERE date='2025-01-10 10:00:00' AND team_id=@team_u16 LIMIT 1);

-- ---------- Stats ----------
-- Add many stats rows across players and matches so the Stats table has sufficient rows for pagination/testing.
INSERT INTO Stats (player_id, match_id, goals, assists, minutes_played, rating) VALUES
  -- m1 (Remontada_U10 home vs U12)
  (@p1,  @m1, 1, 0, 80, 7.8),
  (@p2,  @m1, 0, 0, 90, 7.0),
  (@p3,  @m1, 0, 1, 75, 7.6),
  (@p5,  @m1, 0, 0, 60, 6.9),

  -- m2 (Remontada_U14 home vs U16)
  (@p11, @m2, 0, 0, 90, 6.8),
  (@p12, @m2, 1, 0, 90, 8.2),
  (@p13, @m2, 2, 1, 90, 9.0),

  -- m3 (Remontada_U10 away vs U14)
  (@p1,  @m3, 0, 0, 90, 7.1),
  (@p9,  @m3, 1, 0, 90, 8.0),
  (@p4,  @m3, 0, 0, 70, 6.5),

  -- m4 (Remontada_U12 away vs U10)
  (@p6,  @m4, 1, 0, 85, 8.0),
  (@p8,  @m4, 0, 1, 60, 7.2),
  (@p21, @m4, 0, 0, 45, 6.3),

  -- m5 (Remontada_U12 home vs U16)
  (@p6,  @m5, 0, 0, 90, 7.0),
  (@p16, @m5, 1, 0, 90, 8.1),
  (@p18, @m5, 0, 0, 90, 6.7),

  -- m6 (Remontada_U14 away vs U12)
  (@p11, @m6, 0, 0, 90, 6.9),
  (@p14, @m6, 1, 0, 90, 8.0),
  (@p15, @m6, 0, 1, 80, 7.4),

  -- m7 (Remontada_U16 home vs U14)
  (@p16, @m7, 1, 0, 90, 8.5),
  (@p19, @m7, 0, 0, 90, 7.0),
  (@p20, @m7, 2, 0, 90, 9.1),

  -- m8 (Remontada_U16 home vs U10)
  (@p17, @m8, 0, 0, 90, 6.8),
  (@p20, @m8, 1, 0, 90, 8.3),
  (@p5,  @m8, 0, 1, 70, 7.0),

  -- m9 (Remontada_U14 away vs U16)
  (@p11, @m9, 0, 0, 90, 6.6),
  (@p12, @m9, 1, 1, 90, 8.4),
  (@p15, @m9, 0, 0, 60, 6.9),

  -- m10 (Remontada_U10 home vs U12)
  (@p3,  @m10, 2, 0, 90, 8.6),
  (@p2,  @m10, 0, 0, 90, 7.1),
  (@p21, @m10, 0, 1, 55, 6.8),

  -- m11 (Remontada_U12 away vs U10)
  (@p6,  @m11, 0, 0, 90, 6.7),
  (@p8,  @m11, 0, 0, 40, 6.2),

  -- m12 (Remontada_U16 tournament vs U14)
  (@p16, @m12, 1, 0, 90, 8.2),
  (@p14, @m12, 0, 1, 90, 7.9),
  (@p22, @m12, 0, 0, 70, 6.5);

-- Optional: update Teams.player_count based on inserted players
UPDATE Teams SET player_count = (
  SELECT COUNT(*) FROM Players WHERE Players.team_id = Teams.id
) WHERE id IN (@team_u10, @team_u12, @team_u14, @team_u16);
-- Done.
-- Done.
