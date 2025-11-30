const { check, param } = require('express-validator');

const matchesValidatorRules = [
  check('date')
    .exists().withMessage('date is required')
    .isISO8601().withMessage('date must be a valid ISO date')
    .toDate()
    .custom((date) => {
      const minDate = new Date('2024-01-01');
      const maxDate = new Date();
      if (date < minDate || date > maxDate) {
        throw new Error('Date must be realistic');
      }
      return true;
    }),

  check('opponent')
    .exists().withMessage('opponent is required')
    .trim().escape()
    .notEmpty().withMessage('opponent cannot be empty'),

  check('location')
    .exists().withMessage('location is required')
    .isIn(['Home', 'Away'])
    .withMessage("Invalid location. Must be 'Home' or 'Away'."),

  check('match_type')
    .exists().withMessage('match_type is required')
    .trim().escape()
    .notEmpty().withMessage('match_type cannot be empty')
    .isIn(['Friendly', 'Officially'])
    .withMessage("Invalid type. Must be 'Friendly' or 'Officially'."),

  check('team_id')
    .exists().withMessage('team_id is required')
    .isInt({ min: 1 }).withMessage('team_id must be a positive integer')
    .custom(async (team_id) => {
      const { validateTeam } = require('../helpers/validateForeignKeys');
      const exists = await validateTeam(team_id);
      if (!exists) throw new Error('Invalid team_id');
      return true;
    }),

  check('team_goals')
    .exists().withMessage('team_goals is required')
    .isInt({ min: 0 }).withMessage("team_goals must be a non-negative integer"),

  check('opponent_goals')
    .exists().withMessage('opponent_goals is required')
    .isInt({ min: 0 }).withMessage("opponent_goals must be a non-negative integer")
];

const matchesUpdateValidatorRules = [
  param('id')
    .exists().withMessage('id is required')
    .isInt({ min: 1 }).withMessage('id must be a positive integer'),

  check('date')
    .optional()
    .isISO8601().withMessage('date must be a valid ISO date')
    .toDate()
    .custom((date) => {
      const minDate = new Date('2024-01-01');
      const maxDate = new Date();
      if (date < minDate || date > maxDate) {
        throw new Error('Date must be realistic');
      }
      return true;
    }),

  check('opponent')
    .optional()
    .trim().escape()
    .notEmpty().withMessage('opponent cannot be empty'),

  check('location')
    .optional()
    .isIn(['Home', 'Away'])
    .withMessage("Invalid location. Must be 'Home' or 'Away'."),

  check('match_type')
    .optional()
    .trim().escape()
    .notEmpty().withMessage('match_type cannot be empty')
    .isIn(['Friendly', 'Officially'])
    .withMessage("Invalid type. Must be 'Friendly' or 'Officially'."),

  check('team_id')
    .optional()
    .isInt({ min: 1 }).withMessage('team_id must be a positive integer')
    .custom(async (team_id) => {
      const { validateTeam } = require('../helpers/validateForeignKeys');
      const exists = await validateTeam(team_id);
      if (!exists) throw new Error('Invalid team_id');
      return true;
    }),

  check('team_goals')
    .optional()
    .isInt({ min: 0 }).withMessage("team_goals must be a non-negative integer"),

  check('opponent_goals')
    .optional()
    .isInt({ min: 0 }).withMessage("opponent_goals must be a non-negative integer")
];

const matchesGetByIdValidatorRules = [
  param('id')
    .exists().withMessage('id is required')
    .isInt({ min: 1 }).withMessage('id must be a positive integer'),
];

module.exports = {
  matchesValidatorRules,
  matchesUpdateValidatorRules,
  matchesGetByIdValidatorRules
};
