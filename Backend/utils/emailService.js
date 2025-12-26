const nodemailer = require('nodemailer');
const path = require('path');

// Create a test account for development (ethereal.email)
const createTestAccount = async () => {
  const testAccount = await nodemailer.createTestAccount();
  return {
    user: testAccount.user,
    pass: testAccount.pass,
    smtp: {
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    },
  };
};

// Production SMTP configuration (update these in your .env file)
const getSmtpConfig = () => ({
  host: process.env.SMTP_HOST || 'smtp.gmail.com', // For Gmail, update for other providers
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

// Create transporter
const createTransporter = async () => {
  let transporter;
  
  if (process.env.NODE_ENV === 'production') {
    transporter = nodemailer.createTransport(getSmtpConfig());
  } else {
    // For development, use ethereal.email
    const testAccount = await createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    // Log the test account details for development
    console.log('Test account created:');
    console.log(`Username: ${testAccount.user}`);
    console.log(`Password: ${testAccount.pass}`);
  }
  
  return transporter;
};

// Send email with attachment
const sendEmailWithAttachment = async ({ to, subject, text, filename, content }) => {
  try {
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: `"Progress Monitoring System" <${process.env.SMTP_USER || 'noreply@example.com'}>`,
      to,
      subject: subject || 'Task Report',
      text: text || 'Please find the attached task report.',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Task Report</h2>
          <p>${text || 'Please find the attached task report.'}</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      `,
      attachments: [
        {
          filename,
          content: Buffer.from(content, 'base64'),
          contentType: 'text/csv',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    
    // For development, log the preview URL
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return {
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      message: 'Failed to send email',
      error: error.message,
    };
  }
};

module.exports = {
  sendEmailWithAttachment,
};
