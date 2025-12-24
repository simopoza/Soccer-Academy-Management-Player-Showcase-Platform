const db = require("../db");

const getMatches = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, COALESCE(m.team_name, t.name) AS team_name
      FROM Matches m
      LEFT JOIN Teams t ON m.team_id = t.id
      ORDER BY m.date DESC
    `);

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching matches: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getMatchById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT m.*, t.name AS team_name
      FROM Matches m
      LEFT JOIN Teams t ON m.team_id = t.id
      WHERE m.id = ?
    `, [id]);

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
    competition,
    team_goals,
    opponent_goals,
    team_id
  } = req.body;

  // location now indicates Home/Away (validator enforces values)
  const location = req.body.location ?? null;

  try {
    // prevent duplicate exact match entries (same date/opponent/location/competition/team)
    const [existing] = await db.query(`
      SELECT m.id
      FROM Matches m
      WHERE m.date = ? AND m.opponent = ? AND m.location = ? AND m.competition = ? AND (m.team_id <=> ? AND m.team_name <=> ?)
    `, [date, opponent, location, competition, team_id, req.body.team_name ?? null]);

    if (existing && existing.length > 0) {
      const existingId = existing[0].id;
      const [rows] = await db.query(`
        SELECT m.*, COALESCE(m.team_name, t.name) AS team_name
        FROM Matches m
        LEFT JOIN Teams t ON m.team_id = t.id
        WHERE m.id = ?
      `, [existingId]);
      return res.status(200).json(rows[0]);
    }

    const query = "INSERT INTO Matches (date, opponent, location, competition, team_goals, opponent_goals, team_id, team_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const value = [date, opponent, location, competition, team_goals, opponent_goals, team_id, req.body.team_name ?? null];
    const [ result ] = await db.query(query, value);
    // fetch the newly created row (include team_name via LEFT JOIN)
    const [rows] = await db.query(`
      SELECT m.*, COALESCE(m.team_name, t.name) AS team_name
      FROM Matches m
      LEFT JOIN Teams t ON m.team_id = t.id
      WHERE m.id = ?
    `, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error adding match:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateMatch = async (req, res) => {
  const { id } = req.params;

  try {
    const [ row ] = await db.query("SELECT * FROM Matches WHERE id = ?", [id]);

    if (!row || row.length === 0) {
      return res.status(404).json({ message: "Match not found" });
    }

    const fieldsToUpdate = {};
    const allowedFields = ["date", "opponent", "location", "competition", "team_goals", "opponent_goals", "team_id", "team_name"];

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
    // return the updated row
    const [rows] = await db.query(`
      SELECT m.*, COALESCE(m.team_name, t.name) AS team_name
      FROM Matches m
      LEFT JOIN Teams t ON m.team_id = t.id
      WHERE m.id = ?
    `, [id]);
    res.status(200).json(rows[0]);
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