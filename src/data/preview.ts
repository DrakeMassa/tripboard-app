import { ClipPreview, TripPreview } from '@/types/trip';

// Product-preview fixtures are shown until authentication and live trip reads are enabled.
export const previewTrip: TripPreview = {
  id: 'columbia-preview',
  title: 'Columbia game weekend',
  location: 'Columbia, Missouri',
  dateRange: 'Oct 7–12, 2026',
  travelerCount: 3,
  daysUntil: 15,
  baseCurrency: 'USD',
  arrivals: [
    {
      id: 'arrival-drake',
      participantId: 'participant-drake',
      name: 'Drake',
      initials: 'DM',
      route: 'Wilmington → Missouri · add travel',
      arrivalTime: 'TBD',
      status: 'missing',
    },
  ],
  itinerary: [
    {
      id: 'plan-1',
      time: 'TBD',
      title: 'Arrive in Columbia',
      detail: 'Add flight or drive and pickup details',
      category: 'travel',
    },
    {
      id: 'plan-2',
      time: 'TBD',
      title: 'Game day',
      detail: 'Add opponent, kickoff, venue, and entry plan',
      category: 'activity',
    },
    {
      id: 'plan-3',
      time: 'TBD',
      title: 'Return to Wilmington',
      detail: 'Add the confirmed return itinerary',
      category: 'travel',
    },
  ],
  resources: [
    {
      id: 'resource-game-ticket',
      itineraryItemId: 'plan-2',
      kind: 'ticket',
      title: 'Game tickets',
      detail: 'Add provider, section, row, seats, and mobile-ticket link',
      externalUrl: null,
    },
    {
      id: 'resource-parking',
      itineraryItemId: 'plan-2',
      kind: 'parking_pass',
      title: 'Parking pass',
      detail: 'Keep the lot, entrance, and pass link with the game plan',
      externalUrl: null,
    },
    {
      id: 'resource-trip-album',
      itineraryItemId: null,
      kind: 'photo_album',
      title: 'Shared trip album',
      detail: 'Paste an iCloud Shared Album or Google Photos link',
      externalUrl: null,
    },
  ],
};

export const previewClips: ClipPreview[] = [
  {
    id: 'clip-1',
    source: 'TikTok',
    title: 'The carbonara worth crossing Rome for',
    place: 'Luciano Cucina Italiana',
    addedBy: 'Drake',
    accent: '#C36F55',
  },
  {
    id: 'clip-2',
    source: 'Instagram',
    title: 'A tiny wine window in Florence',
    place: 'Buchette del Vino',
    addedBy: 'Maya',
    accent: '#426C57',
  },
  {
    id: 'clip-3',
    source: 'Web',
    title: 'Sunset viewpoint above the Arno',
    place: 'Piazzale Michelangelo',
    addedBy: 'Clay',
    accent: '#A7804C',
  },
];
