const db = require("../db");

const getPlayers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Players");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching players:", err);
    return res.status(500).json({ message : "Internal Server Error" });
  }
};

const getPlayerById = async (req, res) => {
  const { id } = req.params;
    const idNum = Number(id);

  if (isNaN(idNum)) {
    return res.status(400).json({ message: "Invalid player ID" });
  }

  try {
    const [rows] = await db.query("SELECT * FROM Players WHERE id = ?", [idNum]);
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
    team_id
  } = req.body;
  const allowedPosition = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
  const allowedStrong_foot = ['Left', 'Right'];
  const team_id_num = Number(team_id);
  const height_num = Number(height);
  const weight_num = Number(weight);
  
  if (isNaN(team_id_num) || isNaN(height_num) || isNaN(weight_num)) {
    return res.status(400).json({ message: "height, weight, and team_id must be a number" });
  }

  if (!allowedPosition.includes(position)) {
    return res.status(400).json({ message: "Invalid position. Must be 'GK' or 'CB' or 'LB' or 'RB' or 'CDM' or 'CM' or 'CAM' or 'LW' or 'RW' or 'ST'." });
  }

  if (!allowedStrong_foot.includes(strong_foot)) {
    return res.status(400).json({ message: "Invalid strong_foot. Must be 'left' or 'right'." });
  }

  if (!first_name || first_name.trim().length === 0) {
    return res.status(400).json({ message: "first_name must be provided and not empty" });
  }

  if (!last_name || last_name.trim().length === 0) {
    return res.status(400).json({ message: "last_name must be provided and not empty" });
  }

  if (!height || !weight || !image_url) {
    return res.status(400).json({
      message: "Missing required fields: height, weight, and image_url are required."
    });
  }

  const dob = new Date(date_of_birth);
  if (isNaN(dob.getTime())) {
    return res.status(400).json({ message: "date_of_birth must be a valid date" });
  }

  try {
    const [rows] = await db.query("SELECT * FROM Teams WHERE id = ?", [team_id]);
    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid team_id" });
    }
  } catch (err) {
    console.error("Error adding match:", err);
    return res.status(500).json({ message: "Internal server error" });
  }

  try {
    const query = `INSERT INTO Players (first_name, last_name, date_of_birth, height, weight, position, strong_foot, image_url, team_id) VALUES (?,?,?,?,?,?,?,?,?)`;
    const values = [first_name, last_name, date_of_birth, height, weight, position, strong_foot, image_url, team_id];

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
  const {
    first_name,
    last_name,
    date_of_birth,
    height,
    weight,
    position,
    strong_foot,
    image_url,
    team_id
  } = req.body;
  
  const idNum = Number(id);
  if (isNaN(idNum)) {
    return res.status(400).json({ message: "Invalid player ID" });
  }

  const allowedPosition = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
  const allowedStrong_foot = ['Left', 'Right'];
  const team_id_num = Number(team_id);
  const height_num = Number(height);
  const weight_num = Number(weight);
  
  if (isNaN(team_id_num) || isNaN(height_num) || isNaN(weight_num)) {
    return res.status(400).json({ message: "height, weight, and team_id must be a number" });
  }

  if (!allowedPosition.includes(position)) {
    return res.status(400).json({ message: "Invalid position. Must be 'GK' or 'CB' or 'LB' or 'RB' or 'CDM' or 'CM' or 'CAM' or 'LW' or 'RW' or 'ST'." });
  }

  if (!allowedStrong_foot.includes(strong_foot)) {
    return res.status(400).json({ message: "Invalid strong_foot. Must be 'left' or 'right'." });
  }

  if (!first_name || first_name.trim().length === 0) {
    return res.status(400).json({ message: "first_name must be provided and not empty" });
  }

  if (!last_name || last_name.trim().length === 0) {
    return res.status(400).json({ message: "last_name must be provided and not empty" });
  }

  if (!height || !weight || !image_url) {
    return res.status(400).json({
      message: "Missing required fields: height, weight, and image_url are required."
    });
  }

  try {
    const [rows] = await db.query("SELECT * FROM Teams WHERE id = ?", [team_id]);
    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid team_id" });
    }
  } catch (err) {
    console.error("Error adding match:", err);
    return res.status(500).json({ message: "Internal server error" });
  }

  try {
    const values = [first_name, last_name, date_of_birth, height, weight, position, strong_foot, image_url, team_id, idNum];
    const [ result ] = await db.query("UPDATE Players SET first_name = ?, last_name = ?, date_of_birth = ?, height = ?, weight = ?, position = ?, strong_foot = ?, image_url = ?, team_id = ? WHERE id = ?", values);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Player not found" });
    }
    res.status(200).json({ message: "Player updated successfully" });
  } catch (err) {
    console.error("Error updating player: ", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const deletePlayer = async (req, res) => {
  const { id } = req.params;
  const idNum = Number(id);
  if (isNaN(idNum)) {
    return res.status(400).json({ message: "Invalid player ID" });
  }

  try {
    const [ result ] = await db.query("DELETE FROM Players WHERE id = ?", [idNum]);
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