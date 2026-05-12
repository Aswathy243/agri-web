// backend/routes/reportRoutes.js

const express = require('express');
const router = express.Router();
const { Report } = require('../models'); // Adjust the path if needed

// Route to fetch report details by trackingId
router.get('/TrackReportDetails/:trackingId', async (req, res) => {
  const { trackingId } = req.params;
  try {
    const report = await Report.findOne({ where: { trackingId } });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
