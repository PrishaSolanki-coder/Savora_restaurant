# Savora — Full-Stack Restaurant Website

A production-oriented restaurant website: React/Vite frontend, Node/Express backend,
MySQL database, JWT authentication, a customer ordering flow, table reservations,
reviews, and a full admin dashboard.

## Features

- Public site: home, dynamic menu (search/filter/sort), food details, about, contact
- Customer accounts: register/login (JWT + bcrypt), profile editing, order & reservation history
- Real shopping cart persisted server-side per user
- Checkout with **server-computed pricing** (the backend never trusts prices from the browser)
- Order tracking with a visual status timeline
- Table reservations with admin approval workflow
- Customer reviews with admin moderation
- Full admin dashboard: stats, menu CRUD, category CRUD, order status management,
  reservation management, user role management, review moderation

## Tech Stack

**Frontend:** React, Vite, React Router, Axios, plain CSS (custom design system)
**Backend:** Node.js, Express, JWT, bcryptjs, express-validator
**Database:** MySQL (mysql2)
**Deployment:** Vercel (frontend + backend as two separate projects) + any cloud MySQL provider

## Folder Structure

```
restaurant-website/
├── frontend/           React + Vite app
│   ├── src/
│   │   ├── components/ Reusable UI pieces (FoodCard, Alert, ProtectedRoute)
│   │   ├── context/    AuthContext, CartContext
│   │   ├── layouts/    MainLayout (public site), AdminLayout (dashboard)
│   │   ├── pages/      One file per route, admin pages in pages/admin/
│   │   └── services/   api.js — the one Axios client used everywhere
│   └── vercel.json
├── backend/            Express API
│   ├── api/index.js    Vercel serverless entry point
│   ├── config/db.js    MySQL connection pool
│   ├── controllers/    Request handling + business logic
│   ├── middleware/     auth, admin, validation, error handling
│   ├── models/         All SQL queries live here
│   ├── routes/         URL → controller wiring
│   ├── server.js       App entry point
│   └── vercel.json
├── database/
│   ├── schema.sql      All tables, foreign keys, indexes
│   └── seed.sql        Realistic categories + menu items
└── README.md
```

## Local Development

### 1. Install MySQL and create the database

Install MySQL locally (or use MySQL Workbench to connect to one), then run:

```sql
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

This creates the `restaurant_db` database, all tables, and seeds categories +
18 menu items. **User accounts are not seeded** (see "Creating your first admin
account" below) — a real bcrypt password hash can't be safely hand-written into
a SQL file, so accounts are created through the actual registration flow.

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` with your real MySQL credentials and a random `JWT_SECRET`
(any long random string — e.g. generate one with `openssl rand -hex 32`).

```bash
npm run dev
```

You should see:
```
✅ Connected to MySQL database.
🚀 Server running on http://localhost:5000
```

Test it: open `http://localhost:5000/api/health` in your browser — you should see
`{"success":true,"message":"API is running"}`.

### 3. Frontend setup

In a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

Open the printed URL (usually `http://localhost:5173`). The Vite dev server
proxies `/api/*` requests to `http://localhost:5000` automatically (see
`vite.config.js`), so you don't need a `.env` file for local development.

### 4. Creating your first admin account

1. On the running site, click **Register** and create a normal account.
2. In MySQL, promote that account to admin:
   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'you@example.com';
   ```
3. Log out and log back in (so your JWT reflects the new role), then visit
   `http://localhost:5173/admin`.

## Environment Variables

**backend/.env**
| Variable | Description |
|---|---|
| `PORT` | Port the Express server listens on locally (default 5000) |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection |
| `JWT_SECRET` | Long random string used to sign auth tokens — never commit this |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CLIENT_URL` | The frontend's origin, used for CORS |

**frontend/.env** (only needed for production builds)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Full URL of the deployed backend API, e.g. `https://your-backend.vercel.app/api` |

## API Overview

All responses follow `{ success, message, data? }` (or `{ success:false, message, errors? }`).

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Log in |
| GET | `/api/auth/me` | user | Current user |
| GET | `/api/menu` | — | List menu (query: category, search, veg, sort) |
| GET | `/api/menu/:id` | — | Menu item + related items |
| POST/PUT/DELETE | `/api/menu/:id` | admin | Manage menu items |
| GET/POST/PUT/DELETE | `/api/categories` | admin for writes | Manage categories |
| GET/POST/PUT/DELETE | `/api/cart*` | user | Cart operations |
| POST | `/api/orders` | user | Place order (server computes total) |
| GET | `/api/orders` / `/api/orders/:id` | user | Order history / details |
| PUT | `/api/orders/:id/cancel` | user | Cancel own order (early stages only) |
| POST/GET | `/api/reservations` | user | Create / list own reservations |
| PUT | `/api/reservations/:id/cancel` | user | Cancel own reservation |
| GET/POST/DELETE | `/api/reviews` | user for writes | Reviews |
| `/api/admin/*` | admin | Dashboard stats, order/reservation/user/review management |

