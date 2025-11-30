const express = require("express");
const router = express.Router();
const auth = require('../middlewares/authMiddleware');

const playersRoutes = require("./players");
const teamsRoutes = require("./teams");
const matchesRoutes = require("./matches");
const statsRoutes = require("./stats");
const userRoutes = require("./user");
const authRoutes = require("./auth");

router.use("/auth", authRoutes);
router.use("/users", auth, userRoutes);
router.use("/players", auth, playersRoutes);
router.use("/teams", auth, teamsRoutes);
router.use("/matches", auth, matchesRoutes);
router.use("/stats", auth, statsRoutes);

module.exports = router;
