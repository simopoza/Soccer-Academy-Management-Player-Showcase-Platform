const db = require('../db');
const { hashPassword, comparePassword } = require('../helpers/hashPassword');
const { generateAccessToken, generateRefreshToken } = require('../helpers/generateToken');

const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, role } = req.body;

      // 1. Prevent admin registration
    if (role === 'admin') {
      return res.status(400).json({ 
        message: "Admin accounts cannot be created via registration. Contact existing admin." 
      });
    }

    const [ existingUsers ] = await db.query("SELECT email FROM Users WHERE email = ?", [email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await hashPassword(password);

    const result = await db.query(
      "INSERT INTO Users (first_name, last_name, email, password, role, status, profile_completed) VALUES (?, ?, ?, ?, ?, 'pending', ?)",
      [
        first_name, 
        last_name, 
        email, 
        hashedPassword, 
        role,
        // Admin & Agent: profile_completed = true (no profile needed)
        // Player: profile_completed = false (needs to complete profile)
        role === 'admin' || role === 'agent' ? true : false
      ]
    );

    const userId = result[0].insertId;

    if (role === 'player') {
      await db.query(
        "INSERT INTO Players (user_id) VALUES (?)",
        [userId]
      );
    };

    res.status(201).json({
      message: "Account created successfully. Please wait for admin approval before logging in.",
      user: { userId, first_name, last_name, email, role, status: 'pending' }
    });
  }  catch (error) {
    console.error("Error in register:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    const [ existingUser ] = await db.query("SELECT * FROM Users WHERE email = ?", [email]);

    if (existingUser.length === 0) {
      return res.status (401).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await comparePassword(password, existingUser[0].password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // 4. Check approval status (AFTER password verification)
    if (existingUser[0].status === 'pending') {
      return res.status(403).json({ 
        message: "Your account is pending approval. You will receive an email once approved.",
        status: 'pending'
      });
    }

    if (existingUser[0].status === 'rejected') {
      return res.status(403).json({ 
        message: "Your account was not approved.",
        status: 'rejected'
      });
    }

    const accessToken = generateAccessToken(existingUser[0]);
    const refreshToken = generateRefreshToken(existingUser[0]);

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,        // change to true in production (HTTPS)
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "User logged in successfully",
      token: accessToken,
      user: {
        id: existingUser[0].id,
        first_name: existingUser[0].first_name,
        last_name: existingUser[0].last_name,
        email: existingUser[0].email,
        role: existingUser[0].role,
        profile_completed: existingUser[0].profile_completed
      },
    });

  } catch (error) {
    console.error("Error in login User: ", error);
    res.status(500).json({ message: "Server error" });
  }
}

const logout = (req, res) => {
  try {
    // Clear the JWT cookies
    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
    });

    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { 
  register,
  login,
  logout
};