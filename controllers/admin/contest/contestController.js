const asyncHandler = require("express-async-handler");
const axios = require("axios");
const Contest = require("../../../modles/admin/contest/Contest");


exports.createContest = asyncHandler(async (req, res) => {
    const {
        match_id,
        contest_category,
        contest_name,
        prize_pool,
        entry_fee,
        max_participants,
        prize_distribution,
    } = req.body;

    try {
        const newContest = new Contest({
            match_id,
            contest_category,
            contest_name,
            prize_pool,
            entry_fee,
            max_participants,
            prize_distribution,
        });

        const savedContest = await newContest.save();
        res.status(201).json({
            message: "Contest created successfully",
            contest: savedContest,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create contest",
            error: error.message,
        });
    }
});


exports.getContest = asyncHandler(async (req, res) => {
    try {
        const { match_id } = req.params; // Accessing match_id from params

        // Fetch contests from the database
        const contests = await Contest.find({ match_id });

        if (!contests || contests.length === 0) {
            return res.status(404).json({
                message: "No contests found for the provided match ID",
            });
        }

        // Fetch match details from the third-party API
        const apiResponse = await axios.get(
            "https://rest.entitysport.com/v2/matches/?status=1&pre_squad=true&per_page=50&token=727a1fdf86db894769fad12428772cfc"
        );

        const matchData = apiResponse?.data?.response?.items || [];

        // Attach match details to contests
        const enrichedContests = contests.map(contest => {
            const matchDetails = matchData.find(
                match => Number(match.match_id) === Number(match_id)
            );

            return {
                ...contest._doc, // Spread contest data
                match_details: matchDetails || "Match details not found",
            };
        });

        res.status(200).json({
            message: "Contests fetched successfully",
            contests: enrichedContests,
        });
    } catch (error) {
        console.error("Error fetching contests:", error);
        res.status(500).json({
            message: "Failed to fetch contests",
            error: error.message,
        });
    }
});


