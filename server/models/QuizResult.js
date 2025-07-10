const mongoose = require('mongoose');
const { Schema } = mongoose;

const quizResultSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    setNumber: { type: String, required: true },
    totalMarks: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizResult', quizResultSchema);
