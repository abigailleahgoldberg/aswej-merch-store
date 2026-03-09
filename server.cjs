require('dotenv').config();
const express = require('express');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fetch = require('node-fetch');

const app = express();

app.use('/api/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Checkout session - handles cart items
app.post('/api/create-checkout-session', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { items } = req.body;
    if (!items?.length) return res.status(400).json({ error: 'No items in cart' });

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: { name: item.name, images: [item.image] },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `https://store.jewsa.com/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://store.jewsa.com/cart`,
      shipping_address_collection: { allowed_countries: ['US', 'CA'] },
      metadata: { orderId: Date.now().toString(), items: JSON.stringify(items) }
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error('Checkout error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Also support /api/create-checkout
app.post('/api/create-checkout', async (req, res) => {
  req.body.items = req.body.items || req.body.cartItems;
  return app._router.handle(Object.assign(req, { url: '/api/create-checkout-session' }), res, () => {});
});

// Webhook - fires after payment, creates Printful order
app.post('/api/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: 'Webhook signature failed' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = await stripe.checkout.sessions.retrieve(event.data.object.id, { expand: ['shipping_details'] });
    const items = JSON.parse(session.metadata.items || '[]');
    const shipping = session.shipping_details || session.collected_information?.shipping_details;
    const addr = shipping?.address;

    if (addr && items.length) {
      const variantMap = {
        'jewsa-tee': { 'S':'5197023020','M':'5197023021','L':'5197023022','XL':'5197023023','2XL':'5197023024' },
        'jewsa-hat': { 'Black':'5196674755','Navy':'5196674756','Khaki':'5196674757' },
      };

      const orderItems = items.map(item => {
        const map = variantMap[item.id] || {};
        const variantId = map[item.size] || map[item.color] || Object.values(map)[0];
        return { sync_variant_id: parseInt(variantId), quantity: item.quantity };
      }).filter(i => i.sync_variant_id);

      if (orderItems.length) {
        await fetch('https://api.printful.com/orders?store_id=17719110', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${process.env.PRINTFUL_API_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipient: { name: shipping.name, email: session.customer_details?.email, address1: addr.line1, address2: addr.line2||'', city: addr.city, state_code: addr.state, zip: addr.postal_code, country_code: addr.country },
            items: orderItems,
          }),
        });
      }
    }
  }
  res.json({ received: true });
});

app.get(/.*/, (req, res) => res.sendFile(path.join(__dirname, 'dist/index.html')));

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`JewSA store running on port ${PORT}`));
