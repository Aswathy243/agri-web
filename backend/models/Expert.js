module.exports = (sequelize, DataTypes) => {
  const Expert = sequelize.define('Expert', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(15),
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    designation: {
      type: DataTypes.STRING,
    },
    department: {
      type: DataTypes.STRING,
    },
    region: {
      type: DataTypes.STRING,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(20),
      defaultValue: 'expert',
    },
    specialization: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'experts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    underscored: true,
  });

  return Expert;
};
