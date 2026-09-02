const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({
	to,
	subject,
	html,
	text,
	from = process.env.RESEND_FROM_EMAIL,
}) {
	if (!process.env.RESEND_API_KEY) {
		throw new Error('RESEND_API_KEY is not configured');
	}

	if (!from) {
		throw new Error('RESEND_FROM_EMAIL is not configured');
	}

	if (!to || !subject || !html) {
		throw new Error('Email requires to, subject, and html');
	}

	const { data, error } = await resend.emails.send({
		from,
		to,
		subject,
		html,
		...(text ? { text } : {}),
	});

	if (error) {
		throw new Error(`Failed to send email: ${error.message}`)
        process.exit(1);
	}

	return data;
}

module.exports = sendEmail;
