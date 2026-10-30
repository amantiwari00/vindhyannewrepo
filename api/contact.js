const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
    }

    try {
        let body = req.body;
        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch (e) {
                body = {};
            }
        }
        body = body || {};

        const { name, phone, email, service, message } = body;

        if (!name || !email) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name and email are required fields.' 
            });
        }

        const gmailUser = process.env.GMAIL_USER;
        const gmailPass = process.env.GMAIL_APP_PASSWORD;
        const toEmail = process.env.TO_EMAIL || gmailUser;

        if (!gmailUser || !gmailPass) {
            console.error('Email credentials not configured: GMAIL_USER or GMAIL_APP_PASSWORD missing.');
            return res.status(500).json({ 
                success: false, 
                message: 'Server email credentials are not configured in Vercel environment variables.' 
            });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: gmailUser,
                pass: gmailPass
            }
        });

        const mailOptions = {
            from: `"VGS Website" <${gmailUser}>`,
            to: toEmail,
            replyTo: email,
            subject: `New Contact Inquiry: ${name}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Service Requested:</strong> ${service || 'General Inquiry'}</p>
                <p><strong>Message:</strong><br/> ${message ? message.replace(/\n/g, '<br/>') : 'No message provided'}</p>
            `
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ 
            success: true, 
            message: 'Your message has been received. We will get back to you shortly!' 
        });
    } catch (error) {
        console.error('Error handling contact form submission:', error);
        return res.status(500).json({ 
            success: false, 
            message: `Failed to send email: ${error.message}` 
        });
    }
};

