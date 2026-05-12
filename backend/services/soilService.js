// backend/services/soilService.js
const axios = require('axios');
module.exports.getSoilData = async (lat, lng) => {
  try {
    const res = await axios.get('https://rest.isric.org/soilgrids/v2.0/properties/query', { params: { lat, lon: lng } });
    const pH = res.data.properties.phh2o.mean['0-5cm'] / 10;
    return { ph: pH.toFixed(1), moisture: null };
  } catch {
    return { ph: 6.8, moisture: 65 }; // fallback mock
  }
};
