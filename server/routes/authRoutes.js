const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const authController = require('../controllers/authController');

// Validation middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('username', 'Username is required').notEmpty().trim(),
    check('fullname', 'Full name is required').notEmpty().trim(),
    check('usn', 'USN must be in format like 1RV20CS001').matches(/^[1-9][A-Za-z]{2}\d{2}[A-Za-z]{2}\d{3}$/i),
    check('branch', 'Branch is required').isIn(['MCA', 'BCA', 'BSC', 'ENGINEERING']),
    check('yop', 'Year of passing must be between 2000 and current year + 5').isInt({ min: 2000, max: new Date().getFullYear() + 5 }),
    check('collegename', 'College name is required').notEmpty().trim()
], validate, authController.register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Password is required').exists()
], validate, authController.login);

// @route   GET /api/auth/verify-token
// @desc    Verify JWT token
// @access  Private
router.get('/verify-token', authController.verifyToken, (req, res) => {
    res.json({
        success: true,
        message: "Token is valid",
        user: {
            id: req.user._id,
            email: req.user.email,
            username: req.user.username,
            userType: req.user.user_type
        }
    });
});

// @route   POST /api/auth/users/bulk
// @desc    Bulk upload users (Admin only)
// @access  Private (Admin)
router.post('/users/bulk',
    authController.verifyToken,
    authController.verifyAdmin,
    [
        check('users').exists().withMessage('Users array is required'),
        check('users').isArray({ min: 1 }).withMessage('Users must be a non-empty array'),
        check('users.*.email').isEmail().withMessage('Invalid email format').normalizeEmail(),
        check('users.*.password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        check('users.*.username').notEmpty().withMessage('Username is required').trim(),
        check('users.*.fullname').notEmpty().withMessage('Full name is required').trim(),
        check('users.*.usn').matches(/^[1-9][A-Za-z]{2}\d{2}[A-Za-z]{2}\d{3}$/i).withMessage('Invalid USN format (e.g., 1RV20CS001)'),
        check('users.*.branch').isIn(['MCA', 'BCA', 'BSC', 'ENGINEERING']).withMessage('Invalid branch'),
        check('users.*.yop').isInt({ min: 2000, max: new Date().getFullYear() + 5 }).withMessage(`Year of passing must be between 2000 and ${new Date().getFullYear() + 5}`),
        check('users.*.collegename').notEmpty().withMessage('College name is required').trim()
    ],
    validate,
    authController.bulkUploadUsers
);

// @route   GET /api/auth/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/users',
    authController.verifyToken,
    authController.verifyAdmin,
    authController.getAllUsers
);

// @route   GET /api/auth/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/users/:id',
    authController.verifyToken,
    authController.getUserById
);

// @route   PUT /api/auth/users/:id
// @desc    Update user
// @access  Private
router.put('/users/:id',
    authController.verifyToken,
    [
        check('email', 'Please include a valid email').optional().isEmail().normalizeEmail(),
        check('password', 'Password must be at least 6 characters').optional().isLength({ min: 6 }),
        check('username', 'Username is required').optional().notEmpty().trim(),
        check('fullname', 'Full name is required').optional().notEmpty().trim(),
        check('usn', 'USN must be in format like 1RV20CS001').optional().matches(/^[1-9][A-Za-z]{2}\d{2}[A-Za-z]{2}\d{3}$/i),
        check('branch', 'Branch is required').optional().isIn(['MCA', 'BCA', 'BSC', 'ENGINEERING']),
        check('yop', 'Year of passing must be between 2000 and current year + 5').optional().isInt({ min: 2000, max: new Date().getFullYear() + 5 }),
        check('collegename', 'College name is required').optional().notEmpty().trim()
    ],
    validate,
    authController.updateUser
);

// @route   DELETE /api/auth/users/:id
// @desc    Delete user (Admin only)
// @access  Private (Admin)
router.delete('/users/:id',
    authController.verifyToken,
    authController.verifyAdmin,
    authController.deleteUser
);

module.exports = router;