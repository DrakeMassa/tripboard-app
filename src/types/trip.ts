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
