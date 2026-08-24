# Supabase production configuration

Before production, enable **Confirm Email**, disable anonymous sign-ins, configure allowed PKCE redirect URLs, and review RLS with separate authenticated test accounts. Store only the project URL and publishable key in the client; keep service-role keys and database credentials out of Expo variables and CI logs.

Web hosting must rewrite unknown application paths (including `/trips/:tripId`) to `index.html`; Expo exports a single-page application.

`trip_members` is the access-control list for authenticated users. `trip_participants` is the durable traveler and expense ledger: it supports travelers without accounts and remains after access is removed. Referenced participants are deactivated rather than deleted.

Trip ownership is deliberately restrictive. Ownership transfer requires a future dedicated transactional RPC that updates the owner and protected organizer membership atomically. Until that exists, an owner must delete owned trips or use that future transfer path before deleting their auth account. Complete in-app account deletion is not implemented.

The migration test harness uses PostgreSQL 16 rather than a live Supabase project. It supplies a minimal `auth` schema, so Supabase platform integration remains a required pre-production verification step. Never run the harness against a real project: it assumes an empty disposable database.
