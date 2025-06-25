const UserAnswer = require("../models/UserAnswer");

exports.getUserAnswersReport = async (req, res) => {
    try {
        const answers = await UserAnswer.find()
            .populate("userId", "fullname username usn branch yop email college created_at") // Include required user fields
            .populate("questionId") // question data
            .lean();

        const userMap = {};

        for (const ans of answers) {
            const userId = ans.userId._id;

            if (!userMap[userId]) {
                userMap[userId] = {
                    userDetails: ans.userId,
                    answers: []
                };
            }

            userMap[userId].answers.push({
                question: ans.questionId?.question || "Question Deleted",
                selectedOption: ans.selectedOption,
                correctOption: ans.questionId?.correctOption || "N/A",
                isCorrect: ans.isCorrect
            });
        }

        res.json(Object.values(userMap));
    } catch (err) {
        console.error("Error generating report:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
