# Wanderly pre-merge audit · October 1, 2026

Run this as an independent, read-only Claude/Cowork review before merging PR #4.

## Audit target

- Repository: `DrakeMassa/tripboard-app`
- Pull request: `#4`
- Branch: `codex/editable-trip-planner`
- Base branch: `main`
- Rule: audit the current remote branch head and write the exact commit SHA at the top of the report.

## Copy/paste prompt for Claude

```text
Act as an independent senior product-security and mobile/web application auditor for Wanderly, a collaborative travel planner. This is a READ-ONLY review: do not edit files, push commits, merge the PR, change Supabase/Vercel settings, or run destructive SQL.

Repository: DrakeMassa/tripboard-app
PR: #4
Audit branch: codex/editable-trip-planner
Base: main

First fetch the latest remote branch and print the exact commit SHA you audited. Review the complete PR diff plus the current versions of the files listed below. Then run the non-destructive checks listed below.

Primary goals:
1. Find any path where one user can read, update, delete, invite into, or attach data to another user's trip.
2. Verify Row Level Security, SECURITY DEFINER functions, search_path handling, invitation tokens, role transitions, and cross-table trip ownership/integrity.
3. Verify the deployed app uses live Supabase data after sign-in and does not silently fall back to fixtures, demo trips, or fake success states.
4. Exercise every important Columbia pilot control: sign-in/callback, create trip, open trip, back navigation, edit trip, add/edit/delete travel, lodging, plans and essentials, attach/open resource links, invite/revoke guest, and create another trip.
5. Review map, airport-map, video-embed, image, and external-link behavior for CSP/frame failures, mobile/web incompatibility, privacy leaks, attribution problems, and unexpected paid API calls.
6. Confirm the zero-billing map guardrail: OpenStreetMap is the default; Google Maps API code cannot run unless EXPO_PUBLIC_MAP_PROVIDER=google and a key are both present; no secret key reaches the client.
7. Threat-model the proposed confirmation-email, calendar, flight-status, ticket/pass, and file-upload architecture. Flag credential collection, excessive OAuth scopes, insecure webhook verification, raw-email retention, malware, duplicate imports, and service-role-key exposure.
8. Identify accessibility, responsive-layout, stale-content, error-state, and test-coverage gaps that would make the Columbia pilot frustrating or misleading.

Read at minimum:
- src/app/(tabs)/index.tsx
- src/app/(tabs)/trips.tsx
- src/app/trips/[tripId].tsx
- src/app/auth/callback.tsx
- src/app/invite/[token].tsx
- src/auth/AuthProvider.tsx
- src/data/live.ts
- src/lib/supabase.ts
- src/lib/supabase-storage.ts
- src/lib/supabase-storage.web.ts
- src/lib/supabase-storage.native.ts
- src/components/CreateTripForm.tsx
- src/components/TripDetailsEditor.tsx
- src/components/TripPlanManager.tsx
- src/components/TripResources.tsx
- src/components/TripInvitation.tsx
- src/components/SmartTravelImport.tsx
- src/components/AirportLoungeGuide.tsx
- src/components/AirportMap.web.tsx
- src/components/DestinationGuide.tsx
- src/components/DestinationMap.web.tsx
- src/components/EmbeddedVideoFeed.web.tsx
- src/data/destination-guides.ts
- src/data/destination-photos.ts
- supabase/migrations/20260824000100_initial_schema.sql
- supabase/migrations/20260924000100_columbia_pilot_resources.sql
- supabase/tests/security.sql
- docs/IMPORTS_AND_PERSONALIZATION.md
- docs/SUPABASE_PRODUCTION.md
- .env.example

Run:
- npm ci
- npm run lint
- npm run typecheck
- npm test
- npm run build:web
- npm run test:web-bundle
- npm run test:database (only against the disposable local test database expected by the script; never production)

Use this report format:
A. Audited commit SHA and environment
B. Merge verdict: BLOCK / CONDITIONAL / READY
C. Findings ordered P0, P1, P2, P3
D. For every finding: title, severity, exact file and line, evidence, reproduction or attack path, user impact, and smallest safe fix
E. Controls manually exercised and result
F. Commands run and exact result
G. Unverified assumptions or external behavior
H. Five highest-value improvements after the pilot

Do not give generic advice. If a control is safe, say what evidence supports that conclusion. If you cannot test a live service, mark it UNVERIFIED rather than assuming it works. Treat passing CI as evidence, not proof.
```

## Send back to Codex

Return these three things in the Wanderly conversation:

1. Claude's complete report, including its audited SHA.
2. Any screenshots or console/database errors produced during manual checks.
3. Whether Claude had access to the live preview and a disposable Supabase test database, or only the repository.

Do not paste any Supabase secret/service-role key, database password, OAuth client secret, or airline/hotel password into the report or chat.

