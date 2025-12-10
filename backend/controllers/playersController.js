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

const getCurrentPlayer = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      "SELECT * FROM Players WHERE user_id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Player profile not found" });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("Error fetching current player:", err);
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

const completeProfile = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  console.log("User attempting to complete profile:", userId, "for player ID:", id);

  try {
    // Only players can complete their own profile
    if (userRole !== 'player') {
      return res.status(403).json({ message: "Only players can complete profile" });
    }

    // Check if player belongs to this user
    const [player] = await db.query(
      "SELECT p.*, u.profile_completed FROM Players p JOIN Users u ON p.user_id = u.id WHERE p.id = ? AND p.user_id = ?",
      [id, userId]
    );

    if (player.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if profile already completed
    if (player[0].profile_completed) {
      return res.status(400).json({ 
        message: "Profile already completed. Contact admin to make changes." 
      });
    }

    // Extract fields (already validated by middleware)
    const {
      date_of_birth,
      team_id,
      height,
      weight,
      position,
      strong_foot,
      image_url
    } = req.body;

    // Update player data
    const fieldsToUpdate = {
      date_of_birth,
      team_id,
      position,
      height,
      weight,
      strong_foot
    };

    // Add optional image_url if provided
    if (image_url) fieldsToUpdate.image_url = image_url;

    const setClause = Object.keys(fieldsToUpdate)
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.values(fieldsToUpdate);
    values.push(id);

    console.log("Completing profile for player ID:", id);
    console.log("Fields to update:", fieldsToUpdate);
    console.log("SQL Set Clause:", setClause);
    console.log("Values:", values);
    // Update Players table
    await db.query(`UPDATE Players SET ${setClause} WHERE id = ?`, values);

    // Mark profile as completed in Users table
    await db.query(
      "UPDATE Users SET profile_completed = TRUE WHERE id = ?",
      [userId]
    );

    res.status(200).json({ 
      message: "Profile completed successfully",
      profile_completed: true 
    });
  } catch (err) {
    console.error("Error completing profile: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
    getPlayers,
    getPlayerById,
    getCurrentPlayer,
    addPlayer,
    updatePlayer,
    deletePlayer,
    completeProfile,
};