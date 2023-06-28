require("dotenv").config();
const path = require("path");
const nodemailer = require("nodemailer");

const sendEmail = async (
  subject,
  message,
  emailFrom,
  emailTo,
  html 
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com", // hostname
    port: 465, // port for secure SMTP
    secure: true,
   // tls: { rejectUnauthorized: false },
    auth: {
      user: "isai@onenexum.com",
      pass: "dsbbqptcfqjsmieu",
    },
  });
/*   const transporter = nodemailer.createTransport({
    sendmail: true,
    host: "200.45.208.245", // hostname
    port: 587, // port for secure SMTP
    secure: true,
    tls: { rejectUnauthorized: false },
    auth: {
      user: "signin@onenexum.com",
      pass: "&4G99ony3",
    },
  }); */
  
  let mailOptions = {
    from: '"One Nexum" <hello@onenexum.com>', // dirección del remitente
    to: emailTo, // receptor
    subject: subject,
  };
  html ? (mailOptions.html = html) : (mailOptions.text = message);

  // send mail with defined transport object
  const info = await transporter.sendMail(mailOptions);
  
  return info

 /*  console.log("Message sent: %s", info.messageId);

  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info)); */
};

module.exports = {
  sendEmail,
};
