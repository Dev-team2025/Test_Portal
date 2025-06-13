const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    completedSets: { type: [Number], default: [] },
    totalAttempts: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    setScores: { type: Map, of: Number, default: {} },
    lastAttempt: { type: Date }
});

module.exports = mongoose.model("UserQuizProgress", userProgressSchema);
