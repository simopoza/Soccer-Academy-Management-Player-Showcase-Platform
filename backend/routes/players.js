const express = require("express");
const router = express.Router();
const { getPlayers, getPlayerById, addPlayer, updatePlayer, deletePlayer } = require("../controllers/playersController");
const validate = require("../middlewares/validate");
const { playersValidationRules, playersUpdateValidationRules,  playersGetByIdValidatorRules} = require('../validators/playersValidator');
const { hasRole } = require("../middlewares/roleMiddleware");

/**
 * @swagger
 * /players:
 *   get:
 *     summary: Get all players
 *     responses:
 *       200:
 *         description: List of all players
 */
router.get("/", hasRole("admin", "agent", "player"), getPlayers);

/**
 * @swagger
 * /players/{id}:
 *   get:
 *     summary: Get a player by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Player data
 */
router.get("/:id", hasRole("admin", "agent", "player"), playersGetByIdValidatorRules, validate, getPlayerById);

/**
 * @swagger
 * /players:
 *   post:
 *     summary: Add a new player
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *               height:
 *                 type: number
 *               weight:
 *                 type: number
 *               position:
 *                 type: string
 *               strong_foot:
 *                 type: string
 *               image_url:
 *                 type: string
 *               team_id:
 *                 type: integer
 *               user_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Player added successfully
 */
router.post("/", hasRole("admin"), playersValidationRules, validate, addPlayer);

/**
 * @swagger
 * /players/{id}:
 *   put:
 *     summary: Update a player by ID
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
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *               height:
 *                 type: number
 *               weight:
 *                 type: number
 *               position:
 *                 type: string
 *               strong_foot:
 *                 type: string
 *               image_url:
 *                 type: string
 *               team_id:
 *                 type: integer
 *               user_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Player updated successfully
 */
router.put("/:id", hasRole("admin"), playersUpdateValidationRules, validate, updatePlayer);

/**
 * @swagger
 * /players/{id}:
 *   delete:
 *     summary: Delete a player by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Player deleted successfully
 */
router.delete("/:id", hasRole("admin"), playersGetByIdValidatorRules, validate, deletePlayer);

module.exports = router;
