const UserAnswer = require("../models/UserAnswer");
const User = require("../models/User");
const Question = require("../models/Questions");

exports.getQuizReport = async (req, res) => {
    try {
        const { quizSet, college, email } = req.query;

        if (!quizSet) {
            return res.status(400).json({ error: "Quiz set parameter is required" });
        }

        // Build user filter
        const userFilter = {};
        if (college) userFilter.college = new RegExp(college, 'i');
        if (email) userFilter.email = new RegExp(email, 'i');

        // Get all questions for this quiz set first
        const questions = await Question.find({ setNumber: quizSet })
            .sort({ questionNumber: 1 })
            .lean();

        // Get all answers for the selected quiz set with question details
        const answers = await UserAnswer.find({ setNumber: quizSet })
            .populate({
                path: "questionId",
                select: "questionText options correctOption"
            })
            .lean();

        // Group answers by user and include complete question details
        const userAnswersMap = {};
        answers.forEach(answer => {
            if (!userAnswersMap[answer.userId]) {
                userAnswersMap[answer.userId] = [];
            }

            const question = questions.find(q => q._id.toString() === answer.questionId._id.toString());
            const userAnswer = {
                questionId: answer.questionId._id,
                questionText: answer.questionId.questionText,
                options: answer.questionId.options, // Include all options
                correctOption: answer.questionId.correctOption,
                selectedOption: answer.selectedOption,
                isCorrect: answer.isCorrect,
                selectedOptionText: answer.questionId.options[answer.selectedOption] // Get the actual text of selected option
            };

            userAnswersMap[answer.userId].push(userAnswer);
        });

        // Get user details and prepare report
        const reportData = [];
        const users = await User.find(userFilter)
            .where('_id').in(Object.keys(userAnswersMap))
            .lean();

        for (const user of users) {
            const userAnswers = userAnswersMap[user._id.toString()] || [];

            // Sort answers to match question order and include all questions
            const sortedAnswers = questions.map(question => {
                const answer = userAnswers.find(a => a.questionId.toString() === question._id.toString());
                return answer || {
                    questionId: question._id,
                    questionText: question.questionText,
                    options: question.options,
                    correctOption: question.correctOption,
                    selectedOption: 'N/A',
                    selectedOptionText: 'Not Attempted',
                    isCorrect: false
                };
            });

            reportData.push({
                userId: user._id,
                fullname: user.fullname,
                email: user.email,
                college: user.college,
                usn: user.usn,
                branch: user.branch,
                yop: user.yop,
                answers: sortedAnswers,
                questions: questions
            });
        }

        res.json(reportData);
    } catch (err) {
        console.error("Error generating quiz report:", err);
        res.status(500).json({
            error: "Internal Server Error",
            message: err.message
        });
    }
};