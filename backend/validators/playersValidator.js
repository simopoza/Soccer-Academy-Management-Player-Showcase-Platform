const { check, param } = require('express-validator');

const playersValidationRules = [
  check('first_name')
    .exists()
    .notEmpty().withMessage("First_name cannot be empty")
    .isString().trim().withMessage("First_name must be a string"),

  check('last_name')
    .exists()
    .notEmpty().withMessage("Last_name cannot be empty")
    .isString().trim().withMessage("Last_name must be a string"),

  check('height')
    .exists()
    .isInt({ min: 1 }).withMessage("Height must be a number"),

  check('weight')
    .exists()
    .isInt({ min: 1 }).withMessage("Weight must be a number"),

  check('position')
    .exists()
    .isIn(['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'])
    .withMessage("Invalid position. Must be 'GK' or 'CB' or 'LB' or 'RB' or 'CDM' or 'CM' or 'CAM' or 'LW' or 'RW' or 'ST'."),
  
  check('strong_foot')
    .exists()
    .isIn(['Left', 'Right'])
    .withMessage("Invalid strong_foot. Must be 'left' or 'right'."),

  check('image_url')
    .optional()
    .isString().withMessage("Image URL must be a string")
    .isURL().withMessage('Must be a valid URL')
    .matches(/\.(jpg|jpeg|png|gif|webp)$/i).withMessage('Must be an image URL'),

  check('date_of_birth')
    .optional() // use .optional() for PUT, remove for POST if required
    .isISO8601().withMessage('Must be a valid date')
    .toDate() // converts the string to a JS Date object
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
    if (!exists) {
      throw new Error('Invalid team_id');
    }
    return true;
  })
];

const playersUpdateValidationRules = [
  param('id')
    .exists().withMessage('id is required')
    .isInt({ min: 1 }).withMessage('id must be a positive integer'),

  check('first_name')
    .optional()
    .notEmpty().withMessage("First_name cannot be empty")
    .isString().trim().withMessage("First_name must be a string"),

  check('last_name')
    .optional()
    .notEmpty().withMessage("Last_name cannot be empty")
    .isString().trim().withMessage("Last_name must be a string"),

  check('height')
    .optional()
    .isInt({ min: 1 }).withMessage("Height must be a number"),

  check('weight')
    .optional()
    .isInt({ min: 1 }).withMessage("Weight must be a number"),

  check('position')
    .optional()
    .isIn(['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'])
    .withMessage("Invalid position. Must be 'GK' or 'CB' or 'LB' or 'RB' or 'CDM' or 'CM' or 'CAM' or 'LW' or 'RW' or 'ST'."),
  
  check('strong_foot')
    .optional()
    .isIn(['Left', 'Right'])
    .withMessage("Invalid strong_foot. Must be 'left' or 'right'."),

  check('image_url')
    .optional()
    .isString().withMessage("Image URL must be a string")
    .isURL().withMessage('Must be a valid URL')
    .matches(/\.(jpg|jpeg|png|gif|webp)$/i).withMessage('Must be an image URL'),

  check('date_of_birth')
    .optional() // use .optional() for PUT, remove for POST if required
    .isISO8601().withMessage('Must be a valid date')
    .toDate() // converts the string to a JS Date object
    .custom((date) => {
      const minDate = new Date('1900-01-01');
      const maxDate = new Date();
      if (date < minDate || date > maxDate) {
        throw new Error('Date of birth must be a realistic date');
      }
      return true;
    }),

  check('team_id')
  .optional()
  .isInt({ min: 1 }).withMessage('team_id must be a positive integer')
  .custom(async (team_id) => {
    const { validateTeam } = require('../helpers/validateForeignKeys');
    const exists = await validateTeam(team_id);
    if (!exists) {
      throw new Error('Invalid team_id');
    }
    return true;
  })
]

const playersGetByIdValidatorRules = [
  param('id')
    .exists().withMessage('id is required')
    .isInt({ min: 1 }).withMessage('id must be a positve integer'),
];

module.exports = {
  playersValidationRules,
  playersUpdateValidationRules,
  playersGetByIdValidatorRules
}