// models/Otp.js
module.exports = (sequelize, DataTypes) => {
  const Otp = sequelize.define('Otp', {
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    otp_code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'otps',
    timestamps: true, // adds `createdAt` and `updatedAt`
    underscored: true
  });

  return Otp;
};
