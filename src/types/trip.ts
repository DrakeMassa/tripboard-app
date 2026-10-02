export type TripResourceKind =
  | 'ticket'
  | 'confirmation'
  | 'parking_pass'
  | 'reservation'
  | 'document'
  | 'photo_album'
  | 'link'
  | 'other';

export type TravelKind = 'flight' | 'train' | 'car' | 'ferry' | 'bus' | 'other';

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
