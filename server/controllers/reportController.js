const Answer = require('../models/UserAnswer');
const User = require('../models/User');
const Question = require('../models/Questions');
const QuizResult = require('../models/QuizResult');

exports.getAllAnswers = async (req, res) => {
    try {
        const users = await User.find({}, '_id');
        const validUserIds = users.map(user => user._id);

        const answers = await Answer.find({ userId: { $in: validUserIds } })
            .populate({
                path: 'userId',
                model: 'User',
                select: 'fullname usn collegename branch email'
            })
            .populate({
                path: 'questionId',
                model: 'Questions',
                select: 'question options correctOption set type'
            })
            .sort({ timestamp: -1 });

        // ✅ Fetch total marks
        const quizResults = await QuizResult.find({ userId: { $in: validUserIds } });

        // ✅ Construct marksMap: { "userId_setNumber": totalMarks }
        const marksMap = {};
        quizResults.forEach(result => {
            const key = `${result.userId}_${result.setNumber}`;
            marksMap[key] = result.totalMarks;
        });

        res.status(200).json({ success: true, answers, marksMap });
    } catch (error) {
        console.error('❌ Error fetching results:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch results', error: error.message });
    }
};
