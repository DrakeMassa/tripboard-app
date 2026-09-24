# Wanderly / Tripboard

A shared trip workspace built with Expo for iOS, Android, and web. The current checkpoint is a **pilot build**: unsigned users see a fixture-backed Columbia preview, while authenticated users can create and edit trips; invite travelers securely; manage travel, lodging, and daily plans; export calendar entries; and save tickets, confirmations, parking details, documents, and shared-album links.

## Current checkpoint

- Expo SDK 57, Expo Router, strict TypeScript, and SPA web export
- A reviewed initial Supabase schema with RLS, protected ownership/membership invariants, durable participants, and integer-minor-unit expenses
- Tokenized invitation functions that require confirmed, non-anonymous accounts
- Passwordless email sign-in, live trip creation, and member-only ticket/file/link reads and writes
- Generic trip creation plus secure, email-bound, single-use guest invitations
- Live trip, travel, lodging, itinerary, and trip-resource create/update/delete workflows
- Portable `.ics` calendar export for travel, lodging, and itinerary entries
- Automatic rotating destination covers from attributed, high-resolution Wikimedia Commons imagery
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

The validation project contains the reviewed base schema. Later changes are additive migrations; run the disposable PostgreSQL harness with `npm run test:database` before applying a new migration to Supabase. See [production configuration](docs/SUPABASE_PRODUCTION.md) before connecting a project.

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run test:database
npm run build:web
```

See the [Columbia pilot runbook](docs/COLUMBIA_PILOT.md) for validation-project setup and the exact remaining pilot inputs. Maps, native social sharing, file uploads, payments, and the assistant remain later phases; see [delivery phases](docs/PHASES.md).
