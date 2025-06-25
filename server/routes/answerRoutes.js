const express = require('express');
const router = express.Router();
const answerController = require('../controllers/answerController');

// Store quiz answers
router.post('/store', answerController.storeAnswers);

// Get all answers
router.get('/all', answerController.getAllAnswers);

// Get answers by set number
router.get('/set/:setNumber', answerController.getAnswersBySet);

// Get answers by user
router.get('/user/:userId', answerController.getUserAnswers);

module.exports = router;