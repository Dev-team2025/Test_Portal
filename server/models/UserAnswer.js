const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    questionId: {
        type: String,
        required: true
    },
    setNumber: {
        type: String,
        required: true
    },
    selectedOption: {
        type: String,
        required: true
    },
    isCorrect: {
        type: Boolean,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Answer', answerSchema);