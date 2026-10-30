const multer = require('multer');
const nodemailer = require('nodemailer');

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 4.5 * 1024 * 1024 }, // Vercel limit is 4.5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed.'));
        }
    }
});

function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

const handler = async function (req, res) {
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
        await runMiddleware(req, res, upload.single('cresume'));

        const { cname, cphone, cemail, position, cmessage } = req.body || {};

        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please upload a valid PDF resume (maximum 4.5MB).' 
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
            from: `"VGS Careers" <${gmailUser}>`,
            to: toEmail,
            replyTo: cemail,
            subject: `Job Application: ${position || 'Applicant'} - ${cname || 'Candidate'}`,
            html: `
                <h2>New Career Application</h2>
                <p><strong>Name:</strong> ${cname || 'Not provided'}</p>
                <p><strong>Phone:</strong> ${cphone || 'Not provided'}</p>
                <p><strong>Email:</strong> ${cemail || 'Not provided'}</p>
                <p><strong>Position Applied For:</strong> ${position || 'General Position'}</p>
                <p><strong>Message / Cover Note:</strong><br/> ${cmessage ? cmessage.replace(/\n/g, '<br/>') : 'No message provided'}</p>
                <p><strong>Resume:</strong> Attached (${req.file.originalname})</p>
            `,
            attachments: [{
                filename: req.file.originalname,
                content: req.file.buffer,
                contentType: 'application/pdf'
            }]
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ 
            success: true, 
            message: 'Your application and resume have been submitted successfully!' 
        });
    } catch (error) {
        console.error('Error handling career submission:', error);
        return res.status(500).json({ 
            success: false, 
            message: `Failed to process application: ${error.message}` 
        });
    }
};

handler.config = {
    api: {
        bodyParser: false,
    },
};

module.exports = handler;

