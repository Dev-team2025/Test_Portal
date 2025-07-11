const mongoose = require('mongoose');
const { Schema } = mongoose;

const quizResultSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    setNumber: { type: Number, required: true }, // ✅ updated to Number
    totalMarks: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizResult', quizResultSchema);
