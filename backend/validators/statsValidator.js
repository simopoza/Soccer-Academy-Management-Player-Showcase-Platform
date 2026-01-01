const { check, param } = require('express-validator');

const statsValidationRules = [
  check('player_id')
    .exists().withMessage('player_id is required')
    .isInt({ min: 1 }).withMessage('player_id must be a positive integer')
    .toInt()
    .custom(async (player_id) => {
      const { validatePlayer } = require('../helpers/validateForeignKeys');
      const exists = await validatePlayer(player_id);
      if (!exists) throw new Error('Invalid player_id');
      return true;
    }),

  check('match_id')
    .exists().withMessage('match_id is required')
    .isInt({ min: 1 }).withMessage('match_id must be a positive integer')
    .toInt()
    .custom(async (match_id) => {
      const { validateMatch } = require('../helpers/validateForeignKeys');
      const exists = await validateMatch(match_id);
      if (!exists) throw new Error('Invalid match_id');
      return true;
    }),

  check('goals')
    .exists().withMessage('goals is required')
    .isInt({ min: 0 }).withMessage('goals must be a non-negative integer')
    .toInt(),

  check('assists')
    .exists().withMessage('assists is required')
    .isInt({ min: 0 }).withMessage('assists must be a non-negative integer')
    .toInt(),

  check('minutes_played')
    .exists().withMessage('minutes_played is required')
    .isInt({ min: 0, max: 120 }).withMessage('minutes_played must be between 0 and 120')
    .toInt(),
  check('saves')
    .optional()
    .isInt({ min: 0 }).withMessage('saves must be a non-negative integer')
    .toInt(),
  check('yellowCards')
    .optional()
    .isInt({ min: 0 }).withMessage('yellowCards must be a non-negative integer')
    .toInt(),
  check('redCards')
    .optional()
    .isInt({ min: 0 }).withMessage('redCards must be a non-negative integer')
    .toInt(),
];

const statsUpdateValidationRules = [
  param('id')
    .exists().withMessage('id is required')
    .isInt({ min: 1 }).withMessage('id must be a positive integer')
    .toInt(),

  check('player_id')
    .optional()
    .isInt({ min: 1 }).withMessage('player_id must be a positive integer')
    .toInt()
    .custom(async (player_id) => {
      const { validatePlayer } = require('../helpers/validateForeignKeys');
      const exists = await validatePlayer(player_id);
      if (!exists) throw new Error('Invalid player_id');
      return true;
    }),

  check('match_id')
    .optional()
    .isInt({ min: 1 }).withMessage('match_id must be a positive integer')
    .toInt()
    .custom(async (match_id) => {
      const { validateMatch } = require('../helpers/validateForeignKeys');
      const exists = await validateMatch(match_id);
      if (!exists) throw new Error('Invalid match_id');
      return true;
    }),

  check('goals')
    .optional()
    .isInt({ min: 0 }).withMessage('goals must be a non-negative integer')
    .toInt(),

  check('assists')
    .optional()
    .isInt({ min: 0 }).withMessage('assists must be a non-negative integer')
    .toInt(),

  check('minutes_played')
    .optional()
    .isInt({ min: 0, max: 120 }).withMessage('minutes_played must be between 0 and 120')
    .toInt(),
  check('saves')
    .optional()
    .isInt({ min: 0 }).withMessage('saves must be a non-negative integer')
    .toInt(),
  check('yellowCards')
    .optional()
    .isInt({ min: 0 }).withMessage('yellowCards must be a non-negative integer')
    .toInt(),
  check('redCards')
    .optional()
    .isInt({ min: 0 }).withMessage('redCards must be a non-negative integer')
    .toInt(),
];

const statsGetByIdValidatorRules = [
  param('id')
    .exists().withMessage('id is required')
    .isInt({ min: 1 }).withMessage('id must be a positive integer')
    .toInt(),
];

module.exports = {
  statsValidationRules,
  statsUpdateValidationRules,
  statsGetByIdValidatorRules
};
