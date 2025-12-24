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

  // location now stores whether the match is Home or Away
  check('location')
    .exists().withMessage('location is required')
    .trim().escape()
    .isIn(['Home', 'Away']).withMessage("Invalid location. Must be 'Home' or 'Away'."),

  // competition type: Friendly, Cup, League
  check('competition')
    .exists().withMessage('competition is required')
    .trim().escape()
    .notEmpty().withMessage('competition cannot be empty')
    .isIn(['Friendly', 'Cup', 'League'])
    .withMessage("Invalid competition. Must be one of 'Friendly', 'Cup', or 'League'."),

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
    .trim().escape()
    .isIn(['Home', 'Away']).withMessage("Invalid location. Must be 'Home' or 'Away'."),

  check('competition')
    .optional()
    .trim().escape()
    .isIn(['Friendly', 'Cup', 'League'])
    .withMessage("Invalid competition. Must be one of 'Friendly', 'Cup', or 'League'."),

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
