const moment = require("moment");

function getCurrentWeekSets(totalSets = 50) {
    const isoWeek = moment().isoWeek(); // Week 1 to 52
    const startSet = ((isoWeek - 1) * 3) % totalSets + 1;

    const sets = [
        startSet,
        ((startSet) % totalSets) + 1,
        ((startSet + 1) % totalSets) + 1,
    ];

    return sets.map(Number); // ensure numeric set values
}

module.exports = getCurrentWeekSets;
