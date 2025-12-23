const db = require("../db");
const { hashPassword } = require('../helpers/hashPassword');
const { generateResetToken } = require('../helpers/generateToken');
const { sendResetEmail } = require('../helpers/emailService');
const crypto = require('crypto');

const getPlayers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, t.name AS team_name
      FROM Players p
      LEFT JOIN Teams t ON p.team_id = t.id
    `);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching players:", err);
    return res.status(500).json({ message : "Internal Server Error" });
  }
};

const getPlayerById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT p.*, t.name AS team_name
      FROM Players p
      LEFT JOIN Teams t ON p.team_id = t.id
      WHERE p.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.status(200).json(rows[0]);
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

    res.status(200).json(rows[0]);
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

    // Add optional image_url if provided
    if (image_url) fieldsToUpdate.image_url = image_url;

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