export type TravelerArrival = {
  id: string;
  participantId: string;
  name: string;
  initials: string;
  route: string;
  arrivalTime: string;
  status: 'on-time' | 'later' | 'missing';
};

export type ItineraryItem = {
  id: string;
  time: string;
  title: string;
  detail: string;
  category: 'travel' | 'food' | 'stay' | 'activity';
};

export type TripResourceKind =
  | 'ticket'
  | 'confirmation'
  | 'parking_pass'
  | 'reservation'
  | 'document'
  | 'photo_album'
  | 'link'
  | 'other';

export type TripResourcePreview = {
  id: string;
  itineraryItemId: string | null;
  kind: TripResourceKind;
  title: string;
  detail: string;
  externalUrl: string | null;
};

export type TripPreview = {
  id: string;
  title: string;
  location: string;
  dateRange: string;
  travelerCount: number;
  daysUntil: number;
  baseCurrency: string;
  arrivals: TravelerArrival[];
  itinerary: ItineraryItem[];
  resources: TripResourcePreview[];
};

export type ClipPreview = {
  id: string;
  source: 'TikTok' | 'Instagram' | 'Web';
  title: string;
  place: string;
  addedBy: string;
  accent: string;
};


export type TripParticipant = {
  id: string;
  tripId: string;
  userId: string | null;
  displayName: string;
  status: 'active' | 'removed';
  removedAt: string | null;
};

export type Expense = {
  id: string;
  tripId: string;
  createdBy: string | null;
  paidByParticipantId: string;
  amountMinor: number;
  currency: string;
};
