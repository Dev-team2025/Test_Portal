const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    question_number: {
        type: Number,
        required: true,
        unique: true,
    },
    question_text: {
        type: String,
        required: true,
    },
    option_a: {
        type: String,
        required: true,
    },
    option_b: {
        type: String,
        required: true,
    },
    option_c: {
        type: String,
        required: true,
    },
    option_d: {
        type: String,
        required: true,
    },
    correct_answer: {
        type: String,
        required: true,
        enum: ["A", "B", "C", "D"],
    },
    question_type: {
        type: String,
        default: "MCQ",
    },
    topic: {
        type: String,
        required: true,
    },
    ans_desc: {
        type: String,
    },
}, {
    collection: "non_technical_questions1",
    timestamps: true, // adds createdAt and updatedAt
});

module.exports = mongoose.model("Question", questionSchema);
