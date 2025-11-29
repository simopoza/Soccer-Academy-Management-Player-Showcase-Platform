const express = require("express");
const router = express.Router();

const playersRoutes = require("./players");
const teamsRoutes = require("./teams");
const matchesRoutes = require("./matches");
const statsRoutes = require("./stats");
const authRoutes = require("./auth");

router.use("/auth", authRoutes);
router.use("/players", playersRoutes);
router.use("/teams", teamsRoutes);
router.use("/matches", matchesRoutes);
router.use("/stats", statsRoutes);

module.exports = router;
