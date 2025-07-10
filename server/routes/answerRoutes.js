const router = require('express').Router(); // ✅ Fix: define router
const answerController = require('../controllers/answerController');
const QuizResult = require('../models/QuizResult');

// Store quiz answers
router.post('/store', answerController.storeAnswers);

// Get all answers
router.get('/all', answerController.getAllAnswers);

// Get answers by set number
router.get('/set/:setNumber', answerController.getAnswersBySet);

// Get answers by user
router.get('/user/:userId', answerController.getUserAnswers);

// ✅ Get quiz result by userId
router.get('/result/:userId', async (req, res) => {
    try {
        const results = await QuizResult.find({ userId: req.params.userId }).sort({ timestamp: -1 });
        res.json(results);
    } catch (error) {
        console.error("Error fetching quiz result:", error);
        res.status(500).json({ error: 'Failed to fetch quiz results' });
    }
});

module.exports = router;
