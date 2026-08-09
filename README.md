# YourStore — Vanilla JavaScript Ecommerce Starter

A complete ecommerce starter built with **HTML5, CSS3, Vanilla JavaScript, Node.js, Express, JWT and a JSON datastore**. No frontend framework, CSS framework, jQuery or TypeScript is used.

## Core experience

Visitors can browse, search, filter, sort and inspect products without an account. Cart and wishlist actions are protected. If a guest clicks **Add to Cart** or **Wishlist**, YourStore stores the pending action, opens the login/register modal, authenticates the user, closes the modal and automatically resumes the original action without a second click.

## Project structure

```text
ecommerce-store/
├── frontend/
│   ├── index.html
│   ├── shop.html
│   ├── product.html
│   ├── cart.html
│   ├── checkout.html
│   ├── account.html
│   ├── css/
│   │   ├── reset.css
│   │   ├── style.css
│   │   ├── components.css
│   │   └── responsive.css
│   ├── js/
│   │   ├── app.js
│   │   ├── api.js
│   │   ├── products.js
│   │   ├── search.js
│   │   ├── slider.js
│   │   ├── auth.js
│   │   ├── cart.js
│   │   ├── wishlist.js
│   │   ├── modal.js
│   │   └── toast.js
│   └── assets/
│       └── images/
│           ├── 16 local demo product SVGs
│           └── 3 local hero SVGs
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── wishlistRoutes.js
│   │   └── orderRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── cartController.js
│   │   ├── wishlistController.js
│   │   ├── orderController.js
│   │   └── newsletterController.js
│   ├── data/
│   │   ├── products.js
│   │   └── store.json
│   └── utils/
│       ├── store.js
│       └── validators.js
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Requirements

- Node.js 18 or newer
- npm

## Installation

From the project root:

```bash
npm install
```

Create or edit `.env`:

```env
PORT=3000
JWT_SECRET=replace_with_a_long_random_secret_at_least_32_characters
JWT_EXPIRES_IN=2h
NODE_ENV=development
```

The included `.env` contains a development-only secret so the downloaded starter can run immediately. **Replace it before any deployment. Never commit a production `.env`.**

## Start the app

Development mode with Node's built-in watch mode:

```bash
npm run dev
```

Normal mode:

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

Do not open the HTML files directly with `file://`; the frontend expects the Express API at `/api`.

## Authentication flow

### Register

1. Browser posts `name`, `email` and `password` to `POST /api/auth/register`.
2. Backend validates input.
3. Password is hashed with bcrypt using 12 rounds.
4. User is stored in `backend/data/store.json`.
5. Backend signs a time-limited JWT.
6. Frontend stores the token in `sessionStorage`, or `localStorage` when Remember Me is selected.

### Login

1. Browser posts credentials to `POST /api/auth/login`.
2. Backend finds the user and verifies the bcrypt password hash.
3. Backend returns a signed JWT and public user profile.

### Protected requests

The frontend sends:

```http
Authorization: Bearer <JWT>
```

`authMiddleware.js` verifies the signature and expiry on every protected cart, wishlist, order and `/auth/me` request. Frontend state alone is never trusted.

### Session expiry

A 401 caused by an expired/invalid JWT removes the local token, opens the login modal and displays:

> Your session has expired. Please login again.

## Protected Add-to-Cart flow

The important UX is implemented in `auth.js` + `cart.js`:

```text
Guest clicks Add to Cart
        ↓
Pending action stored in sessionStorage
        ↓
Login/Register modal opens
        ↓
Backend authenticates and returns JWT
        ↓
Modal closes
        ↓
auth:pending-action event fires
        ↓
Original product is POSTed to /api/cart
        ↓
Cart badge + drawer refresh
        ↓
Success toast appears
```

The same resume mechanism is used for wishlist and Buy Now.

## API endpoints

### Public

- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/categories`
- `GET /api/search?q=head`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/newsletter`
- `GET /api/health`

### Protected

- `GET /api/auth/me`
- `GET /api/cart`
- `POST /api/cart`
- `PUT /api/cart/:productId`
- `DELETE /api/cart/:productId`
- `GET /api/wishlist`
- `POST /api/wishlist`
- `DELETE /api/wishlist/:productId`
- `POST /api/orders`
- `GET /api/orders`

## Product data

The 16 starter products live in:

```text
backend/data/products.js
```

Each product contains an ID, name, category, current/old price, rating, review count, stock, created date, image path, description and features. Replace the local SVG paths with real image files later without changing the product-card logic.

## JSON persistence

`backend/data/store.json` stores users, carts, wishlists, orders and newsletter email addresses. It is suitable for development and prototypes. For a real business, replace the store utility with PostgreSQL, MySQL or another transactional database while keeping the current controller/API contract.

## Search, filters and sorting

The shop supports:

- Real-time header search suggestions
- Search by product name, category and description
- Audio search aliases so a partial query such as `head` can surface headphones/earbuds
- Category filtering
- Under $50, $50–$100, $100–$500 and $500+ price bands
- 4★ / 3★ rating filters
- In-stock-only filtering
- Featured, low/high price, rating, popularity and newest sorting

## Frontend features

- Sticky responsive header
- Mobile slide-out navigation
- 3-slide vanilla JS hero slider with autoplay, arrows, dots, hover pause and swipe
- Category cards
- Featured products
- Promotional banner
- Deal countdown
- New arrivals
- Best sellers
- Product quick view
- Product detail page with quantity selector
- Login/register modal
- Cart drawer and cart page
- Wishlist
- Checkout with shipping, billing and demo payment methods
- Account dashboard with orders, wishlist, profile and addresses section
- Toast notifications
- Skeleton loading states
- Empty states
- Responsive layouts from large desktop to small mobile
- Semantic labels, keyboard focus styles, alt text and ESC-to-close overlays

## Payment note

Checkout intentionally does **not** process real payments. Card and PayPal are presentation options only. The order API records the selected method so Stripe, PayPal, SSLCommerz or another gateway can later be connected behind the same checkout UI.

## Security notes before production

This starter already hashes passwords with bcrypt, validates JWTs server-side, expires tokens, rate-limits auth endpoints, uses Helmet, limits JSON request size and performs basic input cleaning. Before a production launch also add a real database, HTTPS-only deployment, CSRF strategy appropriate to the final token transport, email verification/password reset, stronger schema validation, audit logging, inventory transactions, payment-provider verification and automated security testing.

Bearer JWTs are stored in Web Storage here because that matches the requested `Authorization: Bearer TOKEN` architecture. For higher-risk production applications, reassess token storage and consider short-lived access tokens plus a carefully designed HttpOnly/Secure refresh-cookie flow.

## Recommended manual test

1. Open the homepage in a private/incognito window.
2. Browse/search products while logged out.
3. Search `head` and confirm audio products appear.
4. Click **Add to Cart**.
5. Confirm the auth modal opens.
6. Register a new user.
7. Confirm the modal closes and the original item is automatically added.
8. Open the cart drawer and change quantity on `cart.html`.
9. Add/remove a wishlist item.
10. Proceed to checkout, complete shipping/billing, choose a demo payment method and place the order.
11. Open `account.html?tab=orders` and confirm the order appears.
12. Logout and verify protected account/cart actions request authentication again.

