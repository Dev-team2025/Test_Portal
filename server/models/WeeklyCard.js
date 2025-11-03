const mongoose = require("mongoose");

const weeklyCardSchema = new mongoose.Schema({
    weekNumber: {
        type: Number,
        required: true,
        min: 1,
        max: 53
    },
    year: {
        type: Number,
        required: true
    },
    // Each card contains 40 question IDs
    card1: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Questions"
    }],
    card2: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Questions"
    }],
    card3: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Questions"
    }],
    // Track when cards are active (Sunday to Sunday)
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for quick lookups
weeklyCardSchema.index({ weekNumber: 1, year: 1 });
weeklyCardSchema.index({ isActive: 1 });
weeklyCardSchema.index({ startDate: 1, endDate: 1 });

// Compound unique index to prevent duplicate week/year combinations
weeklyCardSchema.index({ weekNumber: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("WeeklyCard", weeklyCardSchema);
