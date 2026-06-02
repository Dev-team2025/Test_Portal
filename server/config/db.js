const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("? Connected to MongoDB!");
        await seedDefaultUsers();
    } catch (err) {
        console.error("? MongoDB connection failed:", err.message);
        process.exit(1);
    }
};

const seedDefaultUsers = async () => {
    const User = require("../models/User");

    const defaults = [
        {
            username: "dlithe",
            fullname: "dlithe",
            email: "dlithe@gmail.com",
            password: "dlithe@123",
            user_type: "admin",
            usn: "ADMIN000001",
            branch: "MCA",
            yop: 2025,
            collegename: "Dlithe",
            isFirstLogin: false,
            isActive: true
        },
        {
            username: "student1",
            fullname: "Test Student",
            usn: "1RV20MCA001",
            branch: "MCA",
            yop: 2025,
            email: "student@gmail.com",
            password: "student@123",
            user_type: "student",
            collegename: "Test Portal College",
            isFirstLogin: true,
            isActive: true
        }
    ];

    for (const userData of defaults) {
        const exists = await User.findOne({ username: userData.username });
        if (!exists) {
            const hashed = await bcrypt.hash(userData.password, 10);
            await User.create({ ...userData, password: hashed });
            console.log(`? Default user created: ${userData.username} (${userData.user_type})`);
        }
    }
};

module.exports = connectDB;
