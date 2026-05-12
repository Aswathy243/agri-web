module.exports = (sequelize, DataTypes) => {
  const ForumQuestion = sequelize.define('ForumQuestion', {
    question_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    audio_path: {
      type: DataTypes.STRING,
      allowNull: true
    },
    region: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_emergency: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    farmer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'farmers',
        key: 'id'
      }
    }
  }, {
    tableName: 'forum_questions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    underscored: true
  });

  ForumQuestion.associate = models => {
    ForumQuestion.belongsTo(models.Farmer, {
      foreignKey: 'farmer_id',
      as: 'Farmer'  // Make sure the alias matches your frontend use
    });

    // ✅ Add this to load replies with each question
    ForumQuestion.hasMany(models.ForumReply, {
      foreignKey: 'question_id',
      as: 'ForumReplies'
    });
  };

  return ForumQuestion;
};
