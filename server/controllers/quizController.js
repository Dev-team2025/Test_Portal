const Question = require("../models/Quiz");
const UserQuizProgress = require("../models/UserQuizProgress");
const moment = require('moment');

// Configuration
const QUESTIONS_PER_WEEK = 50;
const TOTAL_QUESTIONS = 1000;

// Helper function to shuffle array
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Get questions for current week
exports.getQuestions = async (req, res) => {
    try {
        const userId = req.query.userId || "default_user";
        const currentWeek = moment().isoWeek();

        // Calculate question range for this week
        const startQuestion = ((currentWeek - 1) * QUESTIONS_PER_WEEK) % TOTAL_QUESTIONS;
        const endQuestion = startQuestion + QUESTIONS_PER_WEEK;
        const questionNumbers = Array.from(
            { length: QUESTIONS_PER_WEEK },
            (_, i) => (startQuestion + i) % TOTAL_QUESTIONS + 1
        );

        // Check if user has already completed this week
        const progress = await UserQuizProgress.findOne({ userId });
        if (progress && progress.completedWeeks.includes(currentWeek)) {
            return res.status(400).json({
                message: `You have already completed week ${currentWeek}'s quiz`
            });
        }

        // Get questions for this week
        const questions = await Question.find({
            question_number: { $in: questionNumbers }
        });

        // Shuffle questions for this user
        const shuffledQuestions = shuffleArray(questions);

        res.json({
            questions: shuffledQuestions,
            currentWeek,
            totalQuestions: QUESTIONS_PER_WEEK
        });
    } catch (err) {
        console.error("Error fetching questions:", err);
        res.status(500).json({ message: "Error fetching questions" });
    }
};

// Submit answers
exports.submitAnswers = async (req, res) => {
    try {
        const { userId, answers, currentWeek } = req.body;

        // Get all question IDs from the submitted answers
        const questionIds = Object.keys(answers);

        // Fetch all the questions that were answered
        const questions = await Question.find({
            _id: { $in: questionIds }
        });

        // Calculate score and prepare results
        let score = 0;
        const results = {};
        const questionMap = {};

        questions.forEach(q => {
            questionMap[q._id.toString()] = q;
            const selectedOption = answers[q._id];
            const isCorrect = q.correct_answer === selectedOption;

            if (isCorrect) score += 1;

            results[q._id] = {
                questionText: q.question_text,
                selectedOption,
                correctAnswer: q.correct_answer,
                isCorrect,
                explanation: q.ans_desc || "No explanation available"
            };
        });

        // Update user progress
        await UserQuizProgress.findOneAndUpdate(
            { userId },
            {
                $addToSet: { completedWeeks: currentWeek },
                $inc: {
                    totalAttempts: 1,
                    totalCorrect: score,
                    [`weeklyScores.${currentWeek}`]: score
                },
                $set: { lastAttempt: new Date() }
            },
            { upsert: true, new: true }
        );

        res.json({
            success: true,
            score,
            totalQuestions: questionIds.length,
            results,
            currentWeek
        });
    } catch (err) {
        console.error("Error submitting answers:", err);
        res.status(500).json({
            success: false,
            message: "Error submitting answers"
        });
    }
};

// Get user progress
exports.getUserProgress = async (req, res) => {
    try {
        const userId = req.query.userId;
        const progress = await UserQuizProgress.findOne({ userId });

        if (!progress) {
            return res.json({
                completedWeeks: [],
                totalAttempts: 0,
                totalCorrect: 0,
                weeklyScores: {}
            });
        }

        res.json({
            completedWeeks: progress.completedWeeks,
            totalAttempts: progress.totalAttempts,
            totalCorrect: progress.totalCorrect,
            weeklyScores: progress.weeklyScores || {}
        });
    } catch (err) {
        console.error("Error fetching user progress:", err);
        res.status(500).json({ message: "Error fetching progress" });
    }
};