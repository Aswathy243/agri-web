const { sequelize } = require('../models');
const { createExtensions } = require('./extensions');

async function initializeDatabase() {
  try {
    // Create PostGIS extension if not exists
    await createExtensions();
    
    // Sync all models
    await sequelize.sync({ force: true }); // Use { alter: true } in production
    
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    await sequelize.close();
  }
}

initializeDatabase();