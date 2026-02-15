// Import styles
import './style.css';

// Product data
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

// Cart state
let cart = JSON.parse(localStorage.getItem('jewsa-cart') || '[]');

// Simple function to add items to cart
function addToCart(productType, size) {
  console.log('Adding to cart:', productType, size);
  
  if (!size) {
    alert('Please select a size first');
    return;
  }

  const product = PRODUCTS[productType];
  const existingItem = cart.find(item => item.id === product.id && item.size === size);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      size,
      quantity: 1
    });
  }

  // Save cart
  localStorage.setItem('jewsa-cart', JSON.stringify(cart));
  
  // Update display
  updateCartDisplay();
  
  // Show notification
  showNotification('Item added to cart!');
}

// Update cart display
function updateCartDisplay() {
  console.log('Updating cart display');
  
  // Update cart count
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
  }

  // Update cart items
  const cartItems = document.getElementById('cart-items');
  if (cartItems) {
    if (cart.length === 0) {
      cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
      return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartItems.innerHTML = `
      ${cart.map(item => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}">
          <div class="cart-item-details">
            <h3>${item.name}</h3>
            <p>Size: ${item.size}</p>
            <p>$${item.price.toFixed(2)} × ${item.quantity}</p>
          </div>
          <div class="cart-item-actions">
            <button onclick="updateQuantity('${item.id}', '${item.size}', ${item.quantity - 1})">-</button>
            <span>${item.quantity}</span>
            <button onclick="updateQuantity('${item.id}', '${item.size}', ${item.quantity + 1})">+</button>
          </div>
        </div>
      `).join('')}
      <div class="cart-summary">
        <div class="cart-total">
          <span>Total:</span>
          <span>$${total.toFixed(2)}</span>
        </div>
        <button onclick="checkout()" class="checkout-button">Checkout</button>
      </div>
    `;
  }
}

// Show notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 2000);
}

// Update quantity
function updateQuantity(productId, size, newQuantity) {
  if (newQuantity < 1) {
    cart = cart.filter(item => !(item.id === productId && item.size === size));
  } else {
    const item = cart.find(item => item.id === productId && item.size === size);
    if (item) {
      item.quantity = newQuantity;
    }
  }
  
  localStorage.setItem('jewsa-cart', JSON.stringify(cart));
  updateCartDisplay();
}

// Checkout function
async function checkout() {
  const stripe = Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: cart,
      }),
    });

    const { sessionId } = await response.json();
    
    const result = await stripe.redirectToCheckout({
      sessionId,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error('Checkout error:', error);
    showNotification('Checkout failed. Please try again.');
  }
}

// Make functions available globally
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.checkout = checkout;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('Page loaded, initializing cart...');
  updateCartDisplay();
});