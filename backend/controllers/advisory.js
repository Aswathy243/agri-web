const Advisory = require('../models/Advisory');
const User = require('../models/user');
const { getWeatherData } = require('../services/weather');
const { getSoilData } = require('../services/soil');
const { sendNotification } = require('../services/firebase');
const ErrorResponse = require('../utils/errorResponse');

exports.generateAdvisory = async (req, res, next) => {
  try {
    
    const farmer = await User.findByPk(req.user.id);
    
    if (!farmer) {
      return next(new ErrorResponse('Farmer not found', 404));
    }

    // Ensure location exists
    if (!farmer.location) {
      return next(new ErrorResponse('Farmer location not set', 400));
    }

    // Get location-based data
    const [weatherData, soilData] = await Promise.all([
      getWeatherData(farmer.location.coordinates),
      getSoilData(farmer.location.coordinates)
    ]);

    // Generate advisory based on crop, weather, and soil data
    const advisoryText = generateAdvisoryText(
      farmer.crops[0], // Assuming primary crop for simplicity
      weatherData,
      soilData
    );

    const advisory = await Advisory.create({
      farmerId: farmer.id,
      crop: farmer.crops[0],
      stage: 'growth', // Would come from crop calendar
      advisoryText,
      soilType: soilData.type,
      rainfallData: weatherData.rainfall,
      nutrients: generateNutrientRecommendations(soilData)
    });

    // Send notification to farmer
    if (farmer.fcmToken) {
      await sendNotification(
        farmer.id,
        'New Advisory Available',
        `New farming advisory for your ${farmer.crops[0]} crop`,
        {
          type: 'advisory',
          advisoryId: advisory.id.toString()
        }
      );
    }

    res.status(201).json({
      success: true,
      data: advisory
    });
  } catch (err) {
    next(err);
  }
};


exports.getAdvisories = async (req, res, next) => {
  try {
    const advisories = await Advisory.findAll({
      where: { farmerId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: advisories
    });
  } catch (err) {
    next(err);
  }
};



