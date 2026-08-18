TEEB Perfumes — production-hardened storefront

Storefront pages use a shared catalog source (catalog.js) so products, prices, and stock are consistent for every visitor. Cart state is kept locally only for the customer's current shopping session.

Checkout uses Cash on Delivery. The browser sends only product IDs and quantities; the Vercel serverless endpoint validates the catalog price and stock server-side, calculates delivery and total, and sends the order to perfumesteeb@gmail.com through the configured email service.

Admin is intentionally read-only in the storefront build. Product changes are made in catalog.js and deployed, avoiding browser localStorage as a fake production database.

Production infrastructure note: persistent multi-user admin editing, order history, authentication, and database-backed inventory require a real database/auth service. Do not reintroduce client-only product editing for a live store.
