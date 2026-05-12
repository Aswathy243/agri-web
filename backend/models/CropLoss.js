// models/CropLoss.js
module.exports = (sequelize, DataTypes) => {
  const CropLoss = sequelize.define('CropLoss', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cropType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    damageCause: {
      type: DataTypes.ENUM('climate', 'animal', 'pest', 'disease', 'other'),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    location: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: false
    },
   /* latitude: {
  type: DataTypes.FLOAT,
  allowNull: false
},
longitude: {
  type: DataTypes.FLOAT,
  allowNull: false
},*/

    status: {
      type: DataTypes.ENUM('submitted', 'under_review', 'approved', 'rejected', 'compensated'),
      defaultValue: 'submitted'
    },
    trackingId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    officerComments: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    compensationAmount: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    schemeApplied: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true,
    hooks: {
      beforeCreate: (cropLoss) => {
        if (!cropLoss.trackingId) {
          cropLoss.trackingId = `CL-${Date.now().toString(36).toUpperCase()}`;
        }
      }
    }
  });

  return CropLoss;
};
