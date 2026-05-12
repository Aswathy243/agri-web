const { sequelize } = require('../models');

async function createExtensions() {
  try {
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS "postgis"');
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('PostgreSQL extensions created');
  } catch (error) {
    console.error('Error creating extensions:', error);
    throw error;
  }
}

module.exports = { createExtensions };