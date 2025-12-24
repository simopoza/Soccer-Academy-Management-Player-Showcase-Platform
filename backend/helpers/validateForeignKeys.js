const db = require("../db");

async function validateMatch(match_id) {
  const [rows] = await db.query("SELECT id FROM Matches WHERE id = ?", [match_id]);
  return rows.length > 0; // true = exists
}

async function validatePlayer(player_id) {
  const [rows] = await db.query("SELECT id FROM Players WHERE id = ?", [player_id]);
  return rows.length > 0; // true = exists
}

async function validateTeam(team_id) {
  const [rows] = await db.query("SELECT * FROM Teams WHERE id = ?", [team_id]);
  return rows.length > 0; // true = exists
}

async function validateUser(user_id) {
  const [rows] = await db.query("SELECT id FROM Users WHERE id = ?", [user_id]);
  return rows.length > 0; // true = exists
}

async function validateParticipant(participant_id) {
  const [rows] = await db.query("SELECT id FROM Participants WHERE id = ?", [participant_id]);
  return rows.length > 0;
}

module.exports = {
  validateMatch,
  validatePlayer,
  validateTeam,
  validateUser,
  validateParticipant
};
