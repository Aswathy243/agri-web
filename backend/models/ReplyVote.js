module.exports = (sequelize, DataTypes) => {
  const ReplyVote = sequelize.define('ReplyVote', {
    farmer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reply_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    tableName: 'reply_votes',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['farmer_id', 'reply_id']
      }
    ]
  });

  return ReplyVote;
};