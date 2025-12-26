const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { sendTaskReportEmail } = require('../controllers/reportController');

const router = express.Router();

// @route   POST /api/reports/send-email
// @desc    Send task report via email to admin
// @access  Private/Admin
router.post(
  '/send-email',
  protect,
  authorize('admin'),
  sendTaskReportEmail
);

module.exports = router;