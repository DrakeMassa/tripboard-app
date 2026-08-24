# Delivery phases

## Phase 1 — trustworthy trip basics

- Magic-link or OTP authentication
- Create/edit/archive trips
- Secure invitation acceptance and membership roles
- Arrival and departure board
- Lodging cards
- Empty, loading, error, and offline states
- Family-friendly contextual onboarding

Exit condition: a real group can sign in, join a trip securely, and answer “when does everyone arrive?” without using mock data.

## Phase 2 — Trip Inbox and places

- iOS and Android share-extension proof of concept
- Receive TikTok, Instagram, YouTube, and ordinary web links
- Store the original URL even when metadata extraction fails
- Scrollable clip feed grouped by trip
- Extract candidate places with user confirmation
- Map/list views and reservation-provider deep links

Exit condition: sharing a supported link from another app reliably adds it to one selected trip.

## Phase 3 — itinerary and assistant

- Collaborative itinerary editing
- Convert saved places into itinerary proposals
- Trip-scoped assistant with permission-aware retrieval
- Citations back to the underlying trip records

Exit condition: the assistant answers factual trip questions from stored data and clearly indicates missing information.

## Phase 4 — shared money

- Multiple payers and custom shares
- Per-currency ledgers and settlement suggestions
- Receipts and CSV export
- Immutable correction history

Exit condition: every balance reconciles exactly in integer minor units and exports reproduce the same totals.

## Phase 5 — hardening and release

- Accessibility and device-matrix testing
- Observability, backups, rate limits, abuse controls, and incident runbook
- App Store and Play Store assets/privacy disclosures
- External security review
