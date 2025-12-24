const db = require('../db');

const listParticipants = async (req, res) => {
  try {
    const q = req.query.q ? `%${req.query.q}%` : '%';
    const [rows] = await db.query(
      `SELECT p.id, COALESCE(c.name, p.external_name) AS name, p.club_id
       FROM Participants p
       LEFT JOIN Clubs c ON p.club_id = c.id
       WHERE COALESCE(c.name, p.external_name) LIKE ?
       ORDER BY c.name IS NULL, c.name, p.external_name
       LIMIT 200`,
      [q]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error listing participants', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { listParticipants };
