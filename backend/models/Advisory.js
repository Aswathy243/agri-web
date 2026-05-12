// models/Advisory.js
module.exports = (sequelize, DataTypes) => {
  const Advisory = sequelize.define('Advisory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    crop: {
      type: DataTypes.STRING,
      allowNull: false
    },
    stage: {
      type: DataTypes.STRING,
      allowNull: false
    },
    advisoryText: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    soilType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    rainfallData: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true
  });

  return Advisory;
};
