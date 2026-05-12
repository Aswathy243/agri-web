const axios = require('axios');
const { WEATHER_API_KEY } = process.env;

const getWeatherData = async (coordinates) => {
  try {
    const [longitude, latitude] = coordinates;
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}`
    );
    
    // Process and return relevant data
    return {
      temperature: response.data.main.temp,
      humidity: response.data.main.humidity,
      rainfall: response.data.rain ? response.data.rain['1h'] || 0 : 0,
      windSpeed: response.data.wind.speed,
      conditions: response.data.weather[0].main
    };
  } catch (error) {
    console.error('Weather API error:', error);
    throw new Error('Failed to fetch weather data');
  }
};

const getWeatherForecast = async (coordinates) => {
  // Similar implementation for forecast
};

module.exports = { getWeatherData, getWeatherForecast };