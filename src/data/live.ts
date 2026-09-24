import { requireSupabase } from '@/lib/supabase';
import type { TravelKind, TripResourceKind } from '@/types/trip';

export type LiveTrip = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  baseCurrency: string;
};

export type LiveTripResource = {
  id: string;
  tripId: string;
  itineraryItemId: string | null;
  kind: TripResourceKind;
  title: string;
  provider: string | null;
  externalUrl: string | null;
  storagePath: string | null;
  details: string | null;
};

export type LiveTravelSegment = {
  id: string;
  tripId: string;
  participantId: string;
  kind: TravelKind;
  provider: string | null;
  serviceNumber: string | null;
  departurePlace: string;
  arrivalPlace: string;
  departsAt: string;
  arrivesAt: string | null;
  notes: string | null;
};

export type LiveAccommodation = {
  id: string;
  tripId: string;
  name: string;
  address: string | null;
  checkInAt: string | null;
  checkOutAt: string | null;
  bookingUrl: string | null;
  notes: string | null;
};

export type LiveItineraryItem = {
  id: string;
  tripId: string;
  title: string;
  details: string | null;
  startsAt: string;
  endsAt: string | null;
};

type TripRow = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  base_currency: string;
};

type ResourceRow = {
  id: string;
  trip_id: string;
  itinerary_item_id: string | null;
  kind: TripResourceKind;
  title: string;
  provider: string | null;
  external_url: string | null;
  storage_path: string | null;
  details: string | null;
};

type TravelRow = {
  id: string;
  trip_id: string;
  participant_id: string;
  kind: TravelKind;
  provider: string | null;
  service_number: string | null;
  departure_place: string;
  arrival_place: string;
  departs_at: string;
  arrives_at: string | null;
  notes: string | null;
};

type AccommodationRow = {
  id: string;
  trip_id: string;
  name: string;
  address: string | null;
  check_in_at: string | null;
  check_out_at: string | null;
  booking_url: string | null;
  notes: string | null;
};

type ItineraryRow = {
  id: string;
  trip_id: string;
  title: string;
  details: string | null;
  starts_at: string;
  ends_at: string | null;
};

function mapTrip(row: TripRow): LiveTrip {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    startDate: row.start_date,
    endDate: row.end_date,
    baseCurrency: row.base_currency,
  };
}

function mapResource(row: ResourceRow): LiveTripResource {
  return {
    id: row.id,
    tripId: row.trip_id,
    itineraryItemId: row.itinerary_item_id,
    kind: row.kind,
    title: row.title,
    provider: row.provider,
    externalUrl: row.external_url,
    storagePath: row.storage_path,
    details: row.details,
  };
}

function mapTravel(row: TravelRow): LiveTravelSegment {
  return {
    id: row.id,
    tripId: row.trip_id,
    participantId: row.participant_id,
    kind: row.kind,
    provider: row.provider,
    serviceNumber: row.service_number,
    departurePlace: row.departure_place,
    arrivalPlace: row.arrival_place,
    departsAt: row.departs_at,
    arrivesAt: row.arrives_at,
    notes: row.notes,
  };
}

function mapAccommodation(row: AccommodationRow): LiveAccommodation {
  return {
    id: row.id,
    tripId: row.trip_id,
    name: row.name,
    address: row.address,
    checkInAt: row.check_in_at,
    checkOutAt: row.check_out_at,
    bookingUrl: row.booking_url,
    notes: row.notes,
  };
}

function mapItineraryItem(row: ItineraryRow): LiveItineraryItem {
  return {
    id: row.id,
    tripId: row.trip_id,
    title: row.title,
    details: row.details,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
  };
}

async function getAuthenticatedUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await requireSupabase().auth.getUser();
  if (error) throw error;
  if (!user) throw new Error('Sign in to update this trip.');
  return user.id;
}

