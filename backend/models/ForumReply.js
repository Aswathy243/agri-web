module.exports = (sequelize, DataTypes) => {
  const ForumReply = sequelize.define('ForumReply', {
    reply_text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    upvotes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    expert_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    farmer_name: {  // Add this for farmer name storage
      type: DataTypes.STRING,
      allowNull: true
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'forum_questions',
        key: 'id'
      }
    },
    expert_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'experts',
        key: 'id'
      }
    },
    farmer_id: {  // Add this field for farmer association
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'farmers',
        key: 'id'
      }
    }
  }, {
    tableName: 'forum_replies',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  ForumReply.associate = models => {
    ForumReply.belongsTo(models.ForumQuestion, {
      foreignKey: 'question_id',
      as: 'Question'
    });
    ForumReply.belongsTo(models.Expert, {
      foreignKey: 'expert_id',
      as: 'Expert'
    });
    ForumReply.belongsTo(models.Farmer, {
      foreignKey: 'farmer_id',
      as: 'Farmer'
    });
        ForumReply.hasMany(models.ReplyVote, { foreignKey: 'reply_id', as: 'Votes' });

  };

  return ForumReply;
};