const db = require("../db");

const getPlayers = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM players");
    res.status(200).send(result.rows);
  } catch (error) {
    console.error("Error fetching players:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const getPlayerById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM players WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).send({ message: "Player not found" });
    }
    res.status(200).send(result.rows[0]);
  } catch (error) {
    console.error(`Error fetching player with ID ${id}:`, error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const addPlayer = async (req, res) => {};

const updatePlayer = async (req, res) => {};

const deletePlayer = async (req, res) => {};

module.exports = {
    getPlayers,
    getPlayerById,
    addPlayer,
    updatePlayer,
    deletePlayer,
};