const db = require("../db");

async function validateMatch(match_id) {
  const [rows] = await db.query("SELECT id FROM Matches WHERE id = ?", [match_id]);
  return rows.length > 0; // true = exists
}

async function validatePlayer(player_id) {
  const [rows] = await db.query("SELECT id FROM Players WHERE id = ?", [player_id]);
  return rows.length > 0; // true = exists
}

module.exports = {
  validateMatch,
  validatePlayer
};
