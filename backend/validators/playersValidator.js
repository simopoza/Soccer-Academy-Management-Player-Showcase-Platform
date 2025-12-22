const { check, param } = require('express-validator');

const playersValidationRules = [
  check('first_name')
    .exists()
    .notEmpty().withMessage("First_name cannot be empty")
    .isString().trim().escape().withMessage("First_name must be a string"),

  check('last_name')
    .exists()
    .notEmpty().withMessage("Last_name cannot be empty")
    .isString().trim().escape().withMessage("Last_name must be a string"),

  check('height')
    .optional({ nullable: true })
    .isFloat({ min: 1 }).withMessage("Height must be a positive number"),

  check('weight')
    .optional({ nullable: true })
    .isFloat({ min: 1 }).withMessage("Weight must be a positive number"),

  check('position')
    .exists()
    .isIn(['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Winger', 'Striker'])
    .withMessage("Invalid position."),

  check('strong_foot')
    .exists()
    .isIn(['Left', 'Right', 'Both'])
    .withMessage("Invalid strong_foot."),

  check('image_url')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      // Skip if null, undefined, or empty
      if (!value) return true;
      
      // Allow base64 data URIs or regular URLs
      if (value.startsWith('data:image/')) {
        return true;
      }
      // Validate as URL
      const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
      if (!urlPattern.test(value)) {
        throw new Error('Must be a valid image URL or base64 data URI');
      }
      return true;
    }),

  check('date_of_birth')
    .optional()
    .isISO8601().withMessage('Must be a valid date')
    .toDate()
    .custom((date) => {
      const minDate = new Date('1900-01-01');
      const maxDate = new Date();
      if (date < minDate || date > maxDate) {
        throw new Error('Date of birth must be a realistic date');
      }
      return true;
    }),

  check('team_id')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('team_id must be a positive integer')
    .custom(async (team_id) => {
      if (!team_id) return true;
      const { validateTeam } = require('../helpers/validateForeignKeys');
      const exists = await validateTeam(team_id);
      if (!exists) throw new Error('Invalid team_id');
      return true;
    }),

  check('user_id')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('user_id must be a positive integer')
    .custom(async (user_id) => {
      if (!user_id) return true;
      const { validateUser } = require('../helpers/validateForeignKeys');
      const exists = await validateUser(user_id);
      if (!exists) throw new Error('Invalid user_id');
      return true;
    }),
];

const playersUpdateValidationRules = [
  param('id')
    .exists().withMessage('id is required')
    .isInt({ min: 1 }).withMessage('id must be a positive integer'),

  check('first_name')
    .optional({ nullable: true })
    .notEmpty().withMessage("First_name cannot be empty")
    .isString().trim().escape().withMessage("First_name must be a string"),

  check('last_name')
    .optional({ nullable: true })
    .notEmpty().withMessage("Last_name cannot be empty")
    .isString().trim().escape().withMessage("Last_name must be a string"),

  check('height')
    .optional({ nullable: true })
    .isFloat({ min: 1 }).withMessage("Height must be a positive number"),

  check('weight')
    .optional({ nullable: true })
    .isFloat({ min: 1 }).withMessage("Weight must be a positive number"),

  check('position')
    .optional({ nullable: true })
    .isIn(['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Winger', 'Striker'])
    .withMessage("Invalid position."),

  check('strong_foot')
    .optional({ nullable: true })
    .isIn(['Left', 'Right', 'Both'])
    .withMessage("Invalid strong_foot."),

  check('image_url')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      // Skip if null, undefined, or empty
      if (!value) return true;
      
      // Allow base64 data URIs or regular URLs
      if (value.startsWith('data:image/')) {
        return true;
      }
      // Validate as URL
      const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
      if (!urlPattern.test(value)) {
        throw new Error('Must be a valid image URL or base64 data URI');
      }
      return true;
    }),

  check('date_of_birth')
    .optional({ nullable: true })
    .isISO8601().withMessage('Must be a valid date')
    .toDate()
    .custom((date) => {
      const minDate = new Date('1900-01-01');
      const maxDate = new Date();
      if (date < minDate || date > maxDate) {
        throw new Error('Date of birth must be a realistic date');
      }
      return true;
    }),

  check('team_id')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('team_id must be a positive integer')
    .custom(async (team_id) => {
      if (!team_id) return true;
      const { validateTeam } = require('../helpers/validateForeignKeys');
      const exists = await validateTeam(team_id);
      if (!exists) throw new Error('Invalid team_id');
      return true;
    }),

  check('user_id')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('user_id must be a positive integer')
    .custom(async (user_id) => {
      if (!user_id) return true;
      const { validateUser } = require('../helpers/validateForeignKeys');
      const exists = await validateUser(user_id);
      if (!exists) throw new Error('Invalid user_id');
      return true;
    }),
];

const playersGetByIdValidatorRules = [
  param('id')
    .exists().withMessage('id is required')
    .isInt({ min: 1 }).withMessage('id must be a positive integer'),
];

const completeProfileValidationRules = [
  param('id')
    .exists().withMessage('id is required')
    .isInt({ min: 1 }).withMessage('id must be a positive integer'),

  check('date_of_birth')
    .exists().withMessage('date_of_birth is required')
    .isISO8601().withMessage('Must be a valid date')
    .toDate()
    .custom((date) => {
      const minDate = new Date('1900-01-01');
      const maxDate = new Date();
      if (date < minDate || date > maxDate) {
        throw new Error('Date of birth must be a realistic date');
      }
      return true;
    }),

  check('team_id')
    .exists().withMessage('team_id is required')
    .isInt({ min: 1 }).withMessage('team_id must be a positive integer')
    .custom(async (team_id) => {
      const { validateTeam } = require('../helpers/validateForeignKeys');
      const exists = await validateTeam(team_id);
      if (!exists) throw new Error('Invalid team_id');
      return true;
    }),

  check('position')
    .exists().withMessage('position is required')
    .isIn(['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST', 'Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Winger', 'Striker'])
    .withMessage("Invalid position."),

  check('height')
    .exists().withMessage('height is required')
    .isFloat({ min: 1 }).withMessage("Height must be a positive number"),

  check('weight')
    .exists().withMessage('weight is required')
    .isFloat({ min: 1 }).withMessage("Weight must be a positive number"),

  check('strong_foot')
    .exists().withMessage('strong_foot is required')
    .isIn(['Left', 'Right', 'Both'])
    .withMessage("Invalid strong_foot."),

  check('image_url')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      // Skip if null, undefined, or empty
      if (!value) return true;
      
      // Allow base64 data URIs or regular URLs
      if (value.startsWith('data:image/')) {
        return true;
      }
      // Validate as URL
      const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
      if (!urlPattern.test(value)) {
        throw new Error('Must be a valid image URL or base64 data URI');
      }
      return true;
    }),
];

module.exports = {
  playersValidationRules,
  playersUpdateValidationRules,
  playersGetByIdValidatorRules,
  completeProfileValidationRules
};
