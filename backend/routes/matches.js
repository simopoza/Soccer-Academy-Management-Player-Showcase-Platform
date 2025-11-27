const express = require("express");
const router = express.Router();
const {
  getMatches,
  getMatchById,
  addMatch,
  updateMatch,
  deleteMatch,
} = require("../controllers/matchesController");
const { matchesValidatorRules, matchesUpdateValidatorRules, matchesGetByIdValidatorRules } = require("../validators/matchesValidator");
const validate = require("../middlewares/validate");

/**
 * @swagger
 * /matches:
 *   get:
 *     summary: Get all matches
 *     responses:
 *       200:
 *         description: List of all matches
 */
router.get("/", getMatches);

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
router.get("/:id", matchesGetByIdValidatorRules, validate, getMatchById);

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
 *                 format: date-time
 *               opponent:
 *                 type: string
 *               location:
 *                 type: string
 *                 enum: [Home, Away]
 *               match_type:
 *                 type: string
 *                 enum: [Friendly, Officially]
 *               team_goals:
 *                 type: integer
 *                 default: 0
 *               opponent_goals:
 *                 type: integer
 *                 default: 0
 *               team_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Match added successfully
 */
router.post("/", matchesValidatorRules, validate, addMatch);

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
 *                 format: date-time
 *               opponent:
 *                 type: string
 *               location:
 *                 type: string
 *                 enum: [Home, Away]
 *               match_type:
 *                 type: string
 *                 enum: [Friendly, Officially]
 *               team_goals:
 *                 type: integer
 *               opponent_goals:
 *                 type: integer
 *               team_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Match updated successfully
 */
router.put("/:id", matchesUpdateValidatorRules, validate, updateMatch);

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
router.delete("/:id", matchesGetByIdValidatorRules, validate, deleteMatch);

module.exports = router;
