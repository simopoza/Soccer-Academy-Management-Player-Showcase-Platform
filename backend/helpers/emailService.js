const nodemailer = require('nodemailer');

// Create transporter with Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendApprovalEmail = async (email, firstName) => {
  try {
    console.log(`📧 Sending approval email to: ${email}`);

    const loginLink = `${process.env.FRONTEND_URL}/login`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Soccer Academy <mohammedannahri18@gmail.com>',
      to: email,
      subject: 'Your Account Has Been Approved! ✅',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Account Approved!</h2>
          <p>Hi ${firstName},</p>
          <p>Great news! Your account has been approved by our admin team.</p>
          <p>You can now login and access your dashboard:</p>
          <a href="${loginLink}" style="display: inline-block; padding: 12px 24px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 5px; margin: 16px 0;">
            Login Now
          </a>
          <p>Welcome aboard!</p>
          <p style="color: #666; margin-top: 32px;">
            Best regards,<br/>
            Soccer Academy Team
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Approval email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending approval email:', error);
    return false;
  }
};

const sendRejectionEmail = async (email, firstName) => {
  try {
    console.log(`📧 Sending rejection email to: ${email}`);
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Soccer Academy <mohammedannahri18@gmail.com>',
      to: email,
      subject: 'Account Registration Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Registration Update</h2>
          <p>Hi ${firstName},</p>
          <p>Thank you for your interest in joining our academy.</p>
          <p>Unfortunately, your account registration was not approved at this time.</p>
          <p>If you believe this is a mistake, please contact our admin team.</p>
          <p style="color: #666; margin-top: 32px;">
            Best regards,<br/>
            Soccer Academy Team
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Rejection email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending rejection email:', error);
    return false;
  }
};

module.exports = {
  sendApprovalEmail,
  sendRejectionEmail
};