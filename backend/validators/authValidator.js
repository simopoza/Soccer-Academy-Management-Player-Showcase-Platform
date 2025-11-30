const { check } = require('express-validator');

const registerValidationRules = [
  check('first_name')
    .exists().withMessage('first_name is required')
    .trim()
    .escape()
    .notEmpty().withMessage("first_name cannot be empty"),

  check('last_name')
    .exists().withMessage('last_name is required')
    .trim()
    .escape()
    .notEmpty().withMessage("last_name cannot be empty"),

  check('email')
    .exists().withMessage('email is required')
    .trim()
    .normalizeEmail()
    .notEmpty().withMessage('email cannot be empty')
    .isEmail().withMessage('Must be a valid email address'),

  check('password')
    .exists().withMessage('password is required')
    .notEmpty().withMessage('password cannot be empty')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),

  check('role')
    .exists().withMessage('role is required')
    .trim()
    .escape()
    .notEmpty().withMessage('role cannot be empty')
    .isIn(['admin', 'player', 'agent'])
    .withMessage("Invalid role. Must be 'admin', 'player', or 'agent'."),
];

const loginValidationRules = [
  check('email')
    .exists().withMessage('email is required')
    .trim()
    .normalizeEmail()
    .notEmpty().withMessage('email cannot be empty')
    .isEmail().withMessage('Must be a valid email address'),

  check('password')
    .exists().withMessage('password is required')
    .notEmpty().withMessage('password cannot be empty'),
];

module.exports = {
  registerValidationRules,
  loginValidationRules,
};