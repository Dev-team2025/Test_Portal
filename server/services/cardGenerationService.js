const Question = require('../models/Questions');
const WeeklyCard = require('../models/WeeklyCard');
const moment = require('moment');
const logger = require('../utils/logger');

class CardGenerationService {
    /**
     * Generate 3 cards for a specific week with 40 unique questions each
     * @param {Number} weekNumber - Week number (1-52/53)
     * @param {Number} year - Year
     * @returns {Promise<Object>} - Generated weekly card
     */
    async generateWeeklyCards(weekNumber = null, year = null) {
        try {
            const currentMoment = moment();
            const targetWeek = weekNumber || currentMoment.isoWeek();
            const targetYear = year || currentMoment.year();

            logger.info(`Generating cards for Week ${targetWeek}, Year ${targetYear}`);

            // Check if cards already exist for this week
            const existingCard = await WeeklyCard.findOne({
                weekNumber: targetWeek,
                year: targetYear
            });

            if (existingCard) {
                logger.info(`Cards already exist for Week ${targetWeek}, Year ${targetYear}`);
                return existingCard;
            }

            // Calculate start and end dates (Sunday to Sunday)
            const startDate = moment().year(targetYear).isoWeek(targetWeek).startOf('isoWeek').subtract(1, 'day'); // Sunday
            const endDate = moment(startDate).add(6, 'days').endOf('day'); // Next Saturday 11:59 PM

            // Get 120 unique questions (40 per card)
            const selectedQuestions = await this.selectUniqueQuestions(120, targetWeek, targetYear);

            if (selectedQuestions.length < 120) {
                throw new Error(`Not enough questions available. Found ${selectedQuestions.length}, need 120`);
            }

            // Split into 3 cards of 40 questions each
            const card1Questions = selectedQuestions.slice(0, 40).map(q => q._id);
            const card2Questions = selectedQuestions.slice(40, 80).map(q => q._id);
            const card3Questions = selectedQuestions.slice(80, 120).map(q => q._id);

            // Create the weekly card document
            const weeklyCard = new WeeklyCard({
                weekNumber: targetWeek,
                year: targetYear,
                card1: card1Questions,
                card2: card2Questions,
                card3: card3Questions,
                startDate: startDate.toDate(),
                endDate: endDate.toDate(),
                isActive: true
            });

            await weeklyCard.save();

            // Update question usage tracking
            await this.updateQuestionUsage(selectedQuestions, targetWeek, targetYear);

            logger.info(`Successfully generated cards for Week ${targetWeek}, Year ${targetYear}`);
            logger.info(`Card 1: ${card1Questions.length} questions`);
            logger.info(`Card 2: ${card2Questions.length} questions`);
            logger.info(`Card 3: ${card3Questions.length} questions`);

            return weeklyCard;

        } catch (error) {
            logger.error('Error generating weekly cards:', error);
            throw error;
        }
    }

    /**
     * Select unique questions that haven't been used recently
     * Prioritizes questions that have never been used or were used longest ago
     * @param {Number} count - Number of questions to select
     * @param {Number} currentWeek - Current week number
     * @param {Number} currentYear - Current year
     * @returns {Promise<Array>} - Array of selected questions
     */
    async selectUniqueQuestions(count, currentWeek, currentYear) {
        try {
            // Total questions in database
            const totalQuestions = await Question.countDocuments();
            logger.info(`Total questions available: ${totalQuestions}`);

            if (totalQuestions < count) {
                throw new Error(`Not enough questions in database. Have ${totalQuestions}, need ${count}`);
            }

            // Strategy: Select questions with the following priority:
            // 1. Questions never used (lastUsedInWeek === null)
            // 2. Questions not used in the last 4 weeks
            // 3. Questions used least recently

            const fourWeeksAgo = currentWeek - 4;

            // Get questions sorted by usage priority
            const questions = await Question.aggregate([
                {
                    $addFields: {
                        // Calculate priority score (higher is better)
                        priority: {
                            $cond: [
                                { $eq: ['$lastUsedInWeek', null] }, // Never used
                                3,
                                {
                                    $cond: [
                                        {
                                            $or: [
                                                { $ne: ['$lastUsedInYear', currentYear] }, // Different year
                                                { $lte: ['$lastUsedInWeek', fourWeeksAgo] } // More than 4 weeks ago
                                            ]
                                        },
                                        2,
                                        1
                                    ]
                                }
                            ]
                        }
                    }
                },
                {
                    $sort: {
                        priority: -1,        // Higher priority first
                        usageCount: 1,       // Less used first
                        lastUsedInWeek: 1    // Older usage first
                    }
                },
                {
                    $limit: count
                }
            ]);

            logger.info(`Selected ${questions.length} questions for the week`);
            logger.info(`Never used: ${questions.filter(q => q.lastUsedInWeek === null).length}`);
            logger.info(`Previously used: ${questions.filter(q => q.lastUsedInWeek !== null).length}`);

            return questions;

        } catch (error) {
            logger.error('Error selecting unique questions:', error);
            throw error;
        }
    }

