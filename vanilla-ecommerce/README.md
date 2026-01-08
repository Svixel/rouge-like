# Vanilla E-commerce with BTCPay Server

A simple, static HTML/CSS/JS e-commerce site with Bitcoin payments via BTCPay Server.

## Quick Start

1. Edit `products.json` to add your products
2. Add product images to `images/` folder
3. Configure your BTCPay Server URL in `products.json`
4. Upload all files to your hosting

## File Structure

```
vanilla-ecommerce/
├── index.html          # Main page (edit store layout here)
├── products.json       # Product data (prices, descriptions)
├── css/
│   └── style.css       # Styling (colors, layout)
├── js/
│   └── store.js        # Store logic (cart, checkout)
└── images/             # Product images (product1.jpg, etc.)
```

## Adding Products

Edit `products.json`:

```json
{
  "products": [
    {
      "id": "unique-id",
      "name": "Product Name",
      "description": "Product description",
      "price": 29.99,
      "image": "my-image.jpg",
      "category": "category-name"
    }
  ]
}
```

Then add `my-image.jpg` to the `images/` folder.

---

## Security: Why Prices Can't Be Hacked

### The Problem
> "Can't someone change the HTML and pay less?"

### The Solution

**Prices are validated server-side by BTCPay Server, not in the browser.**

Even if someone:
- Opens browser DevTools
- Changes `$100` to `$1` in the HTML
- Modifies JavaScript variables

...it doesn't matter because:

1. **Products.json is read-only** - Users can't modify files on your server
2. **BTCPay creates invoices server-side** - The invoice amount comes from YOUR BTCPay store
3. **Cart re-validates prices** - Every action re-checks against products.json

### BTCPay Security Setup

For maximum security, use **BTCPay Point of Sale** app:

1. In BTCPay Dashboard → Plugins → Point of Sale
2. Add your products WITH prices in BTCPay
3. Customers select products from BTCPay's interface
4. Zero client-side price manipulation possible

---

## BTCPay Server Setup

### Option 1: Self-Hosted (Most Private)
```bash
# Using Docker
git clone https://github.com/btcpayserver/btcpayserver-docker
cd btcpayserver-docker
./btcpay-setup.sh
```

### Option 2: Hosted BTCPay (Easier)
- [BTCPay Server Directory](https://directory.btcpayserver.org/) - Find a host
- Or use a VPS from privacy-friendly providers

### Configuration

Update `products.json`:
```json
{
  "store": {
    "name": "Your Store Name",
    "currency": "USD",
    "btcpay_url": "https://your-btcpay-instance.com",
    "store_id": "your-store-id-here"
  }
}
```

---

## Anonymous Hosting Options

### 1. Neocities (Easiest, Free)
- No email required
- Drag and drop upload
- Free subdomain: yoursite.neocities.org
- https://neocities.org

### 2. IPFS + Fleek
- Decentralized hosting
- Content-addressed (immutable)
- https://fleek.co

### 3. Njalla (Most Private)
- Accepts Bitcoin/Monero
- No personal info required
- Domain registration + hosting
- https://njal.la

### 4. 1984 Hosting (Iceland)
- Strong privacy laws
- Accepts Bitcoin
- https://1984hosting.com

### 5. GitHub Pages (Free, Less Private)
- Requires GitHub account
- Free SSL
- Easy updates via git push

### 6. Tor Hidden Service (Maximum Privacy)
- Requires running your own server
- .onion address
- Complete anonymity

---

## Updating Your Store

### To change products:
1. Edit `products.json`
2. Re-upload to hosting

### To change styling:
1. Edit `css/style.css`
2. Re-upload to hosting

### To add images:
1. Add files to `images/` folder
2. Reference in products.json as `"image": "filename.jpg"`
3. Re-upload to hosting

---

## For Your Client

Simple instructions for your client:

1. **To edit products**: Open `products.json` in any text editor
2. **To add images**: Put image files in the `images` folder
3. **To update site**: Upload all files to Neocities (drag & drop)

That's it! No coding required.

---

## Testing Locally

Just open `index.html` in a browser. For full functionality:

```bash
# Python 3
python -m http.server 8000

# Then visit http://localhost:8000
```

---

## License

MIT - Do whatever you want with it.
