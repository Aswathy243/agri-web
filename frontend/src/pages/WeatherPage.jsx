import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom colored icons
const createCustomIcon = (color = 'red') => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const LOCALITIES = [
  { name: 'Painavu', lat: 9.9233, lon: 76.8961 },
  { name: 'Thodupuzha', lat: 9.8949, lon: 76.7152 },
  { name: 'Adimali', lat: 10.0651, lon: 77.09 },
  { name: 'Kattappana', lat: 9.8423, lon: 77.1566 },
  { name: 'Murickassery', lat: 9.6898, lon: 77.2036 },
  { name: 'Kumily', lat: 9.6060, lon: 77.1564 },
  { name: 'Kalvary Mount', lat: 9.9480, lon: 76.9711 },
  { name: 'Devikulam', lat: 10.0413, lon: 77.1541 },
  { name: 'Peerumade', lat: 9.7930, lon: 76.9540 },
  { name: 'Udumbanchola', lat: 9.7946, lon: 77.1807 },
  { name: 'Vattavada', lat: 10.1321, lon: 77.0887 },
  { name: 'Rajakkad', lat: 9.7078, lon: 77.1970 },
  { name: 'Munnar', lat: 10.0889, lon: 77.0595 },
  { name: 'Thankamani', lat: 9.9450, lon: 76.7186 },
  { name: 'Karimkunnam', lat: 9.9815, lon: 76.7553 },
  { name: 'Vazhathope', lat: 9.8524, lon: 76.9484 },
  { name: 'Vandiperiyar', lat: 9.7634, lon: 77.1181 },
  { name: 'Konnathady', lat: 9.8426, lon: 77.0957 },
  { name: 'Chakkupallam', lat: 10.0553, lon: 77.0619 },
  { name: 'Anakkara', lat: 9.8558, lon: 76.8475 },
  { name: 'Nedumkandam', lat: 9.8289, lon: 77.1227 },
  { name: 'Santhanpara', lat: 9.7970, lon: 77.0133 },
  { name: 'Upputhara', lat: 9.7202, lon: 77.0053 },
  { name: 'Idukki', lat: 9.8314, lon: 76.9205 }
];

// Reverse geocode to get place name from coordinates
async function reverseGeocode(lat, lon) {
  try {
    const response = await axios.get(
      'https://nominatim.openstreetmap.org/reverse',
      {
        params: {
          lat,
          lon,
          format: 'json',
        },
        headers: {
          'Accept-Language': 'en',
        },
      }
    );
    return (
      response.data.address?.city ||
      response.data.address?.town ||
      response.data.address?.village ||
      response.data.address?.hamlet ||
      response.data.display_name ||
      null
    );
  } catch {
    return null;
  }
}

function LocationMarker({ onSelect }) {
  useMapEvents({
    click: async (e) => {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;
      const name = await reverseGeocode(lat, lon);
      if (name) {
        onSelect({ lat, lon, name });
      } else {
        onSelect({ lat, lon, name: `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}` });
      }
    },
  });
  return null;
}

function MapController({ center }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (center) {
      map.setView(center, 12);
    }
  }, [center, map]);
  return null;
}

const WeatherPage = () => {
  const [loc, setLoc] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState('');
  const [inputValue, setInputValue] = useState('');

  const API_KEY = process.env.REACT_APP_TOMORROW_API_KEY;

  // When location changes, fetch weather
  useEffect(() => {
    if (!loc) return;

    const fields = ['temperature', 'precipitationProbability', 'windSpeed', 'humidity'];

    const fetchWeather = async () => {
      try {
        const res = await axios.get('https://api.tomorrow.io/v4/timelines', {
          params: {
            location: `${loc.lat},${loc.lon}`,
            fields: fields.join(','),
            timesteps: ['1h'],
            units: 'metric',
            apikey: API_KEY,
          },
        });
        setForecast(res.data);
        setError('');
      } catch (e) {
        console.error(e);
        setError('Unable to fetch forecast for this location.');
      }
    };
    fetchWeather();
  }, [loc, API_KEY]);

  // Handle input change and find locality
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // When user submits place name, check if it matches LOCALITIES
  const handleSearch = () => {
    const found = LOCALITIES.find(
      (l) => l.name.toLowerCase() === inputValue.trim().toLowerCase()
    );
    if (found) {
      setLoc(found);
      setError('');
    } else {
      setError('Place not found in localities. Please try selecting on map.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold text-green-800 mb-4">Idukki Local Weather</h2>

      {/* Text input for place name */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Enter locality name (e.g. Munnar)"
          value={inputValue}
          onChange={handleInputChange}
          className="border p-2 rounded flex-grow"
        />
        <button
          onClick={handleSearch}
          className="bg-green-700 text-white px-4 rounded hover:bg-green-800"
        >
          Search
        </button>
      </div>

      {/* Map for selecting locality */}
      <MapContainer
        center={loc ? [loc.lat, loc.lon] : [9.9, 77]}
        zoom={loc ? 12 : 10}
        style={{ height: '300px', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Preset locality markers with blue icons */}
        {LOCALITIES.map((l, i) => (
          <Marker
            key={i}
            position={[l.lat, l.lon]}
            icon={createCustomIcon('blue')}
            eventHandlers={{
              click: () => {
                setLoc(l);
                setInputValue(l.name);
                setError('');
              },
            }}
          >
            <Popup>{l.name}</Popup>
          </Marker>
        ))}

        {/* Selected location marker with red icon */}
        {loc && (
          <Marker 
            position={[loc.lat, loc.lon]}
            icon={createCustomIcon('red')}
          >
            <Popup>{loc.name}</Popup>
          </Marker>
        )}

        <LocationMarker onSelect={(selectedLoc) => {
          setLoc(selectedLoc);
          setInputValue(selectedLoc.name || `Lat: ${selectedLoc.lat.toFixed(4)}, Lon: ${selectedLoc.lon.toFixed(4)}`);
          setError('');
        }} />

        <MapController center={loc ? [loc.lat, loc.lon] : null} />
      </MapContainer>

      {loc && (
        <p className="mt-4">
          Selected: <strong>{loc.name}</strong>
        </p>
      )}

      {error && <p className="text-red-600 mt-2">{error}</p>}

      {forecast?.data?.timelines?.[0]?.intervals && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-green-700 mb-2">
            📅 Hourly Forecast (Next 24h)
          </h3>
          <div className="space-y-2 max-h-64 overflow-auto">
            {forecast.data.timelines[0].intervals.slice(0, 24).map((pt, i) => (
              <div
                key={i}
                className="flex justify-between p-2 bg-gray-100 rounded-md"
              >
                <span>
                  {new Date(pt.startTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span>{pt.values.temperature.toFixed(1)}°C</span>
                <span>☔ {pt.values.precipitationProbability}%</span>
                <span>💧 {pt.values.humidity.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherPage;