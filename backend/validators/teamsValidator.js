const { check, param } = require('express-validator');

const teamsValidationRules = [
  check('name')
    .exists().withMessage("name is required")
    .trim()
    .notEmpty().withMessage("name cannot be empty"),

  check('age_limit')
    .exists()
    .isInt({ min: 9, max: 17}).withMessage("age_limit must be a number between 9 and 17"),
];

const teamsUpdateValidationRules = [
  param('id')
    .exists().withMessage('id is required')
    .isInt({ min: 1 }).withMessage('id must be a positive integer'),

  check('name')
    .optional()
    .trim()
    .notEmpty().withMessage("name cannot be empty"),

  check('age_limit')
    .optional()
    .isInt({ min: 9, max: 17}).withMessage("age_limit must be a number between 9 and 17"),
];

const teamsGetByIdValidationRules = [
  param('id')
    .exists().withMessage('id is required')
    .isInt({ min: 1 }).withMessage('id must be a positive integer'),
];

module.exports = {
  teamsValidationRules,
  teamsUpdateValidationRules,
  teamsGetByIdValidationRules
}