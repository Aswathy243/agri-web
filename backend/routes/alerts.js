const express = require('express');
const router = express.Router();
const axios = require('axios');

// Get agricultural alerts based on location
router.get('/:lat/:lon', async (req, res) => {
  try {
    const { lat, lon } = req.params;
    
    // Using NASA POWER API for agricultural data
    const response = await axios.get(
      `https://power.larc.nasa.gov/api/temporal/daily/point?start=20230101&end=20231231&latitude=${lat}&longitude=${lon}&community=AG&parameters=PRECTOT,GWETTOP&format=JSON`
    );
    
    // Process data to generate alerts
    const alerts = [];
    const latestData = response.data.properties.parameter.PRECTOT[Object.keys(response.data.properties.parameter.PRECTOT)[0]];
    
    if (latestData > 20) {
      alerts.push({
        type: 'weather',
        severity: 'high',
        message: 'Heavy rainfall expected. Prepare drainage systems.',
        time: 'Latest data'
      });
    }
    
    if (response.data.properties.parameter.GWETTOP[Object.keys(response.data.properties.parameter.GWETTOP)[0]] < 30) {
      alerts.push({
        type: 'drought',
        severity: 'medium',
        message: 'Low soil moisture detected. Consider irrigation.',
        time: 'Latest data'
      });
    }
    
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

module.exports = router;