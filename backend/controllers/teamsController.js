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

  try {
    const [ result ] = await db.query("SELECT * FROM Teams WHERE id = ?", [id]);
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

  try {
    const [ rows ] = await db.query("SELECT * FROM Teams WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Team not found" });
    }

    const fieldsToUpdate = {};
    const allowedFields = ["name", "age_limit"];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    });

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: "No fields provided to update"});
    }

    const setClause = Object.keys(fieldsToUpdate)
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.values(fieldsToUpdate);
    values.push(id);

    const sql = `UPDATE Teams SET ${setClause} WHERE id = ?`;

    await db.query(sql, values);

    res.status(200).json({ message: "Team updated successfully" });
  } catch (err) {
    console.error("Error updating team: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteTeam = async (req, res) => {
  const { id } = req.params;

  try {
    const [ result ] = await db.query("DELETE FROM Teams WHERE id = ?", [id]);
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