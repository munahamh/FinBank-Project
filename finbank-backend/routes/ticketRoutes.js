const express = require('express');
const router = express.Router();
const { submitTicket } = require('../controllers/ticketController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, submitTicket);

module.exports = router;