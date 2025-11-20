const db = require("../db");
const { validateMatch, validatePlayer } = require("../helpers/validateForeignKeys");
const calculateRating = require("../helpers/calculateRating");

const getStats = async (req, res) => {
  try {
    const [ rows ] = await db.query("SELECT * FROM Stats");
    if (rows.length === 0) {
      return res.status(200).json({ message: "Stats table is empty" });
    }
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching Stats: ", err);
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

  if (!(await validateMatch(match_id))) {
    return res.status(400).json({ message: "Invalid match_id" });
  }

  if (!(await validatePlayer(player_id))) {
    return res.status(400).json({ message: "Invalid player_id" });
  }

  const { rating, finalGoals, finalAssists } = calculateRating(minutes_played, goals, assists);
  
  try {
    const query = `INSERT INTO Stats (player_id, match_id, goals, assists, minutes_played, rating) VALUES (?,?,?,?,?,?)`;
    const value = [player_id, match_id, finalGoals, finalAssists, minutes_played, rating];
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
    const allowedFields = ["player_id", "match_id", "goals", "assists", "minutes_played"];
  
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    });

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: "No fields provided to update" });
    }

    if (fieldsToUpdate.match_id !== undefined) {
      if (!(await validateMatch(fieldsToUpdate.match_id))) {
        return res.status(400).json({ message: "Invalid match_id" });
      }
    }

    if (fieldsToUpdate.player_id !== undefined) {
      if (!(await validatePlayer(fieldsToUpdate.player_id))) {
        return res.status(400).json({ message: "Invalid player_id" });
      }
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

module.exports = {
  getStats,
  getStatById,
  addStat,
  updateStat,
  deleteStat,
};

/*
Only one improvement

For PUT, you don’t need .exists() for all fields unless the user MUST update all fields.

Usually, update routes allow partial updates.
But if you want "full update", then you're good.
*/