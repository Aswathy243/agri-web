import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
//import AdvisoryCard from '../components/AdvisoryCard'; // Adjust path if needed

const Advisory = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ location: '', crop: '' });
  const [advisories, setAdvisories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [locations, setLocations] = useState([]);
  const [crops, setCrops] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchUserProfile = async (token) => {
      try {
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (err) {
        console.error('Failed to fetch user profile', err);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await axios.get(`${API_URL}/locations`);
        setLocations(response.data);
      } catch (err) {
        console.error('Failed to fetch locations', err);
      }
    };

    const fetchCrops = async () => {
      try {
        const response = await axios.get(`${API_URL}/crops`);
        setCrops(response.data);
      } catch (err) {
        console.error('Failed to fetch crops', err);
      }
    };

    fetchUserProfile(token);
    fetchLocations();
    fetchCrops();
  }, [navigate, API_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const fetchAdvisory = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const selectedLocation = locations.find(loc => loc.name === formData.location);

      const response = await axios.post(
        `${API_URL}/advisory/generate`,
        {
          crop: formData.crop,
          coordinates: selectedLocation?.coordinates || [0, 0]
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setAdvisories(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch advisory');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (advisoryId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/advisory/${advisoryId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdvisories(prev =>
        prev.map(adv =>
          adv._id === advisoryId ? { ...adv, isRead: true } : adv
        )
      );
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const submitFeedback = async (advisoryId, feedback) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/advisory/${advisoryId}/feedback`,
        { feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdvisories(prev =>
        prev.map(adv =>
          adv._id === advisoryId ? { ...adv, feedbackSubmitted: true } : adv
        )
      );
    } catch (err) {
      console.error('Failed to submit feedback', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-900 mb-6">
        Smart Advisory {user && `for ${user.name}`}
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={fetchAdvisory}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">Select Location</label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Choose your location</option>
                {locations.map((loc) => (
                  <option key={loc._id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Select Crop</label>
              <select
                name="crop"
                value={formData.crop}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Choose your crop</option>
                {crops.map((crop) => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.location || !formData.crop}
            className={`mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition ${
              loading || !formData.location || !formData.crop ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : (
              'Get Advisory'
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-green-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-green-800 mb-4">
          {advisories.length > 0 ? 'Current Advisory' : 'No Advisory Generated Yet'}
        </h2>

        {advisories.length === 0 ? (
          <p className="text-gray-600">
            Please select your location and crop to receive personalized farming advice.
          </p>
        ) : (
          <div className="space-y-4">
            {advisories.map((advisory) => (
              <div
                key={advisory._id}
                className={`p-4 rounded-lg shadow transition ${
                  advisory.isRead ? 'bg-gray-50' : 'bg-white border-l-4 border-green-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-green-700">{advisory.category || 'General Advice'}</h3>
                    <p className="text-gray-700 mt-1">{advisory.advisoryText}</p>
                    {advisory.nutrients?.length > 0 && (
                      <div className="mt-2">
                        <h4 className="text-sm font-semibold text-gray-600">Nutrient Recommendations:</h4>
                        <ul className="list-disc pl-5 text-sm text-gray-600">
                          {advisory.nutrients.map((nutrient, idx) => (
                            <li key={idx}>{nutrient.name}: {nutrient.quantity}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {!advisory.isRead && (
                    <button
                      onClick={() => markAsRead(advisory._id)}
                      className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                    >
                      Mark as Read
                    </button>
                  )}
                </div>

                {!advisory.feedbackSubmitted && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Was this advice helpful?</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => submitFeedback(advisory._id, 'positive')}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                      >
                        👍 Helpful
                      </button>
                      <button
                        onClick={() => submitFeedback(advisory._id, 'negative')}
                        className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200"
                      >
                        👎 Not Helpful
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Advisory;
