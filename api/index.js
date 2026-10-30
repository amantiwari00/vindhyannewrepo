module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ 
        status: 'ok', 
        message: 'Vindhyan Geotechnical Services API is active',
        endpoints: [
            '/api/contact',
            '/api/careers'
        ]
    });
};
