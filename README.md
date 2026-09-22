# Wanderly / Tripboard

A shared trip workspace built with Expo for iOS, Android, and web. The current checkpoint is a **pilot build**: unsigned users see a fixture-backed Columbia preview, while authenticated users can create the live Columbia trip and save tickets, confirmations, parking details, documents, and shared-album links.

## Current checkpoint

- Expo SDK 57, Expo Router, strict TypeScript, and SPA web export
- A reviewed initial Supabase schema with RLS, protected ownership/membership invariants, durable participants, and integer-minor-unit expenses
- Tokenized invitation functions that require confirmed, non-anonymous accounts
- Passwordless email sign-in, live trip creation, and member-only ticket/file/link reads and writes
- Database migration/security tests plus lint, type checking, unit tests, and web export in CI

## Run locally

Use Node.js 22 or later.

```bash
npm install
cp .env.example .env.local
npm start
```

Without public Supabase values, the application remains in Preview mode. Never commit credentials. The publishable key is client-visible; security still depends on correctly deployed grants, RLS, Auth settings, and platform verification. Never put a secret or service-role key in an `EXPO_PUBLIC_` variable.

## Database model

`trip_members` grants authenticated access and roles. `trip_participants` is a durable ledger identity for travelers, payers, and split recipients, including people without accounts. Removing membership does not erase participant history. `trip_resources` keeps trip essentials separate from social clips and can point to an itinerary event without allowing cross-trip references.

The initial migration has not been deployed and is updated in place. Run its disposable PostgreSQL harness with `npm run test:database`; do not point it at a real Supabase project. See [production configuration](docs/SUPABASE_PRODUCTION.md) before connecting a project.

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run test:database
npm run build:web
```

See the [Columbia pilot runbook](docs/COLUMBIA_PILOT.md) for validation-project setup and the exact remaining pilot inputs. Maps, native social sharing, file uploads, payments, and the assistant remain later phases; see [delivery phases](docs/PHASES.md).
