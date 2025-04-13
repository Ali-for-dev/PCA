// backend/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async options => {
    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "90596b8f979807",
            pass: "bd1e5832fb81a6"
        }
    });

    const message = {
        from: "YourApp <noreply@yourapp.com>", // You can customize this
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    await transporter.sendMail(message);
};

module.exports = sendEmail;