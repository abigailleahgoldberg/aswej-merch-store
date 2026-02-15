// Import styles
import './style.css';

// Product IDs
const PRODUCTS = {
    tee: '419473357',
    hat: '419417492'
};

// Update variant selectors with actual data
async function loadVariants() {
    try {
        const response = await fetch('/api/variants'); // This will be our serverless function
        const variants = await response.json();
        
        // Update size dropdowns
        updateSizeOptions('tee-sizes', variants.tee);
        updateSizeOptions('hat-sizes', variants.hat);
    } catch (error) {
        console.error('Failed to load variants:', error);
    }
}

function updateSizeOptions(selectId, variants) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    // Clear existing options except placeholder
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // Add new options
    variants.forEach(variant => {
        const option = document.createElement('option');
        option.value = variant.id;
        option.textContent = variant.size;
        select.appendChild(option);
    });
}

// Handle buy button clicks
document.querySelectorAll('.buy-button').forEach(button => {
    button.addEventListener('click', handleBuyClick);
});

function handleBuyClick(event) {
    const card = event.target.closest('.product-card');
    const select = card.querySelector('select');
    const variantId = select.value;
    
    if (variantId === '') {
        alert('Please select a size first');
        return;
    }
    
    // For now, we'll redirect to Printful's manual order form
    // Later this will integrate with their order API
    window.open('https://www.printful.com/custom-products');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadVariants();
});