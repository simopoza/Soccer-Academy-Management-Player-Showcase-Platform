const db = require("../db");

const getPlayers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, t.name AS team_name
      FROM Players p
      JOIN Teams t ON p.team_id = t.id
    `);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching players:", err);
    return res.status(500).json({ message : "Internal Server Error" });
  }
};

const getPlayerById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT p.*, t.name AS team_name
      FROM Players p
      JOIN Teams t ON p.team_id = t.id
      WHERE p.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("Error fetching player by ID:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const addPlayer = async (req, res) => {
  const {
    first_name,
    last_name,
    date_of_birth,
    height,
    weight,
    position,
    strong_foot,
    image_url,
    team_id,
    user_id
  } = req.body;

  try {
    const query = `INSERT INTO Players (first_name, last_name, date_of_birth, height, weight, position, strong_foot, image_url, team_id, user_id) VALUES (?,?,?,?,?,?,?,?,?,?)`;
    const values = [first_name, last_name, date_of_birth, height, weight, position, strong_foot, image_url, team_id, user_id];

    const [ result ] = await db.query(query, values);
    res.status(201).json({ 
      message: "Player added successfully",
      id: result.insertId 
    });
  } catch (err) {
    console.error("Error adding player: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updatePlayer = async (req, res) => {
  const { id } = req.params;

  try {
    const [ rows ] = await db.query("SELECT * FROM Players WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Player not found"});
    }

    const fieldsToUpdate = {};
    const allowedFields = ["first_name", "last_name", "date_of_birth", "height", "weight", "position", "strong_foot", "image_url", "team_id", "user_id"];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    });

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: "No fields provided to update "});
    }

    const setClause = Object.keys(fieldsToUpdate)
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.values(fieldsToUpdate);
    values.push(id);

    const sql = `UPDATE Players SET ${setClause} WHERE id = ?`;

    await db.query(sql, values);

    res.status(200).json({ message: "Player updated successfully" });
  } catch (err) {
    console.error("Error updating player: ", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const deletePlayer = async (req, res) => {
  const { id } = req.params;

  try {
    const [ result ] = await db.query("DELETE FROM Players WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Player not found" });
    }
    res.status(200).json({ message: "Player deleted successfully" });
  } catch (err) {
    console.error("Error deleting player: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
    getPlayers,
    getPlayerById,
    addPlayer,
    updatePlayer,
    deletePlayer,
};