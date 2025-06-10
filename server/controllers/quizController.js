// controllers/quizController.js
const Question = require("../models/Quiz");
const UserQuizProgress = require("../models/UserQuizProgress");

exports.getQuestions = async (req, res) => {
    try {
        const userId = req.query.userId || "default_user";
        const questionCount = 50;
        const totalQuestions = 1000;

        let progress = await UserQuizProgress.findOne({ userId });

        if (!progress) {
            progress = await UserQuizProgress.create({ userId, lastOffset: 0 });
        }

        let start = progress.lastOffset;
        let end = start + questionCount;

        if (end > totalQuestions) {
            start = 0;
            end = questionCount;
        }

        const questions = await Question.find({})
            .sort({ question_number: 1 })
            .skip(start)
            .limit(questionCount);

        await UserQuizProgress.updateOne({ userId }, { lastOffset: end });

        res.json({
            questions,
            isLastBatch: end >= totalQuestions
        });
    } catch (err) {
        console.error("Error fetching questions:", err);
        res.status(500).json({ message: "Error fetching questions" });
    }
};

exports.submitAnswers = async (req, res) => {
    try {
        const { userId, answers, topic } = req.body;

        // Get all question IDs from the submitted answers
        const questionIds = Object.keys(answers);

        // Fetch all the questions that were answered
        const questions = await Question.find({
            _id: { $in: questionIds }
        });

        // Create a map for quick lookup of questions by ID
        const questionMap = {};
        questions.forEach(q => {
            questionMap[q._id.toString()] = q;
        });

        // Calculate score and prepare detailed results
        let score = 0;
        const results = {};

        for (const [questionId, selectedOption] of Object.entries(answers)) {
            const question = questionMap[questionId];
            if (!question) continue;

            const isCorrect = question.correct_answer === selectedOption;
            if (isCorrect) {
                score += 1; // Each correct answer gives 1 mark
            }

            results[questionId] = {
                questionText: question.question_text,
                selectedOption,
                correctAnswer: question.correct_answer,
                isCorrect,
                explanation: question.ans_desc || "No explanation available"
            };
        }

        // Here you might want to save the results to the user's progress
        // For example:
        await UserQuizProgress.findOneAndUpdate(
            { userId },
            {
                $inc: { totalAttempts: 1, totalCorrect: score },
                $set: { lastAttempt: new Date() }
            },
            { upsert: true }
        );

        res.json({
            success: true,
            score,
            totalQuestions: questionIds.length,
            results
        });
    } catch (err) {
        console.error("Error submitting answers:", err);
        res.status(500).json({
            success: false,
            message: "Error submitting answers"
        });
    }
};
