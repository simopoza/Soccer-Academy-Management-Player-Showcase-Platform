const express = require('express');
const router = express.Router();
const { getTeams, getTeamById, addTeam, updateTeam, deleteTeam } = require('../controllers/teamsController');
const validate = require("../middlewares/validate");
const { teamsValidationRules, teamsUpdateValidationRules, teamsGetByIdValidationRules } = require('../validators/teamsValidator');
const { hasRole } = require("../middlewares/roleMiddleware");

/**
 * @swagger
 * /teams:
 *   get:
 *     summary: Get all teams
 *     responses:
 *       200:
 *         description: List of all teams
 */
router.get('/', hasRole("admin", "agent", "player"), getTeams);

/**
 * @swagger
 * /teams/{id}:
 *   get:
 *     summary: Get a team by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Team data
 */
router.get('/:id', hasRole("admin", "agent", "player"), teamsGetByIdValidationRules, validate, getTeamById);

/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Add a new team
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age_limit:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Team added successfully
 */
router.post('/', hasRole("admin"), teamsValidationRules, validate, addTeam);

/**
 * @swagger
 * /teams/{id}:
 *   put:
 *     summary: Update a team by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               age_limit:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Team updated successfully
 */
router.put('/:id', hasRole("admin"), teamsUpdateValidationRules, validate, updateTeam);

/**
 * @swagger
 * /teams/{id}:
 *   delete:
 *     summary: Delete a team by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Team deleted successfully
 */
router.delete('/:id', hasRole("admin"), teamsGetByIdValidationRules, validate, deleteTeam);

module.exports = router;
