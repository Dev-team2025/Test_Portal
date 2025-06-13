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
        default: "Non Technical",
    },
    topic: {
        type: String,
        default: "", // Optional
    },
    ans_desc: {
        type: String,
        default: "", // Optional
    },
    set: {
        type: Number, // You can change to Number if set is numeric
        required: true,
    },
}, {
    collection: "mcq_questions",
    timestamps: true,
});

module.exports = mongoose.model("Question", questionSchema);
