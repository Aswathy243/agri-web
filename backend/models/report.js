module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'name',
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'location',
    },
    panchayat: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'panchayat',
    },
    block: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'block',
    },
    cropType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'crop_type',
    },
    damageCause: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'damage_cause',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'description',
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'image_url',
    },
    trackingId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'tracking_id',
    },
    percentage: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: 'percentage',
    },
    land: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: 'land',
    },
    urgency: {
      type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
      allowNull: true,
      field: 'urgency',
    },
    status: {
      type: DataTypes.ENUM('Pending', 'In Review', 'Approved', 'Rejected', 'Compensated'),
      allowNull: false,
      defaultValue: 'Pending',
      field: 'status',
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'submitted_at',
    },
    in_review_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'in_review_at',
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'approved_at',
    },
    rejected_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'rejected_at',
    },
    compensated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'compensated_at',
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'remarks',
    },
    processed_date: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'processed_date',
    },
    read: {
     type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'read',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'createdAt',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'updatedat',
    },
  }, {
    tableName: 'reports',
    timestamps: true, // Enable timestamps to match createdAt/updatedat
    underscored: true, // Ensure snake_case field names
  });

  return Report;
};