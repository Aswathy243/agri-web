const axios = require('axios');

const getWeather = async (req, res) => {
  const { lat, lng } = req.query;
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    const response = await axios.get(url);
    const data = response.data;

    const weather = {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      description: data.weather[0].description,
      wind: {
        speed: data.wind.speed,
      },
      clouds: data.clouds,
      icon: data.weather[0].icon,
      location: data.name,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      forecast: [
        { day: 'Today', temp: data.main.temp, humidity: data.main.humidity, rain: 30 },
        { day: 'Tomorrow', temp: data.main.temp + 1, humidity: 75, rain: 10 },
        { day: 'Day 3', temp: data.main.temp - 2, humidity: 80, rain: 50 },
        { day: 'Day 4', temp: data.main.temp - 1, humidity: 85, rain: 70 },
        { day: 'Day 5', temp: data.main.temp, humidity: 72, rain: 40 }
      ]
    };

    res.json({ current: weather, forecast: weather.forecast });
  } catch (err) {
    console.error('Weather API error:', err.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
};

module.exports = { getWeather };
