-- Migration: create Matches table with nullable date, sync team_name from Teams via triggers,
-- and add FK from Stats.match_id to Matches.id
-- Date: 2025-12-24
-- WARNING: Run on a tested backup or staging environment first.

USE `soccer_school`;

START TRANSACTION;

-- Create Matches table
CREATE TABLE IF NOT EXISTS Matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATETIME NULL,
  opponent VARCHAR(100) NOT NULL,
  location ENUM('Home','Away') DEFAULT 'Home',
  competition ENUM('Friendly','Cup','League') DEFAULT 'Friendly',
  team_name VARCHAR(100) NULL,
  team_goals INT DEFAULT 0,
  opponent_goals INT DEFAULT 0,
  team_id INT NULL,
  participant_home_id INT NULL,
  participant_away_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (team_id) REFERENCES Teams(id)
      ON DELETE SET NULL
      ON UPDATE CASCADE
);

-- Create trigger to set team_name from Teams.name when team_id provided (INSERT)
DELIMITER $$
CREATE TRIGGER trg_matches_before_insert
BEFORE INSERT ON Matches FOR EACH ROW
BEGIN
  IF NEW.team_id IS NOT NULL THEN
    SET NEW.team_name = (SELECT name FROM Teams WHERE id = NEW.team_id);
  END IF;
END$$

-- Create trigger to set team_name from Teams.name when team_id provided (UPDATE)
CREATE TRIGGER trg_matches_before_update
BEFORE UPDATE ON Matches FOR EACH ROW
BEGIN
  IF NEW.team_id IS NOT NULL THEN
    SET NEW.team_name = (SELECT name FROM Teams WHERE id = NEW.team_id);
  END IF;
END$$
DELIMITER ;

-- Add FK from Stats.match_id to Matches.id (Stats may have been created earlier without this FK)
-- If your DB already has this constraint, this statement will fail; run manually if needed.
ALTER TABLE Stats
  ADD CONSTRAINT fk_stats_match FOREIGN KEY (match_id) REFERENCES Matches(id) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;

-- End migration
