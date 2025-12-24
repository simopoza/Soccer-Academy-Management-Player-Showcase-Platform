const db = require("../db");
const {
  resolveTeamName,
  getHomeParticipantForTeam,
  resolveOrCreateAwayParticipant,
  findExistingMatch,
  insertAndFetchMatch,
  formatMatch,
  fetchMatchById,
  buildUpdateClause,
  prepareUpdateFields,
} = require('../helpers/matchHelpers');

const getMatches = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, 
        COALESCE(m.team_name, t.name, ch.name, ph.external_name) AS team_name
      FROM Matches m
      LEFT JOIN Teams t ON m.team_id = t.id
      LEFT JOIN Participants ph ON m.participant_home_id = ph.id
      LEFT JOIN Clubs ch ON ph.club_id = ch.id
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
      SELECT m.*, COALESCE(m.team_name, t.name, ch.name, ph.external_name) AS team_name
      FROM Matches m
      LEFT JOIN Teams t ON m.team_id = t.id
      LEFT JOIN Participants ph ON m.participant_home_id = ph.id
      LEFT JOIN Clubs ch ON ph.club_id = ch.id
      WHERE m.id = ?
      LIMIT 1
    `, [id]);

    if (!rows || rows.length === 0) return res.status(404).json({ message: "Match not found" });
    return res.status(200).json(formatMatch(rows[0]));
  } catch (err) {
    console.error("Error fetching match by id:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const addMatch = async (req, res) => {
  // Accept and normalize inputs
  let {
    date = null,
    opponent = null,
    location = null,
    competition = null,
    team_goals = 0,
    opponent_goals = 0,
    team_id = null,
    team_name = null,
    participant_home_id = null,
    participant_away_id = null,
  } = req.body;

  if (date === '') date = null;

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const resolvedTeamId = team_id ?? null;
    const resolvedTeamName = await resolveTeamName(conn, resolvedTeamId, participant_home_id, team_name);

    const resolvedHomeParticipantId = participant_home_id ?? await getHomeParticipantForTeam(conn, resolvedTeamId);

    const resolvedAwayParticipantId = participant_away_id ?? await resolveOrCreateAwayParticipant(conn, opponent);

    const existingId = await findExistingMatch(conn, {
      date,
      opponent,
      location,
      competition,
      teamId: resolvedTeamId,
      teamName: resolvedTeamName,
      participantHomeId: resolvedHomeParticipantId,
      participantAwayId: resolvedAwayParticipantId,
    });

    if (existingId) {
      const [rows] = await conn.query(`
        SELECT m.*, COALESCE(m.team_name, t.name) AS team_name
        FROM Matches m
        LEFT JOIN Teams t ON m.team_id = t.id
        WHERE m.id = ?
      `, [existingId]);
      await conn.commit();
      conn.release();
      return res.status(200).json(formatMatch(rows[0]));
    }

    const values = [date, opponent, location, competition, team_goals, opponent_goals, resolvedTeamId, resolvedTeamName, resolvedHomeParticipantId, resolvedAwayParticipantId];
    const inserted = await insertAndFetchMatch(conn, values);

    await conn.commit();
    conn.release();
    return res.status(201).json(formatMatch(inserted));
  } catch (err) {
    console.error("Error adding match:", err);
    try {
      if (conn) {
        await conn.rollback();
        conn.release();
      }
    } catch (rbErr) {
      console.error('Error during rollback:', rbErr);
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateMatch = async (req, res) => {
  const { id } = req.params;

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const existing = await fetchMatchById(conn, id);
    if (!existing) {
      conn.release();
      return res.status(404).json({ message: "Match not found" });
    }

    const fieldsToUpdate = {};
    const allowedFields = ["date", "opponent", "location", "competition", "team_goals", "opponent_goals", "team_id", "team_name", "participant_home_id", "participant_away_id"];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) fieldsToUpdate[field] = req.body[field];
    });

    if (Object.keys(fieldsToUpdate).length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ message: "No fields provided to update" });
    }

    // Let helper prepare/resolve any derived fields (team_name, participant ids)
    const prepared = await prepareUpdateFields(conn, fieldsToUpdate, existing);

    const { setClause, values } = buildUpdateClause(prepared);
    if (!setClause) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ message: "No fields provided to update" });
    }

    values.push(id);
    const sql = `UPDATE Matches SET ${setClause} WHERE id = ?`;
    await conn.query(sql, values);

    const updated = await fetchMatchById(conn, id);

    await conn.commit();
    conn.release();
    res.status(200).json(formatMatch(updated));
  } catch (err) {
    console.error("Error updating match:", err);
    try {
      if (conn) {
        await conn.rollback();
        conn.release();
      }
    } catch (rbErr) {
      console.error('Error during rollback:', rbErr);
    }
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