import './style.css';
import { loadStripe } from '@stripe/stripe-js';

// Product IDs
const PRODUCTS = {
  tee: {
    id: '419473357',
    name: 'JewSA Basic Tee',
    price: 29.99,
    image: 'https://files.cdn.printful.com/files/b4e/b4ebbc30701e79902092467a74f74124_preview.png'
  },
  hat: {
    id: '419417492',
    name: 'JewSA Old School Bucket Hat',
    price: 24.99,
    image: 'https://files.cdn.printful.com/files/3f4/3f41dd5bee9414a4c43fcefc2a63a429_preview.png'
  }
};

// Initialize Stripe
let stripe;
async function initStripe() {
  stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}
initStripe();

// Shopping Cart
let cart = [];

function addToCart(productType, size) {
  const product = PRODUCTS[productType];
  if (!product || !size) {
    alert('Please select a size first');
    return;
  }

  cart.push({
    ...product,
    size,
    quantity: 1
  });

  updateCartDisplay();
}

function updateCartDisplay() {
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    cartCount.textContent = cart.length;
  }

  const cartItems = document.getElementById('cart-items');
  if (cartItems) {
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" width="50">
        <div>
          <h3>${item.name}</h3>
          <p>Size: ${item.size}</p>
          <p>$${item.price.toFixed(2)}</p>
        </div>
        <button onclick="removeFromCart('${item.id}')">Remove</button>
      </div>
    `).join('');
  }
}

// Handle buy button clicks
document.querySelectorAll('.buy-button').forEach(button => {
  button.addEventListener('click', async (event) => {
    const card = event.target.closest('.product-card');
    const select = card.querySelector('select');
    const size = select.value;
    const productType = card.dataset.product;

    if (!size) {
      alert('Please select a size first');
      return;
    }

    addToCart(productType, size);
  });
});

// Checkout handler
async function handleCheckout() {
  try {
    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: cart }),
    });

    const { sessionId } = await response.json();
    const result = await stripe.redirectToCheckout({
      sessionId,
    });

    if (result.error) {
      alert(result.error.message);
    }
  } catch (error) {
    console.error('Checkout error:', error);
    alert('Checkout failed. Please try again.');
  }
}

// Initialize cart display
document.addEventListener('DOMContentLoaded', () => {
  updateCartDisplay();
});