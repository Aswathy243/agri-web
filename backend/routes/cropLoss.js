const express = require('express');
const { protect } = require('../middlewares/auth');
const { 
  reportCropLoss,
  getCropLossReports,
  updateCropLossReport 
} = require('../controllers/cropLoss');

const router = express.Router();

router.use(protect);

router.post('/', reportCropLoss);
router.get('/', getCropLossReports);
router.put('/:id', updateCropLossReport);

module.exports = router;