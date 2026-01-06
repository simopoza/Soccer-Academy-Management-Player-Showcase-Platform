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
    scheduled_start = null,
    duration_minutes = 90,
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
  if (scheduled_start === '') scheduled_start = null;

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

    // convert incoming ISO8601 datetimes into MySQL DATETIME 'YYYY-MM-DD HH:MM:SS' (UTC)
    const toMySQLDatetime = (iso) => {
      if (!iso) return null;
      const d = new Date(iso);
      if (isNaN(d)) return null;
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
    };

    const mysqlDate = toMySQLDatetime(date);
    const mysqlScheduled = toMySQLDatetime(scheduled_start);

    const values = [mysqlDate, mysqlScheduled, Number(duration_minutes) || 90, opponent, location, competition, team_goals, opponent_goals, resolvedTeamId, resolvedTeamName, resolvedHomeParticipantId, resolvedAwayParticipantId];
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
    const allowedFields = ["date", "scheduled_start", "duration_minutes", "opponent", "location", "competition", "team_goals", "opponent_goals", "team_id", "team_name", "participant_home_id", "participant_away_id"];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) fieldsToUpdate[field] = req.body[field];
    });

    if (Object.keys(fieldsToUpdate).length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ message: "No fields provided to update" });
    }

    // Let helper prepare/resolve any derived fields (team_name, participant ids)
    // convert any incoming ISO datetimes to MySQL format for updates
    const toMySQLDatetime = (iso) => {
      if (!iso) return null;
      const d = new Date(iso);
      if (isNaN(d)) return null;
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
    };
    if (fieldsToUpdate.date) fieldsToUpdate.date = toMySQLDatetime(fieldsToUpdate.date);
    if (fieldsToUpdate.scheduled_start) fieldsToUpdate.scheduled_start = toMySQLDatetime(fieldsToUpdate.scheduled_start);
    if (fieldsToUpdate.duration_minutes !== undefined) fieldsToUpdate.duration_minutes = Number(fieldsToUpdate.duration_minutes) || null;

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

// Add an opponent goal without requiring a real player id.
// Creates or finds a placeholder opponent player, creates/updates a Stats row, and recomputes match score.
const addOpponentGoal = async (req, res) => {
  const { id: matchId } = req.params;
  const {
    goals = 1,
    assists = 0,
    minutes_played = 0,
    saves = 0,
    yellowCards = 0,
    redCards = 0,
  } = req.body || {};

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // ensure match exists
    const [mrows] = await conn.query('SELECT id FROM Matches WHERE id = ? FOR UPDATE', [matchId]);
    if (!mrows || mrows.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ message: 'Match not found' });
    }

    // find or create placeholder opponent player
    const [prow] = await conn.query("SELECT id FROM Players WHERE first_name = 'Opponent' AND last_name = 'Scorer' LIMIT 1");
    let playerId;
    if (prow && prow.length > 0) {
      playerId = prow[0].id;
    } else {
      const [ins] = await conn.query('INSERT INTO Players (first_name, last_name, position, team_id) VALUES (?,?,?,NULL)', ['Opponent', 'Scorer', 'ST']);
      playerId = ins.insertId;
    }

    // check for existing stat for this player+match
    const [srows] = await conn.query('SELECT * FROM Stats WHERE player_id = ? AND match_id = ? FOR UPDATE', [playerId, matchId]);
    const calculateRating = require('../helpers/calculateRating');
    let statId;
    if (srows && srows.length > 0) {
      const existing = srows[0];
      const newGoals = (Number(existing.goals) || 0) + Number(goals || 0);
      const newAssists = (Number(existing.assists) || 0) + Number(assists || 0);
      const newMinutes = minutes_played || existing.minutes_played || 0;
      const { rating, finalGoals, finalAssists } = calculateRating(newMinutes, newGoals, newAssists);
      await conn.query('UPDATE Stats SET goals = ?, assists = ?, minutes_played = ?, saves = ?, yellowCards = ?, redCards = ?, rating = ? WHERE id = ?', [finalGoals, finalAssists, newMinutes, Number(saves) || 0, Number(yellowCards) || 0, Number(redCards) || 0, rating, existing.id]);
      statId = existing.id;
    } else {
      const { rating, finalGoals, finalAssists } = calculateRating(minutes_played, Number(goals || 0), Number(assists || 0));
      const [insStat] = await conn.query('INSERT INTO Stats (player_id, match_id, goals, assists, minutes_played, saves, yellowCards, redCards, rating) VALUES (?,?,?,?,?,?,?,?,?)', [playerId, matchId, finalGoals, finalAssists, Number(minutes_played) || 0, Number(saves) || 0, Number(yellowCards) || 0, Number(redCards) || 0, rating]);
      statId = insStat.insertId;
    }

    // recompute match score
    const recomputeMatchScore = require('../helpers/recomputeMatchScore');
    try {
      await recomputeMatchScore(matchId, conn);
    } catch (e) {
      console.error('Failed to recompute match score after opponent goal', e);
    }

    await conn.commit();
    conn.release();
    res.status(201).json({ message: 'Opponent goal recorded', statId });
  } catch (err) {
    console.error('Error adding opponent goal:', err);
    try { await conn.rollback(); conn.release(); } catch (e) {}
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getMatches,
  getMatchById,
  addMatch,
  updateMatch,
  deleteMatch,
  addOpponentGoal,
};