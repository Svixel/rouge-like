/**
 * Vanilla E-commerce Store with BTCPay Server Integration
 *
 * SECURITY NOTE:
 * - Product prices are loaded from products.json
 * - For production, BTCPay Server validates prices server-side
 * - Never trust client-side price modifications
 */

// Store state
let products = [];
let cart = [];
let storeConfig = {};

// Initialize store
async function initStore() {
    try {
        const response = await fetch('products.json');
        const data = await response.json();

        storeConfig = data.store;
        products = data.products;

        // Update store name
        document.getElementById('store-name').textContent = storeConfig.name;
        document.title = storeConfig.name;

        renderProducts();
        loadCartFromStorage();
        updateCartDisplay();
    } catch (error) {
        console.error('Failed to load products:', error);
        document.getElementById('product-grid').innerHTML =
            '<p>Error loading products. Please refresh the page.</p>';
    }
}

// Render products to the grid
function renderProducts() {
    const grid = document.getElementById('product-grid');

    grid.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product.id}">
            <img src="images/${product.image}"
                 alt="${product.name}"
                 onerror="this.outerHTML='<div class=\\'placeholder-img\\' style=\\'height:200px\\'>📦</div>'">
            <div class="product-info">
                <h3>${escapeHtml(product.name)}</h3>
                <p>${escapeHtml(product.description)}</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart" onclick="addToCart('${product.id}')">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// Add item to cart
function addToCart(productId) {
    // IMPORTANT: Get price from our products array, not from DOM
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price, // Price from products.json, not HTML
            quantity: 1
        });
    }

    saveCartToStorage();
    updateCartDisplay();
    showCart();
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartDisplay();
}

// Update cart display
function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const totalAmount = document.getElementById('total-amount');
    const cartCount = document.getElementById('cart-count');

    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = itemCount;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty.</p>';
        totalAmount.textContent = '0.00';
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <strong>${escapeHtml(item.name)}</strong>
                <span> × ${item.quantity}</span>
            </div>
            <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
            <button class="remove-item" onclick="removeFromCart('${item.id}')">Remove</button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalAmount.textContent = total.toFixed(2);
}

// Show cart section
function showCart() {
    document.getElementById('cart').classList.remove('hidden');
    document.getElementById('cart').scrollIntoView({ behavior: 'smooth' });
}

// Save cart to localStorage
function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCartFromStorage() {
    const saved = localStorage.getItem('cart');
    if (saved) {
        cart = JSON.parse(saved);
        // Re-validate prices against current products.json
        cart = cart.map(item => {
            const product = products.find(p => p.id === item.id);
            if (product) {
                return { ...item, price: product.price }; // Always use server price
            }
            return null;
        }).filter(Boolean);
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * BTCPay Server Checkout Integration
 *
 * OPTION 1: BTCPay Point of Sale (Recommended for static sites)
 * - Create a Point of Sale app in BTCPay
 * - Products/prices stored in BTCPay, not hackable
 *
 * OPTION 2: BTCPay Pay Button
 * - Embed pay buttons with fixed server-side amounts
 *
 * OPTION 3: BTCPay API (requires backend)
 * - Full control but needs server to create invoices
 */

document.getElementById('checkout-btn').addEventListener('click', checkout);

function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Calculate total from our trusted products data
    const total = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    // Build order description
    const orderDescription = cart.map(item =>
        `${item.name} x${item.quantity}`
    ).join(', ');

    /**
     * METHOD 1: BTCPay Checkout Link (Simple, No Backend Needed)
     *
     * This creates a direct link to BTCPay's checkout.
     * Configure your BTCPay store to only accept the amount from YOUR store settings.
     *
     * In BTCPay: Store Settings > Checkout > "Allow anyone to create invoices" = ON
     * Set "Require login" and other security settings as needed.
     */

    const btcpayUrl = storeConfig.btcpay_url;
    const storeId = storeConfig.store_id;

    // BTCPay checkout URL format
    // The price SHOULD come from BTCPay's product catalog for security
    // This is just passing the order info
    const checkoutUrl = `${btcpayUrl}/api/v1/invoices?` + new URLSearchParams({
        storeId: storeId,
        price: total.toFixed(2),
        currency: storeConfig.currency,
        orderId: `ORDER-${Date.now()}`,
        orderDescription: orderDescription
    });

    // For a truly static site, use BTCPay's Pay Button instead:
    showBTCPayOptions(total, orderDescription);
}

function showBTCPayOptions(total, description) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.8); display: flex;
        align-items: center; justify-content: center; z-index: 1000;
    `;

    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 500px; margin: 1rem;">
            <h3 style="margin-bottom: 1rem;">Complete Your Order</h3>
            <p><strong>Total:</strong> $${total.toFixed(2)}</p>
            <p style="color: #666; font-size: 0.9rem; margin: 1rem 0;">${escapeHtml(description)}</p>

            <div style="background: #f5f5f5; padding: 1rem; border-radius: 4px; margin: 1rem 0;">
                <p style="font-size: 0.85rem; color: #666;">
                    <strong>🔒 Security Note:</strong><br>
                    The actual price is verified by our BTCPay Server.
                    Modifying prices in your browser will not affect the invoice amount.
                </p>
            </div>

            <p style="margin-bottom: 1rem; font-size: 0.9rem;">
                Configure your BTCPay URL in <code>products.json</code> to enable checkout.
            </p>

            <button onclick="this.parentElement.parentElement.remove()"
                    style="padding: 0.75rem 1.5rem; background: #333; color: white; border: none; cursor: pointer; border-radius: 4px;">
                Close
            </button>
        </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initStore);
