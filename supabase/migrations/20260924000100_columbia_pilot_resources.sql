begin;

do $$
begin
  if to_regclass('public.trips') is null
    or to_regclass('public.itinerary_items') is null
    or to_regprocedure('public.is_trip_member(uuid)') is null
    or to_regprocedure('public.can_contribute_trip(uuid)') is null
    or to_regprocedure('public.can_edit_trip(uuid)') is null then
    raise exception 'Wanderly base schema is missing; apply 20260824000100_initial_schema.sql first';
  end if;
end
$$;

do $$
begin
  if to_regtype('public.resource_kind') is null then
    create type public.resource_kind as enum (
      'ticket',
      'confirmation',
      'parking_pass',
      'reservation',
      'document',
      'photo_album',
      'link',
      'other'
    );
  end if;
end
$$;

alter table public.trips add column if not exists location text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.trips'::regclass
      and conname = 'trips_location_valid'
  ) then
    alter table public.trips
      add constraint trips_location_valid
      check (location is null or (nullif(trim(location), '') is not null and char_length(location) <= 160));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.itinerary_items'::regclass
      and conname = 'itinerary_items_trip_id_id_key'
  ) then
    alter table public.itinerary_items
      add constraint itinerary_items_trip_id_id_key unique (trip_id, id);
  end if;
end
$$;

create table if not exists public.trip_resources (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  itinerary_item_id uuid,
  created_by uuid references auth.users (id) on delete set null,
  kind public.resource_kind not null default 'link',
  title text not null check (nullif(trim(title), '') is not null and char_length(title) <= 160),
  provider text,
  external_url text,
  storage_path text,
  details text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, id),
  constraint resource_external_url_https check (external_url is null or external_url ~* '^https://[^[:space:]]+$'),
  constraint resource_storage_path_nonempty check (storage_path is null or nullif(trim(storage_path), '') is not null)
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.trip_resources'::regclass
      and conname = 'resource_itinerary_same_trip'
  ) then
    alter table public.trip_resources
      add constraint resource_itinerary_same_trip
      foreign key (trip_id, itinerary_item_id)
      references public.itinerary_items (trip_id, id)
      on delete set null (itinerary_item_id);
  end if;
end
$$;

create index if not exists trip_resources_trip_created_idx
  on public.trip_resources (trip_id, created_at desc);
create index if not exists trip_resources_itinerary_idx
  on public.trip_resources (trip_id, itinerary_item_id)
  where itinerary_item_id is not null;

drop trigger if exists trip_resources_set_updated_at on public.trip_resources;
create trigger trip_resources_set_updated_at before update on public.trip_resources
for each row execute function public.set_updated_at();

drop trigger if exists trip_resources_created_by_immutable on public.trip_resources;
create trigger trip_resources_created_by_immutable before update on public.trip_resources
for each row execute function public.prevent_created_by_change();

drop trigger if exists resources_trip_immutable on public.trip_resources;
create trigger resources_trip_immutable before update on public.trip_resources
for each row execute function public.prevent_trip_identity_change();

alter table public.trip_resources enable row level security;

drop policy if exists resources_select_members on public.trip_resources;
create policy resources_select_members on public.trip_resources
for select to authenticated using (public.is_trip_member(trip_id));

drop policy if exists resources_insert_contributors on public.trip_resources;
create policy resources_insert_contributors on public.trip_resources
for insert to authenticated with check (public.can_contribute_trip(trip_id) and created_by = auth.uid());

drop policy if exists resources_update_owner_or_editors on public.trip_resources;
create policy resources_update_owner_or_editors on public.trip_resources
for update to authenticated
using ((created_by = auth.uid() and public.can_contribute_trip(trip_id)) or public.can_edit_trip(trip_id))
with check ((created_by = auth.uid() and public.can_contribute_trip(trip_id)) or public.can_edit_trip(trip_id));

drop policy if exists resources_delete_owner_or_editors on public.trip_resources;
create policy resources_delete_owner_or_editors on public.trip_resources
for delete to authenticated
using ((created_by = auth.uid() and public.can_contribute_trip(trip_id)) or public.can_edit_trip(trip_id));

revoke all on table public.trip_resources from public, anon;
grant select, insert, update, delete on table public.trip_resources to authenticated;

commit;
