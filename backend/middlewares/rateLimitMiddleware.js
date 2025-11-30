const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: "Too many login attempts, please try again later." },
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 7,
  message: { error: "Too many accounts created, please try again later." },
});

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many password reset attempts, please try again later." },
});

module.exports = { loginLimiter, registerLimiter, resetPasswordLimiter };
