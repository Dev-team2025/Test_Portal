const Question = require("../models/Questions");
const cardGenerationService = require("../services/cardGenerationService");

/**
 * Get questions for a specific weekly card (1, 2, or 3)
 * This replaces the old set-based system with the new card-based system
 */
exports.getWeeklyQuestions = async (req, res) => {
    try {
        const cardNumber = parseInt(req.query.card);

        if (!cardNumber || ![1, 2, 3].includes(cardNumber)) {
            return res.status(400).json({
                error: "Invalid card number. Must be 1, 2, or 3"
            });
        }

        console.log(`Fetching questions for card ${cardNumber}`);

        // Get questions for the specified card
        const questions = await cardGenerationService.getCardQuestions(cardNumber);

        if (!questions || questions.length === 0) {
            console.warn(`⚠️ No questions found for card ${cardNumber}`);
            return res.status(404).json({
                error: "No questions available for this card",
                message: "Please contact the administrator"
            });
        }

        console.log(`✓ Found ${questions.length} questions for card ${cardNumber}`);

        res.json(questions);

    } catch (err) {
        console.error("Error fetching weekly questions:", err);
        res.status(500).json({
            error: "Error fetching questions",
            message: err.message
        });
    }
};

/**
 * Get all questions (admin only)
 */
exports.getAllQuestions = async (req, res) => {
    try {
        const questions = await Question.find().sort({ createdAt: -1 });
        res.json(questions);
    } catch (err) {
        console.error("Error fetching all questions:", err);
        res.status(500).json({
            error: "Error fetching questions",
            message: err.message
        });
    }
};

/**
 * Add a new question (admin only)
 */
exports.addQuestion = async (req, res) => {
    try {
        // Transform flat options to nested structure
        const questionData = {
            ...req.body,
            options: {
                a: req.body.option_a || req.body.options?.a,
                b: req.body.option_b || req.body.options?.b,
                c: req.body.option_c || req.body.options?.c,
                d: req.body.option_d || req.body.options?.d
            },
            type: req.body.type || "technical",
            difficulty: req.body.difficulty || "medium"
        };

        const newQ = new Question(questionData);
        await newQ.save();

        console.log(`✓ Question added successfully: ${newQ._id}`);
        res.status(201).json({
            message: "Question added successfully",
            data: newQ
        });
    } catch (err) {
        console.error("Error adding question:", err);
        res.status(400).json({
            error: "Validation failed",
            details: err.message
        });
    }
};

/**
 * Update a question (admin only)
 */
exports.updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        // Transform flat options to nested structure if provided
        const updateData = { ...req.body };

        if (req.body.option_a || req.body.option_b || req.body.option_c || req.body.option_d) {
            updateData.options = {
                a: req.body.option_a,
                b: req.body.option_b,
                c: req.body.option_c,
                d: req.body.option_d
            };
        }

        const updatedQuestion = await Question.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedQuestion) {
            return res.status(404).json({ error: "Question not found" });
        }

        console.log(`✓ Question updated successfully: ${id}`);
        res.json({
            message: "Question updated successfully",
            data: updatedQuestion
        });
    } catch (err) {
        console.error("Error updating question:", err);
        res.status(400).json({
            error: "Update failed",
            details: err.message
        });
    }
};

/**
 * Delete a question (admin only)
 */
exports.deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedQuestion = await Question.findByIdAndDelete(id);

        if (!deletedQuestion) {
            return res.status(404).json({ error: "Question not found" });
        }

        console.log(`✓ Question deleted successfully: ${id}`);
        res.status(200).json({
            message: "Question deleted successfully",
            data: deletedQuestion
        });
    } catch (err) {
        console.error("Error deleting question:", err);
        res.status(500).json({
            error: "Delete failed",
            details: err.message
        });
    }
};

/**
 * Get the current active weekly card info
 */
exports.getActiveCardInfo = async (req, res) => {
    try {
        const weeklyCard = await cardGenerationService.getActiveWeeklyCard();

        const cardInfo = {
            weekNumber: weeklyCard.weekNumber,
            year: weeklyCard.year,
            startDate: weeklyCard.startDate,
            endDate: weeklyCard.endDate,
            isActive: weeklyCard.isActive,
            cards: {
                card1: { count: weeklyCard.card1.length },
                card2: { count: weeklyCard.card2.length },
                card3: { count: weeklyCard.card3.length }
            }
        };

        res.json(cardInfo);
    } catch (err) {
        console.error("Error fetching active card info:", err);
        res.status(500).json({
            error: "Error fetching card information",
            message: err.message
        });
    }
};

/**
 * Manually generate weekly cards (admin only)
 * This allows admins to regenerate cards if needed
 */
exports.generateCards = async (req, res) => {
    try {
        const { weekNumber, year } = req.body;

        const weeklyCard = await cardGenerationService.generateWeeklyCards(
            weekNumber || null,
            year || null
        );

        console.log(`✓ Cards generated for Week ${weeklyCard.weekNumber}, Year ${weeklyCard.year}`);

        res.status(201).json({
            message: "Weekly cards generated successfully",
            data: {
                weekNumber: weeklyCard.weekNumber,
                year: weeklyCard.year,
                startDate: weeklyCard.startDate,
                endDate: weeklyCard.endDate,
                cardCounts: {
                    card1: weeklyCard.card1.length,
                    card2: weeklyCard.card2.length,
                    card3: weeklyCard.card3.length
                }
            }
        });
    } catch (err) {
        console.error("Error generating cards:", err);
        res.status(500).json({
            error: "Card generation failed",
            message: err.message
        });
    }
};

/**
 * Get question statistics (admin only)
 */
exports.getQuestionStats = async (req, res) => {
    try {
        const totalQuestions = await Question.countDocuments();
        const neverUsed = await Question.countDocuments({ lastUsedInWeek: null });
        const usedOnce = await Question.countDocuments({ usageCount: 1 });
        const usedMultiple = await Question.countDocuments({ usageCount: { $gt: 1 } });

        const byDifficulty = await Question.aggregate([
            { $group: { _id: "$difficulty", count: { $sum: 1 } } }
        ]);

        const byType = await Question.aggregate([
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);

        res.json({
            total: totalQuestions,
            usage: {
                neverUsed,
                usedOnce,
                usedMultiple
            },
            byDifficulty: byDifficulty.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
            byType: byType.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {})
        });
    } catch (err) {
        console.error("Error fetching question stats:", err);
        res.status(500).json({
            error: "Error fetching statistics",
            message: err.message
        });
    }
};
