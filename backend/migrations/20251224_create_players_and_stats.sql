-- Migration: create Players and Stats tables
-- Date: 2025-12-24
-- NOTE: Matches table was previously dropped; Stats references Matches(id).
-- To avoid FK errors, this migration creates `Players` and `Stats` but does not add the FK constraint on `match_id` yet.
-- After recreating `Matches`, add the FK with an ALTER TABLE.

USE `soccer_school`;

START TRANSACTION;

-- =====================
-- Table: Players
-- =====================
CREATE TABLE IF NOT EXISTS Players (
  id INT AUTO_INCREMENT PRIMARY KEY,

  first_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NULL,
  date_of_birth DATE NULL,

  height DECIMAL(4,1) NULL,
  weight DECIMAL(4,1) NULL,
  strong_foot ENUM('Left','Right') NULL,
  image_url TEXT NULL,

  -- Position optionally NULL (recommended)
  position ENUM('GK','CB','LB','RB','CDM','CM','CAM','LW','RW','ST') NULL,

  team_id INT NULL,
  user_id INT NULL UNIQUE,

  FOREIGN KEY (team_id) REFERENCES Teams(id)
      ON DELETE SET NULL
      ON UPDATE CASCADE,

  FOREIGN KEY (user_id) REFERENCES Users(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
);

-- =====================
-- Table: Stats
-- =====================
-- Note: `match_id` FK to Matches(id) is deferred until Matches is recreated.
CREATE TABLE IF NOT EXISTS Stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  player_id INT NOT NULL,
  match_id INT NOT NULL,

  goals INT DEFAULT 0,
  assists INT DEFAULT 0,
  minutes_played INT DEFAULT 0 CHECK (minutes_played BETWEEN 0 AND 120),
  rating DECIMAL(4,2) DEFAULT 0.0,

  -- Prevent duplicate stat entries
  UNIQUE (player_id, match_id),

  FOREIGN KEY (player_id) REFERENCES Players(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE

  -- FOREIGN KEY (match_id) REFERENCES Matches(id)
  --     ON DELETE CASCADE
  --     ON UPDATE CASCADE
);

COMMIT;

-- After Matches is recreated, run the following to add the FK on match_id:
-- ALTER TABLE Stats ADD CONSTRAINT fk_stats_match FOREIGN KEY (match_id) REFERENCES Matches(id) ON DELETE CASCADE ON UPDATE CASCADE;

-- End migration
