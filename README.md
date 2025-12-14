Solaré — Static Frontend Demo

This is a static front-end demo for a small e-commerce site showcasing solar-powered bags.

How to run locally

1. Open terminal in project root.
2. Start a simple HTTP server (Python 3):

```bash
python -m http.server 8000
```

3. (Optional) Start the mock API server to persist orders/messages instead of `localStorage`:

```bash
cd server
npm install
npm start
```

This starts the mock API on http://localhost:9876. If the API is not running, the frontend will fallback to saving orders and messages in `localStorage`.

4. Open http://localhost:8000/ in your browser.

Implemented features

- `index.html` — Hero, features, preview collection (first 3 products), modal product view.
- `collection.html` — Full product grid generated from `js/products.js`, filters by shape/color, modal product view.
- `css/style.css` — Styles with Playfair/Inter fonts and Chanel-inspired minimal look with gold accents.
- `js/products.js` — Product array with fields: `id, name, price, image, description, color, shape`.
- `js/main.js` — Renders products, handles modal, filters, and cart actions; stores cart in `localStorage` under `solare_cart`.
- `cart.html` + `js/cart.js` — Cart page for viewing and managing items.
- `checkout.html` + `js/checkout.js` — Checkout flow (demo payment), saves orders to `localStorage`.
- `order-confirmation.html` — Shows last order details.
- `contact.html` — Contact form demo (messages saved to `localStorage`).

Notes

- This is a static demo without a backend. Payment and messaging are simulated and stored locally for demonstration purposes.
- To clear demo data, open browser devtools and clear `localStorage` for the site or use the UI actions (clear cart).

If you want, I can:
- Add a simple admin page to view orders and messages (visit `admin.html`).
- Replace placeholder Instagram links with real links and assets.
- Improve accessibility further and add unit tests for JS logic.

What would you like me to do next?