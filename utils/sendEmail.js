import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: process.env.SMTP_PORT,
		secure: false,
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASSWORD,
		},
	});

	const message = {
		from: `${process.env.FORM_NAME}<${process.env.FROM_EMAIL}>`,
		to: options.email,
		subject: options.subject,
		text: options.message,
	};

	const info = await transporter.sendMail(message);

	console.log('Message sent: %s', info.messageId);
};

export default sendEmail;
