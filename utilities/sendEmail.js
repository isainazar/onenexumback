require("dotenv").config();
const path = require("path");
const nodemailer = require("nodemailer");

const sendEmail = async (
  subject,
  message,
  emailFrom,
  emailTo,
  html = false
) => {
  const transporter = nodemailer.createTransport({
    host: "onenexum.com", // hostname
    port: 465, // port for secure SMTP
    secure: true,
    tls: {
      ciphers: "SSLv3",
    },
    auth: {
      user: "newsletter@onenexum.com",
      pass: "IESChub2022.!",
    },
  });
  let mailOptions = {
    from: emailFrom || "newsletter@onenexum.com", // dirección del remitente
    to: emailTo || "newsletter@onenexum.com", // receptor
    subject: subject,
  };
  html ? (mailOptions.html = html) : (mailOptions.text = message);

  // send mail with defined transport object
  const info = await transporter.sendMail(mailOptions);

  console.log("Message sent: %s", info.messageId);

  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};

module.exports = {
  sendEmail,
};
