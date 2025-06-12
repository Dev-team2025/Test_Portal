const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// Quiz routes
router.get('/questions', quizController.getQuestions);
router.post('/submit', quizController.submitAnswers);
router.get('/progress', quizController.getUserProgress);

module.exports = router;