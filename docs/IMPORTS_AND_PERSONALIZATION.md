# Imports, passes, and destination personalization

Wanderly should reduce trip administration rather than create another place to retype it. The import system therefore follows a review-first model: collect a confirmation with the user's permission, extract structured candidates, show exactly what will be added, and save only after approval.

## Recommended integration order

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

## Destination imagery and preferences

Destination imagery can feel personal without covert tracking.

- Ask the traveler to choose interest tags such as sports, outdoors, food, architecture, nightlife, family, or relaxation.
- Combine those declared interests with the trip destination and season.
- Use licensed, high-resolution images with attribution and a curated fallback for each destination.
- Rotate a small set and allow `Show more like this`, `Not for me`, and `Use as cover` controls.
- Never infer interests from unrelated browsing or search history without a clear, revocable opt-in.

For the Columbia pilot, `sports` can prioritize a dramatic stadium/game-day image while retaining city and campus alternatives. A Jackson, Wyoming trip with `outdoors` selected can prioritize the Tetons, trail, and summit imagery.

## Pilot success test

The automation layer is valuable only if a traveler can forward or connect one real confirmation, approve it in under 30 seconds, see it in the correct trip, add it to a calendar without duplication, and open the original live ticket or pass when needed.

