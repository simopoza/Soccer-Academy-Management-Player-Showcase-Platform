const db = require("../db");
const calculateRating = require("../helpers/calculateRating");

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

    res.status(200).json({ message: "Stat updated successfully" });
  } catch (err) {
    console.error("Error updating Stat: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteStat = async (req, res) => {
  const { id } = req.params;

  try {
    const [ result ] = await db.query("DELETE FROM Stats WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Stat not found" });
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
