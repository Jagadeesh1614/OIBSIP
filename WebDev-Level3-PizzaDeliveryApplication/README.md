# Pizza Delivery Full-Stack App (Level 3)

A MERN app: React (Vite) frontend, Node/Express backend, MongoDB, JWT auth
for both a **User** flow and a separate **Admin** flow, Razorpay test-mode
payments, node-cron low-stock email alerts, and status polling for
real-time order tracking.

## Structure
```
pizza-app/
  backend/   Express API + MongoDB models + Razorpay + node-cron + nodemailer
  frontend/  React (Vite) app: user flow + admin flow
```

## 1. Prerequisites
- Node.js 18+
- A MongoDB instance (local `mongod`, or a free MongoDB Atlas cluster)
- A Razorpay account in **test mode** (dashboard.razorpay.com → Settings → API Keys)
- An email account for Nodemailer (e.g. Gmail with an **App Password**, not your normal password)

## 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# edit .env: MONGO_URI, JWT secrets, EMAIL_*, RAZORPAY_*, ADMIN_ALERT_EMAIL, SEED_ADMIN_*
npm run seed     # creates the admin account + seeds inventory (5 bases, 5 sauces, cheeses, vegetables) + a small preset menu
npm run dev      # starts the API on http://localhost:5000
```
The admin login created by `npm run seed` uses `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD` from `.env`. There is deliberately no public
"admin register" endpoint — that's how the brief's "admin login not
accessible from user registration" requirement is enforced.

## 3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL, defaults to http://localhost:5000/api
npm run dev             # starts the app on http://localhost:5173
```

## 4. Try it out
**User flow:** Register → check the console/email for the verification
link (Nodemailer must be configured, or read the link straight from the
backend log if you temporarily console.log it) → verify → log in →
Dashboard → "Build your own pizza" → 4-step wizard (base, sauce, cheese,
vegetables) → Order summary → "Pay with Razorpay (test mode)". In the
Razorpay test checkout, use a test card, e.g. `4111 1111 1111 1111`, any
future expiry, any CVV — or click the built-in "Success" simulation
Razorpay's test modal provides.

**Admin flow:** go to `/admin/login`, sign in with the seeded admin
credentials → Inventory dashboard (edit stock/threshold per item) and
Orders panel (change status: Order Received → In Kitchen → Sent to
Delivery). The user's Dashboard polls `/api/orders/mine` every 5 seconds,
so a status change shows up there shortly after.

## 5. How each checklist item is implemented
- **Email verification**: `verifyToken` on the User model, emailed as a link, 1-hour expiry.
- **JWT auth**: separate secrets (`JWT_SECRET` for users, `JWT_ADMIN_SECRET` for admins) so tokens can't cross over.
- **Forgot password**: `resetToken` + emailed link, 1-hour expiry, generic response either way (doesn't reveal if the email exists).
- **Custom pizza builder**: 4-step wizard reading live options from `/api/pizza/options`, which only returns in-stock inventory.
- **Order summary → Razorpay**: `POST /api/orders` creates a Razorpay test order; the frontend opens Razorpay Checkout; on success the signature is verified server-side (`POST /api/orders/verify`) before the order is marked paid.
- **Real-time status**: no WebSocket server here — implemented via 5-second polling on the dashboard, which is what the brief allows ("polling or WebSockets").
- **Admin inventory**: `Inventory` collection, one document per ingredient, grouped by type; stock is decremented automatically on payment verification, and can be edited manually from `/admin/inventory`.
- **Low-stock emails**: `node-cron` job (`LOW_STOCK_CRON` schedule) checks every item's `stock` against its `threshold` and emails `ADMIN_ALERT_EMAIL` once per dip (re-arms after restock).
- **Order management**: `/admin/orders` lists all paid orders and lets the admin change status via a dropdown.

## 6. Notes & limits
- This is a learning-project scaffold, not a hardened production deploy: add rate limiting, input sanitization, HTTPS, and a process manager (pm2) before shipping.
- Prices are illustrative (flat ₹249 base + ₹20/vegetable) — adjust `BASE_PRICE` in `frontend/src/pages/OrderSummary.jsx`.
- Amounts are stored in **paise** in the `Order.amount` field to match Razorpay's smallest-unit convention.
