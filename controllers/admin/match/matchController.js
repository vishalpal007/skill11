const asyncHandler = require("express-async-handler");
const axios = require("axios");

exports.fetchMatches = asyncHandler(async (req, res) => {
    try {
        const response = await axios.get(
            'https://rest.entitysport.com/v2/matches/?status=1&pre_squad=true&per_page=50&token=727a1fdf86db894769fad12428772cfc'
        );

        const matches = response?.data?.response?.items;
        if (!matches || matches.length === 0) {
            return res.status(404).json({ message: "No matches found." });
        }

        // Map and send the response directly without saving to database
        const matchesToSend = matches.map(match => ({
            match_id: match.match_id,
            title: match.title,
            short_title: match.short_title,
            date_start: match.date_start,
            date_end: match.date_end,
            status: match.status_str,
            venue: {
                venue_id: match.venue?.venue_id || '',
                name: match.venue?.name || '',
                location: match.venue?.location || '',
                country: match.venue?.country || '',
            },
            team_a: {
                team_id: match.teama?.team_id || '',
                name: match.teama?.name || '',
                short_name: match.teama?.short_name || '',
                logo_url: match.teama?.logo_url || '',
            },
            team_b: {
                team_id: match.teamb?.team_id || '',
                name: match.teamb?.name || '',
                short_name: match.teamb?.short_name || '',
                logo_url: match.teamb?.logo_url || '',
            },
            competition: {
                cid: match.competition?.cid || '',
                title: match.competition?.title || '',
                type: match.competition?.type || '',
            },
        }));

        // Send the fetched data
        res.status(200).json({
            matches: matchesToSend,
        });
    } catch (error) {
        console.error("Error while fetching match data:", error);
        res.status(500).json({ message: "Error fetching match data", error });
    }
});
