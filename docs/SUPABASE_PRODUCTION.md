# Supabase production configuration

Before production, enable **Confirm Email**, disable anonymous sign-ins, configure allowed PKCE redirect URLs, and review RLS with separate authenticated test accounts. Store only the project URL and publishable key in the client; keep service-role keys and database credentials out of Expo variables and CI logs.

Passwordless sign-in returns through `/auth/callback`, which validates the requested in-app destination before routing. In **Authentication → URL Configuration**, use:

- Site URL: `https://wanderly-pilot.vercel.app`
- Redirect URL: `https://wanderly-pilot.vercel.app/**`
- Preview deployments: `https://*-drake-projects1.vercel.app/**`
- Local web: `http://localhost:8081/**`
- Native development builds: `wanderly://**`

Do not add a service-role key to Vercel or any `EXPO_PUBLIC_` variable. Native auth should be tested in a development build with the configured `wanderly` scheme, not Expo Go, because authentication callbacks require a stable URL.

Web hosting must rewrite unknown application paths (including `/trips/:tripId`) to `index.html`; Expo exports a single-page application.

Signed-out routes intentionally show an authentication gate. They never substitute a fixture trip, because that makes dead controls look like saved data. A release is not pilot-ready until a separate test account can request a link, return through `/auth/callback`, create or open a real trip, save one travel item, refresh, and see that item persist.

`trip_members` is the access-control list for authenticated users. `trip_participants` is the durable traveler and expense ledger: it supports travelers without accounts and remains after access is removed. Referenced participants are deactivated rather than deleted.

Trip ownership is deliberately restrictive. Ownership transfer requires a future dedicated transactional RPC that updates the owner and protected organizer membership atomically. Until that exists, an owner must delete owned trips or use that future transfer path before deleting their auth account. Complete in-app account deletion is not implemented.

The migration test harness uses PostgreSQL 16 rather than a live Supabase project. It supplies a minimal `auth` schema, so Supabase platform integration remains a required pre-production verification step. Never run the harness against a real project: it assumes an empty disposable database.

Invitation redemption locks the invitation row before checking membership and incrementing use count, serializing concurrent redemption attempts. The PostgreSQL harness verifies accounting sequentially; race testing remains required against a disposable Supabase environment because the single-session `psql` harness cannot exercise concurrency reliably.

Removing `trip_members` access does not change `trip_participants.status`: access lifecycle and durable traveler/ledger lifecycle are intentionally independent. Participant account linking or reassignment requires a future dedicated controlled RPC and is not allowed through generic table updates.

`trip_resources.external_url` accepts HTTPS only. The pilot stores ticket/confirmation details and external links; `storage_path` reserves a future private attachment flow, but no Supabase Storage bucket or upload policy is enabled yet.
