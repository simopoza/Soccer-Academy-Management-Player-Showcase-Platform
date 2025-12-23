const express = require("express");
const router = express.Router();
const { getPlayers, getPlayerById, addPlayer, updatePlayer, deletePlayer, completeProfile, getCurrentPlayer, adminCreatePlayerWithUser } = require("../controllers/playersController");
const validate = require("../middlewares/validate");
const { playersValidationRules, playersUpdateValidationRules, playersGetByIdValidatorRules, completeProfileValidationRules } = require('../validators/playersValidator');
const { adminPlayerValidationRules } = require('../validators/adminPlayerValidator');
const { hasRole } = require("../middlewares/roleMiddleware");

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

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
 * /players/me:
 *   get:
 *     summary: Get current logged-in player's info
 *     responses:
 *       200:
 *         description: Current player data
 */
router.get("/me", hasRole("player"), getCurrentPlayer);

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

// Admin endpoint to create a player and create/link a user account if email provided
router.post('/admin-create', hasRole('admin'), adminPlayerValidationRules, validate, adminCreatePlayerWithUser);

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
 * /players/{id}/complete-profile:
 *   put:
 *     summary: Complete player profile (player only, first time)
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
 *             required:
 *               - first_name
 *               - last_name
 *               - date_of_birth
 *               - position
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
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
 *     responses:
 *       200:
 *         description: Profile completed successfully
 *       400:
 *         description: Profile already completed or missing required fields
 *       403:
 *         description: Access denied
 */
// Accept multipart/form-data for profile completion (allows image uploads)
router.put("/:id/complete-profile", hasRole("player"), upload.single('image'), completeProfileValidationRules, validate, completeProfile);

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
