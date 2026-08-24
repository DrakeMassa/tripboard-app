# Wanderly / Tripboard

A shared trip workspace for arrivals, lodging, itinerary, saved social clips, maps, and expenses. One Expo project targets iOS, Android, and the web.

This repository is a clean rebuild of the earlier Lovable prototype. The current checkpoint intentionally labels preview data; it does not pretend disconnected features are live.

## Current checkpoint

- Expo SDK 57, React Native, Expo Router, and strict TypeScript
- Responsive mobile/web product-preview screens
- Supabase client boundary with local session persistence
- Initial Postgres schema with Row Level Security
- Tokenized, expiring, revocable trip invitations
- Organizer, editor, member, and viewer roles
- Timezone-aware travel and itinerary records
- Integer-minor-unit expense model and tested split helper
- Quality workflow for lint, type checking, tests, and web export

## Run locally

Requirements: Node.js 22+ and npm.

```bash
npm install
cp .env.example .env.local
npm start
```

Then scan the Expo QR code or press `w` for the web app. Without Supabase environment values, the app stays in clearly marked product-preview mode.

## Connect Supabase

1. Create or select a Supabase project.
2. Apply `supabase/migrations/20260824000100_initial_schema.sql` through the Supabase CLI or SQL editor.
3. Copy the Project URL and publishable key from Supabase Dashboard → Connect.
4. Put them in `.env.local` using the names from `.env.example`.
5. Never commit `.env`, `.env.local`, service-role keys, Lovable workspace metadata, or credential-bearing Git URLs.

The publishable key is client-visible by design. Security comes from the migration’s database privileges and RLS policies; review them again before production data is accepted.

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build:web
```

## Build sequence

1. Foundation: app shell, authentication, trips, membership, arrivals, and lodging.
2. Trip Inbox: native sharing from TikTok/Instagram/web, clip feed, place extraction, and map linking.
3. Planning: collaborative itinerary and trip-aware assistant grounded only in authorized trip data.
4. Money: normalized expenses, custom splits, settlement, currencies, and exports.
5. Reservations: deep links first; automated booking only where official provider APIs and user confirmation allow it.

## Security decisions

- Invitation URLs contain a random token; only its SHA-256 hash is stored.
- Invite tokens expire, can be revoked, have usage limits, and cannot grant organizer access.
- Joining a trip happens through a controlled database function—not by inserting yourself into `trip_members`.
- All user-owned writes require `created_by = auth.uid()` and a non-viewer trip role.
- Dates use `date`; moments use `timestamptz`; IANA time-zone names are stored alongside travel data.
- Money uses integer minor units instead of floating-point values.

## Working agreement

Codex is the primary implementation agent for this repository. Claude can be used as an independent reviewer at architecture, security, and pre-release checkpoints. Reviewer feedback should arrive as pull-request comments or a written review; the implementation agent owns reconciliation and tests.
