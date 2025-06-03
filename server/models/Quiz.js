const db = require('../config/db');

const getQuestionsBySetId = (setId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT id, question_text, option_a, option_b, option_c, option_d, correct_option
            FROM questions
            WHERE quiz_id = ?
        `;
        db.query(query, [setId], (err, results) => {
            if (err) reject(err);
            resolve(results);
        });
    });
};

module.exports = {
    getQuestionsBySetId,
};
