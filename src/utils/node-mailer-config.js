const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html, bcc = null) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Mail options
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: html,
    };

    if (bcc) {
      mailOptions.bcc = bcc;
    }

    // await transporter.sendMail(mailOptions);
  } catch (err) {
    throw new Error(`Error sending email: ${err.message}`);
  }
};

module.exports = { sendEmail };
