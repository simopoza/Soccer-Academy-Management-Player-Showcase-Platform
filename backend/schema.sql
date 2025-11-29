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
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'agent', 'player') NOT NULL
);

-- =====================
-- Table: Teams
-- =====================
CREATE TABLE IF NOT EXISTS Teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    age_limit INT NOT NULL
);

-- =====================
-- Table: Players
-- =====================
CREATE TABLE IF NOT EXISTS Players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    height DECIMAL(4,1),
    weight DECIMAL(4,1),
    position ENUM('GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST') NOT NULL,
    strong_foot ENUM('Left', 'Right'),
    image_url VARCHAR(255),
    team_id INT,
    user_id INT UNIQUE NOT NULL,
    FOREIGN KEY (team_id) REFERENCES Teams(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- =====================
-- Table: Matches
-- =====================
CREATE TABLE IF NOT EXISTS Matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATETIME NOT NULL,
    opponent VARCHAR(100) NOT NULL,
    location ENUM('Home', 'Away') NOT NULL,
    match_type ENUM('Friendly', 'Officially') NOT NULL,
    team_goals INT DEFAULT 0,
    opponent_goals INT DEFAULT 0,
    team_id INT,
    FOREIGN KEY (team_id) REFERENCES Teams(id) ON DELETE CASCADE ON UPDATE CASCADE
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
    FOREIGN KEY (player_id) REFERENCES Players(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (match_id) REFERENCES Matches(id) ON DELETE CASCADE ON UPDATE CASCADE
);
