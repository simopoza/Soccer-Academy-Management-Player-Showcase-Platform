const { check, param } = require('express-validator');

const teamsValidationRules = [
  check('name')
    .exists().withMessage("name is required")
    .trim()
    .escape()
    .notEmpty().withMessage("name cannot be empty"),
  check('age_limit')
    .exists()
    .isInt({ min: 9, max: 17 }).withMessage("age_limit must be a number between 9 and 17"),

  check('coach')
    .optional({ nullable: true })
    .isString().trim().escape().withMessage('coach must be a string'),

  check('founded')
    .optional({ nullable: true })
    .isString().trim().escape().withMessage('founded must be a string'),

  check('status')
    .optional()
    .isIn(['Active', 'Inactive']).withMessage('Invalid status'),
];

const teamsUpdateValidationRules = [
  param('id')
    .exists().withMessage('id is required')
    .isInt({ min: 1 }).withMessage('id must be a positive integer'),

  check('name')
    .optional({ nullable: true })
    .trim()
    .escape()
    .notEmpty().withMessage("name cannot be empty"),

  check('age_limit')
    .optional({ nullable: true })
    .isInt({ min: 9, max: 17 }).withMessage("age_limit must be a number between 9 and 17"),

  check('coach')
    .optional({ nullable: true })
    .isString().trim().escape().withMessage('coach must be a string'),

  check('founded')
    .optional({ nullable: true })
    .isString().trim().escape().withMessage('founded must be a string'),

  check('status')
    .optional()
    .isIn(['Active', 'Inactive']).withMessage('Invalid status'),
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
};
