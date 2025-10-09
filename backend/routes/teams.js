const express = require('express');
const router = express.Router();
const { getTeams, getTeamById, addTeam, updateTeam, deleteTeam } = require('../controllers/teamsController');

/**
 * @swagger
 * /teams:
 *   get:
 *     summary: Get all teams
 *     responses:
 *       200:
 *         description: List of all teams
 */
router.get('/', getTeams);

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
router.get('/:id', getTeamById);

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
router.post('/', addTeam);

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
router.put('/:id', updateTeam);

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
router.delete('/:id', deleteTeam);

module.exports = router;
