# Tulip - Smart Product Scanner App

One repo, two parts: a React frontend and an Express/MongoDB backend.
Merged from the old `tulip-scanner-app` and `tulip-backend` repos on
2026-11-23. Both original histories are preserved in this repo
(`client/` came from tulip-scanner-app, `server/` from tulip-backend
via `git subtree`).

```
tulip/
  client/   React 19 app (was tulip-scanner-app)
  server/   Express API + MongoDB (was tulip-backend)
```

## Run it

Prerequisites: Node 16+, npm 8+, MongoDB running locally on
`mongodb://localhost:27017/tulip`.

```bash
npm run install:all   # install server + client dependencies
npm run dev           # starts server on :5001 and client on :3000
```

Or run them separately:

```bash
npm run dev:server    # API at http://localhost:5001/api
npm run dev:client    # app at http://localhost:3000
```

Seed sample products (Coca-Cola, Doritos, Cheerios, Tide, Charmin):

```bash
npm run seed
```

Config lives in `server/.env` (not committed): `PORT=5001`,
`MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL=http://localhost:3000`.

## What works, honestly

- Signup / login with email + password (JWT), scan history, saving
  products, and product lookup by barcode against the database, with
  an Open Food Facts fallback for unknown barcodes.
- Price comparison and coupons in the client are still simulated
  (random prices from `client/src/services/priceService.js`), and
  barcode scanning itself is simulated, no real camera scanning yet.
  The backend has no real retailer price API.

## Fixes made during the merge

- The frontend calls the API at `http://localhost:5001/api`, so the
  server now runs on port 5001 (it used to default to 5000).
- `server/routes/products.js` had its own broken auth check that used
  an undeclared `jwt` variable, so every product route returned 401.
  It now uses the shared `middleware/auth.js`.
- The frontend calls `GET /api/products/:barcode`, but the backend
  only had `/scan/:barcode`. A `GET /:barcode` route was added
  (declared last so it does not swallow `/search` or `/saved`).
- `client/src/setupProxy.js` proxied `/api` to `localhost:3000`
  (the app itself) and required `http-proxy-middleware`, which is
  not installed. The proxy was removed; the app calls the backend
  directly.
