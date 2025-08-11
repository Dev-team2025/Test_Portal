const Question = require("../models/Questions");
const getCurrentWeekSets = require("../utils/weekUtils").getCurrentWeekSets;

exports.getWeeklyQuestions = async (req, res) => {
    const card = req.query.card;
    if (!card || !["1", "2", "3"].includes(card)) {
        return res.status(400).json({ error: "Invalid card number" });
    }

    const sets = getCurrentWeekSets();
    const setNumber = sets[parseInt(card) - 1];

    console.log("Weekly sets:", sets, "Selected set:", setNumber);

    try {
        const questions = await Question.find({ set: setNumber });
        if (questions.length === 0) {
            console.warn(`⚠️ No questions found for set ${setNumber}`);
        }
        res.json(questions);
    } catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({ error: "Error fetching questions" });
    }
};

exports.getAllQuestions = async (req, res) => {
    const questions = await Question.find();
    res.json(questions);
};

exports.addQuestion = async (req, res) => {
    try {
        // Transform flat options to nested structure
        const questionData = {
            ...req.body,
            options: {
                a: req.body.option_a,
                b: req.body.option_b,
                c: req.body.option_c,
                d: req.body.option_d
            },
            // Add default values for missing fields
            type: req.body.type || "technical",
            difficulty: req.body.difficulty || "medium"
        };

        const newQ = new Question(questionData);
        await newQ.save();
        res.status(201).json({ message: "Question added", data: newQ });
    } catch (err) {
        res.status(400).json({
            error: "Validation failed",
            details: err.message
        });
    }
};

exports.deleteQuestion = async (req, res) => {
    await Question.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Question deleted" });
};