const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    set: Number,
    question: { type: String, required: true },
    options: {
        a: { type: String, required: true },
        b: { type: String, required: true },
        c: { type: String, required: true },
        d: { type: String, required: true }
    },
    correctOption: { type: String, required: true },
    explanation: { type: String, required: false }  // 👈 make it optional
});

module.exports = mongoose.model("Question", questionSchema);
