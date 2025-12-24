-- Migration: drop Matches table and seed Teams
-- Date: 2025-12-24
-- WARNING: Run on a tested backup or staging environment first.
USE `soccer_school`;

START TRANSACTION;

-- Drop Matches table (this will remove all match history)
DROP TABLE IF EXISTS `Players`;
DROP TABLE IF EXISTS `Stats`;
DROP TABLE IF EXISTS `Matches`;

-- Clear existing Teams data
TRUNCATE TABLE `Teams`;

-- Insert academy teams: U10, U12, U14, U16
-- Teams table columns: id, name, age_limit, coach, founded, status, player_count
INSERT INTO `Teams` (`name`, `age_limit`, `coach`, `founded`, `status`, `player_count`)
VALUES
  ('Remontada_U10', 10, NULL, '2026', 'Active', 0),
  ('Remontada_U12', 12, NULL, '2026', 'Active', 0),
  ('Remontada_U14', 14, NULL, '2026', 'Active', 0),
  ('Remontada_U16', 16, NULL, '2026', 'Active', 0);

COMMIT;

-- End migration
