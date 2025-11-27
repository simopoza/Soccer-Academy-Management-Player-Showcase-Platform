const express = require('express');
const router = express.Router();
const { getStats, getStatById, addStat, updateStat, deleteStat } = require('../controllers/statsController');
const validate = require("../middlewares/validate");
const { statsValidationRules, statsUpdateValidationRules, statsGetByIdValidatorRules } = require('../validators/statsValidator');

/**
 * @swagger
 * /stats:
 *   get:
 *     summary: Get all stats
 *     responses:
 *       200:
 *         description: List of all stats
 */
router.get('/', getStats);

/**
 * @swagger
 * /stats/{id}:
 *   get:
 *     summary: Get a stat by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Stat data
 */
router.get('/:id', statsGetByIdValidatorRules, validate, getStatById);

/**
 * @swagger
 * /stats:
 *   post:
 *     summary: Add a new stat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               player_id:
 *                 type: integer
 *               match_id:
 *                 type: integer
 *               goals:
 *                 type: integer
 *               assists:
 *                 type: integer
 *               minutes_played:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Stat added successfully
 */
router.post('/', statsValidationRules, validate, addStat);

/**
 * @swagger
 * /stats/{id}:
 *   put:
 *     summary: Update a stat by ID
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
 *               player_id:
 *                 type: integer
 *               match_id:
 *                 type: integer
 *               goals:
 *                 type: integer
 *               assists:
 *                 type: integer
 *               minutes_played:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Stat updated successfully
 */
router.put('/:id', statsUpdateValidationRules, validate, updateStat);

/**
 * @swagger
 * /stats:
 *   post:
 *     summary: Add a new stat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               player_id:
 *                 type: integer
 *               match_id:
 *                 type: integer
 *               goals:
 *                 type: integer
 *               assists:
 *                 type: integer
 *               minutes_played:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Stat added successfully
 */
router.post('/', statsValidationRules, validate, addStat);

/**
 * @swagger
 * /stats/{id}:
 *   put:
 *     summary: Update a stat by ID
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
 *               player_id:
 *                 type: integer
 *               match_id:
 *                 type: integer
 *               goals:
 *                 type: integer
 *               assists:
 *                 type: integer
 *               minutes_played:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Stat updated successfully
 */
router.put('/:id', statsUpdateValidationRules, validate, updateStat);

/**
 * @swagger
 * /stats/{id}:
 *   delete:
 *     summary: Delete a stat by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Stat deleted successfully
 */
router.delete('/:id', statsGetByIdValidatorRules, validate, deleteStat);

module.exports = router;
