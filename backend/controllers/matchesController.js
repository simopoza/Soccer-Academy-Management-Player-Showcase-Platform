const db = require("../db");

const getMatches = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM matches");
    res.status(200).send(result.rows);
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const getMatchById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM matches WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).send({ message: "Match not found" });
    }
    res.status(200).send(result.rows[0]);
  } catch (error) {
    console.error(`Error fetching match with ID ${id}:`, error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const addMatch = async (req, res) => {};

const updateMatch = async (req, res) => {};

const deleteMatch = async (req, res) => {};

module.exports = {
  getMatches,
  getMatchById,
  addMatch,
  updateMatch,
  deleteMatch,
};