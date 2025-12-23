const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate");
const { 
  getAllUsers, 
  getUserById, 
  addUser, 
  updateUser, 
  deleteUserById,
  resetPassword,
  updateUserProfile
} = require("../controllers/userController");
const {
  userValidationRules,
  userUpdateValidationRules,
  userIdParamValidation,
  userPasswordUpdateValidationRules,
  userProfileUpdateValidationRules
} = require("../validators/userValidator");
const { hasRole } = require("../middlewares/roleMiddleware");
const { resetPasswordLimiter } = require("../middlewares/rateLimitMiddleware");

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get("/", hasRole("admin"), getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User data
 */
router.get("/:id", hasRole("admin", "player"), userIdParamValidation, validate, getUserById);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Add a new user
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
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, player, agent]
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post("/", hasRole("admin"), userValidationRules, validate, addUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user by ID
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
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, player, agent]
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put("/:id", hasRole("admin", "player"), userUpdateValidationRules, validate, updateUser);

/**
 * @swagger
 * /users/{id}/profile:
 *   put:
 *     summary: Update user profile (first name, last name, email)
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
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
// Accept multipart/form-data for profile updates (allows image uploads)
router.put("/:id/profile", hasRole("player", "admin", "agent"), upload.single('image'), userProfileUpdateValidationRules, validate, updateUserProfile);

/**
 * @swagger
 * /users/{id}/password:
 *   put:
 *     summary: Reset a user's password by ID
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
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
router.put("/:id/password", resetPasswordLimiter, hasRole("player", "admin", "agent"), userPasswordUpdateValidationRules, validate, resetPassword);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
router.delete("/:id", hasRole("admin"), userIdParamValidation, validate, deleteUserById);

module.exports = router;
