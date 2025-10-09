const express = require('express');
const router = express.Router();
const { getMatches, getMatchById, addMatch, updateMatch, deleteMatch } = require('../controllers/matchesController');

/**
 * @swagger
 * /matches:
 *   get:
 *     summary: Get all matches
 *     responses:
 *       200:
 *         description: List of all matches
 */
router.get('/', getMatches);

/**
 * @swagger
 * /matches/{id}:
 *   get:
 *     summary: Get a match by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Match data
 */
router.get('/:id', getMatchById);

/**
 * @swagger
 * /matches:
 *   post:
 *     summary: Add a new match
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *               home_team_id:
 *                 type: integer
 *               away_team_id:
 *                 type: integer
 *               score_home:
 *                 type: integer
 *               score_away:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Match added successfully
 */
router.post('/', addMatch);

/**
 * @swagger
 * /matches/{id}:
 *   put:
 *     summary: Update a match by ID
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
 *               date:
 *                 type: string
 *               home_team_id:
 *                 type: integer
 *               away_team_id:
 *                 type: integer
 *               score_home:
 *                 type: integer
 *               score_away:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Match updated successfully
 */
router.put('/:id', updateMatch);

/**
 * @swagger
 * /matches/{id}:
 *   delete:
 *     summary: Delete a match by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Match deleted successfully
 */
router.delete('/:id', deleteMatch);

module.exports = router;
