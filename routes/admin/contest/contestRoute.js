const express = require('express');
const { createContest, getContest } = require('../../../controllers/admin/contest/contestController');
const router = express.Router()


router.post("/create-contest", createContest)
router.get("/get-contest/:match_id", getContest);

module.exports = router;