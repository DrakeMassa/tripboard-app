import { ClipPreview, TripPreview } from '@/types/trip';

// Product-preview fixtures are shown only until a Supabase project is connected.
export const previewTrip: TripPreview = {
  id: 'italy-preview',
  title: 'Italy with friends',
  location: 'Rome · Florence · Tuscany',
  dateRange: 'Sep 12–20, 2026',
  travelerCount: 6,
  daysUntil: 19,
  baseCurrency: 'EUR',
  arrivals: [
    {
      id: 'arrival-clay',
      name: 'Clay',
      initials: 'CL',
      route: 'JFK → FCO · DL 230',
      arrivalTime: '9:40 AM',
      status: 'on-time',
    },
    {
      id: 'arrival-maya',
      name: 'Maya',
      initials: 'MY',
      route: 'LHR → FCO · BA 552',
      arrivalTime: '1:15 PM',
      status: 'later',
    },
  ],
  itinerary: [
    {
      id: 'plan-1',
      time: '9:40 AM',
      title: 'Clay lands in Rome',
      detail: 'Terminal 3 · Fiumicino Airport',
      category: 'travel',
    },
    {
      id: 'plan-2',
      time: '3:00 PM',
      title: 'Check in at Casa Oliva',
      detail: 'Via del Governo Vecchio',
      category: 'stay',
    },
    {
      id: 'plan-3',
      time: '8:30 PM',
      title: 'Dinner at Roscioli',
      detail: 'Reservation for 6 · Walk 8 min',
      category: 'food',
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
