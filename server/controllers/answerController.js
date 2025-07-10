const mongoose = require('mongoose');
const Answer = require('../models/UserAnswer');
const Question = require('../models/Questions');
const QuizResult = require('../models/QuizResult');

exports.storeAnswers = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { answers, userId } = req.body;

        // Validate input
        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                error: 'Invalid answers format'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID'
            });
        }

        const setNumber = answers[0].setNumber;
        if (!setNumber) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                error: 'Set number is missing'
            });
        }

        // 🔒 Check if the user has already taken this quiz set
        const existingResult = await QuizResult.findOne({
            userId: userId,
            setNumber: setNumber
        }).session(session);

        if (existingResult) {
            await session.abortTransaction();
            return res.status(403).json({
                success: false,
                error: 'You have already attempted this quiz set'
            });
        }

        // ✅ Proceed with storing answers if not attempted before
        const questionIds = answers.map(a => a.questionId);
        const questions = await Question.find({ _id: { $in: questionIds } })
            .select('_id correctOption')
            .session(session);

        if (questions.length !== answers.length) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                error: 'Some questions not found'
            });
        }

        const answerDocs = answers.map(answer => {
            const question = questions.find(q => q._id.toString() === answer.questionId);
            if (!question) throw new Error(`Question not found: ${answer.questionId}`);

            const userAnswer = answer.selectedOption ? answer.selectedOption.toLowerCase() : null;
            const isCorrect = userAnswer === question.correctOption;

            return {
                userId: new mongoose.Types.ObjectId(userId),
                questionId: new mongoose.Types.ObjectId(answer.questionId),
                setNumber: setNumber,
                selectedOption: answer.selectedOption,
                isCorrect,
                marks: isCorrect ? 1 : 0
            };
        });

        const totalMarks = answerDocs.reduce((sum, ans) => sum + ans.marks, 0);
        const insertedAnswers = await Answer.insertMany(answerDocs, { session });

        const result = new QuizResult({
            userId: new mongoose.Types.ObjectId(userId),
            setNumber: setNumber,
            totalMarks,
            answers: insertedAnswers.map(a => a._id)
        });

        await result.save({ session });
        await session.commitTransaction();

        res.status(201).json({
            success: true,
            totalMarks,
            correctAnswers: totalMarks,
            totalQuestions: answers.length,
            answers: insertedAnswers
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error storing answers:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to store answers'
        });
    } finally {
        session.endSession();
    }
};

exports.getAllAnswers = async (req, res) => {
    try {
        const answers = await Answer.find().sort({ timestamp: -1 });
        res.json({ success: true, data: answers });
    } catch (error) {
        console.error('Error fetching all answers:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch answers'
        });
    }
};

exports.getAnswersBySet = async (req, res) => {
    try {
        const { setNumber } = req.params;
        const answers = await Answer.find({ setNumber }).sort({ timestamp: -1 });
        res.json({ success: true, data: answers });
    } catch (error) {
        console.error('Error fetching answers by set:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch answers by set'
        });
    }
};

exports.getUserAnswers = async (req, res) => {
    try {
        const { userId } = req.params;
        const answers = await Answer.find({ userId }).sort({ timestamp: -1 });
        res.json({ success: true, data: answers });
    } catch (error) {
        console.error('Error fetching answers by user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch answers by user'
        });
    }
};