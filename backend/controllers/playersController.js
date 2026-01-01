const db = require("../db");
const { hashPassword } = require('../helpers/hashPassword');
const { generateResetToken } = require('../helpers/generateToken');
const { sendResetEmail } = require('../helpers/emailService');
const crypto = require('crypto');

const getPlayers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const qRaw = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    // Normalize search: remove quotes, keep email chars, collapse spaces, lowercase
    let qClean = qRaw.replace(/['"]/g, '');
    qClean = qClean.replace(/[^^\p{L}\p{N}\s@._-]/gu, ' ');
    qClean = qClean.replace(/\s+/g, ' ').trim().toLowerCase();
    const q = qClean || null;

    const whereClauses = [];
    const params = [];
    if (q) {
      whereClauses.push(`(LOWER(CONCAT_WS(' ', p.first_name, p.last_name)) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(p.position) LIKE ?)`);
      const like = `%${q}%`;
      params.push(like, like, like);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Try cache first
    const cache = require('../helpers/cache');
    const cacheKey = `players:${page}:${limit}:${q || ''}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const countSql = `SELECT COUNT(*) AS total FROM Players p LEFT JOIN Users u ON p.user_id = u.id ${whereSql}`;
    const [countRows] = await db.query(countSql, params);
    const total = countRows && countRows.length ? countRows[0].total : 0;

    const offset = (page - 1) * limit;
    const dataSql = `SELECT p.*, t.name AS team_name, COALESCE(p.image_url, u.image_url) AS image_url,
      s.avg_rating, s.total_rating, s.matches_played
      FROM Players p
      LEFT JOIN Teams t ON p.team_id = t.id
      LEFT JOIN Users u ON p.user_id = u.id
      LEFT JOIN (
        SELECT player_id, AVG(rating) AS avg_rating, SUM(rating) AS total_rating, COUNT(*) AS matches_played
        FROM Stats
        GROUP BY player_id
      ) s ON s.player_id = p.id
      ${whereSql}
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?`;

    const dataParams = params.slice();
    dataParams.push(limit, offset);
    const [rows] = await db.query(dataSql, dataParams);

    const makeAbsolute = (url) => {
      if (!url) return null;
      if (String(url).startsWith('http')) return url;
      return `${req.protocol}://${req.get('host')}${url}`;
    };
    const mapped = rows.map(r => ({
      ...r,
      image_url: makeAbsolute(r.image_url),
      avg_rating: r.avg_rating != null ? Number(r.avg_rating) : null,
      total_rating: r.total_rating != null ? Number(r.total_rating) : 0,
      matches_played: r.matches_played != null ? Number(r.matches_played) : 0,
    }));
    const payload = { data: mapped, total };
    cache.set(cacheKey, payload, 30 * 1000);
    res.status(200).json(payload);
  } catch (err) {
    console.error("Error fetching players:", err);
    return res.status(500).json({ message : "Internal Server Error" });
  }
};

