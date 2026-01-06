-- Migration: add scheduled_start and duration_minutes to Matches table
-- Run once against the database. Example:
-- mysql -u <user> -p soccer_school < backend/scripts/add_matches_timing_columns.sql

USE soccer_school;

-- Conditionally add `scheduled_start` if it does not exist
SELECT COUNT(*) INTO @c1 FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'soccer_school' AND TABLE_NAME = 'Matches' AND COLUMN_NAME = 'scheduled_start';
SET @sql1 = IF(@c1 = 0,
  'ALTER TABLE Matches ADD COLUMN scheduled_start DATETIME NULL AFTER date;',
  'SELECT 1;'
);
PREPARE stmt1 FROM @sql1; EXECUTE stmt1; DEALLOCATE PREPARE stmt1;

-- Conditionally add `duration_minutes` if it does not exist
SELECT COUNT(*) INTO @c2 FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'soccer_school' AND TABLE_NAME = 'Matches' AND COLUMN_NAME = 'duration_minutes';
SET @sql2 = IF(@c2 = 0,
  'ALTER TABLE Matches ADD COLUMN duration_minutes INT DEFAULT 90 AFTER scheduled_start;',
  'SELECT 1;'
);
PREPARE stmt2 FROM @sql2; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;

-- This script is safe to run multiple times against MySQL servers that support prepared statements.
