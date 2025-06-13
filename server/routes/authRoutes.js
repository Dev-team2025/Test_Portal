const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// User management routes (protected)
router.get('/auth/users', authController.verifyToken, authController.verifyAdmin, authController.getAllUsers);
router.get('/auth/users/:id', authController.verifyToken, authController.getUserById);
router.put('/auth/users/:id', authController.verifyToken, authController.updateUser);
router.delete('/auth/users/:id', authController.verifyToken, authController.verifyAdmin, authController.deleteUser);

module.exports = router;