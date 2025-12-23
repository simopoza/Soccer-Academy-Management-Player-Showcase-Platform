-- ===============================================
-- Database: soccer_school
-- Description: Schema for Soccer School Management System
-- Author: Mohammed Annahri
-- ===============================================

CREATE DATABASE IF NOT EXISTS soccer_school;
USE soccer_school;

-- =====================
-- Table: Users
-- =====================
CREATE TABLE IF NOT EXISTS Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'agent', 'player') NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approved_by INT NULL,
  approved_at DATETIME NULL,
  profile_completed BOOLEAN DEFAULT FALSE,
  image_url TEXT NULL,

  FOREIGN KEY (approved_by) REFERENCES Users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- =====================
-- Table: Teams
-- =====================
CREATE TABLE IF NOT EXISTS Teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  age_limit INT NOT NULL,
  coach VARCHAR(100) NULL,
  founded VARCHAR(20) NULL,
  status ENUM('Active','Inactive') DEFAULT 'Active',
  player_count INT DEFAULT 0
);

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
-- Table: Matches
-- =====================
CREATE TABLE IF NOT EXISTS Matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATETIME NOT NULL,
  opponent VARCHAR(100) NOT NULL,
  location ENUM('Home','Away') NOT NULL,
  match_type ENUM('Friendly','Officially') NOT NULL,
  team_goals INT DEFAULT 0,
  opponent_goals INT DEFAULT 0,

  team_id INT NULL,

  FOREIGN KEY (team_id) REFERENCES Teams(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
);

-- =====================
-- Table: Stats
-- =====================
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
      ON UPDATE CASCADE,

  FOREIGN KEY (match_id) REFERENCES Matches(id)
      ON DELETE CASCADE
      ON UPDATE CASCADE
);

-- =====================
-- Table: PasswordResets
-- =====================
CREATE TABLE PasswordResets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

