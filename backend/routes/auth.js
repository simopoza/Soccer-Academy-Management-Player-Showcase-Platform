const express = require("express");
const router = express.Router();
const { register, login, logout } = require("../controllers/authController");
const  validate  = require("../middlewares/validate");
const { registerValidationRules, loginValidationRules } = require("../validators/authValidator");

/**
 * @swagger
 * /auth/register:
 *  post:
 *    summary: Add a new user
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              first_name:
 *                type: string
 *              last_name:
 *                type: string
 *              email:
 *                type: string
 *                format: email
 *              password:
 *                type: string
 *              role:
 *                type: string
 *                enam: [admin, player, agent]
 *    responses:
 *      201:
 *        description: User added successfully
 */
router.post("/register", registerValidationRules, validate, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 */
router.post("/login", loginValidationRules, validate, login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     responses:
 *       200:
 *         description: User logged out successfully
 */
router.post("/logout", logout);

module.exports = router;
