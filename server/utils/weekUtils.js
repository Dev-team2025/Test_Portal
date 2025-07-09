const moment = require("moment");

function getCurrentWeekSets(totalSets = 52) {
    const now = moment();
    const weekOfYear = now.isoWeek(); // ISO week (1-52)

    // Calculate 3 sets for the current week
    const startSet = ((weekOfYear - 1) * 3) % totalSets + 1;

    return [
        startSet,
        startSet % totalSets + 1,
        (startSet + 1) % totalSets + 1
    ].map(set => set > totalSets ? set - totalSets : set);
}

module.exports = { getCurrentWeekSets };