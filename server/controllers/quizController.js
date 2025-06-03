const db = require("../config/db");

exports.getQuestions = (req, res) => {
    const { question_type } = req.query;

    let query;
    const queryParams = [];

    if (question_type && question_type !== 'all') {
        query = `
            SELECT question_id, question_text, option_a, option_b, option_c, option_d, 
                   correct_answer, question_type, topic, ans_desc
            FROM non_technical_questions
            WHERE question_type = ?
            LIMIT 50
        `;
        queryParams.push(question_type);
    } else {
        query = `
            SELECT question_id, question_text, option_a, option_b, option_c, option_d, 
                   correct_answer, question_type, topic, ans_desc
            FROM non_technical_questions
            LIMIT 50
        `;
    }

    db.query(query, queryParams, (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching questions" });

        res.json({
            questions: results,
            question_type: question_type || 'all',
            isLastBatch: results.length < 50
        });
    });
};

exports.submitQuiz = (req, res) => {
    const { userId, answers, question_type } = req.body;
    const questionIds = Object.keys(answers);

    if (questionIds.length === 0) {
        return res.status(400).json({ message: "No answers provided" });
    }

    let query;
    const queryParams = [questionIds];

    if (question_type && question_type !== 'all') {
        query = `
            SELECT question_id, correct_answer, ans_desc 
            FROM non_technical_questions
            WHERE question_id IN (?) AND question_type = ?
        `;
        queryParams.push(question_type);
    } else {
        query = `
            SELECT question_id, correct_answer, ans_desc 
            FROM non_technical_questions
            WHERE question_id IN (?)
        `;
    }

    db.query(query, queryParams, (err, correctAnswers) => {
        if (err) return res.status(500).json({ message: "Error calculating score" });

        let score = 0;
        const results = {};

        correctAnswers.forEach(item => {
            const isCorrect = answers[item.question_id] === item.correct_answer;
            if (isCorrect) score++;
            results[item.question_id] = {
                isCorrect,
                correctAnswer: item.correct_answer,
                explanation: item.ans_desc
            };
        });

        res.json({
            score,
            total: questionIds.length,
            results,
            question_type
        });
    });
};

// ✅ New endpoint to fetch distinct question types
exports.getQuestionTypes = (req, res) => {
    const query = `
        SELECT DISTINCT question_type 
        FROM non_technical_questions
        WHERE question_type IS NOT NULL AND question_type != ''
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching question types:", err);
            return res.status(500).json({ message: "Error fetching question types" });
        }

        console.log("Fetched question types:", results);
        const types = results.map(r => r.question_type);
        res.json({
            questionTypes: ['all', ...types],
            status: "success"
        });
    });
};
