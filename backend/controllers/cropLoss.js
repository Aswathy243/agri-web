const { CropLoss, User } = require('../models');
const { sendNotification, sendMulticastNotification } = require('../services/firebase');
const ErrorResponse = require('../utils/errorResponse');

exports.reportCropLoss = async (req, res, next) => {
  try {
    const { cropType, damageCause, description, imageUrl } = req.body;
    
    const cropLoss = await CropLoss.create({
      farmerId: req.user.id,
      cropType,
      damageCause,
      description,
      images: imageUrl ? [imageUrl] : [],
      location: req.user.location,
      status: 'submitted'
    });

    // Notify farmer
    if (req.user.deviceToken) {
      await sendNotification(
        req.user.deviceToken,
        'Crop Loss Report Submitted',
        `Your report for ${cropType} has been received (ID: ${cropLoss.trackingId})`,
        { reportId: cropLoss.id.toString() }
      );
    }

    // Notify officers in the same area
    const officers = await User.findAll({
      where: {
        role: 'officer',
        // Using PostGIS function ST_DWithin to find nearby officers
        [Sequelize.Op.and]: [
          sequelize.where(
            sequelize.fn('ST_DWithin', 
              sequelize.col('location'),
              sequelize.fn('ST_SetSRID', 
                sequelize.fn('ST_MakePoint', ...req.user.location.coordinates),
                4326
              ),
              5000 // 5km radius
            ),
            true
          )
        ]
      }
    });

    if (officers.length > 0) {
      const officerTokens = officers.map(o => o.deviceToken).filter(t => t);
      if (officerTokens.length > 0) {
        await sendMulticastNotification(
          officerTokens,
          'New Crop Loss Report',
          `New ${cropType} damage reported in your area`,
          { reportId: cropLoss.id.toString() }
        );
      }
    }

    res.status(201).json({
      success: true,
      data: cropLoss
    });
  } catch (err) {
    next(err);
  }
};


//Following codes are rough. Remember...CropLoss



exports.getCropLossReports = async (req, res, next) => {
  try {
    const reports = await CropLoss.findAll({ where: { farmerId: req.user.id } });
    res.status(200).json({ success: true, data: reports });
  } catch (err) {
    next(err);
  }
};

exports.updateCropLossReport = async (req, res, next) => {
  try {
    const report = await CropLoss.findOne({ where: { id: req.params.id, farmerId: req.user.id } });
    if (!report) {
      return next(new ErrorResponse('Report not found', 404));
    }
    // Update report fields from req.body as needed
    await report.update(req.body);

    res.status(200).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};
