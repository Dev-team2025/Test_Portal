const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.get("/quiz-report", reportController.getQuizReport);

module.exports = router;