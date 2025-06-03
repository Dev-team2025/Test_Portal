const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.register = async (req, res) => {
    const { username, fullname, usn, branch, yop, email, password } = req.body;

    if (!username || !fullname || !usn || !branch || !yop || !email || !password) {
        return res.status(400).json({ message: "❌ All fields are required" });
    }

    User.findByEmail(email, async (err, results) => {
        if (err) return res.status(500).json({ message: "❌ Database error" });
        if (results.length > 0) {
            return res.status(400).json({ message: "❌ User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        User.create(username, fullname, usn, branch, yop, email, hashedPassword, (err, result) => {
            if (err) return res.status(500).json({ message: "❌ Registration failed" });
            res.status(201).json({ message: "✅ User registered successfully", userId: result.insertId });
        });
    });
};

exports.login = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "❌ All fields are required" });
    }

    User.findByEmail(email, async (err, results) => {
        if (err) return res.status(500).json({ message: "❌ Database error" });
        if (results.length === 0) {
            return res.status(401).json({ message: "❌ Invalid credentials" });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: "❌ Invalid credentials" });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                userType: user.user_type || 'user'
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            token,
            userId: user.id,
            username: user.username,
            email: user.email,
            userType: user.user_type || 'user'
        });
    });
};