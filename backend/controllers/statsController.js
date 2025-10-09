const db = require("../db");

const getStats = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM stats");
    res.status(200).send(result.rows);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const getStatById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM stats WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).send({ message: "Stat not found" });
    }
    res.status(200).send(result.rows[0]);
  } catch (error) {
    console.error(`Error fetching stat with ID ${id}:`, error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const addStat = async (req, res) => {};

const updateStat = async (req, res) => {};

const deleteStat = async (req, res) => {};

module.exports = {
  getStats,
  getStatById,
  addStat,
  updateStat,
  deleteStat,
};