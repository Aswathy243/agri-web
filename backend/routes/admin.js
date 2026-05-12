const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

// 🔒 Allowed status transitions
const allowedTransitions = {
  Pending: ['In Review'],
  'In Review': ['Approved', 'Rejected'],
  Approved: ['Compensated'],
  Rejected: [],
  Compensated: []
};

// 🚥 Urgency calculator based on % of loss
function getUrgency(losspercent) {
  if (losspercent >= 76) return 'Critical';
  if (losspercent >= 51) return 'High';
  if (losspercent >= 26) return 'Medium';
  return 'Low';
}

// ✅ POST: Submit a new crop loss report
router.post('/reports', async (req, res) => {
  try {
    const {
      farmer_name, location, panchayat, block, croptype, area, loss_date,
      damagecause, description, imageurl, trackingid, losspercent
    } = req.body;

    if (!farmer_name || !location || !panchayat || !block || !croptype || !area || !loss_date ||
        !damagecause || !description || !trackingid || losspercent == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const urgency = getUrgency(losspercent);

    const insertQuery = `
      INSERT INTO crop_loss_reports (
        farmer_name, location, panchayat, block, croptype, area, loss_date,
        damagecause, description, imageurl, trackingid, losspercent,
        urgency, status, submitted_at
      )
      VALUES (
        :farmer_name, :location, :panchayat, :block, :croptype, :area, :loss_date,
        :damagecause, :description, :imageurl, :trackingid, :losspercent,
        :urgency, 'Pending', CURRENT_TIMESTAMP
      )
    `;

    await sequelize.query(insertQuery, {
      type: QueryTypes.INSERT,
      replacements: {
        farmer_name, location, panchayat, block, croptype, area, loss_date,
        damagecause, description, imageurl, trackingid, losspercent, urgency
      }
    });

    res.status(201).json({ success: true, message: 'Report submitted successfully' });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// ✅ GET: Summary counts for dashboard
router.get('/summary', async (req, res) => {
  try {
    const result = await sequelize.query(`
      SELECT
        COUNT(*) FILTER (WHERE urgency = 'Critical') AS critical,
        COUNT(*) FILTER (WHERE status = 'Pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'Approved') AS approved,
        COUNT(*) FILTER (WHERE status = 'Compensated') AS compensated
      FROM crop_loss_reports;
    `, { type: QueryTypes.SELECT });

    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// ✅ GET: Fetch reports with filters
router.get('/reports', async (req, res) => {
  try {
    const { damagecause, urgency, block, panchayat, status } = req.query;
    const conditions = [];
    const params = {};

    ['damagecause', 'urgency', 'block', 'panchayat', 'status'].forEach(field => {
      if (req.query[field]) {
        conditions.push(`${field} = :${field}`);
        params[field] = req.query[field];
      }
    });

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const reports = await sequelize.query(
      `SELECT * FROM crop_loss_reports ${whereClause} ORDER BY submitted_at DESC`,
      { type: QueryTypes.SELECT, replacements: params }
    );

    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// ✅ PATCH: Update status and remarks
router.patch('/reports/:id', async (req, res) => {
  const { id } = req.params;
  const { status: newStatus, remarks } = req.body;

  try {
    const report = await sequelize.query(
      `SELECT status FROM crop_loss_reports WHERE id = :id`,
      { type: QueryTypes.SELECT, replacements: { id } }
    );

    if (!report.length) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const currentStatus = report[0].status;
    const allowed = allowedTransitions[currentStatus] || [];

    if (!allowed.includes(newStatus)) {
      return res.status(400).json({
        error: `Invalid status transition from "${currentStatus}" to "${newStatus}". Allowed: [${allowed.join(', ')}]`
      });
    }

    let timestampField = '';
    if (newStatus === 'In Review') timestampField = 'in_review_at';
    else if (newStatus === 'Approved') timestampField = 'approved_at';
    else if (newStatus === 'Rejected') timestampField = 'rejected_at';
    else if (newStatus === 'Compensated') timestampField = 'compensated_at';

    const updateQuery = `
      UPDATE crop_loss_reports
      SET status = :status,
          remarks = :remarks
          ${timestampField ? `, ${timestampField} = CURRENT_TIMESTAMP` : ''}
      WHERE id = :id
    `;

    await sequelize.query(updateQuery, {
      type: QueryTypes.UPDATE,
      replacements: { status: newStatus, remarks, id }
    });

    res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ error: 'Failed to update report status' });
  }
});

module.exports = router;
