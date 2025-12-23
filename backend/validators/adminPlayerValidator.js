const { check } = require('express-validator');

const adminPlayerValidationRules = [
  check('first_name')
    .exists().withMessage('first_name is required')
    .notEmpty().withMessage('first_name cannot be empty')
    .isString().trim().escape(),

  check('last_name')
    .exists().withMessage('last_name is required')
    .notEmpty().withMessage('last_name cannot be empty')
    .isString().trim().escape(),

  check('date_of_birth')
    .optional({ nullable: true })
    .isISO8601().withMessage('Must be a valid date')
    .toDate(),

  check('height')
    .optional({ nullable: true })
    .isFloat({ min: 1 }).withMessage('Height must be a positive number'),

  check('weight')
    .optional({ nullable: true })
    .isFloat({ min: 1 }).withMessage('Weight must be a positive number'),

  check('position')
    .optional({ nullable: true })
    .isIn(['GK','CB','LB','RB','CDM','CM','CAM','LW','RW','ST','Goalkeeper','Defender','Midfielder','Forward','Winger','Striker'])
    .withMessage('Invalid position'),

  check('strong_foot')
    .optional({ nullable: true })
    .isIn(['Left','Right','Both']).withMessage('Invalid strong_foot'),

  check('team_id')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('team_id must be a positive integer'),

  check('email')
    .optional({ nullable: true })
    .isEmail().withMessage('email must be a valid email')
    .normalizeEmail(),

  check('sendInvite')
    .optional()
    .isBoolean().withMessage('sendInvite must be boolean'),
];

module.exports = {
  adminPlayerValidationRules
};
