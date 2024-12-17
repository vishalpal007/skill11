const express = require('express');
const { fetchMatches } = require('../../../controllers/admin/match/matchController');
const router = express.Router()

router.get('/fetch', fetchMatches)

module.exports = router