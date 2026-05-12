const express = require('express');
const router = express.Router();
const advisoryController = require('../controllers/advisory');

router.post('/generate', advisoryController.generateAdvisory);

module.exports = router;
