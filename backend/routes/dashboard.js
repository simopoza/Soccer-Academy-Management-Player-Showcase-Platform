const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRecentMatches,
  getPerformanceRatings,
} = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');
const { hasRole } = require('../middlewares/roleMiddleware');

// All dashboard routes require authentication and admin role
router.use(authMiddleware);
router.use(hasRole('admin'));

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Returns total players, active teams, matches count, and player growth percentage
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalPlayers:
 *                       type: integer
 *                       example: 248
 *                     playerGrowth:
 *                       type: string
 *                       example: "+12%"
 *                     activeTeams:
 *                       type: integer
 *                       example: 12
 *                     matchesPlayed:
 *                       type: integer
 *                       example: 156
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/stats', getDashboardStats);

/**
 * @swagger
 * /api/dashboard/recent-matches:
 *   get:
 *     summary: Get recent matches
 *     description: Returns the most recent matches with results (Won/Lost/Draw)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of recent matches to return
 *     responses:
 *       200:
 *         description: Recent matches retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       team1:
 *                         type: string
 *                       team2:
 *                         type: string
 *                       score:
 *                         type: string
 *                         example: "3-2"
 *                       date:
 *                         type: string
 *                         format: date
 *                       status:
 *                         type: string
 *                         enum: [Won, Lost, Draw]
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/recent-matches', getRecentMatches);

/**
 * @swagger
 * /api/dashboard/performance-ratings:
 *   get:
 *     summary: Get performance ratings over time
 *     description: Returns average team ratings grouped by month
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 6
 *         description: Number of months to retrieve ratings for
 *     responses:
 *       200:
 *         description: Performance ratings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Jan"
 *                       rating:
 *                         type: number
 *                         format: float
 *                         example: 7.5
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/performance-ratings', getPerformanceRatings);

module.exports = router;
