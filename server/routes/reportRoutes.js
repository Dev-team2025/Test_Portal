// routes/reportRoutes.js
const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// Get quiz report for multiple users
router.get("/quiz-report", reportController.getQuizReport);

// Get quiz results for a specific user
router.get("/user-results", reportController.getUserQuizResults);

module.exports = router;