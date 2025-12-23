const db = require("../db");
const { hashPassword, comparePassword } = require("../helpers/hashPassword");

// GET all users
const getAllUsers = async (req, res) => {
  try {
    const [ users ] = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.status, COALESCE(u.image_url, p.image_url) AS image_url
       FROM Users u
       LEFT JOIN Players p ON p.user_id = u.id`
    );
    // Convert relative image paths to absolute URLs
    const makeAbsolute = (req, url) => {
      if (!url) return null;
      if (String(url).startsWith('http')) return url;
      return `${req.protocol}://${req.get('host')}${url}`;
    };
    users.forEach(u => { u.image_url = makeAbsolute(req, u.image_url); });
    
    // Return an empty array when there are no users so clients can always
    // safely treat the response as an array (avoids `res.data.map` errors).
    if (users.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET user by ID
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    // If Users.image_url column exists, include it; otherwise return user and attach player image if present
    const [colCheck] = await db.query("SHOW COLUMNS FROM Users LIKE 'image_url'");
    let user;
    if (colCheck && colCheck.length > 0) {
      [user] = await db.query("SELECT id, first_name, last_name, email, image_url FROM Users WHERE id = ?", [id]);
    } else {
      [user] = await db.query("SELECT id, first_name, last_name, email FROM Users WHERE id = ?", [id]);
      // try to attach player image if exists
      const [pRows] = await db.query('SELECT image_url FROM Players WHERE user_id = ?', [id]);
      if (pRows && pRows.length > 0 && pRows[0].image_url) {
        user[0].image_url = pRows[0].image_url;
      }
    }
    const makeAbsolute = (req, url) => {
      if (!url) return null;
      if (String(url).startsWith('http')) return url;
      return `${req.protocol}://${req.get('host')}${url}`;
    };
    if (user[0] && user[0].image_url) user[0].image_url = makeAbsolute(req, user[0].image_url);
    
    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.status(200).json(user[0]);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST add new user
const addUser = async (req, res) => {
  const { first_name, last_name, email, password , role} = req.body;

  try {
    const hashedPassword = await hashPassword(password);
    const values = [first_name, last_name, email, hashedPassword, role];
    const [ result ] = await db.query(
      "INSERT INTO Users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)",
      values
    );

    res.status(201).json({
      message: "User added successfully",
      user: {userId: result.insertId, first_name, last_name, email, role}
    });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// PUT update user
const updateUser = async (req, res) => {
  const { id } = req.params;

  try {
    const existingUser = await db.query("SELECT * FROM Users WHERE id = ?", [id]);

    if (existingUser[0].length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const fieldsToUpdate = {};
    const allowedFields = ["first_name", "last_name", "email", "role"];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    })

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ error: "No valid fields provided for update" });
    }

    const setClause = Object.keys(fieldsToUpdate)
      .map((field) => `${field} = ?`)
      .join(", ");
    
    const values = Object.values(fieldsToUpdate);
    values.push(id);

    const sql = `UPDATE Users SET ${setClause} WHERE id = ?`;
    
    await db.query(sql, values);

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Validation is handled by express-validator middleware
    // but we can add extra check here for safety
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "New password and confirm password do not match" });
    }

    const [ userRows ] = await db.query("SELECT password FROM Users WHERE id = ?", [id]);

    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingHashedPassword = userRows[0].password;

    const isOldPasswordValid = await comparePassword(oldPassword, existingHashedPassword);
    
    if (!isOldPasswordValid) {
      return res.status(401).json({ error: "Old password is incorrect" });
    }

    const isSamePassword = await comparePassword(newPassword, existingHashedPassword);

    if (isSamePassword) {
      return res.status(400).json({ error: "New password must be different from the old password" });
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await db.query("UPDATE Users SET password = ? WHERE id = ?", [hashedNewPassword, id]);

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    // When multipart/form-data is used, multer populates req.body and req.file
    const { first_name, last_name, email } = req.body || {};
    const uploadedFile = req.file;

    const [ existingUser ] = await db.query("SELECT * FROM Users WHERE id = ?", [id]);

    if (existingUser.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if email is being changed and if it's already in use by another user
    if (email && email !== existingUser[0].email) {
      const [ emailCheck ] = await db.query("SELECT id FROM Users WHERE email = ? AND id != ?", [email, id]);
      if (emailCheck.length > 0) {
        return res.status(400).json({ error: "Email already in use" });
      }
    }

    const fieldsToUpdate = {};
    if (first_name !== undefined) fieldsToUpdate.first_name = first_name;
    if (last_name !== undefined) fieldsToUpdate.last_name = last_name;
    if (email !== undefined) fieldsToUpdate.email = email;

    // If an image was uploaded, save it to disk and set image_url (but only update Users.image_url if column exists)
    let playerImageToUpdate = null;
    if (uploadedFile) {
      try {
        const fs = require('fs');
        const fsp = require('fs').promises;
        const path = require('path');
        const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
        await fsp.mkdir(uploadsDir, { recursive: true });
        const ext = uploadedFile.originalname.split('.').pop();
        const filename = `user_${id}_${Date.now()}.${ext}`;
        const filepath = path.join(uploadsDir, filename);
        await fsp.writeFile(filepath, uploadedFile.buffer);
        // Set image_url to a path the frontend can request
        const imageUrl = `/public/uploads/${filename}`;
        // Check whether Users.image_url column exists; if so, update Users, otherwise plan to update Players
        const [colImgCheck] = await db.query("SHOW COLUMNS FROM Users LIKE 'image_url'");
        if (colImgCheck && colImgCheck.length > 0) {
          fieldsToUpdate.image_url = imageUrl;
        } else {
          playerImageToUpdate = imageUrl;
        }
      } catch (fileErr) {
        console.error('Error saving uploaded profile image:', fileErr);
        return res.status(500).json({ error: 'Failed to save profile image' });
      }
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ error: "No valid fields provided for update" });
    }

    const setClause = Object.keys(fieldsToUpdate)
      .map((field) => `${field} = ?`)
      .join(", ");
    
    const values = Object.values(fieldsToUpdate);
    values.push(id);

    const sql = `UPDATE Users SET ${setClause} WHERE id = ?`;
    
    await db.query(sql, values);

    // If the Users table did not have image_url, but we saved an image, write it onto the Players table for that user
    if (playerImageToUpdate) {
      try {
        await db.query('UPDATE Players SET image_url = ? WHERE user_id = ?', [playerImageToUpdate, id]);
      } catch (pErr) {
        console.error('Error updating Players.image_url fallback:', pErr);
        // non-fatal: continue to respond with user info
      }
    }

    // Return updated user info (include image_url if present on Users or fallback to Players)
    const [colCheck2] = await db.query("SHOW COLUMNS FROM Users LIKE 'image_url'");
    let updatedUser;
    if (colCheck2 && colCheck2.length > 0) {
      [updatedUser] = await db.query("SELECT id, first_name, last_name, email, role, image_url FROM Users WHERE id = ?", [id]);
    } else {
      [updatedUser] = await db.query("SELECT id, first_name, last_name, email, role FROM Users WHERE id = ?", [id]);
      const [pRows2] = await db.query('SELECT image_url FROM Players WHERE user_id = ?', [id]);
      if (pRows2 && pRows2.length > 0 && pRows2[0].image_url) {
        updatedUser[0].image_url = pRows2[0].image_url;
      }
    }
    // ensure absolute URL
    const makeAbsolute = (req, url) => {
      if (!url) return null;
      if (String(url).startsWith('http')) return url;
      return `${req.protocol}://${req.get('host')}${url}`;
    };
    if (updatedUser[0] && updatedUser[0].image_url) updatedUser[0].image_url = makeAbsolute(req, updatedUser[0].image_url);

    res.status(200).json({ 
      message: "Profile updated successfully",
      user: updatedUser[0]
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE user by ID
const deleteUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const [ result ] = await db.query("DELETE FROM Users WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUserById,
  resetPassword,
  updateUserProfile
};
