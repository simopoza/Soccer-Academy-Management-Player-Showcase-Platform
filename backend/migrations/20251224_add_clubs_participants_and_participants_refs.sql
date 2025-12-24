-- Migration: add Clubs and Participants tables, add participant refs to Matches
-- Date: 2025-12-24
-- Purpose: incremental migration for Option A (add Clubs, Participants and nullable participant refs on Matches)
-- NOTE: Review and run on a backup or staging DB first.

USE `soccer_school`;

START TRANSACTION;

-- Create Clubs table (canonical teams/organizations)
CREATE TABLE IF NOT EXISTS Clubs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  short_name VARCHAR(50),
  country VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_clubs_name (name)
);

-- Create Participants table (a club or an external opponent instance for a season)
CREATE TABLE IF NOT EXISTS Participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  club_id INT NULL,
  external_name VARCHAR(150) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (club_id) REFERENCES Clubs(id) ON DELETE SET NULL
);

-- NOTE:
-- Matches table already exists in the current database. This migration intentionally
-- does NOT alter `Matches` to add participant columns or foreign keys so it is safe
-- to run when `Matches` is present. If you want to add participant references to
-- `Matches`, run a separate ALTER TABLE migration (example provided in comments below).

-- Backfill / manual steps (run only after review):
-- 1) Create Clubs from existing Teams (if Teams table exists)
-- INSERT INTO Clubs (name, short_name)
-- SELECT name, NULL FROM Teams WHERE name IS NOT NULL
-- ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 2) Create Participants for every Club
-- INSERT INTO Participants (club_id)
-- SELECT id FROM Clubs;

-- 3) For external/free-text team names in Matches, create Participants and then link them
-- INSERT INTO Participants (external_name)
-- SELECT DISTINCT team_name FROM Matches WHERE team_id IS NULL AND team_name IS NOT NULL;

-- 4) Optional: when ready, add participant columns to Matches and link them:
-- ALTER TABLE Matches
--   ADD COLUMN participant_home_id INT NULL,
--   ADD COLUMN participant_away_id INT NULL;

-- ALTER TABLE Matches
--   ADD CONSTRAINT fk_matches_participant_home FOREIGN KEY (participant_home_id) REFERENCES Participants(id) ON DELETE SET NULL,
--   ADD CONSTRAINT fk_matches_participant_away FOREIGN KEY (participant_away_id) REFERENCES Participants(id) ON DELETE SET NULL;

COMMIT;

-- End of migration
