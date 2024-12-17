const mongoose = require('mongoose');

const ContestSchema = new mongoose.Schema({
    match_id: {
        type: Number,
        required: true
    },
    contest_category: {
        type: String,
        required: true,
        enum: ["Mega", "Small"]
    },
    contest_name: { type: String, required: true },
    prize_pool: { type: Number, required: true },
    entry_fee: { type: Number, required: true },
    max_participants: { type: Number, required: true },
    prize_distribution: {
        type: Array,
        required: true,
    },
    createdAt: { type: Date, default: Date.now },
});

const Contest = mongoose.model('Contest', ContestSchema);

module.exports = Contest;
