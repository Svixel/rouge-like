# BTCPay Server Setup Guide

## Why BTCPay Server?

- **Self-hosted** = You control everything
- **No third-party** = No payment processor fees
- **Private** = No KYC required
- **Secure** = Prices validated server-side

---

## The Security Model Explained

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR STATIC WEBSITE                     │
│                                                             │
│  products.json ──────────► Browser displays prices          │
│  (on YOUR server)          (user sees $100)                 │
│                                    │                        │
│                            User clicks "Buy"                │
│                                    │                        │
│                                    ▼                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Even if hacker changes HTML to show $1...           │   │
│  │ The request goes to BTCPay with product ID          │   │
│  │ BTCPay looks up REAL price = $100                   │   │
│  │ Invoice generated for $100, not $1                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                    │                        │
│                                    ▼                        │
│                         BTCPay Invoice: $100                │
│                         (Unhackable!)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Setup Methods

### Method 1: BTCPay Pay Button (Simplest)

No coding needed. Create buttons in BTCPay dashboard.

1. Go to BTCPay → Your Store → Pay Button
2. Create a button for each product
3. Set the fixed price
4. Copy the HTML and embed in your site

```html
<!-- Example BTCPay Pay Button -->
<form method="POST" action="https://your-btcpay.com/api/v1/invoices">
  <input type="hidden" name="storeId" value="your-store-id" />
  <input type="hidden" name="price" value="29.99" />
  <input type="hidden" name="currency" value="USD" />
  <button type="submit">Buy Now - $29.99</button>
</form>
```

**Security**: Price is in the form but BTCPay validates against store settings.

---

### Method 2: BTCPay Point of Sale (Recommended)

Products stored entirely in BTCPay.

1. BTCPay → Plugins → Point of Sale
2. Create new Point of Sale
3. Add all products with prices
4. Get your POS URL
5. Link directly to it from your site

Your website just links to: `https://your-btcpay.com/apps/your-pos-id`

**Security**: 100% server-side. No prices in HTML at all.

---

### Method 3: API Integration (Advanced)

For dynamic stores with a backend:

```javascript
// Server-side code (Node.js example)
const createInvoice = async (cart) => {
  // Get prices from YOUR database, not from request
  const total = cart.items.reduce((sum, item) => {
    const product = await db.getProduct(item.id);
    return sum + product.price * item.quantity;
  }, 0);

  const response = await fetch('https://your-btcpay.com/api/v1/stores/YOUR_STORE/invoices', {
    method: 'POST',
    headers: {
      'Authorization': 'token YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: total,
      currency: 'USD'
    })
  });

  return response.json();
};
```

---

## Quick Deployment Checklist

- [ ] Set up BTCPay Server (self-hosted or third-party)
- [ ] Create a store in BTCPay
- [ ] Add products to `products.json`
- [ ] Update BTCPay URL in `products.json`
- [ ] Choose integration method (Pay Button recommended)
- [ ] Upload to hosting
- [ ] Test with small transaction

---

## Privacy-Focused BTCPay Hosting

If you don't want to self-host:

| Provider | Accepts BTC | No KYC | Notes |
|----------|-------------|--------|-------|
| Voltage | Yes | Yes | Lightning-focused |
| LunaNode | Yes | Minimal | Canadian VPS |
| Njalla | Yes | Yes | Maximum privacy |

Or run on a Raspberry Pi at home!

---

## Testing

1. Use BTCPay's testnet mode first
2. Create test invoices
3. Verify prices cannot be manipulated
4. Switch to mainnet when ready
