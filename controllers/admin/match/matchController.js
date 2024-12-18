const asyncHandler = require('express-async-handler');
const { getMatchData } = require('../../../services/MatchDetails');

exports.getLiveMatchesData = asyncHandler(async (req, res) => {
    try {
        const liveMatches = getMatchData(); // Fetch cached live matches
        res.status(200).json({
            success: true,
            data: liveMatches,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch live match data.",
            error: error.message,
        });
    }
});
