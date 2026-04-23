import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `FlitStore <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message, // Fallback for plain text (like OTPs)
    html: options.html,    // 🟢 Added to support professional Order Invoices
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;