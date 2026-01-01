-- Migration: add saves, yellowCards, redCards to Stats table
-- Run this once against the database (e.g., via mysql CLI)

USE soccer_school;

ALTER TABLE Stats
  ADD COLUMN saves INT DEFAULT 0 AFTER assists,
  ADD COLUMN yellowCards INT DEFAULT 0 AFTER saves,
  ADD COLUMN redCards INT DEFAULT 0 AFTER yellowCards;

-- If you want idempotency in some deployment systems, you can guard with checks, but
-- MySQL doesn't support IF NOT EXISTS for ADD COLUMN in older versions; run this
-- migration only once.
