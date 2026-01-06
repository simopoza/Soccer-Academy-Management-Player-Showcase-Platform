const express = require("express");
const router = express.Router();
const {
  getMatches,
  getMatchById,
  addMatch,
  addOpponentGoal,
  updateMatch,
  deleteMatch,
} = require("../controllers/matchesController");
const { matchesValidatorRules, matchesUpdateValidatorRules, matchesGetByIdValidatorRules } = require("../validators/matchesValidator");
const validate = require("../middlewares/validate");
const { hasRole } = require("../middlewares/roleMiddleware");

/**
 * @swagger
 * /matches:
 *   get:
 *     summary: Get all matches
 *     responses:
 *       200:
 *         description: List of all matches
 */
router.get("/", hasRole("admin", "agent", "player"), getMatches);

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
router.get("/:id", hasRole("admin", "agent", "player"), matchesGetByIdValidatorRules, validate, getMatchById);

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
 *               competition:
 *                 type: string
 *                 enum: [Friendly, Cup, League]
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
router.post("/", hasRole("admin"), matchesValidatorRules, validate, addMatch);

// record an opponent goal quickly
router.post("/:id/opponent-goal", hasRole("admin"), addOpponentGoal);

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
  *               competition:
  *                 type: string
  *                 enum: [Friendly, Cup, League]
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
router.put("/:id", hasRole("admin"), matchesUpdateValidatorRules, validate, updateMatch);

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
router.delete("/:id", hasRole("admin"), matchesGetByIdValidatorRules, validate, deleteMatch);

module.exports = router;
