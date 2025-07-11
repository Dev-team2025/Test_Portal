const Answer = require('../models/UserAnswer');
const User = require('../models/User');
const Question = require('../models/Questions');

exports.getAllAnswers = async (req, res) => {
    try {
        console.log("🔍 Fetching users...");
        const users = await User.find({}, '_id');
        const validUserIds = users.map(user => user._id);
        console.log("✅ Found users:", validUserIds.length);

        console.log("🔍 Fetching answers...");
        const answers = await Answer.find({ userId: { $in: validUserIds } })
            .populate({
                path: 'userId',
                model: 'User',
                select: 'fullname usn collegename branch email'
            })
            .populate({
                path: 'questionId',
                model: 'Questions', // this must match `mongoose.model("Question")`
                select: 'question options correctOption set type'
            })
            .sort({ timestamp: -1 });

        console.log("✅ Answers fetched:", answers.length);
        res.status(200).json({ success: true, answers });
    } catch (error) {
        console.error('❌ Error fetching complete results:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch results', error: error.message });
    }
};

