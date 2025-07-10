// controllers/reportController.js
const mongoose = require('mongoose');
const UserAnswer = require("../models/UserAnswer");
const User = require("../models/User");
const Question = require("../models/Questions");
const QuizResult = require("../models/QuizResult");

exports.getQuizReport = async (req, res) => {
    try {
        const { quizSet, college, email } = req.query;

        // Validate input parameters
        if (!quizSet) {
            return res.status(400).json({
                success: false,
                message: "quizSet parameter is required"
            });
        }

        // Convert quizSet to number if it's numeric
        const quizSetNumber = isNaN(quizSet) ? quizSet : Number(quizSet);

        // Build the base query for users
        const userQuery = {};
        if (college) userQuery.college = new RegExp(college, 'i');
        if (email) userQuery.email = new RegExp(email, 'i');

        // Get all users matching the criteria
        const users = await User.find(userQuery).lean();

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No users found matching the criteria"
            });
        }

        // Get all questions for the quiz set
        const questions = await Question.find({ setNumber: quizSetNumber })
            .sort({ questionNumber: 1 })
            .lean();

        if (questions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No questions found for this quiz set"
            });
        }

        // Get all answers for these users and quiz set
        const answers = await UserAnswer.find({
            userId: { $in: users.map(u => u._id) },
            setNumber: quizSetNumber
        })
            .populate({
                path: "questionId",
                select: "questionText options correctOption questionNumber"
            })
            .lean();

        // Get all quiz results for these users and quiz set
        const quizResults = await QuizResult.find({
            userId: { $in: users.map(u => u._id) },
            setNumber: quizSetNumber
        }).lean();

        // Prepare response
        const response = users.map(user => {
            const userAnswers = answers.filter(a => a.userId.toString() === user._id.toString());
            const userQuizResult = quizResults.find(r => r.userId.toString() === user._id.toString());
            const correctAnswers = userAnswers.filter(a => a.isCorrect).length;
            const totalMarks = userAnswers.reduce((sum, a) => sum + (a.marks || 0), 0);

            return {
                userId: user._id,
                fullname: user.fullname,
                email: user.email,
                college: user.college,
                usn: user.usn,
                branch: user.branch,
                yop: user.yop,
                answers: questions.map(question => {
                    const answer = userAnswers.find(a =>
                        a.questionId && a.questionId._id.toString() === question._id.toString()
                    );

                    return {
                        questionId: question._id,
                        questionNumber: question.questionNumber,
                        questionText: question.questionText,
                        selectedOption: answer ? answer.selectedOption : 'N/A',
                        isCorrect: answer ? answer.isCorrect : false,
                        marks: answer ? answer.marks : 0
                    };
                }),
                totalScore: correctAnswers,
                totalMarks: userQuizResult ? userQuizResult.totalMarks : totalMarks,
                percentage: questions.length > 0
                    ? ((correctAnswers / questions.length) * 100).toFixed(2)
                    : 0,
                submissionDate: userQuizResult ? userQuizResult.timestamp : null
            };
        });

        res.status(200).json(response);
    } catch (err) {
        console.error("Error fetching quiz report:", err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};

// Keep your existing getUserQuizResults method
exports.getUserQuizResults = async (req, res) => {
    // ... (your existing implementation)
};