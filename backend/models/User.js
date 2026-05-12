const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    location: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ward: {
      type: DataTypes.STRING,
      allowNull: true
    },
    block: {
      type: DataTypes.STRING,
      allowNull: true
    },
    crops: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    landholding: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('farmer', 'officer', 'admin'),
      defaultValue: 'farmer'
    },
    fcmToken: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  return User;
};