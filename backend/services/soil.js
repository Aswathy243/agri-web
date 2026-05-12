const axios = require('axios');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');


const getSoilData = async (coordinates) => {
  try {
    // First try to get from our database using PostGIS
    const [soilData] = await sequelize.query(`
      SELECT * FROM soil_data 
      WHERE ST_DWithin(
        location,
        ST_MakePoint(:longitude, :latitude)::geography,
        5000
      )
      LIMIT 1
    `, {
      replacements: { longitude: coordinates[0], latitude: coordinates[1] },
      type: QueryTypes.SELECT
    });
    
    if (soilData) {
      return soilData;
    }
    
    // Fallback to mock data since we don't have an external API
    const mockSoilData = {
      type: 'loamy',
      ph: 6.5,
      organicMatter: 2.3,
      nitrogen: 18,
      phosphorus: 12,
      potassium: 25
    };
    
    // Save to our database for future use
    const [newSoilData] = await sequelize.query(`
      INSERT INTO soil_data (
        location, 
        type, 
        ph, 
        organic_matter, 
        nitrogen, 
        phosphorus, 
        potassium
      ) VALUES (
        ST_MakePoint(:longitude, :latitude),
        :type,
        :ph,
        :organicMatter,
        :nitrogen,
        :phosphorus,
        :potassium
      ) RETURNING *
    `, {
      replacements: {
        longitude: coordinates[0],
        latitude: coordinates[1],
        ...mockSoilData
      },
      type: QueryTypes.INSERT
    });
    
    return newSoilData;
  } catch (error) {
    console.error('Soil data error:', error);
    throw new Error('Failed to fetch soil data');
  }
};

module.exports = { getSoilData };