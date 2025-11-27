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

  try {
    const [ rows ] = await db.query("SELECT * FROM Matches WHERE id = ?", [id]);
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
  const {
    date,
    opponent,
    location,
    match_type,
    team_goals,
    opponent_goals,
    team_id
  } = req.body;

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

  try {
    const [ rows ] = await db.query("SELECT * FROM Matches WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Match not found" });
    }

    const fieldsToUpdate = {};
    const allowedFields = ["date", "opponent", "location", "match_type", "team_goals", "opponent_goals", "team_id"];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    });

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: "No fields provided to update"});
    }

    const setClause = Object.keys(fieldsToUpdate)
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.values(fieldsToUpdate);
    values.push(id);

    const sql = `UPDATE Matches SET ${setClause} WHERE id = ?`;

    await db.query(sql, values);

    res.status(200).json({ message: "Match updated successfully" });
  } catch (err) {
    console.error("Error updating match:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteMatch = async (req, res) => {
  const { id } = req.params;

  try {
    const [ result ] = await db.query("DELETE FROM Matches WHERE id = ?", [id]);
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