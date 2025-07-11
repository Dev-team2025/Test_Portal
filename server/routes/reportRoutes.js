const express = require('express');
const router = express.Router();
const resultController = require('../controllers/reportController');

router.get('/all', resultController.getAllAnswers); // GET /api/result/all

module.exports = router;
