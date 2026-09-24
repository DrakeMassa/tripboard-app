# Columbia pilot runbook

The pilot is for **Columbia, Missouri · October 7–12, 2026**. It deliberately starts with the smallest useful live workflow: sign in, create the trip, and keep game tickets, parking, confirmations, document links, and a shared photo-album link easy to find.

## 1. Apply the reviewed schema

The `tripboard-validation` project already contains the base schema from `20260824000100_initial_schema.sql`. In Supabase, open **SQL Editor**, create a new query, paste the complete contents of `supabase/migrations/20260924000100_columbia_pilot_resources.sql`, and run it once. The upgrade is transactional and safe to rerun.

For a brand-new empty project, apply every file in `supabase/migrations` in filename order instead.

Do not run `supabase/tests/bootstrap.sql` or `supabase/tests/security.sql` against the hosted project. Those files create and delete test auth users and are only for the disposable PostgreSQL 16 CI database.

## 2. Configure passwordless sign-in

In **Authentication → URL Configuration**:

- Keep the production Site URL exact once the private web pilot is deployed.
- During local web testing, allow `http://localhost:8081/**`.
- For a native development build, allow `wanderly://**`; do not use Expo Go for auth callback testing.

In **Authentication → Providers → Email**, keep email sign-in enabled and require confirmed email accounts. Leave anonymous sign-ins disabled.

## 3. Run the pilot locally

The ignored `.env.local` must contain only:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Then run `npm start`, open the **You** tab, and request a sign-in link. After sign-in, open **Trips** and choose **Create Columbia pilot**. The trip creator is intentionally idempotent at the UI level: after a live trip exists, the button no longer creates another one.

## 4. Add the first essentials

Open the live trip and use **Add ticket, file, or link**. An item can contain details without a URL, or it can open a secure HTTPS link. For a shared album, create the album in Apple Photos or Google Photos and paste its sharing link; Wanderly does not duplicate the album or its permissions.

Details still needed from the trip organizer:

- Game opponent, date, kickoff time, and venue
- Ticket provider plus section, row, and seat details or mobile-ticket link
- Parking lot, entrance instructions, and pass link
- Sister’s and fiancé’s preferred names and email addresses
- Confirmed outbound and return travel
- Lodging address and check-in details
- Shared-album link once the album exists

## Pilot limits

- External links and typed details work; private file upload is not enabled yet.
- Invitation RPCs exist in the database, but the invitation UI is not wired yet.
- Travel, lodging, and itinerary editors are still the next live-data slice.
- Run the Claude read-only audit only after the migration passes CI and the hosted Supabase smoke test is complete.
