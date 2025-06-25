const Answer = require('../models/UserAnswer');

// Store multiple answers
exports.storeAnswers = async (req, res) => {
    try {
        const { answers, userId } = req.body;

        // Validate input
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: 'Invalid answers format' });
        }

        // Create answer documents
        const answerDocs = answers.map(answer => ({
            userId,
            questionId: answer.questionId,
            setNumber: answer.setNumber,
            selectedOption: answer.selectedOption,
            isCorrect: answer.isCorrect
        }));

        // Insert all answers
        const savedAnswers = await Answer.insertMany(answerDocs);

        res.status(201).json({
            message: 'Answers stored successfully',
            count: savedAnswers.length
        });
    } catch (error) {
        console.error('Error storing answers:', error);
        res.status(500).json({ error: 'Failed to store answers' });
    }
};

// Get all answers
exports.getAllAnswers = async (req, res) => {
    try {
        const answers = await Answer.find().sort({ timestamp: -1 });
        res.json(answers);
    } catch (error) {
        console.error('Error fetching answers:', error);
        res.status(500).json({ error: 'Failed to fetch answers' });
    }
};

// Get answers by set number
exports.getAnswersBySet = async (req, res) => {
    try {
        const { setNumber } = req.params;
        const answers = await Answer.find({ setNumber }).sort({ timestamp: -1 });
        res.json(answers);
    } catch (error) {
        console.error('Error fetching answers by set:', error);
        res.status(500).json({ error: 'Failed to fetch answers' });
    }
};

// Get answers by user
exports.getUserAnswers = async (req, res) => {
    try {
        const { userId } = req.params;
        const answers = await Answer.find({ userId }).sort({ timestamp: -1 });
        res.json(answers);
    } catch (error) {
        console.error('Error fetching user answers:', error);
        res.status(500).json({ error: 'Failed to fetch answers' });
    }
};