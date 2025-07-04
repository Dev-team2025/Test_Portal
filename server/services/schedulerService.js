const cron = require('node-cron');
const Answer = require('../models/UserAnswer');
const logger = require('../utils/logger');

class SchedulerService {
    constructor() {
        this.initializeSchedulers();
    }

    initializeSchedulers() {
        // Schedule weekly cleanup every Monday at 10 PM
        cron.schedule('0 22 * * 1', this.cleanupPreviousWeekAnswers.bind(this), {
            scheduled: true,
            timezone: "Asia/Kolkata"
        });

        logger.info('Scheduled tasks initialized');
    }

    async cleanupPreviousWeekAnswers() {
        try {
            const now = new Date();
            const today = new Date(now.setHours(0, 0, 0, 0));
            const dayOfWeek = today.getDay();

            const prevWeekMonday = new Date(today);
            prevWeekMonday.setDate(today.getDate() - dayOfWeek - 7);

            const prevWeekSunday = new Date(prevWeekMonday);
            prevWeekSunday.setDate(prevWeekMonday.getDate() + 6);
            prevWeekSunday.setHours(23, 59, 59, 999);

            const session = await Answer.startSession();
            session.startTransaction();

            try {
                const result = await Answer.deleteMany({
                    timestamp: {
                        $gte: prevWeekMonday,
                        $lte: prevWeekSunday
                    }
                }).session(session);

                await session.commitTransaction();
                logger.info(`Deleted ${result.deletedCount} answers from ${prevWeekMonday.toDateString()} to ${prevWeekSunday.toDateString()}`);
            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }
        } catch (error) {
            logger.error('Failed to cleanup previous week answers:', error);
        }
    }
}

// Export the class directly instead of an instance
module.exports = SchedulerService;