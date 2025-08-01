const express = require('express');
const app = express();
const PORT = 8000;

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'enterprise-scraping-backend' });
});

app.listen(PORT, () => {
    console.log(`Simple test server running on http://localhost:${PORT}`);
});
