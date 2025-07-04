// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Authentication
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected user management
router.get('/auth/users', authController.verifyToken, authController.verifyAdmin, authController.getAllUsers);
router.get('/auth/users/:id', authController.verifyToken, authController.getUserById);
router.put('/auth/users/:id', authController.verifyToken, authController.updateUser);
router.delete('/auth/users/:id', authController.verifyToken, authController.verifyAdmin, authController.deleteUser);
router.post('/auth/users/bulk', authController.verifyToken, authController.verifyAdmin, authController.bulkUploadUsers);

module.exports = router;