import React, { useState, useEffect } from 'react';
import { MapPin, Cloud, Droplets, Thermometer, Wind, AlertTriangle, AlertCircle, Leaf, TrendingUp } from 'lucide-react';
import axios from 'axios';

const FarmerDashboard = () => {
  const [location, setLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [soilData, setSoilData] = useState(null);
  const [crops, setCrops] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Get user's current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            resolve(coords);
          },
          (err) => {
            reject(err);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        reject(new Error('Geolocation is not supported by this browser'));
      }
    });
  };

  // Fetch weather data from OpenWeather API
  const fetchWeatherData = async (coords) => {
    try {
      const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY || 'c9c30c84295248f676584cf1f2b1df44';
      const currentResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&appid=${API_KEY}&units=metric`
      );
      
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.latitude}&lon=${coords.longitude}&appid=${API_KEY}&units=metric&cnt=5`
      );
      
      const forecastList = forecastResponse.data.list.map(item => {
      const dateObj = new Date(item.dt * 1000);

      const day = dateObj.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., Mon
      const date = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }); // e.g., 17 Jun
      const time = dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }); // e.g., 3:00 PM

      return {
        day,       // "Mon"
        date,      // "17 Jun"
        time,      // "3:00 PM"
        temp: item.main.temp,
        humidity: item.main.humidity,
        rain: item.pop ? Math.round(item.pop * 100) : 0,
        icon: item.weather[0].icon,
        description: item.weather[0].description
      };
    });

      setWeatherData({
        current: {
          temperature: currentResponse.data.main.temp,
          humidity: currentResponse.data.main.humidity,
          windSpeed: currentResponse.data.wind.speed,
          description: currentResponse.data.weather[0].description,
          icon: currentResponse.data.weather[0].icon
        },
        forecast: forecastList
      });
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setWeatherData({
        current: {
          temperature: 25,
          humidity: 65,
          windSpeed: 10,
          description: 'clear sky',
          icon: '01d'
        },
        forecast: [
          { day: 'Mon', temp: 26, humidity: 60, rain: 0, icon: '01d' },
          { day: 'Tue', temp: 27, humidity: 55, rain: 10, icon: '02d' },
          { day: 'Wed', temp: 25, humidity: 70, rain: 30, icon: '03d' },
          { day: 'Thu', temp: 24, humidity: 75, rain: 20, icon: '09d' },
          { day: 'Fri', temp: 26, humidity: 65, rain: 0, icon: '01d' }
        ]
      });
    }
  };

  // Fetch soil data from SoilGrids API
  const fetchSoilData = async (coords) => {
    try {
      const response = await axios.get(
        `https://rest.isric.org/soilgrids/v2.0/properties/query`,
        {
          params: {
            lon: coords.longitude,
            lat: coords.latitude,
            property: 'phh2o,soc,clay',
            depth: '0-5cm',
            value: 'mean'
          },
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      const properties = response.data?.properties || {};
      const getValue = (prop) => properties[prop]?.mean ?? null;

      setSoilData({
        ph: getValue('phh2o') ? (getValue('phh2o') / 10).toFixed(1) : 'N/A',
        organicMatter: getValue('soc') ? (getValue('soc') / 10).toFixed(1) : 'N/A',
        clayContent: getValue('clay') ? getValue('clay').toFixed(1) : 'N/A',
        lastUpdated: new Date().toLocaleString()
      });
    } catch (err) {
      console.error('Soil API error:', err);
      setSoilData({
        ph: 6.5,
        organicMatter: 2.3,
        clayContent: 25.7,
        error: 'Failed to load soil data'
      });
    }
  };

  // Simple region-based crop suggestions
  const getCropsByRegion = (lat, lng) => {
    // Example logic - adjust based on your region
    if (lat > 20) {
      return [
        { name: 'Rice', suitability: 85, season: 'Kharif', duration: '120 days' },
        { name: 'Maize', suitability: 80, season: 'Kharif', duration: '90 days' },
        { name: 'Cotton', suitability: 75, season: 'Kharif', duration: '150 days' }
      ];
    } else {
      return [
        { name: 'Wheat', suitability: 85, season: 'Rabi', duration: '110 days' },
        { name: 'Barley', suitability: 75, season: 'Rabi', duration: '100 days' },
        { name: 'Mustard', suitability: 70, season: 'Rabi', duration: '120 days' }
      ];
    }
  };

  // Basic recommendation function
  const recommendCrops = (soil, weather) => {
    const crops = [];

    const temp = weather?.current?.temperature || 25;
    const ph = soil?.ph || 6.5;
    const moisture = soil?.organicMatter || 2.0;

    if (ph >= 6 && ph <= 7.5 && temp > 25 && moisture > 1.5) {
      crops.push({ name: 'Rice', suitability: 90, season: 'Kharif', duration: '120 days' });
    }

    if (ph >= 6 && ph <= 7 && temp > 18 && temp < 24 && moisture > 1.0) {
      crops.push({ name: 'Wheat', suitability: 85, season: 'Rabi', duration: '110 days' });
    }

    if (ph >= 5.5 && ph <= 7 && temp > 22 && moisture > 1.2) {
      crops.push({ name: 'Maize', suitability: 80, season: 'Kharif', duration: '100 days' });
    }

    return crops.length > 0 ? crops : getCropsByRegion(location?.latitude, location?.longitude);
  };

  // Fetch crop recommendations
  const fetchCropRecommendations = async (coords) => {
    try {
      // If we have weather and soil data, use that for recommendations
      if (weatherData && soilData) {
        const recommendedCrops = recommendCrops(soilData, weatherData);
        setCrops(recommendedCrops);
        return;
      }
      
      // Fallback to region-based recommendations
      const recommendedCrops = getCropsByRegion(coords.latitude, coords.longitude);
      setCrops(recommendedCrops);
      
    } catch (err) {
      console.error('Crop recommendation error:', err);
      // Set some basic recommendations
      setCrops(getCropsByRegion(coords.latitude, coords.longitude));
    }
  };

  // Fetch agricultural alerts
  const fetchAlerts = async (coords) => {
  const alerts = [];

  // === NASA POWER API ===
  try {
    const nasaResponse = await axios.get(
      `https://power.larc.nasa.gov/api/temporal/daily/point`,
      {
        params: {
          start: '20230101',
          end: '20231231',
          latitude: coords.latitude,
          longitude: coords.longitude,
          community: 'AG',
          parameters: 'PRECTOT,GWETTOP',
          format: 'JSON',
        },
      }
    );

    const params = nasaResponse.data?.properties?.parameter;

    if (params?.PRECTOT) {
      const latestRainKey = Object.keys(params.PRECTOT).pop();
      const latestRain = params.PRECTOT[latestRainKey];
      if (latestRain > 20) {
        alerts.push({
          type: 'weather',
          severity: 'high',
          message: 'Heavy rainfall expected.',
          time: latestRainKey,
          source: 'NASA POWER',
        });
      }
    }

    if (params?.GWETTOP) {
      const latestMoistureKey = Object.keys(params.GWETTOP).pop();
      const latestMoisture = params.GWETTOP[latestMoistureKey];
      if (latestMoisture < 30) {
        alerts.push({
          type: 'drought',
          severity: 'medium',
          message: `Low soil moisture detected (${latestMoisture}%). Consider irrigation.`,
          time: latestMoistureKey,
          source: 'NASA POWER',
        });
      }
    }
  } catch (err) {
    console.error('NASA POWER API error:', err);
  }

  // === KSDMA API ===
  try {
    const ksdmaResponse = await axios.get(
      'https://ksdma.kerala.gov.in/api/alerts',
      {
        params: {
          lat: coords.latitude,
          lon: coords.longitude,
          radius: 50,
        },
      }
    );

    const ksdmaAlerts = ksdmaResponse.data.alerts || [];

    ksdmaAlerts.forEach((alert) => {
      alerts.push({
        type: alert.alert_type.toLowerCase(),
        severity: alert.severity.toLowerCase(),
        message: alert.message,
        time: new Date(alert.issued_at).toLocaleString(),
        source: 'KSDMA',
      });
    });
  } catch (err) {
    console.error('KSDMA API error:', err);
  }

  // Fallback if no alerts
  if (alerts.length === 0) {
    alerts.push({
      type: 'info',
      severity: 'low',
      message: 'No severe alerts. Regular weather expected.',
      time: new Date().toLocaleDateString(),
      source: 'System',
    });
  }

  // Update state
  setAlerts(alerts);
};


  // Fetch all data when component mounts
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current location
        const coords = await getCurrentLocation();
        setLocation(coords);
        
        // Fetch weather data first as other functions may depend on it
        await fetchWeatherData(coords);
        
        // Then fetch other data in parallel
        await Promise.all([
          fetchSoilData(coords),
          fetchCropRecommendations(coords),
          fetchAlerts(coords),
        ]);
        setLastUpdated(new Date().toLocaleString());
        
      } catch (err) {
        console.error('Location error:', err);
        setError(`Failed to get location: ${err.message}`);
        
        // Fallback to Delhi coordinates if location fails
        const fallbackCoords = { latitude: 9.8584, longitude: 76.9528 };
        setLocation(fallbackCoords);
        
        await fetchWeatherData(fallbackCoords);
        await Promise.all([
          fetchSoilData(fallbackCoords),
          fetchCropRecommendations(fallbackCoords),
          fetchAlerts(fallbackCoords)
        ]);
        
        setLastUpdated(new Date().toLocaleString());
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your personalized dashboard...</p>
          {location && (
            <p className="text-sm text-gray-500 mt-2 flex items-center justify-center">
              <MapPin className="h-4 w-4 mr-1" />
              Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          {location && (
            <p className="text-sm text-gray-500 flex items-center justify-center">
              <MapPin className="h-4 w-4 mr-1" />
              Using location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </p>
          )}
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header with location info */}
      <header className="bg-white shadow-lg border-b-4 border-green-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Leaf className="h-10 w-10 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AgriSmart Dashboard</h1>
                <div className="text-sm text-gray-600 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>
                    {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Unknown location'}
                  </span>
                  {weatherData && (
                    <span className="ml-3 flex items-center">
                      <Thermometer className="h-4 w-4 mr-1" />
                      {weatherData.current.temperature}°C, {weatherData.current.description}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.location.reload()}
                className="text-sm text-green-600 hover:text-green-800"
              >
                Refresh Data
              </button>
              {lastUpdated && (
  <span className="text-xs text-gray-500">
    Last updated: {lastUpdated}
  </span>
)}

            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              Active Alerts
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {alerts.map((alert, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  alert.severity === 'high' ? 'bg-red-50 border-red-500' :
                  alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-blue-50 border-blue-500'
                }`}>
                  <p className="font-medium text-gray-900">{alert.message}</p>
                  <p className="text-sm text-gray-600 mt-1">{alert.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weather and Soil Data */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Weather Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Cloud className="h-5 w-5 mr-2 text-blue-500" />
                Weather Forecast
              </h3>
              {weatherData && (
                <div>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-gray-900">{weatherData.current.temperature}°C</div>
                    <div className="text-gray-600 capitalize">{weatherData.current.description}</div>
                    {weatherData.current.icon && (
                      <img 
                        src={`https://openweathermap.org/img/wn/${weatherData.current.icon}@2x.png`} 
                        alt="Weather icon"
                        className="w-20 h-20 mx-auto"
                      />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center">
                      <Droplets className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm">{weatherData.current.humidity}% Humidity</span>
                    </div>
                    <div className="flex items-center">
                      <Wind className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm">{weatherData.current.windSpeed} km/h</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {weatherData.forecast.map((day, index) => (
  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
    <span className="text-sm font-medium">{day.day}</span>
    <div className="flex flex-col items-end">
      <span className="text-xs text-gray-500">{day.time}</span>
      <div className="flex items-center space-x-2">
        <span className="text-sm">{day.temp}°C</span>
        {day.rain > 0 && (
          <span className="text-xs text-blue-500">{day.rain}%</span>
        )}
        {day.icon && (
          <img
            src={`https://openweathermap.org/img/wn/${day.icon}.png`}
            alt="Weather icon"
            className="w-6 h-6"
          />
        )}
      </div>
    </div>
  </div>
))}

                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Soil & Crop Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Soil Data */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-brown-500" />
                Soil Analysis
              </h3>
              {soilData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{soilData.ph}</div>
                    <div className="text-sm text-gray-600">pH Level</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{soilData.organicMatter}%</div>
                    <div className="text-sm text-gray-600">Organic Matter</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{soilData.clayContent}%</div>
                    <div className="text-sm text-gray-600">Clay Content</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{weatherData?.current.temperature}°C</div>
                    <div className="text-sm text-gray-600">Air Temp</div>
                  </div>
                </div>
              )}
            </div>

            {/* Crop Recommendations */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Leaf className="h-5 w-5 mr-2 text-green-500" />
                Recommended Crops
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                {crops.map((crop, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{crop.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        crop.suitability >= 90 ? 'bg-green-100 text-green-800' :
                        crop.suitability >= 80 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {Math.round(crop.suitability)}% match
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Season: {crop.season}</div>
                      <div>Duration: {crop.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;