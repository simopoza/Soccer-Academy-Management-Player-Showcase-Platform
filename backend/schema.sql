-- ===============================================
-- Database: soccer_school
-- Description: Schema for Soccer School Management System
-- Author: Mohammed Annahri
-- ===============================================

CREATE DATABASE IF NOT EXISTS soccer_school;
USE soccer_school;

-- =====================
-- Table: Teams
-- =====================
CREATE TABLE Teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    age_limit INT NOT NULL
);

-- =====================
-- Table: Players
-- =====================
CREATE TABLE Players (
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
    FOREIGN KEY (team_id) REFERENCES Teams(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- =====================
-- Table: Matches
-- =====================
CREATE TABLE Matches (
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
CREATE TABLE Stats (
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