import Stripe from 'stripe';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('Missing STRIPE_SECRET_KEY');
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const { items } = req.body;

        if (!items?.length) {
            return res.status(400).json({ error: 'No items in cart' });
        }

        const lineItems = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    images: [item.image],
                    metadata: {
                        size: item.size,
                        productId: item.id
                    }
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/cart`,
            shipping_address_collection: {
                allowed_countries: ['US', 'CA'],
            }
        });

        return res.status(200).json({ sessionId: session.id });
    } catch (error) {
        console.error('Stripe error:', error);
        return res.status(500).json({ 
            error: 'Checkout failed', 
            details: error.message 
        });
    }
}