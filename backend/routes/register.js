const express = require('express');
const router = express.Router();
const { Farmer } = require('../models'); // ✅ Proper way to access model

router.post('/', async (req, res) => {
  const { name, phone, village, panchayat, block } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: 'Name and phone number are required' });
  }

  try {
    const newFarmer = await Farmer.create({
      name,
      phone,
      village,
      panchayat,
      block
    });

    res.status(201).json({ message: 'Registration successful', farmer: newFarmer });

  } catch (err) {
    console.error(err);

    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({ message: 'Phone number already registered' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

module.exports = router;