## Local Testing Checklist

- [ ] Register a new account, then try registering the same email again (should fail)
- [ ] Log in with wrong password (should fail with a clear message)
- [ ] Browse menu, search, filter by veg/non-veg, sort by price
- [ ] Add items to cart, change quantities, remove an item
- [ ] Check out an order, confirm it appears in Profile → Order History
- [ ] Open the order's tracking page, confirm the timeline renders
- [ ] Submit a reservation, confirm it appears in Profile → Reservation History
- [ ] Submit a review from an About/Contact-linked account
- [ ] As a non-admin, try visiting `/admin` directly (should redirect away)
- [ ] As admin: add/edit/delete a menu item, category; change an order's status;
      confirm/reject a reservation; change a user's role; moderate a review
- [ ] Log out, confirm protected pages (`/profile`, `/checkout`) redirect to `/login`

## Deploying to Vercel

This project deploys as **two separate Vercel projects** — one for the frontend,
one for the backend. This is simpler and more reliable than trying to combine
a Vite SPA and an Express API into a single Vercel project.

### Step 1 — Push to GitHub

```bash
cd restaurant-website
git init
git add .
git commit -m "Initial commit"
```
Create a new repository on GitHub, then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### Step 2 — Set up a cloud MySQL database

Use any MySQL-compatible provider (PlanetScale, Railway, Aiven, AWS RDS, etc).
Once created, run `database/schema.sql` and `database/seed.sql` against it
(most providers give you a connection string you can use with the MySQL CLI
or a GUI like MySQL Workbench / TablePlus).

### Step 3 — Deploy the backend

1. In Vercel, "Add New Project" → import your GitHub repo.
2. Set **Root Directory** to `backend`.
3. Framework preset: "Other". Build command and output can stay default —
   Vercel auto-detects the `api/` folder as serverless functions.
4. Add environment variables (from your cloud DB + a real `JWT_SECRET`):
   `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`,
   `JWT_EXPIRES_IN`, `CLIENT_URL` (set this once you know your frontend's URL —
   you can update it after Step 4).
5. Deploy. Note the resulting URL, e.g. `https://savora-backend.vercel.app`.
6. Confirm it works: visit `https://savora-backend.vercel.app/api/health`.

### Step 4 — Deploy the frontend

1. In Vercel, "Add New Project" → import the **same** GitHub repo again.
2. Set **Root Directory** to `frontend`.
3. Framework preset: Vite (auto-detected).
4. Add environment variable: `VITE_API_URL` = `https://savora-backend.vercel.app/api`.
5. Deploy. Note the resulting URL, e.g. `https://savora.vercel.app`.

### Step 5 — Connect the two

Go back to the **backend** project's environment variables and set
`CLIENT_URL` to your frontend's real URL (`https://savora.vercel.app`), then
redeploy the backend so CORS allows it.

### Step 6 — Test in production

- Visit your frontend URL, register an account, browse the menu, place an order.
- Promote your account to admin using the same SQL command as local dev, against
  your cloud database this time.
- Confirm `/admin` works and every admin action (menu CRUD, order status, etc.)
  reaches the cloud database correctly.

### Troubleshooting

| Symptom | Likely cause |
|---|---|
| Frontend loads but API calls fail (CORS error in console) | `CLIENT_URL` on the backend doesn't match the frontend's real URL |
| "Cannot connect to database" on Vercel | Cloud MySQL provider may block Vercel's IPs by default — check the provider's connection/firewall settings (many require enabling "allow from anywhere" or an SSL flag) |
| Refreshing a frontend route like `/menu` gives a 404 | `frontend/vercel.json` rewrite is missing or Root Directory wasn't set to `frontend` |
| Backend routes 404 on Vercel but work locally | Root Directory wasn't set to `backend`, or `backend/api/index.js` is missing |
| Admin pages redirect you to home even though you're logged in | Your account's `role` in the database isn't `ADMIN` yet, or you didn't log out/in after promoting it |

## Extending the Project

- **Real payments:** Checkout currently supports Cash on Delivery plus UPI/Card
  as clearly-labeled placeholders (see `Checkout.jsx`). To accept real payments,
  integrate a gateway like Razorpay or Stripe in `orderController.js` and update
  `payment_status` based on its webhook/confirmation.
- **Contact form persistence:** The contact form on the Contact page currently
  simulates submission client-side. To store/email real inquiries, add a
  `contact_messages` table, a controller/route, and swap the `setTimeout` in
  `Contact.jsx` for a real `api.post('/contact', ...)` call.
- **Image uploads:** Admin currently accepts an image *URL* for menu items.
  For real file uploads, integrate a storage service (e.g. AWS S3, Cloudinary)
  in the backend and store the resulting URL — never store binary image data
  directly in MySQL.
