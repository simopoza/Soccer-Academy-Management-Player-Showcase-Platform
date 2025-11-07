const db = require("../db");

const getMatches = async (req, res) => {
  try {
    const [ rows ] = await db.query("SELECT * FROM Matches");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching matches: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getMatchById = async (req, res) => {
  const { id } = req.params;
  const idNum = Number(id);

  if (isNaN(idNum)) {
    return res.status(400).json({ message: "Invalid match ID" });
  }
  
  try {
    const [ rows ] = await db.query("SELECT * FROM Matches WHERE id = ?", [idNum]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Match not found" });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("Error fetching match by ID:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const addMatch = async (req, res) => {
  const allowedTypes = ['Friendly', 'Officially'];
  const allowedLocations = ['Home', 'Away'];
  const {
    date,
    opponent,
    location,
    match_type,
    team_goals,
    opponent_goals,
    team_id
  } = req.body;

  if (opponent.trim().length === 0) {
    return res.status(400).json({ message: "oppenent must be a valid name" });
  }

  if (!date || !opponent || !location || !match_type || !team_id) {
    return res.status(400).json({
      message: "Missing required fields: date, opponent, location, match_type, team_id"
    });
  }

  if (isNaN(Number(team_goals)) || isNaN(Number(opponent_goals)) || isNaN(Number(team_id))) {
    return res.status(400).json({ message: "team_goals, opponent_goals, and team_id must be a number" });
  }

  if (team_goals < 0 || opponent_goals < 0) {
    return res.status(400).json({
      message: "Goals should be bigger or equal to 0"
    });
  }

  if (!allowedTypes.includes(match_type)) {
    return res.status(400).json({ message: "Invalid match_type. Must be 'Friendly' or 'Officially'." });
  }

  if (!allowedLocations.includes(location)) {
    return res.status(400).json({ message: "Invalid location. Must be 'Home' or 'Away'." });
  }

  try {
    const [rows] = await db.query("SELECT * FROM Teams WHERE id = ?", [team_id]);
    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid team_id" });
    }
  } catch (err) {
    console.error("Error adding match:", err);
    return res.status(500).json({ message: "Internal server error" });
  }

  try {
    const query = "INSERT INTO Matches (date, opponent, location, match_type, team_goals, opponent_goals, team_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const value = [date, opponent, location, match_type, team_goals, opponent_goals, team_id];
    const [ result ] = await db.query(query, value);
    res.status(201).json({ 
      message: "Match added successfully",
      id: result.insertId 
    });
  } catch (err) {
    console.error("Error adding match:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateMatch = async (req, res) => {
  const { id } = req.params;
  const idNum = Number(id);
  const allowedTypes = ['Friendly', 'Officially'];
  const allowedLocations = ['Home', 'Away'];

  if (isNaN(idNum)) {
    return res.status(400).json({ message: "Invalid match ID" });
  }

  const {
    date,
    opponent,
    location,
    match_type,
    team_goals,
    opponent_goals,
    team_id
  } = req.body;

  if (opponent.trim().length === 0) {
    return res.status(400).json({ message: "oppenent must be a valid name" });
  }

  if (!date || !opponent || !location || !match_type || !team_id) {
    return res.status(400).json({
      message: "Missing required fields: date, opponent, location, match_type, team_id"
    });
  }

  if (isNaN(Number(team_goals)) || isNaN(Number(opponent_goals)) || isNaN(Number(team_id))) {
    return res.status(400).json({ message: "team_goals, opponent_goals, and team_id must be number" });
  }

  if (team_goals < 0 || opponent_goals < 0) {
    return res.status(400).json({
      message: "Goals should be bigger or equal to 0"
    });
  }

  if (!allowedTypes.includes(match_type)) {
    return res.status(400).json({ message: "Invalid match_type. Must be 'Friendly' or 'Officially'." });
  }

  if (!allowedLocations.includes(location)) {
    return res.status(400).json({ message: "Invalid location. Must be 'Home' or 'Away'." });
  }

  try {
    const [rows] = await db.query("SELECT * FROM Teams WHERE id = ?", [team_id]);
    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid team_id" });
    }
  } catch (err) {
    console.error("Error updating match:", err);
    return res.status(500).json({ message: "Internal server error" });
  }

  try {
    const value = [date, opponent, location, match_type, team_goals, opponent_goals, team_id, idNum];
    const [ result ] = await db.query("UPDATE Matches SET date = ?, opponent = ?, location = ?, match_type = ?, team_goals = ?, opponent_goals = ?, team_id = ? WHERE id = ?", value);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Match not found" });
    }
    res.status(200).json({ message: "Match updated successfully" });
  } catch (err) {
    console.error("Error updating match:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteMatch = async (req, res) => {
  const { id } = req.params;
  const idNum = Number(id);

  if (isNaN(idNum)) {
    return res.status(400).json({ message: "Invalid match ID" });
  }

  try {
    const [ result ] = await db.query("DELETE FROM Matches WHERE id = ?", [idNum]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Match not found" });
    }
    res.status(200).json({ message: "Match deleted successfully" });
  } catch (err) {
    console.error("Error deleting match:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getMatches,
  getMatchById,
  addMatch,
  updateMatch,
  deleteMatch,
};