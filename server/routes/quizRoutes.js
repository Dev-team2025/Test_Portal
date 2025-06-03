const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");

router.get("/question-types", quizController.getQuestionTypes);
router.get("/questions", quizController.getQuestions);
router.post("/submit", quizController.submitQuiz);

module.exports = router;
