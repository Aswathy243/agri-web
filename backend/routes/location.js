const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/reverse-geocode', async (req, res) => {
  const { lat, lon } = req.query;
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
      params: {
        format: 'json',
        lat,
        lon,
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'AgriCompanion/1.0'
      }
    });

    const address = response.data.address;
    const locationName = `${address.village || address.town || address.city || address.county}, ${address.state}`;
    res.json({ location: locationName });
  } catch (error) {
    res.status(500).json({ error: 'Reverse geocoding failed' });
  }
});

module.exports = router;
