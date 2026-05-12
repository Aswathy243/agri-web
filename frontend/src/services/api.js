// services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getUserProfile = async (userId) => {
  const res = await axios.get(`${API_BASE_URL}/users/${userId}`);
  return res.data;
};

export const getWeather = async (location) => {
  const res = await axios.get(`${API_BASE_URL}/weather/${location}`);
  return res.data;
};

export const getSoilData = async (location) => {
  const res = await axios.get(`${API_BASE_URL}/soil/${location}`);
  return res.data;
};

export const getAdvisory = async (userId) => {
  const res = await axios.get(`${API_BASE_URL}/advisory/${userId}`);
  return res.data;
};

export const reportCropLoss = async (formData) => {
  const config = { headers: { 'Content-Type': 'multipart/form-data' } };
  const res = await axios.post(`${API_BASE_URL}/crop-loss`, formData, config);
  return res.data;
};
