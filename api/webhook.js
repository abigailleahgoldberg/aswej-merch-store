const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fetch = require('node-fetch');
const { buffer } = require('micro');

const createPrintfulOrder = async (session) => {
    const items = JSON.parse(session.metadata.items);
    // Stripe 2026+ API: shipping is under collected_information.shipping_details
    const address = session.collected_information?.shipping_details
        || session.shipping_details
        || session.shipping;

    // Map cart items to Printful variant IDs
    const orderItems = items.map(item => ({
        sync_variant_id: getSyncVariantId(item.id, item.size, item.color),
        quantity: item.quantity,
        retail_price: item.price.toString()
    }));

    // Create order in Printful
    const response = await fetch('https://api.printful.com/orders', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.PRINTFUL_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            recipient: {
                name: address.name,
                address1: address.address.line1,
                address2: address.address.line2,
                city: address.address.city,
                state_code: address.address.state,
                country_code: address.address.country,
                zip: address.address.postal_code
            },
            items: orderItems,
            retail_costs: {
                subtotal: (session.amount_subtotal / 100).toString(),
                shipping: (session.total_details.amount_shipping / 100).toString(),
                tax: (session.total_details.amount_tax / 100).toString()
            }
        })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Printful API error: ${JSON.stringify(data)}`);
    }

    return data;
};

// Helper function to get Printful sync variant ID
const getSyncVariantId = (productId, size, color) => {
    // Map of product variants to their Printful sync variant IDs
    const variantMap = {
        '419473357': {  // T-shirt
            'S': '5197023020',
            'M': '5197023021',
            'L': '5197023022',
            'XL': '5197023023',
            '2XL': '5197023024',
            '3XL': '5197023025',
            '4XL': '5197023026'
        },
        '419417492': {  // Hat
            'Black-S/M': '5196674755',
            'Black-L/XL': '5196674755',
            'Navy-S/M': '5196674756',
            'Navy-L/XL': '5196674756',
            'Khaki-S/M': '5196674757',
            'Khaki-L/XL': '5196674757'
        }
    };

    if (productId === '419417492') {  // Hat
        return variantMap[productId][`${color}-${size}`];
    }
    
    return variantMap[productId][size];
};

const handler = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Get raw body buffer for signature verification
        const rawBody = await buffer(req);

        // Verify webhook signature
        event = stripe.webhooks.constructEvent(
            rawBody,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle specific events
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        try {
            // Create order in Printful
            const printfulOrder = await createPrintfulOrder(session);
            console.log('Printful order created:', printfulOrder);

            return res.json({ received: true, printfulOrder });
        } catch (error) {
            console.error('Error creating Printful order:', error);
            return res.status(500).json({
                error: 'Failed to create Printful order',
                message: error.message
            });
        }
    }

    // Return 200 for other events
    res.json({ received: true });
};

// Disable Vercel body parsing — Stripe needs the raw body for signature verification
module.exports = handler;
module.exports.config = {
    api: {
        bodyParser: false,
    },
};