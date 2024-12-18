const express = require('express');
const { getLiveMatchesData } = require('../../../controllers/admin/match/matchController');

const router = express.Router();

// Route to fetch live match data
router.get('/live', getLiveMatchesData);

module.exports = router;