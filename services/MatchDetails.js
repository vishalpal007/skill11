const axios = require('axios');
const asyncHandler = require('express-async-handler');
require('dotenv').config();

let matchData = []; // Local cache to store live match data

const UPCOMING_MATCHES_URL = process.env.UPCOMING_MATCHES;

// Function to fetch live match data from the third-party API
const fetchLiveMatches = async () => {
    try {
        if (!UPCOMING_MATCHES_URL) {
            throw new Error("UPCOMING_MATCHES_URL is not defined. Check your environment variables.");
        }

        const response = await axios.get(UPCOMING_MATCHES_URL);


        const matches = response?.data?.response?.items || [];

        matchData = matches; // Save the fetched data to cache
    } catch (error) {
        console.error('Error while fetching live matches:', error.message);
    }
};

// Schedule data fetching every 10 seconds
setInterval(fetchLiveMatches, 10000);

// Function to return cached match data
const getMatchData = () => matchData;

module.exports = {
    fetchLiveMatches,
    getMatchData,
};
