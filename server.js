require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const contactHandler = require('./api/contact.js');
const careersHandler = require('./api/careers.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Clean URL page routes
app.get(['/', '/home'], (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/services', (req, res) => {
    res.sendFile(path.join(__dirname, 'services.html'));
});

app.get('/gallery', (req, res) => {
    res.sendFile(path.join(__dirname, 'gallery.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/privacy-policy', (req, res) => {
    res.sendFile(path.join(__dirname, 'privacy-policy.html'));
});

// API Routes
app.post('/api/contact', contactHandler);
app.post('/api/careers', careersHandler);
app.get('/api', (req, res) => {
    res.json({ status: 'ok', message: 'Vindhyan Geotechnical Services API is active' });
});

// Serve static files from the current directory
app.use(express.static(__dirname, { extensions: ['html'] }));

// 404 fallback route for unknown pages
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// Start Server locally
if (require.main === module || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log(`Serving static files from ${__dirname}`);
    });
}

module.exports = app;
