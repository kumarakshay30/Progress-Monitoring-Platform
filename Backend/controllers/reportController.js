const { sendEmailWithAttachment } = require('../utils/emailService');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Send task report via email
// @route   POST /api/reports/send-email
// @access  Private/Admin
exports.sendTaskReportEmail = async (req, res) => {
  try {
    const { filename, fileData } = req.body;

    if (!filename || !fileData) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both filename and file data',
      });
    }

    // Get admin email(s)
    const admins = await User.find({ role: 'admin' }).select('email');
    
    if (!admins || admins.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No admin users found',
      });
    }

    const adminEmails = admins.map(admin => admin.email).join(',');

    // Send email with attachment
    const emailResult = await sendEmailWithAttachment({
      to: adminEmails,
      subject: `Task Report - ${new Date().toLocaleDateString()}`,
      text: 'Please find attached the latest task report.',
      filename,
      content: fileData,
    });

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: emailResult.error,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Report sent to admin email successfully',
      messageId: emailResult.messageId,
      previewUrl: emailResult.previewUrl,
    });
  } catch (error) {
    console.error('Error in sendTaskReportEmail:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};