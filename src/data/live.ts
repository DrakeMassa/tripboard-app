import { requireSupabase } from '@/lib/supabase';
import type { TripResourceKind } from '@/types/trip';

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

export async function createColumbiaPilot(): Promise<LiveTrip> {
  const client = requireSupabase();
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('Sign in before creating a trip.');

  const { data, error } = await client
    .from('trips')
    .insert({
      owner_id: user.id,
      title: 'Columbia game weekend',
      description: 'Pilot trip with my sister and her fiancé.',
      location: 'Columbia, Missouri',
      start_date: '2026-10-07',
      end_date: '2026-10-12',
      base_currency: 'USD',
    })
    .select('id,title,description,location,start_date,end_date,base_currency')
    .single();

  if (error) throw error;
  return mapTrip(data as TripRow);
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
      details: input.details?.trim() || null,
      external_url: input.externalUrl,
    })
    .select('id,trip_id,itinerary_item_id,kind,title,provider,external_url,storage_path,details')
    .single();

  if (error) throw error;
  return mapResource(data as ResourceRow);
}
