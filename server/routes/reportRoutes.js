const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.get("/user-answers", reportController.getUserAnswersReport);

module.exports = router;
