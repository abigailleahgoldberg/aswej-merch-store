const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// API routes
app.post('/api/create-checkout-session', require('./api/create-checkout-session'));
app.post('/api/create-checkout', require('./api/create-checkout'));
app.post('/api/webhook', require('./api/webhook'));

// SPA fallback
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist/index.html')));

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`JewSA store running on port ${PORT}`));