    /**
     * Update the usage tracking for selected questions
     * @param {Array} questions - Array of question documents
     * @param {Number} weekNumber - Current week number
     * @param {Number} year - Current year
     */
    async updateQuestionUsage(questions, weekNumber, year) {
        try {
            const questionIds = questions.map(q => q._id);

            await Question.updateMany(
                { _id: { $in: questionIds } },
                {
                    $set: {
                        lastUsedInWeek: weekNumber,
                        lastUsedInYear: year
                    },
                    $inc: {
                        usageCount: 1
                    }
                }
            );

            logger.info(`Updated usage tracking for ${questionIds.length} questions`);

        } catch (error) {
            logger.error('Error updating question usage:', error);
            throw error;
        }
    }

    /**
     * Get the active weekly card for the current week
     * @returns {Promise<Object>} - Active weekly card
     */
    async getActiveWeeklyCard() {
        try {
            const currentMoment = moment();
            const currentWeek = currentMoment.isoWeek();
            const currentYear = currentMoment.year();

            let weeklyCard = await WeeklyCard.findOne({
                weekNumber: currentWeek,
                year: currentYear,
                isActive: true
            })
                .populate('card1')
                .populate('card2')
                .populate('card3');

            // If no card exists, generate one
            if (!weeklyCard) {
                logger.info(`No active card found for Week ${currentWeek}, generating new cards...`);
                weeklyCard = await this.generateWeeklyCards(currentWeek, currentYear);

                // Populate after creation
                weeklyCard = await WeeklyCard.findById(weeklyCard._id)
                    .populate('card1')
                    .populate('card2')
                    .populate('card3');
            }

            return weeklyCard;

        } catch (error) {
            logger.error('Error getting active weekly card:', error);
            throw error;
        }
    }

    /**
     * Get questions for a specific card (1, 2, or 3)
     * @param {Number} cardNumber - Card number (1, 2, or 3)
     * @returns {Promise<Array>} - Array of questions
     */
    async getCardQuestions(cardNumber) {
        try {
            if (![1, 2, 3].includes(cardNumber)) {
                throw new Error('Invalid card number. Must be 1, 2, or 3');
            }

            const weeklyCard = await this.getActiveWeeklyCard();
            const cardKey = `card${cardNumber}`;

            // Return the populated questions
            return weeklyCard[cardKey] || [];

        } catch (error) {
            logger.error(`Error getting card ${cardNumber} questions:`, error);
            throw error;
        }
    }

    /**
     * Deactivate old weekly cards (older than current week)
     */
    async deactivateOldCards() {
        try {
            const currentMoment = moment();
            const currentDate = currentMoment.toDate();

            const result = await WeeklyCard.updateMany(
                {
                    endDate: { $lt: currentDate },
                    isActive: true
                },
                {
                    $set: { isActive: false }
                }
            );

            logger.info(`Deactivated ${result.modifiedCount} old weekly cards`);
            return result;

        } catch (error) {
            logger.error('Error deactivating old cards:', error);
            throw error;
        }
    }
}

module.exports = new CardGenerationService();
