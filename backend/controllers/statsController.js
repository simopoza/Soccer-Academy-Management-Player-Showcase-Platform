const db = require("../db");

const getStats = async (req, res) => {
  try {
    const [ rows ] = await db.query("SELECT * FROM Stats");
    if (rows.length === 0) {
      return res.status(200).json({ message: "Stats table is empty" });
    }
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetshing Stats: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getStatById = async (req, res) => {
  const { id } = req.params;
  const idNum = Number(id);

  if (isNaN(idNum)) {
    return res.status(400).json({ message: "Invalid Stats ID" });
  }

  try {
    const [ rows ] = await db.query("SELECT * FROM Stats WHERE id = ?", [idNum]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Stat not found" });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("Error fetching Stats by ID: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const addStat = async (req, res) => {
  const {
    player_id,
    match_id,
    goals,
    assists,
    minutes_played
  } = req.body;
  const goals_num = Number(goals);
  const assists_num = Number(assists);
  const minutes_played_num = Number(minutes_played);
  const player_id_num = Number(player_id);
  const match_id_num = Number(match_id);

  if (player_id === undefined || match_id === undefined || goals === undefined || assists === undefined || minutes_played === undefined) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (isNaN(goals_num) || isNaN(assists_num) || isNaN(minutes_played_num) || isNaN(player_id_num) || isNaN(match_id_num)) {
    return res.status(400).json({ message: "Goals, Assists, Minutes_played, Rating, player_id and match_id must be number" });
  }

  if (goals_num < 0 || assists_num < 0) {
    return res.status(400).json({ message: "Goals and Assists must be positive integer" });
  }

  if (minutes_played_num < 0 || minutes_played_num > 120) {
    return res.status(400).json({ message: "Minutes_played must be between 0 and 120 minutes" });
  }

  try {
    const [ existing ] = await db.query("SELECT * FROM Matches WHERE id = ?", [match_id_num]);
    if (existing.length === 0) {
      return res.status(400).json({ message: "Invalid match_id" });
    }
  } catch (err) {
    console.error("Error adding Stat: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }

  try {
    const [ existing ] = await db.query("SELECT * FROM Players WHERE id = ?", [player_id_num]);
    if (existing.length === 0) {
      return res.status(400).json({ message: "Invalid player_id" });
    }
  } catch (err) {
    console.error("Error adding Stat: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }

  const rating = calculateRating(minutes_played_num, goals_num, assists_num);

  try {
    const query = `INSERT INTO Stats (player_id, match_id, goals, assists, minutes_played, rating) VALUES (?,?,?,?,?,?)`;
    const value = [player_id_num, match_id_num, goals_num, assists_num, minutes_played_num, rating];
    const [ result ] = await db.query(query, value);

    res.status(201).json({
      message: "Stat added successfully",
      id: result.insertId
    })
  } catch (err) {
    console.error("Error adding Stat: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateStat = async (req, res) => {
  const { id } = req.params;
  const {
    player_id,
    match_id,
    goals,
    assists,
    minutes_played
  } = req.body;
  const idNum = Number(id);
  const goals_num = Number(goals);
  const assists_num = Number(assists);
  const minutes_played_num = Number(minutes_played);
  const player_id_num = Number(player_id);
  const match_id_num = Number(match_id);  

  if (player_id === undefined || match_id === undefined || goals === undefined || assists === undefined || minutes_played === undefined) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (isNaN(idNum)) {
    return res.status(400).json({ message: "id must be number" });
  }

  if (isNaN(goals_num) || isNaN(assists_num) || isNaN(minutes_played_num) || isNaN(player_id_num) || isNaN(match_id_num)) {
    return res.status(400).json({ message: "Goals, Assists, Minutes_played, player_id and match_id must be number" });
  }

  if (goals_num < 0 || assists_num < 0) {
    return res.status(400).json({ message: "Goals and Assists must be positive integer" });
  }

  if (minutes_played_num < 0 || minutes_played_num > 120) {
    return res.status(400).json({ message: "Minutes_played must be between 0 and 120 minutes" });
  }

  try {
    const [ existing ] = await db.query("SELECT * FROM Matches WHERE id = ?", [match_id_num]);
    if (existing.length === 0) {
      return res.status(400).json({ message: "Invalid match_id" });
    }
  } catch (err) {
    console.error("Error updating Stat: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }

  try {
    const [ existing ] = await db.query("SELECT * FROM Players WHERE id = ?", [player_id_num]);
    if (existing.length === 0) {
      return res.status(400).json({ message: "Invalid player_id" });
    }
  } catch (err) {
    console.error("Error updating Stat: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }

  const rating = calculateRating(minutes_played_num, goals_num, assists_num);

  try {
    const value = [player_id_num, match_id_num, goals_num, assists_num, minutes_played_num, rating, idNum];
    const [ result ] = await db.query("UPDATE Stats SET player_id = ?, match_id = ?, goals = ?, assists = ?, minutes_played = ?, rating = ? WHERE id = ?", value);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Stat not found" });
    }
    res.status(200).json({ message: "Stat updated successfully" });
  } catch (err) {
    console.error("Error updating Stat: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteStat = async (req, res) => {
  const { id } = req.params;
  const idNum = Number(id);

  if (isNaN(idNum)) {
    return res.status(400).json({ message: "Invalid Stats ID" });
  }

  try {
    const [ result ] = await db.query("DELETE FROM Stats WHERE id = ?", [idNum]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Stat not found" });
    }
    res.status(200).json({ message: "Stats deleted successfully" });
  } catch (err) {
    console.error("Error deleting Stats by ID: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/// reset goals and assists to 0 if minutes_played = 0

const calculateRating = (minutes, goalsScored, assistsProvided) => {
  // Base rating starts at 5.0 (out of 10)
  let rating = 5.0;
  
  // If player didn't play (0 minutes), return minimum rating
  if (minutes === 0) {
    return 0.0;
  }
  
  // Calculate per-minute impact
  const minutesPlayedRatio = Math.min(minutes / 90, 1.0); // Normalize to 90 minutes max
  
  // Goals contribute more to rating (1.5 points per goal, scaled by minutes)
  const goalContribution = (goalsScored * 1.5) * minutesPlayedRatio;
  
  // Assists contribute to rating (1.0 point per assist, scaled by minutes)
  const assistContribution = (assistsProvided * 1.0) * minutesPlayedRatio;
  
  // Playing time bonus: small bonus for playing more minutes
  const playTimeBonus = minutesPlayedRatio * 0.5;
  
  // Calculate final rating
  rating = rating + goalContribution + assistContribution + playTimeBonus;
  
  // Cap the rating between 0.0 and 10.0
  rating = Math.max(0.0, Math.min(10.0, rating));
  
  // Round to 1 decimal place
  return Math.round(rating * 10) / 10;
}

module.exports = {
  getStats,
  getStatById,
  addStat,
  updateStat,
  deleteStat,
};