const db = require("../db");
const { hashPassword, comparePassword } = require("../helpers/hashPassword");

// GET all users
const getAllUsers = async (req, res) => {
  try {
    const [ users ] = await db.query("SELECT id, first_name, last_name, email FROM Users");
    
    if (users.length === 0) {
      return res.status(200).json({ error: "Users table is empty" });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET user by ID
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const [ user  ] = await db.query("SELECT id, first_name, last_name, email FROM Users WHERE id = ?", [id]);
    
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
    const { oldPassword, newPassword } = req.body;

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
  resetPassword
};
