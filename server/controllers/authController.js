const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.register = async (req, res) => {
    const { username, fullname, usn, branch, yop, email, password } = req.body;

    if (!username || !fullname || !usn || !branch || !yop || !email || !password) {
        return res.status(400).json({ message: "❌ All fields are required" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "❌ User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, fullname, usn, branch, yop, email, password: hashedPassword });
        const savedUser = await newUser.save();

        res.status(201).json({ message: "✅ User registered successfully", userId: savedUser._id });
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
// authController.js
exports.verifyToken = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ user });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
