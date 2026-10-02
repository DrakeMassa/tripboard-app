import { requireSupabase } from '@/lib/supabase';
import type { TravelKind, TripResourceKind } from '@/types/trip';

export const TRIP_DOCUMENT_BUCKET = 'trip-documents';
export const MAX_TRIP_DOCUMENT_BYTES = 10 * 1024 * 1024;

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

export type LiveTripInvitation = {
  id: string;
  tripId: string;
  invitedEmail: string | null;
  expiresAt: string;
  maxUses: number;
  useCount: number;
  revokedAt: string | null;
  createdAt: string;
  isActive: boolean;
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
  departureTimeZone: string;
  arrivalTimeZone: string;
  notes: string | null;
};

export type LiveAccommodation = {
  id: string;
  tripId: string;
  name: string;
  address: string | null;
  checkInAt: string | null;
  checkOutAt: string | null;
  timeZone: string;
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
  timeZone: string;
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
  departure_time_zone: string;
  arrival_time_zone: string;
  notes: string | null;
};

type AccommodationRow = {
  id: string;
  trip_id: string;
  name: string;
  address: string | null;
  check_in_at: string | null;
  check_out_at: string | null;
  time_zone: string;
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
  time_zone: string;
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
    departureTimeZone: row.departure_time_zone,
    arrivalTimeZone: row.arrival_time_zone,
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
    timeZone: row.time_zone,
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
    timeZone: row.time_zone,
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

export async function listTripInvitations(tripId: string): Promise<LiveTripInvitation[]> {
  await getAuthenticatedUserId();
  const { data, error } = await requireSupabase()
    .from('trip_invitations')
    .select('id,trip_id,invited_email,expires_at,max_uses,use_count,revoked_at,created_at')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as {
    id: string;
    trip_id: string;
    invited_email: string | null;
    expires_at: string;
    max_uses: number;
    use_count: number;
    revoked_at: string | null;
    created_at: string;
  }[]).map((row) => ({
    id: row.id,
    tripId: row.trip_id,
    invitedEmail: row.invited_email,
    expiresAt: row.expires_at,
    maxUses: row.max_uses,
    useCount: row.use_count,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
    isActive:
      !row.revoked_at &&
      row.use_count < row.max_uses &&
      new Date(row.expires_at).getTime() > Date.now(),
  }));
}

export async function revokeTripInvitation(invitationId: string): Promise<void> {
  await getAuthenticatedUserId();
  const { error } = await requireSupabase().rpc('revoke_trip_invitation', {
    p_invitation_id: invitationId,
  });
  if (error) throw error;
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
  storagePath?: string | null;
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
      storage_path: input.storagePath || null,
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
  storagePath?: string | null;
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
      storage_path: input.storagePath || null,
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

function safeStorageFileName(value: string): string {
  const cleaned = value
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(-120);
  return cleaned || 'trip-document';
}

export async function uploadTripDocument(input: {
  tripId: string;
  file: Blob;
  fileName: string;
  contentType: string;
}): Promise<string> {
  if (input.file.size > MAX_TRIP_DOCUMENT_BYTES) {
    throw new Error('Choose a file smaller than 10 MB.');
  }
  const userId = await getAuthenticatedUserId();
  const suffix = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const storagePath = `${input.tripId}/${userId}/${suffix}-${safeStorageFileName(input.fileName)}`;
  const { error } = await requireSupabase().storage.from(TRIP_DOCUMENT_BUCKET).upload(storagePath, input.file, {
    cacheControl: '3600',
    contentType: input.contentType || 'application/octet-stream',
    upsert: false,
  });
  if (error) throw error;
  return storagePath;
}

export async function createTripDocumentUrl(storagePath: string): Promise<string> {
  await getAuthenticatedUserId();
  const { data, error } = await requireSupabase().storage
    .from(TRIP_DOCUMENT_BUCKET)
    .createSignedUrl(storagePath, 10 * 60);
  if (error) throw error;
  if (!data.signedUrl) throw new Error('Could not create a secure file link.');
  return data.signedUrl;
}

export async function deleteTripDocument(storagePath: string): Promise<void> {
  await getAuthenticatedUserId();
  const { error } = await requireSupabase().storage.from(TRIP_DOCUMENT_BUCKET).remove([storagePath]);
  if (error) throw error;
}

export async function listTravelSegments(tripId: string): Promise<LiveTravelSegment[]> {
  const { data, error } = await requireSupabase()
    .from('travel_segments')
    .select(
      'id,trip_id,participant_id,kind,provider,service_number,departure_place,arrival_place,departs_at,arrives_at,departure_time_zone,arrival_time_zone,notes',
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
  departureTimeZone: string;
  arrivalTimeZone: string;
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
      departure_time_zone: input.departureTimeZone,
      arrival_time_zone: input.arrivalTimeZone,
      notes: input.notes?.trim() || null,
    })
    .select(
      'id,trip_id,participant_id,kind,provider,service_number,departure_place,arrival_place,departs_at,arrives_at,departure_time_zone,arrival_time_zone,notes',
    )
    .single();
  if (error) throw error;
  return mapTravel(data as TravelRow);
}

