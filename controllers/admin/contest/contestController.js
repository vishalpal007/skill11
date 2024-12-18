const asyncHandler = require("express-async-handler");
const axios = require("axios");
const Contest = require('../../../modles/admin/contest/Contest');
const { getMatchData } = require("../../../services/MatchDetails");

// Create a contest
exports.createContest = asyncHandler(async (req, res) => {
    const { match_id, contest_category, contest_name, prize_pool, entry_fee, max_participants, prize_distribution } = req.body;

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

// Fetch contest data by match_id
exports.getAllContests = asyncHandler(async (req, res) => {
    try {
        const contests = await Contest.find({});
        if (!contests || contests.length === 0) {
            return res.status(404).json({ message: "No contests found" });
        }

        res.status(200).json({
            message: "All contests fetched successfully",
            contests,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch all contests",
            error: error.message,
        });
    }
});

// Fetch contest data by match_id
// exports.getContestByMatchId = asyncHandler(async (req, res) => {
//     try {
//         const { match_id } = req.params;

//         const contests = await Contest.find({ match_id });
//         if (!contests || contests.length === 0) {
//             return res.status(404).json({ message: "No contests found for the provided match ID" });
//         }

//         const apiResponse = await axios.get(
//             "https://rest.entitysport.com/v2/matches/?status=1&pre_squad=true&per_page=50&token=727a1fdf86db894769fad12428772cfc"
//         );

//         const matchData = apiResponse?.data?.response?.items || [];
//         const enrichedContests = contests.map(contest => {
//             const matchDetails = matchData.find(
//                 match => Number(match.match_id) === Number(match_id)
//             );

//             return {
//                 ...contest._doc,
//                 match_details: matchDetails || "Match details not found",
//             };
//         });

//         res.status(200).json({
//             message: "Contests fetched successfully",
//             contests: enrichedContests,
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: "Failed to fetch contests",
//             error: error.message,
//         });
//     }
// });


exports.getContestByMatchId = asyncHandler(async (req, res) => {
    try {
        const { match_id } = req.params;

        // Fetch contests from database that match the provided match_id
        const contests = await Contest.find({ match_id });
        if (!contests || contests.length === 0) {
            return res.status(404).json({ message: "No contests found for the provided match ID" });
        }

        // Fetch live match data and filter for the specific match_id
        const liveMatches = getMatchData();
        const matchDetails = liveMatches.find(
            (match) => match?.match_id === parseInt(match_id)
        );

        if (!matchDetails) {
            return res.status(404).json({ message: "No live match data found for the provided match ID" });
        }


        const teama_id = matchDetails?.teama?.team_id || null;
        const teamb_id = matchDetails?.teamb?.team_id || null;

        // Map contest response with the match's team_a_id & team_b_id
        const enrichedContests = contests.map(contest => ({
            ...contest._doc,
            teama_id,
            teamb_id,
        }));

        res.status(200).json({
            message: "Contests fetched successfully with team data",

            contests: enrichedContests,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch contests or match data",
            error: error.message,
        });
    }
});

