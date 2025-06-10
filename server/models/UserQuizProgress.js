// models/UserQuizProgress.js
const mongoose = require("mongoose");

const userQuizProgressSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    lastOffset: { type: Number, default: 0 }
});

module.exports = mongoose.model("UserQuizProgress", userQuizProgressSchema);
