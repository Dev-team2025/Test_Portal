const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    fullname: { type: String, required: true },
    usn: { type: String, required: true, unique: true },
    branch: { type: String, enum: ['MCA', 'BCA', 'BSC', 'ENGINEERING'], required: true },
    yop: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    user_type: { type: String, enum: ['admin', 'student'], default: "student" },
    collegename: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    isFirstLogin: { type: Boolean, default: true },
    last_login: { type: Date },
    isActive: { type: Boolean, default: true }
}, { validateBeforeSave: false });

const User = mongoose.model("User", userSchema);

const users = [
    {
        username: "admin",
        fullname: "Admin User",
        usn: "ADMIN001",
        branch: "MCA",
        yop: 2025,
        email: "admin@testportal.com",
        password: "Admin@123",
        user_type: "admin",
        collegename: "Test Portal College",
        isFirstLogin: false,
        isActive: true
    },
    {
        username: "student1",
        fullname: "Test Student",
        usn: "STU001",
        branch: "MCA",
        yop: 2025,
        email: "student@testportal.com",
        password: "Student@123",
        user_type: "student",
        collegename: "Test Portal College",
        isFirstLogin: true,
        isActive: true
    }
];

async function seedUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        for (const userData of users) {
            const exists = await User.findOne({ username: userData.username });
            if (exists) {
                console.log(`⚠️  User '${userData.username}' already exists, skipping...`);
                continue;
            }
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            await User.create({ ...userData, password: hashedPassword });
            console.log(`✅ Created user: ${userData.username} (${userData.user_type})`);
            console.log(`   Email   : ${userData.email}`);
            console.log(`   Password: ${userData.password}`);
        }

        console.log("\n🎉 Seeding complete!");
    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}

seedUsers();
