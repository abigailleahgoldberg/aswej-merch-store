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

// Initialize Stripe
const stripe = Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Shopping cart with localStorage persistence
let cart = JSON.parse(localStorage.getItem('jewsa-cart') || '[]');

// Add to cart function
function addToCart(productType, size) {
  const product = PRODUCTS[productType];
  if (!product || !size) {
    alert('Please select a size first');
    return;
  }

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

  saveCart();
  updateCartDisplay();
  showCartNotification();
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('jewsa-cart', JSON.stringify(cart));
}

// Update cart display
function updateCartDisplay() {
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
  }

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
            <p>$${item.price.toFixed(2)} x ${item.quantity}</p>
          </div>
          <div class="cart-item-actions">
            <button onclick="window.updateQuantity('${item.id}', '${item.size}', ${item.quantity - 1})">-</button>
            <span>${item.quantity}</span>
            <button onclick="window.updateQuantity('${item.id}', '${item.size}', ${item.quantity + 1})">+</button>
          </div>
        </div>
      `).join('')}
      <div class="cart-summary">
        <div class="cart-total">
          <span>Total:</span>
          <span>$${total.toFixed(2)}</span>
        </div>
        <button onclick="window.checkout()" class="checkout-button">Checkout</button>
      </div>
    `;
  }
}

// Update item quantity
window.updateQuantity = function(productId, size, newQuantity) {
  if (newQuantity < 1) {
    cart = cart.filter(item => !(item.id === productId && item.size === size));
  } else {
    const item = cart.find(item => item.id === productId && item.size === size);
    if (item) {
      item.quantity = newQuantity;
    }
  }
  saveCart();
  updateCartDisplay();
};

// Show cart notification
function showCartNotification() {
  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.textContent = 'Item added to cart!';
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 2000);
}

// Handle checkout
window.checkout = async function() {
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
    alert('Checkout failed. Please try again.');
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Add to cart button handlers
  document.querySelectorAll('.buy-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      const select = card.querySelector('select');
      const productType = card.dataset.product;
      const size = select.value;

      if (!size) {
        alert('Please select a size first');
        return;
      }

      addToCart(productType, size);
    });
  });

  // Initialize cart display
  updateCartDisplay();
});