import nodemailer, { SendMailOptions } from "nodemailer";

interface SendEmailProps {
  email: string;
  subject: string;
  message: string;
}

async function sendEmail({ email, subject, message }: SendEmailProps) {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) Define the email options
  const mailOptions: SendMailOptions = {
    from: "DevDreams@gmail.com",
    to: email,
    subject,
    text: message,
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
}

export default sendEmail;
