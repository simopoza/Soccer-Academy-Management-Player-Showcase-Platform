const db = require('../db');

/**
 * Get dashboard statistics
 * Returns total players, active teams, and matches count
 */
const getDashboardStats = async (req, res) => {
  try {
    // Get total approved players count
    const [playersResult] = await db.query(
      `SELECT COUNT(DISTINCT p.id) as total 
       FROM Players p 
       INNER JOIN Users u ON p.user_id = u.id 
       WHERE u.status = 'approved'`
    );

    // Get total active teams count
    const [teamsResult] = await db.query(
      'SELECT COUNT(*) as total FROM Teams'
    );

    // Get total matches count
    const [matchesResult] = await db.query(
      'SELECT COUNT(*) as total FROM Matches'
    );

    // Calculate player growth from last month
    const [lastMonthPlayers] = await db.query(
      `SELECT COUNT(DISTINCT p.id) as total 
       FROM Players p 
       INNER JOIN Users u ON p.user_id = u.id 
       WHERE u.status = 'approved' 
       AND u.approved_at < DATE_SUB(NOW(), INTERVAL 1 MONTH)`
    );

    const currentTotal = playersResult[0].total;
    const lastMonthTotal = lastMonthPlayers[0].total || 1; // Avoid division by zero
    const playerGrowth = Math.round(((currentTotal - lastMonthTotal) / lastMonthTotal) * 100);

    res.status(200).json({
      success: true,
      data: {
        totalPlayers: currentTotal,
        playerGrowth: playerGrowth > 0 ? `+${playerGrowth}%` : `${playerGrowth}%`,
        activeTeams: teamsResult[0].total,
        matchesPlayed: matchesResult[0].total,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message,
    });
  }
};

/**
 * Get recent matches with results
 * Returns the last 5 matches with team info
 */
const getRecentMatches = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const [matches] = await db.query(
      `SELECT 
        m.id,
        m.date,
        m.opponent,
        m.team_goals,
        m.opponent_goals,
        t.name as team_name,
        CASE
          WHEN m.team_goals > m.opponent_goals THEN 'Won'
          WHEN m.team_goals < m.opponent_goals THEN 'Lost'
          ELSE 'Draw'
        END as status
      FROM Matches m
      LEFT JOIN Teams t ON m.team_id = t.id
      ORDER BY m.date DESC
      LIMIT ?`,
      [limit]
    );

    // Format the data for frontend
    const formattedMatches = matches.map(match => ({
      id: match.id,
      team1: match.team_name || 'Unknown Team',
      team2: match.opponent,
      score: `${match.team_goals}-${match.opponent_goals}`,
      date: new Date(match.date).toISOString().split('T')[0],
      status: match.status,
    }));

    res.status(200).json({
      success: true,
      data: formattedMatches,
    });
  } catch (error) {
    console.error('Error fetching recent matches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent matches',
      error: error.message,
    });
  }
};

/**
 * Get performance ratings over time
 * Returns average team ratings grouped by month
 */
const getPerformanceRatings = async (req, res) => {
  try {
    const monthsParam = req.query.months;
    const months = monthsParam !== undefined ? parseInt(monthsParam, 10) : 6;

    // Build SQL dynamically: if months is a positive integer, filter by date; if months === 0, return all time
    let ratingsQuery;
    let params = [];
    if (Number.isInteger(months) && months > 0) {
      ratingsQuery = `SELECT 
        DATE_FORMAT(m.date, '%b') as name,
        COALESCE(AVG(s.rating), 0) as rating
      FROM Matches m
      LEFT JOIN Stats s ON m.id = s.match_id
      WHERE m.date >= DATE_SUB(NOW(), INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(m.date, '%Y-%m'), DATE_FORMAT(m.date, '%b')
      ORDER BY MIN(m.date) ASC`;
      params = [months];
    } else {
      ratingsQuery = `SELECT 
        DATE_FORMAT(m.date, '%b') as name,
        COALESCE(AVG(s.rating), 0) as rating
      FROM Matches m
      LEFT JOIN Stats s ON m.id = s.match_id
      GROUP BY DATE_FORMAT(m.date, '%Y-%m'), DATE_FORMAT(m.date, '%b')
      ORDER BY MIN(m.date) ASC`;
      params = [];
    }

    const [ratings] = await db.query(ratingsQuery, params);

    // If no ratings data, return sample structure
    const formattedRatings = ratings.length > 0 ? ratings.map(r => ({
      name: r.name,
      rating: parseFloat(Number(r.rating).toFixed(2)),
    })) : [];

    res.status(200).json({
      success: true,
      data: formattedRatings,
    });
  } catch (error) {
    console.error('Error fetching performance ratings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance ratings',
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentMatches,
  getPerformanceRatings,
};
