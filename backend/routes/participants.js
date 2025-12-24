const express = require('express');
const router = express.Router();
const { listParticipants } = require('../controllers/participantsController');

router.get('/', listParticipants);

module.exports = router;
