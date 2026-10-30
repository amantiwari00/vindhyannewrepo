require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the current directory
app.use(express.static(__dirname));

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// Verify email config on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('Nodemailer configuration error (check your .env file and App Password):', error);
    } else {
        console.log('Nodemailer is configured correctly and ready to send emails.');
    }
});

// Configure Multer for PDF uploads using memory storage (no disk writes)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed.'));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Routes
app.post('/api/contact', async (req, res) => {
    console.log('--- New Contact Form Submission ---');
    console.log('Name:', req.body.name);
    console.log('Phone:', req.body.phone);
    console.log('Email:', req.body.email);
    console.log('Service:', req.body.service);
    console.log('Message:', req.body.message);
    
    try {
        const mailOptions = {
            from: `"VGS Website" <${process.env.GMAIL_USER}>`,
            to: process.env.TO_EMAIL,
            replyTo: req.body.email,
            subject: `New Contact Inquiry: ${req.body.name}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${req.body.name}</p>
                <p><strong>Phone:</strong> ${req.body.phone}</p>
                <p><strong>Email:</strong> ${req.body.email}</p>
                <p><strong>Service Requested:</strong> ${req.body.service}</p>
                <p><strong>Message:</strong><br/> ${req.body.message}</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Contact email sent successfully.');
        res.status(200).json({ success: true, message: 'Your message has been received. We will get back to you shortly!' });
    } catch (error) {
        console.error('Error sending contact email:', error);
        res.status(500).json({ success: false, message: `Failed to send email: ${error.message}` });
    }
    console.log('-----------------------------------');
});

app.post('/api/careers', upload.single('cresume'), async (req, res) => {
    console.log('--- New Careers Application ---');
    console.log('Name:', req.body.cname);
    console.log('Phone:', req.body.cphone);
    console.log('Email:', req.body.cemail);
    console.log('Position:', req.body.position);
    console.log('Message:', req.body.cmessage);
    
    if (!req.file) {
        console.log('No resume uploaded (or invalid format).');
        return res.status(400).json({ success: false, message: 'Please upload a valid PDF resume.' });
    }

    try {
        const mailOptions = {
            from: `"VGS Careers" <${process.env.GMAIL_USER}>`,
            to: process.env.TO_EMAIL,
            replyTo: req.body.cemail,
            subject: `Job Application: ${req.body.position} - ${req.body.cname}`,
            html: `
                <h2>New Career Application</h2>
                <p><strong>Name:</strong> ${req.body.cname}</p>
                <p><strong>Phone:</strong> ${req.body.cphone}</p>
                <p><strong>Email:</strong> ${req.body.cemail}</p>
                <p><strong>Position Applied For:</strong> ${req.body.position}</p>
                <p><strong>Message:</strong><br/> ${req.body.cmessage}</p>
            `,
            attachments: [{
                filename: req.file.originalname,
                content: req.file.buffer,
                contentType: 'application/pdf'
            }]
        };

        await transporter.sendMail(mailOptions);
        console.log('Careers email sent successfully with resume attachment.');
        res.status(200).json({ success: true, message: 'Your application and resume have been submitted successfully!' });
    } catch (error) {
        console.error('Error handling career submission:', error);
        res.status(500).json({ success: false, message: `An error occurred while sending your application: ${error.message}` });
    }
    console.log('-------------------------------');
});

// Removed fallback route to support standard static multi-page navigation

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Serving static files from ${__dirname}`);
    console.log(`Note: GMAIL_APP_PASSWORD requires 2-Step Verification to be enabled on your Google account. Use an App Password from Google Account Security, NOT your normal login password.`);
});
