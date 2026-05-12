module.exports = (sequelize, DataTypes) => {
  const Farmer = sequelize.define('Farmer', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    village: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    panchayat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    block: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    tableName: 'farmers',
    timestamps: true,         // ✅ adds created_at and updated_at
    underscored: true         // ✅ converts camelCase to snake_case
  });




 Farmer.associate = models => {
    Farmer.hasMany(models.ForumQuestion, {
      foreignKey: 'farmer_id',
      as: 'ForumQuestions'
    });
    Farmer.hasMany(models.ForumReply, {
      foreignKey: 'farmer_id',
      as: 'ForumReplies'
    });
  };




  return Farmer;
};
