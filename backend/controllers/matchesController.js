const db = require("../db");

// Helper: normalize a DB row into a consistent API payload
const formatMatch = (r) => ({
  id: r.id,
  date: r.date ? (r.date instanceof Date ? r.date.toISOString() : r.date) : null,
  opponent: r.opponent,
  location: r.location,
  competition: r.competition,
  team_id: r.team_id ?? null,
  team_name: r.team_name ?? null,
  team_goals: Number(r.team_goals) ?? 0,
  opponent_goals: Number(r.opponent_goals) ?? 0,
  participant_home_id: r.participant_home_id ?? null,
  participant_away_id: r.participant_away_id ?? null,
  created_at: r.created_at ? (r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at) : null,
  updated_at: r.updated_at ? (r.updated_at instanceof Date ? r.updated_at.toISOString() : r.updated_at) : null,
});

const getMatches = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, COALESCE(m.team_name, t.name) AS team_name
      FROM Matches m
      LEFT JOIN Teams t ON m.team_id = t.id
      ORDER BY m.date DESC
    `);

    res.status(200).json(rows.map(formatMatch));
  } catch (err) {
    console.error("Error fetching matches: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getMatchById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT m.*, COALESCE(m.team_name, t.name) AS team_name
      FROM Matches m
      LEFT JOIN Teams t ON m.team_id = t.id
      WHERE m.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.status(200).json(formatMatch(rows[0]));
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
    // Resolve team_name from team_id if provided (avoid relying only on DB triggers)
    let teamName = req.body.team_name ?? null;
    if (team_id != null) {
      const [teamRows] = await db.query('SELECT name FROM Teams WHERE id = ?', [team_id]);
      if (teamRows && teamRows.length > 0) teamName = teamRows[0].name;
    }

    // prevent duplicate exact match entries (same date/opponent/location/competition/team)
    // use NULL-safe comparison (<=>) for nullable fields
    const [existing] = await db.query(`
      SELECT m.id
      FROM Matches m
      WHERE m.date <=> ? AND m.opponent = ? AND m.location <=> ? AND m.competition = ? AND (m.team_id <=> ? AND m.team_name <=> ?)
    `, [date, opponent, location, competition, team_id, teamName]);

    if (existing && existing.length > 0) {
      const existingId = existing[0].id;
      const [rows] = await db.query(`
        SELECT m.*, COALESCE(m.team_name, t.name) AS team_name
        FROM Matches m
        LEFT JOIN Teams t ON m.team_id = t.id
        WHERE m.id = ?
      `, [existingId]);
      return res.status(200).json(formatMatch(rows[0]));
    }

    const query = "INSERT INTO Matches (date, opponent, location, competition, team_goals, opponent_goals, team_id, team_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const value = [date, opponent, location, competition, team_goals, opponent_goals, team_id, teamName];
    const [ result ] = await db.query(query, value);
    // fetch the newly created row (include team_name via LEFT JOIN)
    const [rows] = await db.query(`
      SELECT m.*, COALESCE(m.team_name, t.name) AS team_name
      FROM Matches m
      LEFT JOIN Teams t ON m.team_id = t.id
      WHERE m.id = ?
    `, [result.insertId]);
    res.status(201).json(formatMatch(rows[0]));
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

    // If updating team_id but team_name not provided, resolve it now to keep app-level consistency
    if (fieldsToUpdate.hasOwnProperty('team_id')) {
      const newTeamId = fieldsToUpdate.team_id;
      if (newTeamId != null && !fieldsToUpdate.hasOwnProperty('team_name')) {
        const [teamRows] = await db.query('SELECT name FROM Teams WHERE id = ?', [newTeamId]);
        if (teamRows && teamRows.length > 0) {
          fieldsToUpdate.team_name = teamRows[0].name;
        } else {
          fieldsToUpdate.team_name = null;
        }
      }
      // if team_id explicitly set to null and team_name not provided, clear team_name
      if (newTeamId == null && !fieldsToUpdate.hasOwnProperty('team_name')) {
        fieldsToUpdate.team_name = null;
      }
    }

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
    res.status(200).json(formatMatch(rows[0]));
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