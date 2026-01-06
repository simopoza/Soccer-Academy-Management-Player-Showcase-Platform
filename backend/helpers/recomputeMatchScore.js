const db = require('../db');

/**
 * Recompute and persist match score (team_goals, opponent_goals) based on Stats rows.
 * - Treat a stat as belonging to the academy/team when Players.team_id = Matches.team_id
 * - Otherwise treat the stat goals as opponent goals
 */
async function recomputeMatchScore(matchId) {
  if (!matchId) return;
  const conn = db; // db.query is a pool instance
  try {
    // start transaction
    await conn.query('START TRANSACTION');

    // get match and team_id
    const [mrows] = await conn.query('SELECT team_id FROM Matches WHERE id = ?', [matchId]);
    if (!mrows || mrows.length === 0) {
      await conn.query('ROLLBACK');
      return;
    }
    const match = mrows[0];
    const teamId = match.team_id;

    // compute aggregates
    const [aggRows] = await conn.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN p.team_id = ? THEN s.goals ELSE 0 END), 0) AS team_goals,
        COALESCE(SUM(CASE WHEN p.team_id = ? THEN 0 ELSE s.goals END), 0) AS opponent_goals
      FROM Stats s
      JOIN Players p ON p.id = s.player_id
      WHERE s.match_id = ?`,
      [teamId, teamId, matchId]
    );

    const ag = aggRows && aggRows[0] ? aggRows[0] : { team_goals: 0, opponent_goals: 0 };

    // persist into Matches
    await conn.query('UPDATE Matches SET team_goals = ?, opponent_goals = ?, updated_at = NOW() WHERE id = ?', [ag.team_goals, ag.opponent_goals, matchId]);

    await conn.query('COMMIT');
    return ag;
  } catch (err) {
    try { await conn.query('ROLLBACK'); } catch (e) { /* ignore */ }
    console.error('Error in recomputeMatchScore:', err);
    throw err;
  }
}

module.exports = recomputeMatchScore;
