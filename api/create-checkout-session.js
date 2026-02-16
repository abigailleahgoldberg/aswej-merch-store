import Stripe from 'stripe';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Initialize Stripe with the secret key
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const { items } = req.body;

        if (!items?.length) {
            return res.status(400).json({ message: 'No items in cart' });
        }

        // Create line items for Stripe
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
                unit_amount: Math.round(item.price * 100), // Stripe uses cents
            },
            quantity: item.quantity,
        }));

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/cart`,
            shipping_address_collection: {
                allowed_countries: ['US', 'CA'],
            },
            metadata: {
                orderId: Date.now().toString()
            }
        });

        // Return the session ID
        res.status(200).json({ sessionId: session.id });
    } catch (error) {
        console.error('Stripe error:', error);
        res.status(500).json({ 
            message: 'Checkout session creation failed',
            error: error.message 
        });
    }
}