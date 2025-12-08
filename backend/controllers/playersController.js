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

const completeProfile = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

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

    // Extract and validate required fields
    const {
      first_name,
      last_name,
      date_of_birth,
      height,
      weight,
      position,
      strong_foot,
      image_url
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !date_of_birth || !position) {
      return res.status(400).json({ 
        message: "Missing required fields: first_name, last_name, date_of_birth, position" 
      });
    }

    // Update player data
    const fieldsToUpdate = {
      first_name,
      last_name,
      date_of_birth,
      position
    };

    // Add optional fields if provided
    if (height !== undefined) fieldsToUpdate.height = height;
    if (weight !== undefined) fieldsToUpdate.weight = weight;
    if (strong_foot !== undefined) fieldsToUpdate.strong_foot = strong_foot;
    if (image_url !== undefined) fieldsToUpdate.image_url = image_url;

    const setClause = Object.keys(fieldsToUpdate)
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.values(fieldsToUpdate);
    values.push(id);

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
    addPlayer,
    updatePlayer,
    deletePlayer,
    completeProfile,
};