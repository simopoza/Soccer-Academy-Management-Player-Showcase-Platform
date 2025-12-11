const jwt = require("jsonwebtoken");


const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.TOKEN_EXPIRATION
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION
    }
  );
};

const generateResetToken = () => {
  const token = require('crypto').randomBytes(32).toString('hex');
  return token;
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken
};