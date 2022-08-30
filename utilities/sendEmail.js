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
    host: "smtp-mail.outlook.com", // hostname
    port: 587, // port for secure SMTP
    secureConnection: false,
    tls: {
      ciphers: "SSLv3",
    },
    auth: {
      user: "tobias.blaksley@hotmail.com",
      pass: "Vildom90",
    },
  });
  let mailOptions = {
    from: emailFrom || "tobias.blaksley@hotmail.com", // dirección del remitente
    to: emailTo || "tobias.blaksley@hotmail.com", // receptor
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
