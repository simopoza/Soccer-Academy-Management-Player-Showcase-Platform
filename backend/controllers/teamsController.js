const db = require("../db");

const getTeams = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM teams");
    res.status(200).send(result.rows);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const getTeamById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM teams WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).send({ message: "Team not found" });
    }
    res.status(200).send(result.rows[0]);
  } catch (error) {
    console.error(`Error fetching team with ID ${id}:`, error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const addTeam = async (req, res) => {};

const updateTeam = async (req, res) => {};

const deleteTeam = async (req, res) => {};

module.exports = {
  getTeams,
  getTeamById,
  addTeam,
  updateTeam,
  deleteTeam,
};