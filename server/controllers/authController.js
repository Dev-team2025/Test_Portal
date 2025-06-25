// server/controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Auth functions
exports.register = async (req, res) => {
    const { username, fullname, usn, branch, yop, email, password, user_type } = req.body;

    if (!username || !fullname || !usn || !branch || !yop || !email || !password) {
        return res.status(400).json({ message: "❌ All fields are required" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "❌ User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            fullname,
            usn,
            branch,
            yop,
            email,
            password: hashedPassword,
            user_type: user_type || 'user'
        });

        const savedUser = await newUser.save();
        res.status(201).json({ message: "✅ User registered successfully", user: savedUser });
    } catch (err) {
        res.status(500).json({ message: "❌ Registration failed", error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "❌ All fields are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "❌ Invalid credentials" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: "❌ Invalid credentials" });

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                userType: user.user_type || 'user'
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            token,
            userId: user._id,
            username: user.username,
            email: user.email,
            userType: user.user_type || 'user'
        });
    } catch (err) {
        res.status(500).json({ message: "❌ Login failed", error: err.message });
    }
};
//verify admin
exports.verifyAdmin = async (req, res, next) => {
    try {
        if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (user.user_type !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        next();
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};
//verify tokens 
exports.verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};
// User management functions
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -__v');
        res.status(200).json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch users", error: err.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -__v');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch user", error: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { password, ...updateData } = req.body;

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password -__v');

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: "User updated successfully", data: updatedUser });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to update user", error: err.message });
    }
};



exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to delete user", error: err.message });
    }
};
exports.bulkUploadUsers = async (req, res) => {
    try {
        const users = req.body.users;

        if (!Array.isArray(users) || users.length === 0) {
            return res.status(400).json({ message: "No user data provided" });
        }

        // Step 1: Extract all emails from the incoming data
        const emails = users.map(user => user.email);

        // Step 2: Find existing users with these emails
        const existingUsers = await User.find({ email: { $in: emails } }).select("email");
        const existingEmailSet = new Set(existingUsers.map(user => user.email));

        // Step 3: Filter out users whose email already exists
        const newUsers = users.filter(user => !existingEmailSet.has(user.email));

        if (newUsers.length === 0) {
            return res.status(409).json({ message: "All users already exist" });
        }

        // Step 4: Hash passwords and format new users
        const formattedUsers = await Promise.all(
            newUsers.map(async (user) => {
                const hashedPassword = await bcrypt.hash(user.password || "default123", 10);
                return {
                    username: user.username || user.email,
                    fullname: user.fullname,
                    usn: user.usn,
                    branch: user.branch,
                    yop: user.yop,
                    email: user.email,
                    password: hashedPassword,
                    user_type: user.user_type || "user",
                };
            })
        );

        // Step 5: Insert only the filtered new users
        const insertedUsers = await User.insertMany(formattedUsers);

        res.status(201).json({
            message: "✅ Users uploaded successfully",
            insertedCount: insertedUsers.length,
            skippedCount: users.length - newUsers.length,
            skippedEmails: [...existingEmailSet],
            insertedUsers,
        });
    } catch (err) {
        console.error("❌ Bulk upload error:", err);
        res.status(500).json({ message: "❌ Failed to upload users", error: err.message });
    }
};

