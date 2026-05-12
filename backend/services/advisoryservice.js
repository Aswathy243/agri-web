const axios = require('axios');

const getSoilInsights = (lat, lon) => {
  // Simulated example based on geomorphology zones
  return {
    type: 'Loamy',
    fertility: 'High',
    nutrients: [{ name: 'Nitrogen', quantity: '50kg/acre' }, { name: 'Potassium', quantity: '30kg/acre' }]
  };
};

const getRainfallForecast = async (lat, lon) => {
  const apiKey = process.env.OPENWEATHER_API;
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  const { data } = await axios.get(url);
  return data?.rain?.['1h'] || 0;
};

exports.generate = async (crop, coordinates, stage) => {
  const [lat, lon] = coordinates;

  const soil = getSoilInsights(lat, lon);
  const rainfall = await getRainfallForecast(lat, lon);

  const advisories = [];

  // Soil advice
  advisories.push({
    category: 'Soil Health',
    advisoryText: `Soil is ${soil.type} with ${soil.fertility} fertility.`,
    nutrients: soil.nutrients,
    isRead: false
  });

  // Rainfall advice
  if (rainfall < 2) {
    advisories.push({
      category: 'Irrigation',
      advisoryText: `Low rainfall detected. Consider irrigating your ${crop} field.`,
      nutrients: [],
      isRead: false
    });
  }

  // Crop stage advice
  if (stage === 'Vegetative') {
    advisories.push({
      category: 'Crop Growth',
      advisoryText: `${crop} is in the vegetative stage. Apply nitrogen-based fertilizer.`,
      nutrients: [{ name: 'Nitrogen', quantity: '40kg/acre' }],
      isRead: false
    });
  } else if (stage === 'Flowering') {
    advisories.push({
      category: 'Crop Growth',
      advisoryText: `${crop} is flowering. Ensure adequate potassium levels.`,
      nutrients: [{ name: 'Potassium', quantity: '20kg/acre' }],
      isRead: false
    });
  }

  return advisories;
};
