const mongoose = require('mongoose');

const userQuizProgressSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    completedWeeks: {
        type: [Number],
        default: []
    },
    blockedTests: {
        type: [Number],  // Stores week numbers of blocked tests
        default: []
    },
    totalAttempts: {
        type: Number,
        default: 0
    },
    totalCorrect: {
        type: Number,
        default: 0
    },
    weeklyScores: {
        type: Map,
        of: Number,
        default: {}
    },
    lastAttempt: {
        type: Date
    }
});

module.exports = mongoose.model('UserQuizProgress', userQuizProgressSchema);