# Imports, passes, and destination personalization

Wanderly should reduce trip administration rather than create another place to retype it. The import system therefore follows a review-first model: collect a confirmation with the user's permission, extract structured candidates, show exactly what will be added, and save only after approval.

## Recommended integration order

The selected pilot stack is **Resend inbound email → Supabase Edge Function → review queue**, **Google/Microsoft calendar OAuth**, and **FlightAware AeroAPI behind a server-only Edge Function**. Google Maps uses a separately restricted browser key. Airline and hotel passwords are never collected.

### 1. Forwarded confirmation email

This is the broadest first integration because airlines, hotels, rental cars, restaurants, and ticket providers all send confirmations even when they do not offer a usable consumer API.

- Give every account a private, revocable forwarding address.
- Accept inbound mail through a provider webhook into a Supabase Edge Function.
- Verify the sender belongs to the signed-in account before processing.
- Store raw content and attachments privately with a short retention period.
- Extract trip, provider, confirmation number, locations, dates, times, and safe source links into a pending import.
- Require a one-tap review before creating travel, lodging, itinerary, or resource records.
- Preserve the original source and extraction confidence for correction and auditability.

The address must not act as a secret by itself. Rate limiting, sender verification, malware scanning, attachment limits, and idempotency are required before enabling it outside the pilot.

For the pilot, use Resend inbound webhooks because the received message arrives as structured data and attachments can be fetched separately. The webhook must verify its signature before passing the payload to a Supabase Edge Function. Create a per-account alias such as `drake+<revocable-token>@trips.wanderly.app`; do not expose a service-role key to the Expo client.

### 2. Calendar connection

The current pilot exports a standard `.ics` event from every saved flight, stay, or itinerary item. Connected sync should be optional and limited to a calendar the user explicitly selects.

- Google Calendar and Microsoft Graph are the first two-way providers.
- Request the smallest viable calendar scopes; do not request mailbox scopes as a shortcut.
- Keep provider refresh tokens server-side, encrypted, and out of the Expo client.
- Track provider event IDs and use idempotent upserts to prevent duplicates.
- Show whether Wanderly or the external calendar last changed an item and resolve conflicts visibly.
- Apple Calendar continues to work through `.ics` until a native EventKit integration is added.

### 3. Gmail or Outlook confirmation import

Mailbox scanning is more sensitive and operationally heavier than forwarding. Add it only after the forwarding workflow proves useful.

- Make it opt-in and explain the exact query and data retained.
- Search narrowly for travel-confirmation patterns instead of reading an unrestricted inbox.
- Use provider change notifications where available rather than repeatedly scanning history.
- Expect provider verification and security-review requirements before broad release.

### 4. Airline, hotel, ticket, and wallet access

There is no single reliable consumer API across airlines and hotels. Wanderly should prefer the original provider as the source of truth:

- Store a secure deep link to the provider's live booking, boarding pass, mobile ticket, or wallet pass.
- Let the operating system open Apple Wallet, Google Wallet, an airline app, or a ticketing app when supported.
- Support private PDF/image/pass attachments only after the private Storage bucket, signed URLs, retention rules, and malware controls are deployed.
- Never scrape credentials or ask users to share airline or hotel passwords.

### 5. Live flight and gate enrichment

After an itinerary is approved, resolve the carrier, flight number, and departure date through FlightAware AeroAPI from a server-side Edge Function. Store the provider flight ID and last refresh time, then update scheduled/estimated/actual times, cancellation state, terminal, gate, baggage claim, route, and track only when the provider returns them. Gate assignments are often not published until close to departure, so the UI must show `Live gate pending` rather than inventing a gate.

Use push alerts close to the trip and conservative polling outside the travel window. The AeroAPI key is a secret and must never use an `EXPO_PUBLIC_` name.

### 6. Maps, indoor airports, and videos

- The web pilot uses Maps JavaScript API with Places API (New) for category pins, live ratings, review counts, addresses, and Google directions.
- The browser key is intentionally visible but must be restricted by HTTPS referrer and API. Use separate keys for web, iOS, Android, and server workloads.
- Airport interiors use the airport's licensed map when available. CLT's official map supports multi-level routing, walk-time estimates, gates, food, shops, and lounges; Wanderly overlays the saved flights and live gates when published.
- A universal rotatable 360-degree terminal model is not available through one public API. Add it airport-by-airport only where a venue provides licensed indoor geometry or panoramas.
- Play permitted YouTube embeds and first-party video directly in Wanderly. Do not download, re-host, or scrape Instagram/TikTok video; use an official embed where supported and a source link otherwise.

## Destination imagery and preferences

Destination imagery can feel personal without covert tracking.

- The pilot now searches Wikimedia Commons using only the destination and trip title, filters for large landscape images, rotates up to five results, links to the source attribution, and falls back to Wanderly's branded green cover.
- The photo request does not include trip dates, travelers, confirmations, or private notes.
- Ask the traveler to choose interest tags such as sports, outdoors, food, architecture, nightlife, family, or relaxation.
- Combine those declared interests with the trip destination and season.
- Use licensed, high-resolution images with attribution and a curated fallback for each destination.
- Rotate a small set and allow `Show more like this`, `Not for me`, and `Use as cover` controls.
- Never infer interests from unrelated browsing or search history without a clear, revocable opt-in.

For the Columbia pilot, `sports` can prioritize a dramatic stadium/game-day image while retaining city and campus alternatives. A Jackson, Wyoming trip with `outdoors` selected can prioritize the Tetons, trail, and summit imagery.

The first pilot infers only broad context from the trip itself (`game`, `beach`, `hiking`, and similar words). It does not read unrelated search or browsing history. Explicit interest controls and `Use as cover` remain a later refinement.

## Pilot success test

The automation layer is valuable only if a traveler can forward or connect one real confirmation, approve it in under 30 seconds, see it in the correct trip, add it to a calendar without duplication, and open the original live ticket or pass when needed.
