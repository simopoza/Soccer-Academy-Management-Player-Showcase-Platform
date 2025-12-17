const { check, param } = require('express-validator');

const userValidationRules = [
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

const userUpdateValidationRules = [
  param('id')
    .exists().withMessage('User ID is required')
    .isInt({ min: 1 }).withMessage('User ID must be a positive integer'),

  check('first_name')
    .optional()
    .trim()
    .escape()
    .notEmpty().withMessage("first_name cannot be empty"),

  check('last_name')
    .optional()
    .trim()
    .escape()
    .notEmpty().withMessage("last_name cannot be empty"),

  check('email')
    .optional()
    .trim()
    .normalizeEmail()
    .notEmpty().withMessage('email cannot be empty')
    .isEmail().withMessage('Must be a valid email address'),

  check('role')
    .optional()
    .trim()
    .escape()
    .notEmpty().withMessage('role cannot be empty')
    .isIn(['admin', 'player', 'agent'])
    .withMessage("Invalid role. Must be 'admin', 'player', or 'agent'.")
];

const userIdParamValidation = [
  param('id')
    .exists().withMessage('User ID is required')
    .isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
];

const userPasswordUpdateValidationRules = [
   param('id')
    .exists().withMessage('User ID is required')
    .isInt({ min: 1 }).withMessage('User ID must be a positive integer'),

  check("oldPassword")
    .exists().withMessage("oldPassword is required")
    .notEmpty().withMessage("oldPassword cannot be empty"),

  check("newPassword")
    .exists().withMessage("newPassword is required")
    .notEmpty().withMessage("newPassword cannot be empty")
    .isLength({ min: 8 }).withMessage("newPassword must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
    .withMessage(
      "newPassword must contain uppercase, lowercase, number, and special character"
    ),

  check("confirmPassword")
    .exists().withMessage("confirmPassword is required")
    .notEmpty().withMessage("confirmPassword cannot be empty")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('confirmPassword does not match newPassword');
      }
      return true;
    }),
];

const userProfileUpdateValidationRules = [
  param('id')
    .exists().withMessage('User ID is required')
    .isInt({ min: 1 }).withMessage('User ID must be a positive integer'),

  check('first_name')
    .optional()
    .trim()
    .escape()
    .notEmpty().withMessage("first_name cannot be empty"),

  check('last_name')
    .optional()
    .trim()
    .escape()
    .notEmpty().withMessage("last_name cannot be empty"),

  check('email')
    .optional()
    .trim()
    .normalizeEmail()
    .notEmpty().withMessage('email cannot be empty')
    .isEmail().withMessage('Must be a valid email address'),
];

module.exports = {
  userValidationRules,
  userUpdateValidationRules,
  userIdParamValidation,
  userPasswordUpdateValidationRules,
  userProfileUpdateValidationRules
};
