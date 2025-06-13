const mongoose = require("mongoose");

const userAnswerSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Question" },
    selectedOption: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
}, { timestamps: true });

module.exports = mongoose.model("UserAnswer", userAnswerSchema);
