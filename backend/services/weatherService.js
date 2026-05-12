// backend/services/weatherService.js
const axios = require('axios');
module.exports.getWeatherData = async (lat, lng) => {
  const res = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
    params: { lat, lon: lng, units: 'metric', appid: process.env.WEATHER_API_KEY }
  });
  const d = res.data;
  return {
    temperature: Math.round(d.main.temp),
    humidity: d.main.humidity,
    windSpeed: d.wind.speed,
    description: d.weather[0].description
  };
};
