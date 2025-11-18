const { check, param } = require('express-validator');

const statsValidationRules = [
  check('player_id')
    .exists().withMessage('player_id is required')
    .isInt({ min: 1 }).withMessage('player_id must be a positive integer'),

  check('match_id')
    .exists().withMessage('match_id is required')
    .isInt({ min: 1 }).withMessage('match_id must be a positive integer'),

  check('goals')
    .exists().withMessage('goals is required')
    .isInt({ min: 0 }).withMessage('goals must be a non-negative integer'),

  check('assists')
    .exists().withMessage('assists is required')
    .isInt({ min: 0 }).withMessage('assists must be a non-negative integer'),

  check('minutes_played')
    .exists().withMessage('minutes_played is required')
    .isInt({ min: 0, max: 120 }).withMessage('minutes_played must be between 0 and 120'),
];

const statsUpdateValidationRules = [
  param('id')
    .exists().withMessage('id is required')
    .isInt({ min: 1 }).withMessage('id must be a positive integer'),

  check('player_id')
    .exists().withMessage('player_id is required')
    .isInt({ min: 1 }).withMessage('player_id must be a positive integer'),

  check('match_id')
    .exists().withMessage('match_id is required')
    .isInt({ min: 1 }).withMessage('match_id must be a positive integer'),

  check('goals')
    .exists().withMessage('goals is required')
    .isInt({ min: 0 }).withMessage('goals must be a non-negative integer'),

  check('assists')
    .exists().withMessage('assists is required')
    .isInt({ min: 0 }).withMessage('assists must be a non-negative integer'),

  check('minutes_played')
    .exists().withMessage('minutes_played is required')
    .isInt({ min: 0, max: 120 }).withMessage('minutes_played must be between 0 and 120'),
];

module.exports = {
  statsValidationRules,
  statsUpdateValidationRules
};