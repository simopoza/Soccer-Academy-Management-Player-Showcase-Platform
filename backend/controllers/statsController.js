const db = require("../db");
const calculateRating = require("../helpers/calculateRating");
const recomputeMatchScore = require('../helpers/recomputeMatchScore');

const getStats = async (req, res) => {
  try {
    console.log('[statsController] getStats called with', req.query);
    // pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // total count
    const [[countRow]] = await db.query(`SELECT COUNT(*) AS total FROM Stats`);
    const total = countRow ? countRow.total : 0;

    // fetch page of rows with match/player data
    const [rows] = await db.query(`
      SELECT 
        s.*, 
        CONCAT(p.first_name, ' ', p.last_name) AS player_name, 
        p.team_id AS player_team_id,
        m.team_name AS team_name,
        m.opponent AS opponent,
        m.date AS match_date
      FROM Stats s
      JOIN Players p ON s.player_id = p.id
      LEFT JOIN Matches m ON s.match_id = m.id
      ORDER BY s.id DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    return res.status(200).json({ data: rows, total });
  } catch (err) {
    console.error("Error fetching Stats: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getStatById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT 
        s.*, 
        CONCAT(p.first_name, ' ', p.last_name) AS player_name, 
        p.team_id AS player_team_id,
        m.team_name AS team_name,
        m.opponent AS opponent,
        m.date AS match_date
      FROM Stats s
      JOIN Players p ON s.player_id = p.id
      LEFT JOIN Matches m ON s.match_id = m.id
      WHERE s.id = ?
    `, [id]);

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
    minutes_played,
    saves,
    yellowCards,
    redCards
  } = req.body;

  const { rating, finalGoals, finalAssists } = calculateRating(minutes_played, goals, assists);
  
  try {
    const query = `INSERT INTO Stats (player_id, match_id, goals, assists, minutes_played, saves, yellowCards, redCards, rating) VALUES (?,?,?,?,?,?,?,?,?)`;
    const value = [player_id, match_id, finalGoals, finalAssists, minutes_played, Number(saves) || 0, Number(yellowCards) || 0, Number(redCards) || 0, rating];
    // validate player belongs to match team or is an opponent placeholder
    try {
      const [mrows] = await db.query('SELECT team_id FROM Matches WHERE id = ? LIMIT 1', [match_id]);
      const matchTeamId = (mrows && mrows.length) ? mrows[0].team_id : null;
      const [prows] = await db.query('SELECT id, team_id, first_name, last_name FROM Players WHERE id = ? LIMIT 1', [player_id]);
      if (!prows || prows.length === 0) {
        return res.status(400).json({ message: 'Player not found' });
      }
      const player = prows[0];
      const isOpponentPlaceholder = String(player.first_name) === 'Opponent' && String(player.last_name) === 'Scorer';
      if (matchTeamId != null) {
        if (player.team_id !== matchTeamId && !isOpponentPlaceholder) {
          return res.status(400).json({ message: 'Player does not belong to the match team' });
        }
      }

    } catch (e) {
      console.error('Error validating player/team for addStat', e);
      return res.status(500).json({ message: 'Internal server error' });
    }

    const [ result ] = await db.query(query, value);

    // Recompute match score after adding stat
    try {
      await recomputeMatchScore(match_id);
    } catch (e) {
      console.error('Failed to recompute match score after addStat', e);
    }

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

  try {
    const [ rows ] = await db.query("SELECT * FROM Stats WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Stat not found" });
    }

    const existing = rows[0];
    const fieldsToUpdate = {};
    const allowedFields = ["player_id", "match_id", "goals", "assists", "minutes_played", "saves", "yellowCards", "redCards"];
  
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    });

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: "No fields provided to update" });
    }

    const needsRatingUpdate = 
      fieldsToUpdate.goals !== undefined ||
      fieldsToUpdate.assists !== undefined ||
      fieldsToUpdate.minutes_played !== undefined;

    console.log("Needs rating update: ", needsRatingUpdate);

    if (needsRatingUpdate) {
      const goals = fieldsToUpdate.goals ?? existing.goals;
      const assists = fieldsToUpdate.assists ?? existing.assists;
      const minutes = fieldsToUpdate.minutes_played ?? existing.minutes_played;

      const { rating, finalGoals, finalAssists } = calculateRating(minutes, goals, assists);

      fieldsToUpdate.rating = rating;
      fieldsToUpdate.goals = finalGoals;
      fieldsToUpdate.assists = finalAssists;
      fieldsToUpdate.minutes_played = minutes;
    }
    
    const setClause = Object.keys(fieldsToUpdate)
      .map(key => `${key} = ?`)
      .join(', ');
    
    const values = Object.values(fieldsToUpdate);
    values.push(id);

    const sql = `UPDATE Stats SET ${setClause} WHERE id = ?`;
    
    await db.query(sql, values);
    // Recompute match score when relevant fields changed and validate player-team membership
    try {
      const mid = fieldsToUpdate.match_id ?? existing.match_id;
      const finalPlayerId = fieldsToUpdate.player_id ?? existing.player_id;
      // validate membership similar to addStat
      try {
        const [mrows] = await db.query('SELECT team_id FROM Matches WHERE id = ? LIMIT 1', [mid]);
        const matchTeamId = (mrows && mrows.length) ? mrows[0].team_id : null;
        const [prows] = await db.query('SELECT id, team_id, first_name, last_name FROM Players WHERE id = ? LIMIT 1', [finalPlayerId]);
        if (!prows || prows.length === 0) {
          return res.status(400).json({ message: 'Player not found' });
        }
        const player = prows[0];
        const isOpponentPlaceholder = String(player.first_name) === 'Opponent' && String(player.last_name) === 'Scorer';
        if (matchTeamId != null) {
          if (player.team_id !== matchTeamId && !isOpponentPlaceholder) {
            return res.status(400).json({ message: 'Player does not belong to the match team' });
          }
        }
      } catch (e) {
        console.error('Error validating player/team for updateStat', e);
        return res.status(500).json({ message: 'Internal server error' });
      }
      await recomputeMatchScore(mid);
    } catch (e) {
      console.error('Failed to recompute match score after updateStat', e);
    }

    res.status(200).json({ message: "Stat updated successfully" });
  } catch (err) {
    console.error("Error updating Stat: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteStat = async (req, res) => {
  const { id } = req.params;

  try {
    // fetch match_id before deletion
    const [rows] = await db.query('SELECT match_id FROM Stats WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Stat not found' });
    }
    const matchId = rows[0].match_id;

    const [ result ] = await db.query("DELETE FROM Stats WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Stat not found" });
    }

    // Recompute match score after deletion
    try {
      await recomputeMatchScore(matchId);
    } catch (e) {
      console.error('Failed to recompute match score after deleteStat', e);
    }

    res.status(200).json({ message: "Stats deleted successfully" });
  } catch (err) {
    console.error("Error deleting Stats by ID: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getStats,
  getStatById,
  addStat,
  updateStat,
  deleteStat,
};
