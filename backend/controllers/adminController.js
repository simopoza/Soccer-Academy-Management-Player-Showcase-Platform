const db = require('../db');
const { hashPassword } = require('../helpers/hashPassword');
const { sendApprovalEmail, sendRejectionEmail } = require('../helpers/emailService');

// Get all pending users
const getPendingUsers = async (req, res) => {
  // Logic to retrieve pending users from the database
  try {
    const [users] = await db.query(`
      SELECT 
        u.id, 
        u.email, 
        u.first_name, 
        u.last_name, 
        u.role, 
        u.status
      FROM Users u
      WHERE u.status = 'pending'
      ORDER BY u.id DESC
    `);
    res.status(200).json({ users });
  }
  catch (error) {
    console.error("Error retrieving pending users:", error);
    res.status(500).json({ message: 'Error retrieving pending users', error });
  }
};

// Approve user
const approveUser = async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;// From auth middleware

  try {
    const [ existingUser ] = await db.query("SELECT * FROM Users WHERE id = ?", [id]);

    if (existingUser.length === 0) {
      return res.status(404).json({ 
        message: "User not found or already processed" 
      });
    }

    await db.query("UPDATE Users SET status = 'approved', approved_by = ?, approved_at = NOW() WHERE id = ?", [adminId, id]);
  
    await sendApprovalEmail(existingUser[0].email, existingUser[0].first_name);

    res.status(200).json({ 
      message: "User approved successfully",
      user: {
        id: existingUser[0].id,
        email: existingUser[0].email,
        name: `${existingUser[0].first_name} ${existingUser[0].last_name}`
      }
    });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ message: 'Error approving user', error });
  }
};

const rejectUser = async (req, res) => {
  const { id } = req.params;

  try {
    const [ existingUser ] = await db.query("SELECT * FROM Users WHERE id = ? AND status = 'pending'", [id]);
    if (existingUser.length === 0) {
      return res.status(404).json({ 
        message: "User not found or already processed" 
      });
    }

    await sendRejectionEmail(existingUser[0].email, existingUser[0].first_name);

    // Delete user (CASCADE will delete Players record if exists)
    await db.query("DELETE FROM Users WHERE id = ?", [id]);
    
    res.status(200).json({ 
      message: "User rejected and deleted successfully" 
    });
  } catch (error) {
    console.error("Error rejecting user:", error);
    res.status(500).json({ message: 'Error rejecting user', error });
  }
};

// Create admin user (admin only)
const createAdmin = async (req, res) => {
  const { email, first_name, last_name, password } = req.body;
  const createdBy = req.user.id; // From auth middleware

  try {
    const [ existingUser ] = await db.query("SELECT * FROM Users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ 
        message: "User with this email already exists" 
      });
    }

    const hashedPassword = await hashPassword(password);

    const [ result ] = await db.query(
      `INSERT INTO Users
      (first_name, last_name, email, password, role, status, profile_completed,
      approved_by, approved_at)
      VALUES (?, ?, ?, ?, 'admin', 'approved', TRUE, ?, NOW())`,
      [first_name, last_name, email, hashedPassword, createdBy]
    );

    res.status(201).json({
      message: "Admin created successfully",
      user: {
        userId: result.insertId,
        first_name,
        last_name,
        email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    res.status(500).json({ message: 'Error creating admin user', error });
  }
};

module.exports = {
  getPendingUsers,
  approveUser,
  rejectUser,
  createAdmin
};