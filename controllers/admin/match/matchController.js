const axios = require('axios');
const asyncHandler = require('express-async-handler');
require('dotenv').config();

let matchData = [];

const UPCOMING_MATCHES_URL = process.env.UPCOMING_MATCHES

const fetchLiveMatches = async () => {
    try {
        if (!UPCOMING_MATCHES_URL) {
            throw new Error("UPCOMING_MATCHES_URL is not defined. Check your environment variables.");
        }
        const response = await axios.get(UPCOMING_MATCHES_URL);

        const matches = response?.data?.response?.items || [];

        matchData = matches;

        console.log("Live Matches updated:", matchData);
    } catch (error) {
        console.error('Error while fetching live matches:', error);
    }
};

setInterval(fetchLiveMatches, 10000);

exports.getLiveMatchesData = asyncHandler(async (req, res) => {
    console.log("Sending response to Postman/client:", matchData);
    res.status(200).json({
        success: true,
        data: matchData,
    });
});