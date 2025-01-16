// emailTemplates.js
const generateEmailTemplate = (subject, greeting, messageBody, footerText) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background-color: #4caf50;
            padding: 20px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 30px;
          }
          .content p {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            font-size: 16px;
            color: white;
            background-color: #4caf50;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
          .footer {
            background-color: #f4f4f4;
            padding: 10px;
            text-align: center;
            font-size: 14px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header Section -->
          <div class="header">
            <h1>${subject}</h1>
          </div>

          <!-- Content Section -->
          <div class="content">
            <p>${greeting}</p>
            <p>${messageBody}</p>

            <!-- Add a button if needed -->
           <!-- <a href="#" class="button">Take Action</a> -->
          </div>

          <!-- Footer Section -->
          <div class="footer">
            <p>${footerText}</p>
          </div>
        </div>
      </body>
    </html>
    `;
};


const registrationEmail = (first_name, last_name, otp) => {
    const subject = "Registration Successful - Welcome!";
    const greeting = `Hello ${first_name} ${last_name},`;
    const messageBody = `
      <p>Thank you for registering with us! We are excited to have you on board.</p>
      <p>Your OTP for completing the registration is: <strong>${otp}</strong></p>
      <p>Please enter this OTP on our website to verify your account.</p>
    `;
    const footerText = "If you did not request this, please contact our support team.";

    return generateEmailTemplate(subject, greeting, messageBody, footerText);
};

const accountVerificationEmail = (first_name, last_name,email) => {
    const subject = "Account Verified";
    const greeting = `Hello ${first_name} ${last_name},`;
    const messageBody = `
      <p>Thank you for signing up!</p>
      <p>Your email has been verified successfully.</p>
      <p>Now you can login to your account using you email: <strong>${email}</strong></p>
    `;
    const footerText = "If you need help, feel free to contact our support team.";

    return generateEmailTemplate(subject, greeting, messageBody, footerText);
};

const getNewOtpEmail = (first_name, last_name, otp) => {
    const subject = "Request for new OTP";
    const greeting = `Hello ${first_name} ${last_name},`;
    const messageBody = `
      <p>We received a request for new OTP from your registered email!</p>
      <p>Your new OTP is <strong>${otp}</strong></p>
    `;
    const footerText = "If you did not request a password reset, please contact our support team.";

    return generateEmailTemplate(subject, greeting, messageBody, footerText);
};

const loginNotificationEmail = (first_name, last_name) => {
    const subject = "New Login to Your Account";
    const greeting = `Hello ${first_name} ${last_name},`;
    const messageBody = `
      <p>We noticed a new login to your account just now.</p>
      <p>If this was you, you can safely ignore this email. If you didn't log in, please change your password immediately to protect your account.</p>
    `;
    const footerText = "If you need assistance, please contact our support team.";

    return generateEmailTemplate(subject, greeting, messageBody, footerText);
};

const passwordUpdateEmail = (first_name, last_name, email) => {
  const subject = "Your Password Has Been Updated";
  const greeting = `Hello ${first_name} ${last_name},`;
  const messageBody = `
    <p>Your account password has just been updated against email.</p>
    <p><strong>${email}</strong></p>
    <p>If you made this change, no further action is required. If you did not change your password, please contact our support team immediately.</p>
  `;
  const footerText = "If you need assistance, please contact our support team.";

  return generateEmailTemplate(subject, greeting, messageBody, footerText);
};

// Password Reset Email
const passwordResetEmail = (first_name, last_name, email) => {
    const subject = "Password Has Been Reset";
    const greeting = `Hello ${first_name} ${last_name},`;
    const messageBody = `
    <p>Your account password has just been reset against email.</p>
    <p><strong>${email}</strong></p>
    <p>If you made this change, no further action is required. If you did not change your password, please contact our support team immediately.</p>
  `;
    const footerText = "If you did not request a password reset, please ignore this email.";

    return generateEmailTemplate(subject, greeting, messageBody, footerText);
};

const adminCreateUser = (first_name, last_name, password, email) => {
  const subject = "Account Created Successfully by Admin - Welcome!";
  const greeting = `Hello ${first_name} ${last_name},`;
  const messageBody = `
    <p>Ypur account has been created by admin.</p>
    <p>These are your credentials of your account</p>
    <p>Username/Email: <strong>${email}</strong></p>
    <p>Password: <strong>${password}</strong></p>
    <p>This is your auto generated password please update your password after logging in to your account.</p>
  `;
  const footerText = "If you did not request this, please contact our support team.";

  return generateEmailTemplate(subject, greeting, messageBody, footerText);
};

// Export all email functions
export {
    registrationEmail,
    loginNotificationEmail,
    accountVerificationEmail,
  getNewOtpEmail,
  passwordUpdateEmail,
  passwordResetEmail,
  adminCreateUser
};
