const mongoose = require('mongoose');
const WeeklyCard = require('./models/WeeklyCard');
const cardGenerationService = require('./services/cardGenerationService');
const moment = require('moment');
require('dotenv').config();

async function regenerateCurrentWeekCards() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✓ Connected to MongoDB');

        const currentMoment = moment();
        const currentWeek = currentMoment.isoWeek();
        const currentYear = currentMoment.year();

        console.log(`\nRegenerating cards for Week ${currentWeek}, Year ${currentYear}`);
        console.log(`Current date: ${currentMoment.format('YYYY-MM-DD HH:mm:ss')}`);
        console.log(`Day of week: ${currentMoment.day()} (0=Sunday, 1=Monday, etc.)`);

        // Delete existing card for this week
        const deleteResult = await WeeklyCard.deleteMany({
            weekNumber: currentWeek,
            year: currentYear
        });

        console.log(`✓ Deleted ${deleteResult.deletedCount} existing card(s)`);

        // Generate new cards
        console.log('\nGenerating new weekly cards...');
        const weeklyCard = await cardGenerationService.generateWeeklyCards(currentWeek, currentYear);

        console.log('\n✓ Cards generated successfully!');
        console.log(`  Week Number: ${weeklyCard.weekNumber}`);
        console.log(`  Year: ${weeklyCard.year}`);
        console.log(`  Start Date: ${moment(weeklyCard.startDate).format('YYYY-MM-DD HH:mm:ss')} (${moment(weeklyCard.startDate).format('dddd')})`);
        console.log(`  End Date: ${moment(weeklyCard.endDate).format('YYYY-MM-DD HH:mm:ss')} (${moment(weeklyCard.endDate).format('dddd')})`);
        console.log(`  Card 1: ${weeklyCard.card1.length} questions`);
        console.log(`  Card 2: ${weeklyCard.card2.length} questions`);
        console.log(`  Card 3: ${weeklyCard.card3.length} questions`);
        console.log(`  Is Active: ${weeklyCard.isActive}`);

        // Display when each card should be available
        console.log('\n📅 Card Availability Schedule:');
        const startOfWeek = moment(weeklyCard.startDate);
        const monday = moment(startOfWeek).add(1, 'day');
        const wednesday = moment(startOfWeek).add(3, 'days');
        const friday = moment(startOfWeek).add(5, 'days');
        const endOfWeek = moment(weeklyCard.endDate);

        console.log(`  Card 1 (Monday): Opens ${monday.format('MMM DD (ddd)')} - Closes ${endOfWeek.format('MMM DD (ddd) HH:mm')}`);
        console.log(`  Card 2 (Wednesday): Opens ${wednesday.format('MMM DD (ddd)')} - Closes ${endOfWeek.format('MMM DD (ddd) HH:mm')}`);
        console.log(`  Card 3 (Friday): Opens ${friday.format('MMM DD (ddd)')} - Closes ${endOfWeek.format('MMM DD (ddd) HH:mm')}`);

        console.log('\n✅ Done! Please refresh your browser to see the updated cards.');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    } finally {
        await mongoose.disconnect();
        console.log('\n✓ Disconnected from MongoDB');
    }
}

regenerateCurrentWeekCards();
