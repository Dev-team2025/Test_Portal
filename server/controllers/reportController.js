const Answer = require('../models/UserAnswer');
const User = require('../models/User');
const Question = require('../models/Questions');
const QuizResult = require('../models/QuizResult');
const moment = require('moment');

exports.getAllAnswers = async (req, res) => {
    try {
        const now = moment();

        // Get current week's Monday at 00:00
        const currentWeekMonday = now.clone().startOf('isoWeek');

        // Get previous week's Monday at 00:00 (subtract 1 week from current week's Monday)
        const previousWeekMonday = currentWeekMonday.clone().subtract(1, 'week');

        // Get current week's Sunday at 12:00 PM
        const currentWeekSunday = currentWeekMonday.clone().add(6, 'days').hour(12).minute(0).second(0).millisecond(0);

        // Date range: Previous week Monday to Current week Sunday (14 days)
        // Previous week Monday 12:00 AM to Current week Sunday 12:00 PM
        const startOfWeek = previousWeekMonday; // Previous week Monday 00:00
        const endOfWeek = currentWeekSunday; // Current week Sunday 12:00 PM

        const users = await User.find({}, '_id');
        const validUserIds = users.map(user => user._id);

        // Filter answers by timestamp within the week period
        const answers = await Answer.find({
            userId: { $in: validUserIds },
            timestamp: {
                $gte: startOfWeek.toDate(),
                $lte: endOfWeek.toDate()
            }
        })
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

        // Get set numbers from filtered answers for quiz results filtering
        const setNumbers = [...new Set(answers.map(ans => ans.setNumber))];

        // Fetch quiz results for the same users and sets
        const quizResults = await QuizResult.find({
            userId: { $in: validUserIds },
            setNumber: { $in: setNumbers }
        });

        // Construct marksMap: { "userId_setNumber": totalMarks }
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
