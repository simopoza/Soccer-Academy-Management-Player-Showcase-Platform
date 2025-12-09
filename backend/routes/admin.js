const express = require('express');
const router = express.Router();
const { 
  getPendingUsers, 
  approveUser, 
  rejectUser,
  createAdmin 
} = require('../controllers/adminController');
const { hasRole } = require('../middlewares/roleMiddleware');
const  authMiddleware = require('../middlewares/authMiddleware');


// All routes require admin role
router.use(authMiddleware);
router.use(hasRole('admin'));

// Get pending users
router.get('/pending-users', getPendingUsers);

// Approve user
router.put('/users/:id/approve', approveUser);

// Reject user (delete)
router.delete('/users/:id/reject', rejectUser);

// Create new admin
router.post('/users/create-admin', createAdmin);

module.exports = router;