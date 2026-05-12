'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('soil_data', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      ph: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      organic_matter: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      nitrogen: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      phosphorus: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      potassium: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      location: {
        type: Sequelize.GEOMETRY('POINT'),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add spatial index
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_soil_data_location ON soil_data USING GIST(location);
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('soil_data');
  }
};