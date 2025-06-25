// models/WeeklyQuizSet.js
const mongoose = require("mongoose");

const weeklyQuizSetSchema = new mongoose.Schema({
    weekNumber: Number,
    year: Number,
    cards: {
        card1: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
        card2: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
        card3: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("WeeklyQuizSet", weeklyQuizSetSchema);
