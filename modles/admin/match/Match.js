const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
    match_id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    short_title: { type: String },
    date_start: { type: Date, required: true },
    date_end: { type: Date },
    status: {
        type: String,
        enum: ['Scheduled', 'Live', 'Completed'],
        default: 'Scheduled',
    },
    venue: {
        venue_id: { type: String },
        name: { type: String },
        location: { type: String },
        country: { type: String },
    },
    team_a: {
        team_id: { type: Number },
        name: { type: String },
        short_name: { type: String },
        logo_url: { type: String },
    },
    team_b: {
        team_id: { type: Number },
        name: { type: String },
        short_name: { type: String },
        logo_url: { type: String },
    },
    competition: {
        cid: { type: Number },
        title: { type: String },
        type: { type: String },
    },
    createdAt: { type: Date, default: Date.now },
});

const Match = mongoose.model('Match', MatchSchema);
module.exports = Match;
