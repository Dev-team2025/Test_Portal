const mongoose = require('mongoose');
const { Schema } = mongoose;

const answerSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    setNumber: { type: String, required: true },
    selectedOption: { type: String, required: false }, // allow null for unanswered
    isCorrect: { type: Boolean, required: true },
    marks: { type: Number, default: 0 }, // <-- NEW FIELD
    timestamp: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Answer', answerSchema);