const getPlayerById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT p.*, t.name AS team_name, COALESCE(p.image_url, u.image_url) AS image_url,
        (SELECT AVG(rating) FROM Stats WHERE player_id = p.id) AS avg_rating,
        (SELECT SUM(rating) FROM Stats WHERE player_id = p.id) AS total_rating,
        (SELECT COUNT(*) FROM Stats WHERE player_id = p.id) AS matches_played
      FROM Players p
      LEFT JOIN Teams t ON p.team_id = t.id
      LEFT JOIN Users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Player not found" });
    }
    const makeAbsolute = (url) => {
      if (!url) return null;
      if (String(url).startsWith('http')) return url;
      return `${req.protocol}://${req.get('host')}${url}`;
    };
    const row = rows[0];
    row.image_url = makeAbsolute(row.image_url);
    row.avg_rating = row.avg_rating != null ? Number(row.avg_rating) : null;
    row.total_rating = row.total_rating != null ? Number(row.total_rating) : 0;
    row.matches_played = row.matches_played != null ? Number(row.matches_played) : 0;
    res.status(200).json(row);
  } catch (err) {
    console.error("Error fetching player by ID:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getCurrentPlayer = async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      "SELECT * FROM Players WHERE user_id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Player profile not found" });
    }
    const makeAbsolute = (url) => {
      if (!url) return null;
      if (String(url).startsWith('http')) return url;
      return `${req.protocol}://${req.get('host')}${url}`;
    };
    const row = rows[0];
    row.image_url = makeAbsolute(row.image_url);
    res.status(200).json(row);
  } catch (err) {
    console.error("Error fetching current player:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const addPlayer = async (req, res) => {
  const {
    first_name,
    last_name,
    date_of_birth,
    height,
    weight,
    position,
    strong_foot,
    image_url,
    team_id,
    user_id
  } = req.body;

  // Normalize position and strong_foot to DB-friendly values
  const positionMap = {
    'Goalkeeper': 'GK',
    'Defender': 'CB',
    'Midfielder': 'CM',
    'Forward': 'ST',
    'Winger': 'LW',
    'Striker': 'ST',
    // include lowercase keys
    'goalkeeper': 'GK',
    'defender': 'CB',
    'midfielder': 'CM',
    'forward': 'ST',
    'winger': 'LW',
    'striker': 'ST'
  };

  const normalizePosition = (pos) => {
    if (!pos) return null;
    // If already an allowed abbreviation, return uppercased
    const abbrevs = ['GK','CB','LB','RB','CDM','CM','CAM','LW','RW','ST'];
    if (abbrevs.includes(String(pos).toUpperCase())) return String(pos).toUpperCase();
    return positionMap[pos] || positionMap[String(pos).toLowerCase()] || null;
  };

  const normalizeStrongFoot = (sf) => {
    if (!sf) return null;
    const s = String(sf);
    if (s === 'Left' || s === 'Right') return s;
    // map 'Both' to Right (DB only supports Left/Right)
    if (s === 'Both' || s.toLowerCase() === 'both') return 'Right';
    return null;
  };

  const dbPosition = normalizePosition(position);
  const dbStrongFoot = normalizeStrongFoot(strong_foot);
  try {
    // Build INSERT dynamically so we can omit user_id when not provided
    const cols = ['first_name','last_name','date_of_birth','height','weight','position','strong_foot','image_url'];
    const values = [first_name, last_name, date_of_birth, height, weight, dbPosition, dbStrongFoot, image_url];

    if (team_id !== undefined && team_id !== null) {
      cols.push('team_id');
      values.push(team_id);
    }
    if (user_id !== undefined && user_id !== null) {
      cols.push('user_id');
      values.push(user_id);
    }

    const placeholders = cols.map(() => '?').join(',');
    const query = `INSERT INTO Players (${cols.join(',')}) VALUES (${placeholders})`;

    const [ result ] = await db.query(query, values);
    res.status(201).json({ 
      message: "Player added successfully",
      id: result.insertId 
    });
    // invalidate players list cache
    try { require('../helpers/cache').invalidatePrefix('players:'); } catch (e) { /* ignore */ }
  } catch (err) {
    console.error("Error adding player: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updatePlayer = async (req, res) => {
  const { id } = req.params;

  try {
    const [ rows ] = await db.query("SELECT * FROM Players WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Player not found"});
    }

    const fieldsToUpdate = {};
    const allowedFields = ["first_name", "last_name", "date_of_birth", "height", "weight", "position", "strong_foot", "image_url", "team_id", "user_id"];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    });

    // Normalize any position / strong_foot values to DB-friendly forms
    if (fieldsToUpdate.position) {
      const pos = fieldsToUpdate.position;
      const positionMap = {
        'Goalkeeper': 'GK', 'Defender': 'CB', 'Midfielder': 'CM', 'Forward': 'ST', 'Winger': 'LW', 'Striker': 'ST',
        'goalkeeper': 'GK', 'defender': 'CB', 'midfielder': 'CM', 'forward': 'ST', 'winger': 'LW', 'striker': 'ST'
      };
      const abbrevs = ['GK','CB','LB','RB','CDM','CM','CAM','LW','RW','ST'];
      if (abbrevs.includes(String(pos).toUpperCase())) {
        fieldsToUpdate.position = String(pos).toUpperCase();
      } else if (positionMap[pos]) {
        fieldsToUpdate.position = positionMap[pos];
      } else if (positionMap[String(pos).toLowerCase()]) {
        fieldsToUpdate.position = positionMap[String(pos).toLowerCase()];
      } else {
        // leave as-is; DB validator will catch invalid values
      }
    }

    if (fieldsToUpdate.strong_foot) {
      const sf = fieldsToUpdate.strong_foot;
      if (sf === 'Left' || sf === 'Right') {
        // ok
      } else if (String(sf).toLowerCase() === 'both') {
        fieldsToUpdate.strong_foot = 'Right';
      }
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: "No fields provided to update "});
    }

    const setClause = Object.keys(fieldsToUpdate)
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.values(fieldsToUpdate);
    values.push(id);

    const sql = `UPDATE Players SET ${setClause} WHERE id = ?`;

    await db.query(sql, values);

    res.status(200).json({ message: "Player updated successfully" });
    // invalidate players cache
    try { require('../helpers/cache').invalidatePrefix('players:'); } catch (e) { /* ignore */ }
  } catch (err) {
    console.error("Error updating player: ", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const deletePlayer = async (req, res) => {
  const { id } = req.params;

  try {
    const [ result ] = await db.query("DELETE FROM Players WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Player not found" });
    }
    res.status(200).json({ message: "Player deleted successfully" });
    // invalidate players cache
    try { require('../helpers/cache').invalidatePrefix('players:'); } catch (e) { /* ignore */ }
  } catch (err) {
    console.error("Error deleting player: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const completeProfile = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  console.log("User attempting to complete profile:", userId, "for player ID:", id);

  try {
    // Only players can complete their own profile
    if (userRole !== 'player') {
      return res.status(403).json({ message: "Only players can complete profile" });
    }

    // Check if player belongs to this user
    const [player] = await db.query(
      "SELECT p.*, u.profile_completed FROM Players p JOIN Users u ON p.user_id = u.id WHERE p.id = ? AND p.user_id = ?",
      [id, userId]
    );

    if (player.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if profile already completed
    if (player[0].profile_completed) {
      return res.status(400).json({ 
        message: "Profile already completed. Contact admin to make changes." 
      });
    }

    // Extract fields (already validated by middleware)
    const {
      date_of_birth,
      team_id,
      height,
      weight,
      position,
      strong_foot,
      image_url
    } = req.body;

    // Update player data
    const fieldsToUpdate = {
      date_of_birth,
      team_id,
      position,
      height,
      weight,
      strong_foot
    };

    // Handle uploaded file (req.file) if present and set image_url accordingly
    let uploadedImageUrl = null;
    if (req.file) {
      try {
        const fs = require('fs');
        const fsp = require('fs').promises;
        const path = require('path');
        const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
        await fsp.mkdir(uploadsDir, { recursive: true });
        const ext = (req.file.originalname || 'img').split('.').pop();
        const filename = `user_${userId}_${Date.now()}.${ext}`;
        const filepath = path.join(uploadsDir, filename);
        await fsp.writeFile(filepath, req.file.buffer);
        uploadedImageUrl = `/public/uploads/${filename}`;
      } catch (fileErr) {
        console.error('Error saving uploaded player image:', fileErr);
        return res.status(500).json({ message: 'Failed to save profile image' });
      }
    }

    // Add optional image_url if provided either via body or uploaded file
    if (image_url) fieldsToUpdate.image_url = image_url;
    if (uploadedImageUrl) fieldsToUpdate.image_url = uploadedImageUrl;

    // Normalize position and strong_foot for DB
    if (fieldsToUpdate.position) {
      const pos = fieldsToUpdate.position;
      const positionMap = {
        'Goalkeeper': 'GK', 'Defender': 'CB', 'Midfielder': 'CM', 'Forward': 'ST', 'Winger': 'LW', 'Striker': 'ST',
        'goalkeeper': 'GK', 'defender': 'CB', 'midfielder': 'CM', 'forward': 'ST', 'winger': 'LW', 'striker': 'ST'
      };
      const abbrevs = ['GK','CB','LB','RB','CDM','CM','CAM','LW','RW','ST'];
      if (abbrevs.includes(String(pos).toUpperCase())) {
        fieldsToUpdate.position = String(pos).toUpperCase();
      } else if (positionMap[pos]) {
        fieldsToUpdate.position = positionMap[pos];
      } else if (positionMap[String(pos).toLowerCase()]) {
        fieldsToUpdate.position = positionMap[String(pos).toLowerCase()];
      }
    }

    if (fieldsToUpdate.strong_foot) {
      const sf = fieldsToUpdate.strong_foot;
      if (sf === 'Left' || sf === 'Right') {
        // ok
      } else if (String(sf).toLowerCase() === 'both') {
        fieldsToUpdate.strong_foot = 'Right';
      }
    }

    const setClause = Object.keys(fieldsToUpdate)
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.values(fieldsToUpdate);
    values.push(id);

    console.log("Completing profile for player ID:", id);
    console.log("Fields to update:", fieldsToUpdate);
    console.log("SQL Set Clause:", setClause);
    console.log("Values:", values);
    // Update Players table
    await db.query(`UPDATE Players SET ${setClause} WHERE id = ?`, values);

    // Mark profile as completed in Users table
    await db.query(
      "UPDATE Users SET profile_completed = TRUE WHERE id = ?",
      [userId]
    );

    // If we saved an uploaded image (or body image_url) and the player is linked to a user, copy it to Users.image_url
    try {
      const newImage = fieldsToUpdate.image_url || null;
      if (newImage && player[0] && player[0].user_id) {
        await db.query('UPDATE Users SET image_url = ? WHERE id = ?', [newImage, player[0].user_id]);
      }
    } catch (copyErr) {
      console.error('Error copying player image to Users.image_url:', copyErr);
      // non-fatal
    }

    res.status(200).json({ 
      message: "Profile completed successfully",
      profile_completed: true 
    });
  } catch (err) {
    console.error("Error completing profile: ", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

 // admin-only endpoint to create player + user if needed
  const adminCreatePlayerWithUser = async (req, res) => {
    const {
      first_name,
      last_name,
      date_of_birth,
      height,
      weight,
      position,
      strong_foot,
      image_url,
      team_id,
      email,
      sendInvite
    } = req.body;

    const normalizePosition = (pos) => {
      if (!pos) return null;
      const positionMap = {
        'Goalkeeper': 'GK', 'Defender': 'CB', 'Midfielder': 'CM', 'Forward': 'ST', 'Winger': 'LW', 'Striker': 'ST',
        'goalkeeper': 'GK', 'defender': 'CB', 'midfielder': 'CM', 'forward': 'ST', 'winger': 'LW', 'striker': 'ST'
      };
      const abbrevs = ['GK','CB','LB','RB','CDM','CM','CAM','LW','RW','ST'];
      if (abbrevs.includes(String(pos).toUpperCase())) return String(pos).toUpperCase();
      return positionMap[pos] || positionMap[String(pos).toLowerCase()] || null;
    };

    const normalizeStrongFoot = (sf) => {
      if (!sf) return null;
      const s = String(sf);
      if (s === 'Left' || s === 'Right') return s;
      if (s === 'Both' || s.toLowerCase() === 'both') return 'Right';
      return null;
    };

    const dbPosition = normalizePosition(position);
    const dbStrongFoot = normalizeStrongFoot(strong_foot);

    let conn;
    try {
      conn = await db.getConnection();
      await conn.beginTransaction();

      let userId = null;
      if (email) {
          // check if user exists
          const [existing] = await conn.query('SELECT id FROM Users WHERE email = ?', [email]);
          if (existing && existing.length > 0) {
            userId = existing[0].id;
            // Guard: if this user already has a linked player, abort early
            const [linked] = await conn.query('SELECT id FROM Players WHERE user_id = ?', [userId]);
            if (linked && linked.length > 0) {
              await conn.rollback();
              conn.release();
              return res.status(409).json({ message: 'User already linked to an existing player', player_id: linked[0].id });
            }
          } else {
          // create user with a random password and then create reset token for invite
          const tempPassword = crypto.randomBytes(12).toString('hex');
          const hashed = await hashPassword(tempPassword);
          const userInsert = 'INSERT INTO Users (email, password, first_name, last_name, role, status, profile_completed) VALUES (?, ?, ?, ?, ?, ?, ?)';
          const [userRes] = await conn.query(userInsert, [email, hashed, first_name || '', last_name || '', 'player', 'approved', false]);
          userId = userRes.insertId;

          // create a reset token so player can set their password
          const token = generateResetToken();
          const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
          await conn.query('INSERT INTO PasswordResets (user_id, token, expires_at) VALUES (?, ?, ?)', [userId, token, expiresAt]);

          // send reset/invite email if requested
          if (sendInvite) {
            // fire-and-forget; do not block transaction failure on mail delivery
            sendResetEmail(email, token).catch(err => console.error('Failed to send invite email:', err));
          }
        }
      }

        // if userId provided, ensure this user isn't already linked to a player
        if (userId !== undefined && userId !== null) {
          const [existingPlayerRows] = await conn.query('SELECT id FROM Players WHERE user_id = ?', [userId]);
          if (existingPlayerRows && existingPlayerRows.length > 0) {
            // abort: user already has a linked player
            await conn.rollback();
            conn.release();
            return res.status(409).json({ message: 'User already linked to an existing player', player_id: existingPlayerRows[0].id });
          }
        }

        // insert player row
        const cols = ['first_name','last_name','date_of_birth','height','weight','position','strong_foot','image_url'];
        const values = [first_name, last_name, date_of_birth, height, weight, dbPosition, dbStrongFoot, image_url];
        if (team_id !== undefined && team_id !== null) { cols.push('team_id'); values.push(team_id); }
        if (userId !== undefined && userId !== null) { cols.push('user_id'); values.push(userId); }
        const placeholders = cols.map(() => '?').join(',');
        const query = `INSERT INTO Players (${cols.join(',')}) VALUES (${placeholders})`;
        const [playerRes] = await conn.query(query, values);

      await conn.commit();
      conn.release();

      return res.status(201).json({ message: 'Player created', id: playerRes.insertId, user_id: userId });
      } catch (err) {
        if (conn) {
          try { await conn.rollback(); } catch (e) { console.error('Rollback error', e); }
          try { conn.release(); } catch (e) {}
        }
        // Handle duplicate-key race where another request inserted a player with same user_id
        if (err && err.code === 'ER_DUP_ENTRY' && /Players\.user_id/.test(err.sql)) {
          try {
            const [rows] = await db.query('SELECT id FROM Players WHERE user_id = ?', [userId]);
            if (rows && rows.length > 0) {
              return res.status(409).json({ message: 'User already linked to an existing player', player_id: rows[0].id });
            }
          } catch (innerErr) {
            console.error('Error querying existing player after duplicate entry:', innerErr);
          }
        }
        console.error('Error in adminCreatePlayerWithUser:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
  };

module.exports = {
  getPlayers,
  getPlayerById,
  getCurrentPlayer,
  addPlayer,
  updatePlayer,
  deletePlayer,
  completeProfile,
  adminCreatePlayerWithUser
};