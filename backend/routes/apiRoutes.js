const express = require("express");
const router = express.Router();
const auth = require('../middlewares/authMiddleware');

const playersRoutes = require("./players");
const teamsRoutes = require("./teams");
const matchesRoutes = require("./matches");
const participantsRoutes = require("./participants");
const statsRoutes = require("./stats");
const userRoutes = require("./user");
const authRoutes = require("./auth");
const adminRoutes = require('./admin');
const dashboardRoutes = require('./dashboard');

router.use("/auth", authRoutes);
router.use("/users", auth, userRoutes);
router.use("/players", auth, playersRoutes);
router.use("/teams", auth, teamsRoutes);
router.use("/admin", auth, adminRoutes);
router.use("/matches", auth, matchesRoutes);
router.use("/participants", auth, participantsRoutes);
router.use("/stats", auth, statsRoutes);
router.use("/dashboard", auth, dashboardRoutes);

module.exports = router;
