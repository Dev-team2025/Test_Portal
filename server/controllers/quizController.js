const Question = require("../models/Quiz");
const UserQuizProgress = require("../models/UserQuizProgress");
const moment = require('moment');
const UserAnswer = require('../models/UserAnswer')

// Configuration
const QUESTIONS_PER_WEEK = 20;
const TOTAL_QUESTIONS = 1926;

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
        const Question = require("../models/Quiz");
        const UserQuizProgress = require("../models/UserQuizProgress");
        const UserAnswer = require("../models/UserAnswer");

        // Shuffle helper
        function shuffleArray(array) {
            const newArray = [...array];
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
            }
            return newArray;
        }

        // Get quiz questions by set number
        exports.getSetQuestions = async (req, res) => {
            try {
                const userId = req.query.userId;
                if (!userId) return res.status(400).json({ message: "Missing userId" });

                const progress = await UserQuizProgress.findOne({ userId }) || { completedSets: [] };
                const nextSet = (Math.max(...progress.completedSets, 0)) + 1;

                const questions = await Question.find({ set: nextSet });

                if (!questions.length) {
                    return res.status(404).json({ message: `No questions found for Set ${nextSet}` });
                }

                const shuffledQuestions = shuffleArray(questions);

                res.json({
                    set: nextSet,
                    totalQuestions: questions.length,
                    questions: shuffledQuestions
                });

            } catch (err) {
                console.error("Error fetching set questions:", err);
                res.status(500).json({ message: "Internal server error" });
            }
        };

        // Submit quiz answers
        exports.submitSetAnswers = async (req, res) => {
            try {
                const { userId, answers, set } = req.body;

                if (!userId || !answers || !set) {
                    return res.status(400).json({ message: "Missing userId, answers, or set" });
                }

                const questionIds = Object.keys(answers);
                const questions = await Question.find({ _id: { $in: questionIds } });

                let score = 0;
                const results = {};

                for (const question of questions) {
                    const selectedOption = answers[question._id];
                    const isCorrect = question.correct_answer === selectedOption;

                    if (isCorrect) score++;

                    results[question._id] = {
                        questionText: question.question_text,
                        selectedOption,
                        correctAnswer: question.correct_answer,
                        isCorrect,
                        explanation: question.ans_desc || ""
                    };

                    await UserAnswer.create({
                        userId,
                        questionId: question._id,
                        selectedOption,
                        isCorrect
                    });
                }

                await UserQuizProgress.findOneAndUpdate(
                    { userId },
                    {
                        $addToSet: { completedSets: set },
                        $inc: {
                            totalAttempts: 1,
                            totalCorrect: score,
                            [`setScores.${set}`]: score
                        },
                        $set: { lastAttempt: new Date() }
                    },
                    { upsert: true, new: true }
                );

                res.json({
                    success: true,
                    set,
                    score,
                    totalQuestions: questionIds.length,
                    results
                });

            } catch (err) {
                console.error("Error submitting set answers:", err);
                res.status(500).json({ message: "Server error while submitting answers" });
            }
        };

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
exports.submitQuiz = async (req, res) => {
    try {
        const { userId, answers } = req.body;

        if (!userId || !answers) {
            return res.status(400).json({ message: "Missing userId or answers" });
        }

        let score = 0;
        const results = {};

        // Save each answer and calculate score
        for (const [questionId, selectedOption] of Object.entries(answers)) {
            const question = await Question.findById(questionId);

            if (!question) continue;

            const isCorrect = question.correct_answer === selectedOption;

            if (isCorrect) score++;

            results[questionId] = {
                isCorrect,
                explanation: question.explanation || ""
            };

            await UserAnswer.create({
                userId,
                questionId,
                selectedOption,
                isCorrect
            });
        }

        res.status(200).json({
            message: "Quiz submitted successfully",
            score,
            results
        });

    } catch (error) {
        console.error("Error in quiz submission:", error);
        res.status(500).json({ message: "Server error during quiz submission" });
    }
};