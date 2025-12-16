const moment = require("moment");

function getCurrentWeekSets(totalSets = 52) {
    const now = moment();

    // Start of your "academic year" (Oct 1st)
    const startOfYear =
        now.month() >= 9
            ? moment([now.year(), 9, 1])   // October this year
            : moment([now.year() - 1, 9, 1]); // October last year

    // Weeks passed since October 1
    const weekOfYear = Math.floor(now.diff(startOfYear, "weeks")) + 1;

    // Each week has 3 sets
    const startSet = ((weekOfYear - 1) * 3) % totalSets + 1;

    return [
        startSet,
        (startSet % totalSets) + 1,
        ((startSet + 1) % totalSets) + 1
    ].map(set => (set > totalSets ? set - totalSets : set));
}

module.exports = { getCurrentWeekSets };
