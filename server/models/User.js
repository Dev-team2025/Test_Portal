const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    fullname: { type: String, required: true },
    usn: { type: String, required: true, unique: true },
    branch: { type: String, enum: ['MCA', 'BCA', 'BSC', 'ENGINEERING'], required: true },
    yop: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    user_type: { type: String, default: "user" },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
