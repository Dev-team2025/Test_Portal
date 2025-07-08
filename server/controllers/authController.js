const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        {
            _id: user._id,
            email: user.email,
            user_type: user.user_type,
            username: user.username
        },
        process.env.JWT_SECRET || 'Dlithe@123',
        { expiresIn: '1d' }
    );
};

// Register a new user
exports.register = async (req, res) => {
    try {
        const { email, password, username, fullname, usn, branch, yop, collegename } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }, { usn }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email, username or USN already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            email,
            password: hashedPassword,
            username,
            fullname,
            usn: usn.toUpperCase(),
            branch: branch.toUpperCase(),
            yop: parseInt(yop),
            collegename,
            user_type: 'student'
        });

        await newUser.save();

        // Generate token
        const token = generateToken(newUser);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                email: newUser.email,
                username: newUser.username,
                user_type: newUser.user_type,
                fullname: newUser.fullname,
                usn: newUser.usn,
                branch: newUser.branch
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.last_login = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                user_type: user.user_type,
                fullname: user.fullname,
                isFirstLogin: user.isFirstLogin
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// Verify Token Middleware
exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'No token provided'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'Dlithe@123');
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

// Verify Admin Middleware
exports.verifyAdmin = (req, res, next) => {
    if (req.user.user_type !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admins only.'
        });
    }
    next();
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (err) {
        console.error('Get all users error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.json({
            success: true,
            user
        });
    } catch (err) {
        console.error('Get user by ID error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
};

// Update user by ID
exports.updateUser = async (req, res) => {
    try {
        const { password, ...updateData } = req.body;

        // If password is being updated, hash it
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (err) {
        console.error('Update user error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
};

// Delete user (soft delete)
exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        ).select('-password');

        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deactivated successfully',
            user: deletedUser
        });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
};

// Bulk upload users
exports.bulkUploadUsers = async (req, res) => {
    try {
        const { users } = req.body;

        // Validate input
        if (!users || !Array.isArray(users)) {
            return res.status(400).json({
                success: false,
                message: "Invalid request format. Expected { users: [] }"
            });
        }

        // Validation checks
        const validationErrors = [];
        const validUsers = [];
        const currentYear = new Date().getFullYear();
        const validBranches = ['MCA', 'BCA', 'BSC', 'ENGINEERING'];

        users.forEach((user, index) => {
            const errors = [];
            const rowNumber = index + 1;

            // Check required fields
            const requiredFields = ['email', 'password', 'username', 'fullname', 'usn', 'branch', 'yop', 'collegename'];
            const missingFields = requiredFields.filter(field => !user[field]);
            if (missingFields.length > 0) {
                errors.push(`Missing fields: ${missingFields.join(', ')}`);
            }

            // Validate email format
            if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
                errors.push("Invalid email format");
            }

            // Validate USN format
            if (user.usn && !/^[1-9][A-Za-z]{2}\d{2}[A-Za-z]{2}\d{3}$/i.test(user.usn)) {
                errors.push("Invalid USN format (e.g., 1RV20CS001)");
            }

            // Validate branch
            if (user.branch && !validBranches.includes(user.branch.toUpperCase())) {
                errors.push(`Invalid branch. Must be one of: ${validBranches.join(', ')}`);
            }

            // Validate YOP
            if (user.yop && (isNaN(user.yop) || user.yop < 2000 || user.yop > currentYear + 5)) {
                errors.push(`Invalid YOP (2000-${currentYear + 5})`);
            }

            // Validate password length
            if (user.password && user.password.length < 6) {
                errors.push("Password must be at least 6 characters");
            }

            if (errors.length > 0) {
                validationErrors.push({
                    row: rowNumber,
                    errors,
                    data: user
                });
            } else {
                validUsers.push({
                    ...user,
                    usn: user.usn.toUpperCase(),
                    branch: user.branch.toUpperCase(),
                    yop: parseInt(user.yop),
                    user_type: 'student',
                    isFirstLogin: true,
                    isActive: true
                });
            }
        });

        // Return validation errors if any
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Validation errors found in uploaded data",
                errorCount: validationErrors.length,
                validCount: validUsers.length,
                errors: validationErrors
            });
        }

        // Check for duplicates in the database
        const existingRecords = await User.find({
            $or: [
                { email: { $in: validUsers.map(u => u.email) } },
                { usn: { $in: validUsers.map(u => u.usn) } },
                { username: { $in: validUsers.map(u => u.username) } }
            ]
        });

        const existingEmails = new Set(existingRecords.map(u => u.email));
        const existingUsns = new Set(existingRecords.map(u => u.usn));
        const existingUsernames = new Set(existingRecords.map(u => u.username));

        const usersToInsert = [];
        const duplicateErrors = [];

        validUsers.forEach(user => {
            const errors = [];

            if (existingEmails.has(user.email)) {
                errors.push('Email already exists in system');
            }
            if (existingUsns.has(user.usn)) {
                errors.push('USN already exists in system');
            }
            if (existingUsernames.has(user.username)) {
                errors.push('Username already exists in system');
            }

            if (errors.length > 0) {
                duplicateErrors.push({
                    row: users.findIndex(u => u.email === user.email) + 1,
                    field: errors.join(', '),
                    message: errors.join(' and ')
                });
            } else {
                usersToInsert.push(user);
            }
        });

        if (duplicateErrors.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Duplicate records found in system",
                duplicateCount: duplicateErrors.length,
                validCount: usersToInsert.length,
                errors: duplicateErrors
            });
        }

        // Hash passwords and prepare for insertion
        const usersWithHashedPasswords = await Promise.all(
            usersToInsert.map(async user => ({
                ...user,
                password: await bcrypt.hash(user.password, 10),
                created_at: new Date()
            }))
        );

        // Insert users
        const insertedUsers = await User.insertMany(usersWithHashedPasswords);

        res.status(201).json({
            success: true,
            message: "Bulk upload completed successfully",
            insertedCount: insertedUsers.length,
            skippedCount: users.length - insertedUsers.length,
            insertedUsers: insertedUsers.map(u => ({
                _id: u._id,
                email: u.email,
                usn: u.usn,
                username: u.username,
                fullname: u.fullname,
                branch: u.branch,
                yop: u.yop,
                collegename: u.collegename
            }))
        });

    } catch (error) {
        console.error("Bulk upload error:", error);
        res.status(500).json({
            success: false,
            message: "Server error during bulk upload",
            error: error.message
        });
    }
};