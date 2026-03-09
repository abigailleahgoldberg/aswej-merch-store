import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Raw body for Stripe webhook
app.use('/api/webhook', express.raw({ type: 'application/json' }));
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
