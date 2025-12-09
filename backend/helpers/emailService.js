// For now, just console.log
// Later integrate with nodemailer, SendGrid, etc.


const sendApprovalEmail = async (email, firstName) => {
  console.log(`📧 Sending approval email to: ${email}`);

  // TODO: Integrate email service
  const loginLink = `${process.env.FRONTEND_URL}/login`;
  
  // Email content:
  const subject = "Your Account Has Been Approved! ✅";
  const message = `
    Hi ${firstName},
    
    Great news! Your account has been approved by our admin team.
    
    You can now login and access your dashboard:
    ${loginLink}
    
    Welcome aboard!
    
    Best regards,
    Soccer Academy Team
  `;
  
  console.log('Email Subject:', subject);
  console.log('Email Message:', message);

  // TODO: Actually send email
  // await transporter.sendMail({ to: email, subject, text: message });
  
  return true;
};

const sendRejectionEmail = async (email, firstName) => {
  console.log(`📧 Sending rejection email to: ${email}`);
  
  const subject = "Account Registration Update";
  const message = `
    Hi ${firstName},
    
    Thank you for your interest in joining our academy.
    
    Unfortunately, your account registration was not approved.
    
    If you believe this is a mistake, please contact our admin team.
    
    Best regards,
    Soccer Academy Team
  `;
  
  console.log('Email Subject:', subject);
  console.log('Email Message:', message);
  
  // TODO: Actually send email
  
  return true;
};

module.exports = {
  sendApprovalEmail,
  sendRejectionEmail
};