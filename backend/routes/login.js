const express = require('express');
const router = express.Router();
const twilio = require('twilio');
require('dotenv').config();

const { Farmer, Otp } = require('../models');
const { generateToken } = require('../utils/jwt'); // 🔐 Import JWT generator

// Twilio setup
const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

// 🔹 Generate a random 6-digit OTP
function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

// 🔹 Send OTP endpoint
router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;

  try {
    const user = await Farmer.findOne({ where: { phone } });
    if (!user) {
      return res.status(404).json({ message: 'Phone number not found' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const createdOtp = await Otp.create({
      phone,
      otp_code: otp,
      expires_at: expiresAt
    });

    console.log('✅ OTP saved in DB:', createdOtp);

    await client.messages.create({
      body: `AgriCompanion OTP: ${otp}. It is valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE,
      to: `+91${phone}`
    });

    res.status(200).json({ message: 'OTP sent successfully' });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 🔹 Verify OTP endpoint with JWT response
router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;

  try {
    const otpEntry = await Otp.findOne({
      where: { phone, otp_code: otp },
      order: [['created_at', 'DESC']]
    });

    if (!otpEntry) {
      return res.status(401).json({ message: 'Invalid OTP' });
    }

    if (new Date(otpEntry.expires_at) < new Date()) {
      return res.status(401).json({ message: 'OTP has expired' });
    }

    await Otp.destroy({ where: { phone } });

    const farmer = await Farmer.findOne({ where: { phone } });
    const token = generateToken(farmer.id); // 🔐 create JWT with farmer ID

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token, // return JWT to frontend
       user: {  // Add this user object
      id: farmer.id,
      name: farmer.name,
      phone: farmer.phone,
      role: 'farmer'  // Explicit role
    }
    
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
