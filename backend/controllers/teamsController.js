const db = require("../db");

const getTeams = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Teams");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error in fetching teams: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getTeamById = async (req, res) => {
  const { id } = req.params;
  const idNum = Number(id);
  
  if (isNaN(idNum)) {
    return res.status(400).json({ message: "Invalid team ID" });
  }

  try {
    const [ result ] = await db.query("SELECT * FROM Teams WHERE id = ?", [idNum]);
    if (result.length === 0) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.status(200).json(result[0]);
  } catch (err) {
    console.error("Error fetching team by id : ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const addTeam = async (req, res) => {
  const {
    name,
    age_limit
  } = req.body;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ message: "Name must be provided and not empty" });
  }

  if (isNaN(Number(age_limit))) {
    return res.status(400).json({ message: "age_limit should be a number" });
  }

  if (age_limit < 9 || age_limit > 17) {
    return res.status(400).json({ message: "age_limit must be between 5 and 17" });
  }

  try {
    const query = "INSERT INTO Teams (name, age_limit) VALUES (?, ?)";
    const value = [name, age_limit];
    const [ result ] = await db.query(query, value);

    res.status(201).json({ 
      message: "Team added successfully",
      id: result.insertId
    });
  } catch (err) {
    console.error("Error adding team: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateTeam = async (req, res) => {
  const { id } = req.params;
  const idNum = Number(id);

  if (isNaN(idNum)) {
    return res.status(400).json({ message: "Invalid team ID" });
  }

  const {
    name,
    age_limit
  } = req.body;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ message: "Name must be provided and not empty" });
  }

  if (isNaN(Number(age_limit))) {
    return res.status(400).json({ message: "age_limit should be a number" });
  }

  if (age_limit < 9 || age_limit > 17) {
    return res.status(400).json({ message: "age_limit must be between 5 and 17" });
  }

  try {
    const query = "UPDATE Teams SET name = ?, age_limit = ? WHERE id = ?";
    const value = [name, age_limit, idNum];
    const [ result ] = await db.query(query, value);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.status(200).json({ message: "Team updated successfully" });
  } catch (err) {
    console.error("Error updating team: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteTeam = async (req, res) => {
  const { id } = req.params;
  const idNum = Number(id);

  if (isNaN(idNum)) {
    return res.status(400).json({ message: "Invalid team ID" });
  }

  try {
    const [ result ] = await db.query("DELETE FROM Teams WHERE id = ?", [idNum]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Team not found" });
    }
    res.status(200).json({ message: "Team deleted successfully" });
  } catch (err) {
    console.error("Error deleting team: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getTeams,
  getTeamById,
  addTeam,
  updateTeam,
  deleteTeam,
};