async function getCurrentParticipantId(tripId: string, userId: string): Promise<string> {
  const { data, error } = await requireSupabase()
    .from('trip_participants')
    .select('id')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export async function listTrips(): Promise<LiveTrip[]> {
  const { data, error } = await requireSupabase()
    .from('trips')
    .select('id,title,description,location,start_date,end_date,base_currency')
    .order('start_date', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return ((data ?? []) as TripRow[]).map(mapTrip);
}

export async function getTrip(tripId: string): Promise<LiveTrip> {
  const { data, error } = await requireSupabase()
    .from('trips')
    .select('id,title,description,location,start_date,end_date,base_currency')
    .eq('id', tripId)
    .single();

  if (error) throw error;
  return mapTrip(data as TripRow);
}

export async function updateTrip(input: {
  tripId: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}): Promise<LiveTrip> {
  await getAuthenticatedUserId();
  const { data, error } = await requireSupabase()
    .from('trips')
    .update({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      location: input.location?.trim() || null,
      start_date: input.startDate || null,
      end_date: input.endDate || null,
    })
    .eq('id', input.tripId)
    .select('id,title,description,location,start_date,end_date,base_currency')
    .single();
  if (error) throw error;
  return mapTrip(data as TripRow);
}

export async function createTrip(input: {
  title: string;
  description?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}): Promise<LiveTrip> {
  const client = requireSupabase();
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('Sign in before creating a trip.');
  if (!input.title.trim()) throw new Error('Give this trip a name.');

  const { data, error } = await client
    .from('trips')
    .insert({
      owner_id: user.id,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      location: input.location?.trim() || null,
      start_date: input.startDate || null,
      end_date: input.endDate || null,
      base_currency: 'USD',
    })
    .select('id,title,description,location,start_date,end_date,base_currency')
    .single();

  if (error) throw error;
  return mapTrip(data as TripRow);
}

export async function createColumbiaPilot(): Promise<LiveTrip> {
  return createTrip({
    title: 'Columbia game weekend',
    description: 'Pilot trip with my sister and her fiancé.',
    location: 'Columbia, Missouri',
    startDate: '2026-10-07',
    endDate: '2026-10-12',
  });
}

export async function createTripInvitation(input: {
  tripId: string;
  invitedEmail: string;
}): Promise<string> {
  await getAuthenticatedUserId();
  const { data, error } = await requireSupabase().rpc('create_trip_invitation', {
    p_trip_id: input.tripId,
    p_role: 'member',
    p_invited_email: input.invitedEmail.trim().toLowerCase(),
    p_expires_in: '7 days',
    p_max_uses: 1,
  });
  if (error) throw error;
  if (typeof data !== 'string' || !data) throw new Error('Could not create a secure invitation link.');
  return data;
}

export async function acceptTripInvitation(token: string): Promise<string> {
  await getAuthenticatedUserId();
  const { data, error } = await requireSupabase().rpc('accept_trip_invitation', {
    p_token: token,
  });
  if (error) throw error;
  if (typeof data !== 'string' || !data) throw new Error('Could not accept this invitation.');
  return data;
}

export async function listTripResources(tripId: string): Promise<LiveTripResource[]> {
  const { data, error } = await requireSupabase()
    .from('trip_resources')
    .select('id,trip_id,itinerary_item_id,kind,title,provider,external_url,storage_path,details')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return ((data ?? []) as ResourceRow[]).map(mapResource);
}

export async function createTripResource(input: {
  tripId: string;
  kind: TripResourceKind;
  title: string;
  provider?: string | null;
  details?: string | null;
  externalUrl?: string | null;
}): Promise<LiveTripResource> {
  const client = requireSupabase();
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('Sign in before adding a trip item.');

  const { data, error } = await client
    .from('trip_resources')
    .insert({
      trip_id: input.tripId,
      created_by: user.id,
      kind: input.kind,
      title: input.title.trim(),
      provider: input.provider?.trim() || null,
      details: input.details?.trim() || null,
      external_url: input.externalUrl,
    })
    .select('id,trip_id,itinerary_item_id,kind,title,provider,external_url,storage_path,details')
    .single();

  if (error) throw error;
  return mapResource(data as ResourceRow);
}

export async function updateTripResource(input: {
  id: string;
  kind: TripResourceKind;
  title: string;
  provider?: string | null;
  details?: string | null;
  externalUrl?: string | null;
}): Promise<LiveTripResource> {
  await getAuthenticatedUserId();
  const { data, error } = await requireSupabase()
    .from('trip_resources')
    .update({
      kind: input.kind,
      title: input.title.trim(),
      provider: input.provider?.trim() || null,
      details: input.details?.trim() || null,
      external_url: input.externalUrl || null,
    })
    .eq('id', input.id)
    .select('id,trip_id,itinerary_item_id,kind,title,provider,external_url,storage_path,details')
    .single();
  if (error) throw error;
  return mapResource(data as ResourceRow);
}

export async function deleteTripResource(id: string): Promise<void> {
  await getAuthenticatedUserId();
  const { error } = await requireSupabase()
    .from('trip_resources')
    .delete()
    .eq('id', id)
    .select('id')
    .single();
  if (error) throw error;
}

export async function listTravelSegments(tripId: string): Promise<LiveTravelSegment[]> {
  const { data, error } = await requireSupabase()
    .from('travel_segments')
    .select(
      'id,trip_id,participant_id,kind,provider,service_number,departure_place,arrival_place,departs_at,arrives_at,notes',
    )
    .eq('trip_id', tripId)
    .order('departs_at', { ascending: true });
  if (error) throw error;
  return ((data ?? []) as TravelRow[]).map(mapTravel);
}

export async function createTravelSegment(input: {
  tripId: string;
  kind: TravelKind;
  provider?: string | null;
  serviceNumber?: string | null;
  departurePlace: string;
  arrivalPlace: string;
  departsAt: string;
  arrivesAt?: string | null;
  timeZone: string;
  notes?: string | null;
}): Promise<LiveTravelSegment> {
  const userId = await getAuthenticatedUserId();
  const participantId = await getCurrentParticipantId(input.tripId, userId);
  const { data, error } = await requireSupabase()
    .from('travel_segments')
    .insert({
      trip_id: input.tripId,
      participant_id: participantId,
      created_by: userId,
      kind: input.kind,
      provider: input.provider?.trim() || null,
      service_number: input.serviceNumber?.trim() || null,
      departure_place: input.departurePlace.trim(),
      arrival_place: input.arrivalPlace.trim(),
      departs_at: input.departsAt,
      arrives_at: input.arrivesAt || null,
      departure_time_zone: input.timeZone,
      arrival_time_zone: input.timeZone,
      notes: input.notes?.trim() || null,
    })
    .select(
      'id,trip_id,participant_id,kind,provider,service_number,departure_place,arrival_place,departs_at,arrives_at,notes',
    )
    .single();
  if (error) throw error;
  return mapTravel(data as TravelRow);
}

export async function updateTravelSegment(input: {
  id: string;
  kind: TravelKind;
  provider?: string | null;
  serviceNumber?: string | null;
  departurePlace: string;
  arrivalPlace: string;
  departsAt: string;
  arrivesAt?: string | null;
  timeZone: string;
  notes?: string | null;
}): Promise<LiveTravelSegment> {
  await getAuthenticatedUserId();
  const { data, error } = await requireSupabase()
    .from('travel_segments')
    .update({
      kind: input.kind,
      provider: input.provider?.trim() || null,
      service_number: input.serviceNumber?.trim() || null,
      departure_place: input.departurePlace.trim(),
      arrival_place: input.arrivalPlace.trim(),
      departs_at: input.departsAt,
      arrives_at: input.arrivesAt || null,
      departure_time_zone: input.timeZone,
      arrival_time_zone: input.timeZone,
      notes: input.notes?.trim() || null,
    })
    .eq('id', input.id)
    .select(
      'id,trip_id,participant_id,kind,provider,service_number,departure_place,arrival_place,departs_at,arrives_at,notes',
    )
    .single();
  if (error) throw error;
  return mapTravel(data as TravelRow);
}

export async function deleteTravelSegment(id: string): Promise<void> {
  await getAuthenticatedUserId();
  const { error } = await requireSupabase()
    .from('travel_segments')
    .delete()
    .eq('id', id)
    .select('id')
    .single();
  if (error) throw error;
}

export async function listAccommodations(tripId: string): Promise<LiveAccommodation[]> {
  const { data, error } = await requireSupabase()
    .from('accommodations')
    .select('id,trip_id,name,address,check_in_at,check_out_at,booking_url,notes')
    .eq('trip_id', tripId)
    .order('check_in_at', { ascending: true, nullsFirst: false });
  if (error) throw error;
  return ((data ?? []) as AccommodationRow[]).map(mapAccommodation);
}

export async function createAccommodation(input: {
  tripId: string;
  name: string;
  address?: string | null;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  timeZone: string;
  bookingUrl?: string | null;
  notes?: string | null;
}): Promise<LiveAccommodation> {
  const userId = await getAuthenticatedUserId();
  const { data, error } = await requireSupabase()
    .from('accommodations')
    .insert({
      trip_id: input.tripId,
      created_by: userId,
      name: input.name.trim(),
      address: input.address?.trim() || null,
      check_in_at: input.checkInAt || null,
      check_out_at: input.checkOutAt || null,
      time_zone: input.timeZone,
      booking_url: input.bookingUrl || null,
      notes: input.notes?.trim() || null,
    })
    .select('id,trip_id,name,address,check_in_at,check_out_at,booking_url,notes')
    .single();
  if (error) throw error;
  return mapAccommodation(data as AccommodationRow);
}

export async function updateAccommodation(input: {
  id: string;
  name: string;
  address?: string | null;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  timeZone: string;
  bookingUrl?: string | null;
  notes?: string | null;
}): Promise<LiveAccommodation> {
  await getAuthenticatedUserId();
  const { data, error } = await requireSupabase()
    .from('accommodations')
    .update({
      name: input.name.trim(),
      address: input.address?.trim() || null,
      check_in_at: input.checkInAt || null,
      check_out_at: input.checkOutAt || null,
      time_zone: input.timeZone,
      booking_url: input.bookingUrl || null,
      notes: input.notes?.trim() || null,
    })
    .eq('id', input.id)
    .select('id,trip_id,name,address,check_in_at,check_out_at,booking_url,notes')
    .single();
  if (error) throw error;
  return mapAccommodation(data as AccommodationRow);
}

export async function deleteAccommodation(id: string): Promise<void> {
  await getAuthenticatedUserId();
  const { error } = await requireSupabase()
    .from('accommodations')
    .delete()
    .eq('id', id)
    .select('id')
    .single();
  if (error) throw error;
}

export async function listItineraryItems(tripId: string): Promise<LiveItineraryItem[]> {
  const { data, error } = await requireSupabase()
    .from('itinerary_items')
    .select('id,trip_id,title,details,starts_at,ends_at')
    .eq('trip_id', tripId)
    .order('starts_at', { ascending: true });
  if (error) throw error;
  return ((data ?? []) as ItineraryRow[]).map(mapItineraryItem);
}

export async function createItineraryItem(input: {
  tripId: string;
  title: string;
  details?: string | null;
  startsAt: string;
  endsAt?: string | null;
  timeZone: string;
}): Promise<LiveItineraryItem> {
  const userId = await getAuthenticatedUserId();
  const { data, error } = await requireSupabase()
    .from('itinerary_items')
    .insert({
      trip_id: input.tripId,
      created_by: userId,
      title: input.title.trim(),
      details: input.details?.trim() || null,
      starts_at: input.startsAt,
      ends_at: input.endsAt || null,
      time_zone: input.timeZone,
    })
    .select('id,trip_id,title,details,starts_at,ends_at')
    .single();
  if (error) throw error;
  return mapItineraryItem(data as ItineraryRow);
}

export async function updateItineraryItem(input: {
  id: string;
  title: string;
  details?: string | null;
  startsAt: string;
  endsAt?: string | null;
  timeZone: string;
}): Promise<LiveItineraryItem> {
  await getAuthenticatedUserId();
  const { data, error } = await requireSupabase()
    .from('itinerary_items')
    .update({
      title: input.title.trim(),
      details: input.details?.trim() || null,
      starts_at: input.startsAt,
      ends_at: input.endsAt || null,
      time_zone: input.timeZone,
    })
    .eq('id', input.id)
    .select('id,trip_id,title,details,starts_at,ends_at')
    .single();
  if (error) throw error;
  return mapItineraryItem(data as ItineraryRow);
}

export async function deleteItineraryItem(id: string): Promise<void> {
  await getAuthenticatedUserId();
  const { error } = await requireSupabase()
    .from('itinerary_items')
    .delete()
    .eq('id', id)
    .select('id')
    .single();
  if (error) throw error;
}
