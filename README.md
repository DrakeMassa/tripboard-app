# Wanderly / Tripboard

A shared trip workspace built with Expo for iOS, Android, and web. The current checkpoint is a **Preview**: fixture-backed screens demonstrate the product direction while authentication and live data wiring remain unfinished.

## Current checkpoint

- Expo SDK 57, Expo Router, strict TypeScript, and SPA web export
- A reviewed initial Supabase schema with RLS, protected ownership/membership invariants, durable participants, and integer-minor-unit expenses
- Tokenized invitation functions that require confirmed, non-anonymous accounts
- Database migration/security tests plus lint, type checking, unit tests, and web export in CI

## Run locally

Use Node.js 22 or later.

```bash
npm install
cp .env.example .env.local
npm start
```

Without public Supabase values, the application remains in Preview mode. Never commit credentials. The publishable key is client-visible; security still depends on correctly deployed grants, RLS, Auth settings, and platform verification.

## Database model

`trip_members` grants authenticated access and roles. `trip_participants` is a durable ledger identity for travelers, payers, and split recipients, including people without accounts. Removing membership does not erase participant history.

The initial migration has not been deployed and is updated in place. Run its disposable PostgreSQL harness with `npm run test:database`; do not point it at a real Supabase project. See [production configuration](docs/SUPABASE_PRODUCTION.md) before connecting a project.

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run test:database
npm run build:web
```

Planned functionality—including live authentication screens, maps, social sharing, reservations, payments, and assistants—is not implemented in this phase. See [delivery phases](docs/PHASES.md).
