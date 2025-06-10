// routes/quizRoutes.js
const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");

// ✅ Attach route handlers
router.get("/questions", quizController.getQuestions);
router.post("/submit", quizController.submitAnswers);

// ✅ EXPORT the router
module.exports = router;
