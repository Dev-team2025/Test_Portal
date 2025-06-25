const express = require("express");
const router = express.Router();
const multer = require("multer");
const xlsx = require("xlsx");
const Question = require("../models/Questions");
const {
    getAllQuestions,
    addQuestion,
    deleteQuestion,
    getWeeklyQuestions,
} = require("../controllers/quizController");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", getAllQuestions);
router.post("/", addQuestion);
router.delete("/:id", deleteQuestion);
router.get("/weekly-questions", getWeeklyQuestions);

// ✅ Excel upload
router.post("/upload-excel", upload.single("file"), async (req, res) => {
    try {
        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        const questions = data.map(row => ({
            set: Number(row.set), // force to number
            question: row.question,
            options: {
                a: row.option_a,
                b: row.option_b,
                c: row.option_c,
                d: row.option_d,
            },
            correctOption: row.correctOption,
            explanation: row.explanation,
        }));

        await Question.insertMany(questions);
        res.status(200).json({ message: "Excel uploaded successfully" });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: "Upload failed", details: err.message });
    }
});

module.exports = router;
