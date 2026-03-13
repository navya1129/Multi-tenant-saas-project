const nodemailer = require('nodemailer');

const createTransporter = async () => {
  // Check if real SMTP credentials are provided in .env
  if (process.env.SMTP_USER && process.env.SMTP_USER !== 'your_email@gmail.com') {
    console.log("Using real SMTP credentials for email delivery");
    return nodemailer.createTransport({
      service: 'gmail', // Standard Google SMTP setup
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to Ethereal Email if no real credentials present
  console.log("=========================================");
  console.log("WARNING: Using Ethereal Email (Fake Database)");
  console.log("Emails will NOT reach real inboxes.");
  console.log("To send real emails, update your backend/.env file");
  console.log("=========================================");
  
  let testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });
};

const sendInvitationEmail = async (toEmail, fullName, tenantName, tempPassword, acceptLink) => {
  try {
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from: '"SaaSPlatform Admin" <noreply@saasplatform.com>',
      to: toEmail,
      subject: `Invitation to join ${tenantName} on SaaSPlatform`,
      text: `Hi ${fullName}, you have been invited to join ${tenantName}. Your temporary password is: ${tempPassword}. Please accept the invitation by clicking: ${acceptLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #4f46e5; padding: 20px; text-align: center; color: white;">
            <h2>You've been invited!</h2>
          </div>
          <div style="padding: 30px; background-color: #f8fafc;">
            <p>Hi <strong>${fullName}</strong>,</p>
            <p>You have been invited to join the <strong>${tenantName}</strong> workspace on SaaSPlatform.</p>
            
            <div style="background-color: white; border: 1px solid #e2e8f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #64748b;">Your Credentials:</h4>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${toEmail}</p>
              <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
            </div>
            
            <p>Please click the button below to accept your invitation and activate your account:</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${acceptLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Accept Invitation</a>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Message sent: %s", info.messageId);
    // Preview URL is very useful when using Ethereal email for local testing
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = {
  sendInvitationEmail
};