export async function createTravelSegments(input: {
  tripId: string;
  segments: {
    kind: TravelKind;
    provider?: string | null;
    serviceNumber?: string | null;
    departurePlace: string;
    arrivalPlace: string;
    departsAt: string;
    arrivesAt?: string | null;
    departureTimeZone: string;
    arrivalTimeZone: string;
    notes?: string | null;
  }[];
}): Promise<LiveTravelSegment[]> {
  if (!input.segments.length) return [];
  const userId = await getAuthenticatedUserId();
  const participantId = await getCurrentParticipantId(input.tripId, userId);
  const rows = input.segments.map((segment) => ({
    trip_id: input.tripId,
    participant_id: participantId,
    created_by: userId,
    kind: segment.kind,
    provider: segment.provider?.trim() || null,
    service_number: segment.serviceNumber?.trim() || null,
    departure_place: segment.departurePlace.trim(),
    arrival_place: segment.arrivalPlace.trim(),
    departs_at: segment.departsAt,
    arrives_at: segment.arrivesAt || null,
    departure_time_zone: segment.departureTimeZone,
    arrival_time_zone: segment.arrivalTimeZone,
    notes: segment.notes?.trim() || null,
  }));
  const { data, error } = await requireSupabase()
    .from('travel_segments')
    .insert(rows)
    .select(
      'id,trip_id,participant_id,kind,provider,service_number,departure_place,arrival_place,departs_at,arrives_at,departure_time_zone,arrival_time_zone,notes',
    );
  if (error) throw error;
  return ((data ?? []) as TravelRow[])
    .map(mapTravel)
    .sort((a, b) => a.departsAt.localeCompare(b.departsAt));
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
  departureTimeZone: string;
  arrivalTimeZone: string;
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
      departure_time_zone: input.departureTimeZone,
      arrival_time_zone: input.arrivalTimeZone,
      notes: input.notes?.trim() || null,
    })
    .eq('id', input.id)
    .select(
      'id,trip_id,participant_id,kind,provider,service_number,departure_place,arrival_place,departs_at,arrives_at,departure_time_zone,arrival_time_zone,notes',
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
    .select('id,trip_id,name,address,check_in_at,check_out_at,time_zone,booking_url,notes')
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
    .select('id,trip_id,name,address,check_in_at,check_out_at,time_zone,booking_url,notes')
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
    .select('id,trip_id,name,address,check_in_at,check_out_at,time_zone,booking_url,notes')
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
    .select('id,trip_id,title,details,starts_at,ends_at,time_zone')
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
    .select('id,trip_id,title,details,starts_at,ends_at,time_zone')
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
    .select('id,trip_id,title,details,starts_at,ends_at,time_zone')
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
