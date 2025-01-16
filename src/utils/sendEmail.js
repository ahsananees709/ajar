import nodemailer from "nodemailer"
import { EMAIL_NAME,EMAIL_USER,EMAIL_PASS } from "./constant.js";
const transporter = nodemailer.createTransport({
  service:"gmail",
  // host: "smtp.gmail.com",
  port: 465,
  secure: true,
  // logger: true,
  // debug: true,
  // secureConnection:300000,
  // socketTimeout:false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
    },
    tls:{
        rejectUnAuthorized:true
    }
});

// async function sendEmail(subject,text,html,to) {

//   const info = await transporter.sendMail({
//     from: {
//       name: EMAIL_NAME,
//       address: EMAIL_USER
//     },
//     to: to|| "ahsan.flower1@gmail.com",
//     subject:subject|| "Hello ✔",
//     text:text|| "Hello world?",
//     html:html|| "<b>Hello world?</b>",
//   });

//   console.log("Message sent: %s", info.messageId);
//   // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
// }
const sendEmail = async (subject, emailContent, recipientEmail) => {
  try {
      await transporter.sendMail({
        from: {
                name: EMAIL_NAME,
                address: EMAIL_USER
              },
          to: recipientEmail,
          subject: subject,
          html: emailContent,
      });
  } catch (error) {
      console.error('Error sending email:', error.message);
      throw error; // Pass the error up to handle it elsewhere
  }
};
export default sendEmail
