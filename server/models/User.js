const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    fullname: { type: String, required: true },
    usn: { type: String, unique: true, sparse: true },
    branch: { type: String, enum: ['MCA', 'BCA', 'BSC', 'ENGINEERING'] },
    yop: { type: Number },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    user_type: { type: String, enum: ['admin', 'student'], default: "student" },
    collegename: { type: String },
    created_at: { type: Date, default: Date.now },
    isFirstLogin: { type: Boolean, default: true },
    last_login: { type: Date },
    isActive: { type: Boolean, default: true }
}, {
    validateBeforeSave: false
});

module.exports = mongoose.model("User", userSchema);
