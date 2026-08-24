begin;

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create type public.trip_role as enum ('organizer', 'editor', 'member', 'viewer');
create type public.travel_kind as enum ('flight', 'train', 'car', 'ferry', 'bus', 'other');
create type public.clip_source as enum ('tiktok', 'instagram', 'youtube', 'web', 'other');
create type public.clip_status as enum ('pending', 'ready', 'failed');
create type public.place_category as enum ('restaurant', 'attraction', 'stay', 'transit', 'shopping', 'other');
create type public.participant_status as enum ('active', 'removed');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete restrict,
  title text not null check (char_length(title) between 1 and 120),
  description text,
  start_date date,
  end_date date,
  cover_url text,
  base_currency text not null default 'USD' check (base_currency ~ '^[A-Z]{3}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trips_date_order check (end_date is null or start_date is null or end_date >= start_date)
);

create table public.trip_members (
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.trip_role not null default 'member',
  invited_by uuid references auth.users (id) on delete set null,
  joined_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);

create table public.trip_participants (
  id uuid primary key default extensions.gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  display_name text not null check (nullif(trim(display_name), '') is not null),
  status public.participant_status not null default 'active',
  removed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, id),
  constraint participant_status_lifecycle check ((status = 'active' and removed_at is null) or (status = 'removed' and removed_at is not null))
);
create unique index trip_participants_trip_user_idx on public.trip_participants (trip_id, user_id) where user_id is not null;

create table public.trip_invitations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  token_hash bytea not null unique,
  role public.trip_role not null default 'member' check (role <> 'organizer'),
  invited_email text,
  invited_by uuid references auth.users (id) on delete set null,
  expires_at timestamptz not null,
  max_uses integer not null default 1 check (max_uses between 1 and 100),
  use_count integer not null default 0 check (use_count >= 0 and use_count <= max_uses),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.travel_segments (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  participant_id uuid not null,
  created_by uuid references auth.users (id) on delete set null,
  kind public.travel_kind not null,
  provider text,
  service_number text,
  departure_place text not null,
  arrival_place text not null,
  departs_at timestamptz not null,
  arrives_at timestamptz,
  departure_time_zone text not null,
  arrival_time_zone text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint travel_time_order check (arrives_at is null or arrives_at >= departs_at)
);

create table public.accommodations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  created_by uuid references auth.users (id) on delete set null,
  name text not null,
  address text,
  check_in_at timestamptz,
  check_out_at timestamptz,
  time_zone text not null,
  booking_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint accommodation_time_order check (
    check_out_at is null or check_in_at is null or check_out_at >= check_in_at
  )
);

create table public.places (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  created_by uuid references auth.users (id) on delete set null,
  name text not null,
  category public.place_category not null default 'other',
  address text,
  latitude double precision check (latitude is null or latitude between -90 and 90),
  longitude double precision check (longitude is null or longitude between -180 and 180),
  provider_place_id text,
  website_url text,
  reservation_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, id)
);

create table public.trip_clips (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  created_by uuid references auth.users (id) on delete set null,
  place_id uuid,
  source public.clip_source not null,
  source_url text not null,
  title text,
  caption text,
  thumbnail_url text,
  status public.clip_status not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, source_url)
);

create table public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  created_by uuid references auth.users (id) on delete set null,
  place_id uuid,
  title text not null,
  details text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  time_zone text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint itinerary_time_order check (ends_at is null or ends_at >= starts_at)
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips (id) on delete cascade,
  created_by uuid references auth.users (id) on delete set null,
  paid_by_participant_id uuid not null,
  description text not null,
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  incurred_on date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, id)
);

create table public.expense_splits (
  trip_id uuid not null references public.trips (id) on delete cascade,
  expense_id uuid not null,
  participant_id uuid not null,
  share_minor bigint not null check (share_minor >= 0),
  settled_at timestamptz,
  primary key (expense_id, participant_id)
);

alter table public.travel_segments add constraint travel_participant_same_trip foreign key (trip_id, participant_id) references public.trip_participants (trip_id, id) on delete restrict;
alter table public.trip_clips add constraint clips_place_same_trip foreign key (trip_id, place_id) references public.places (trip_id, id) on delete set null (place_id);
alter table public.itinerary_items add constraint itinerary_place_same_trip foreign key (trip_id, place_id) references public.places (trip_id, id) on delete set null (place_id);
alter table public.expenses add constraint expense_payer_same_trip foreign key (trip_id, paid_by_participant_id) references public.trip_participants (trip_id, id) on delete restrict;
alter table public.expense_splits add constraint split_expense_same_trip foreign key (trip_id, expense_id) references public.expenses (trip_id, id) on delete cascade;
alter table public.expense_splits add constraint split_participant_same_trip foreign key (trip_id, participant_id) references public.trip_participants (trip_id, id) on delete restrict;

create index trip_members_user_id_idx on public.trip_members (user_id);
create index trip_invitations_trip_id_idx on public.trip_invitations (trip_id);
create index travel_segments_trip_departure_idx on public.travel_segments (trip_id, departs_at);
create index accommodations_trip_checkin_idx on public.accommodations (trip_id, check_in_at);
create index places_trip_category_idx on public.places (trip_id, category);
create index trip_clips_trip_created_idx on public.trip_clips (trip_id, created_at desc);
create index itinerary_items_trip_start_idx on public.itinerary_items (trip_id, starts_at);
create index expenses_trip_date_idx on public.expenses (trip_id, incurred_on desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger trips_set_updated_at before update on public.trips
for each row execute function public.set_updated_at();
create trigger trip_participants_set_updated_at before update on public.trip_participants
for each row execute function public.set_updated_at();
create trigger travel_segments_set_updated_at before update on public.travel_segments
for each row execute function public.set_updated_at();
create trigger accommodations_set_updated_at before update on public.accommodations
for each row execute function public.set_updated_at();
create trigger places_set_updated_at before update on public.places
for each row execute function public.set_updated_at();
create trigger trip_clips_set_updated_at before update on public.trip_clips
for each row execute function public.set_updated_at();
create trigger itinerary_items_set_updated_at before update on public.itinerary_items
for each row execute function public.set_updated_at();
create trigger expenses_set_updated_at before update on public.expenses
for each row execute function public.set_updated_at();

create or replace function public.prevent_created_by_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.created_by is distinct from old.created_by then
    raise exception 'created_by is immutable';
  end if;
  return new;
end;
$$;

create trigger travel_segments_created_by_immutable before update on public.travel_segments
for each row execute function public.prevent_created_by_change();
create trigger accommodations_created_by_immutable before update on public.accommodations
for each row execute function public.prevent_created_by_change();
create trigger places_created_by_immutable before update on public.places
for each row execute function public.prevent_created_by_change();
create trigger trip_clips_created_by_immutable before update on public.trip_clips
for each row execute function public.prevent_created_by_change();
create trigger itinerary_items_created_by_immutable before update on public.itinerary_items
for each row execute function public.prevent_created_by_change();
create trigger expenses_created_by_immutable before update on public.expenses
for each row execute function public.prevent_created_by_change();

create or replace function public.prevent_trip_identity_change()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.trip_id is distinct from old.trip_id then raise exception 'trip_id is immutable'; end if;
  return new;
end; $$;

create trigger travel_trip_immutable before update on public.travel_segments for each row execute function public.prevent_trip_identity_change();
create trigger accommodations_trip_immutable before update on public.accommodations for each row execute function public.prevent_trip_identity_change();
create trigger places_trip_immutable before update on public.places for each row execute function public.prevent_trip_identity_change();
create trigger clips_trip_immutable before update on public.trip_clips for each row execute function public.prevent_trip_identity_change();
create trigger itinerary_trip_immutable before update on public.itinerary_items for each row execute function public.prevent_trip_identity_change();
create trigger expenses_trip_immutable before update on public.expenses for each row execute function public.prevent_trip_identity_change();
create trigger participants_trip_immutable before update on public.trip_participants for each row execute function public.prevent_trip_identity_change();

create or replace function public.validate_iana_time_zone()
returns trigger language plpgsql stable set search_path = '' as $$
begin
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = new.time_zone) then raise exception 'Invalid IANA time zone: %', new.time_zone; end if;
  return new;
end; $$;
create trigger accommodations_validate_timezone before insert or update of time_zone on public.accommodations for each row execute function public.validate_iana_time_zone();
create trigger itinerary_validate_timezone before insert or update of time_zone on public.itinerary_items for each row execute function public.validate_iana_time_zone();
create or replace function public.validate_travel_time_zones() returns trigger language plpgsql stable set search_path = '' as $$
begin
 if not exists (select 1 from pg_catalog.pg_timezone_names where name = new.departure_time_zone) or not exists (select 1 from pg_catalog.pg_timezone_names where name = new.arrival_time_zone) then raise exception 'Invalid IANA time zone'; end if; return new;
end; $$;
create trigger travel_validate_timezones before insert or update of departure_time_zone, arrival_time_zone on public.travel_segments for each row execute function public.validate_travel_time_zones();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.handle_new_trip()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.trip_members (trip_id, user_id, role) values (new.id, new.owner_id, 'organizer');
  insert into public.trip_participants (trip_id, user_id, display_name)
  values (new.id, new.owner_id, coalesce((select display_name from public.profiles where id = new.owner_id), 'Trip owner'));
  return new;
end;
$$;

create trigger on_trip_created
after insert on public.trips
for each row execute function public.handle_new_trip();

create or replace function public.prevent_trip_owner_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.owner_id is distinct from old.owner_id then
    raise exception 'Trip ownership cannot be reassigned directly';
  end if;
  return new;
end;
$$;

create trigger trips_prevent_owner_change
before update on public.trips
for each row execute function public.prevent_trip_owner_change();

create or replace function public.protect_owner_membership() returns trigger language plpgsql set search_path = '' as $$
declare v_owner uuid; begin
 select owner_id into v_owner from public.trips where id = old.trip_id;
 if tg_op = 'UPDATE' and (new.trip_id is distinct from old.trip_id or new.user_id is distinct from old.user_id) then raise exception 'Membership identity is immutable'; end if;
 if old.user_id = v_owner and (tg_op = 'DELETE' or new.role is distinct from 'organizer'::public.trip_role) then raise exception 'Trip owner membership must remain organizer'; end if;
 return case when tg_op = 'DELETE' then old else new end;
end; $$;
create trigger trip_members_protect_owner before update or delete on public.trip_members for each row execute function public.protect_owner_membership();

create or replace function public.is_trip_member(p_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.trip_members
    where trip_id = p_trip_id and user_id = auth.uid()
  );
$$;

create or replace function public.can_edit_trip(p_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.trip_members
    where trip_id = p_trip_id
      and user_id = auth.uid()
      and role in ('organizer', 'editor')
  );
$$;

create or replace function public.can_contribute_trip(p_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.trip_members
    where trip_id = p_trip_id
      and user_id = auth.uid()
      and role in ('organizer', 'editor', 'member')
  );
$$;

create or replace function public.is_trip_organizer(p_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.trip_members
    where trip_id = p_trip_id and user_id = auth.uid() and role = 'organizer'
  );
$$;

create or replace function public.shares_trip_with(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.trip_members mine
    join public.trip_members theirs on theirs.trip_id = mine.trip_id
    where mine.user_id = auth.uid() and theirs.user_id = p_user_id
  );
$$;

create or replace function public.is_expense_trip_member(p_expense_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.expenses e
    join public.trip_members m on m.trip_id = e.trip_id
    where e.id = p_expense_id and m.user_id = auth.uid()
  );
$$;

create or replace function public.can_manage_expense(p_expense_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.expenses e
    where e.id = p_expense_id
      and ((e.created_by = auth.uid() and public.can_contribute_trip(e.trip_id)) or public.can_edit_trip(e.trip_id))
  );
$$;

create or replace function public.create_trip_invitation(
  p_trip_id uuid,
  p_role public.trip_role default 'member',
  p_invited_email text default null,
  p_expires_in interval default interval '7 days',
  p_max_uses integer default 1
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token text;
begin
  if auth.uid() is null or not public.is_trip_organizer(p_trip_id) then
    raise exception 'Only a trip organizer can create invitations';
  end if;
  if p_role = 'organizer' then
    raise exception 'Invitation links cannot grant organizer access';
  end if;
  if p_expires_in <= interval '0 seconds' or p_expires_in > interval '30 days' then
    raise exception 'Invitation expiry must be between now and 30 days';
  end if;
  if p_max_uses < 1 or p_max_uses > 100 then
    raise exception 'Invitation max uses must be between 1 and 100';
  end if;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');

  insert into public.trip_invitations (
    trip_id,
    token_hash,
    role,
    invited_email,
    invited_by,
    expires_at,
    max_uses
  )
  values (
    p_trip_id,
    extensions.digest(convert_to(v_token, 'UTF8'), 'sha256'),
    p_role,
    nullif(lower(trim(p_invited_email)), ''),
    auth.uid(),
    now() + p_expires_in,
    p_max_uses
  );

  return v_token;
end;
$$;

create or replace function public.accept_trip_invitation(p_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invitation public.trip_invitations%rowtype;
  v_inserted integer;
  v_email text;
  v_confirmed_at timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  select * into v_invitation
  from public.trip_invitations
  where token_hash = extensions.digest(convert_to(p_token, 'UTF8'), 'sha256')
    and revoked_at is null
    and expires_at > now()
    and use_count < max_uses
  for update;

  if not found then
    raise exception 'Invitation is invalid, expired, revoked, or fully used';
  end if;

  select lower(email), email_confirmed_at into v_email, v_confirmed_at from auth.users where id = auth.uid() and not is_anonymous;
  if v_email is null or v_confirmed_at is null then raise exception 'A confirmed, non-anonymous account is required'; end if;
  if v_invitation.invited_email is not null and v_invitation.invited_email <> v_email then
    raise exception 'Invitation is for a different email address';
  end if;

  insert into public.trip_members (trip_id, user_id, role, invited_by)
  values (v_invitation.trip_id, auth.uid(), v_invitation.role, v_invitation.invited_by)
  on conflict (trip_id, user_id) do nothing;

  get diagnostics v_inserted = row_count;

  insert into public.trip_participants (trip_id, user_id, display_name)
  values (v_invitation.trip_id, auth.uid(), coalesce((select display_name from public.profiles where id = auth.uid()), v_email))
  on conflict (trip_id, user_id) where user_id is not null do update set status = 'active', removed_at = null;
  if v_inserted = 1 then
    update public.trip_invitations
    set use_count = use_count + 1
    where id = v_invitation.id;
  end if;

  return v_invitation.trip_id;
end;
$$;

create or replace function public.revoke_trip_invitation(p_invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_trip_id uuid;
begin
  select trip_id into v_trip_id
  from public.trip_invitations
  where id = p_invitation_id;

  if v_trip_id is null or not public.is_trip_organizer(v_trip_id) then
    raise exception 'Only a trip organizer can revoke this invitation';
  end if;

  update public.trip_invitations
  set revoked_at = coalesce(revoked_at, now())
  where id = p_invitation_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_members enable row level security;
alter table public.trip_invitations enable row level security;
alter table public.trip_participants enable row level security;
alter table public.travel_segments enable row level security;
alter table public.accommodations enable row level security;
alter table public.places enable row level security;
alter table public.trip_clips enable row level security;
alter table public.itinerary_items enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_splits enable row level security;

create policy profiles_select_shared_trip on public.profiles
for select to authenticated
using (id = auth.uid() or public.shares_trip_with(id));
create policy profiles_update_self on public.profiles
for update to authenticated
using (id = auth.uid()) with check (id = auth.uid());

create policy trips_select_members on public.trips
for select to authenticated using (owner_id = auth.uid() or public.is_trip_member(id));
create policy trips_insert_owner on public.trips
for insert to authenticated with check (owner_id = auth.uid());
create policy trips_update_editors on public.trips
for update to authenticated using (public.can_edit_trip(id)) with check (public.can_edit_trip(id));
create policy trips_delete_owner on public.trips
for delete to authenticated using (owner_id = auth.uid());

create policy trip_members_select_members on public.trip_members
for select to authenticated using (public.is_trip_member(trip_id));
create policy trip_members_update_organizers on public.trip_members
for update to authenticated using (public.is_trip_organizer(trip_id))
with check (public.is_trip_organizer(trip_id));
create policy trip_members_delete_organizers on public.trip_members
for delete to authenticated using (public.is_trip_organizer(trip_id) and user_id <> auth.uid());

create policy participants_select_members on public.trip_participants for select to authenticated using (public.is_trip_member(trip_id));
create policy participants_insert_editors on public.trip_participants for insert to authenticated with check (public.can_edit_trip(trip_id));
create policy participants_update_editors on public.trip_participants for update to authenticated using (public.can_edit_trip(trip_id)) with check (public.can_edit_trip(trip_id));

create policy invitations_select_organizers on public.trip_invitations
for select to authenticated using (public.is_trip_organizer(trip_id));
create policy invitations_delete_organizers on public.trip_invitations
for delete to authenticated using (public.is_trip_organizer(trip_id));

create policy travel_select_members on public.travel_segments
for select to authenticated using (public.is_trip_member(trip_id));
create policy travel_insert_contributors on public.travel_segments
for insert to authenticated with check (public.can_contribute_trip(trip_id) and created_by = auth.uid());
create policy travel_update_owner_or_editors on public.travel_segments
for update to authenticated using ((created_by = auth.uid() and public.can_contribute_trip(trip_id)) or public.can_edit_trip(trip_id))
with check ((created_by = auth.uid() and public.can_contribute_trip(trip_id)) or public.can_edit_trip(trip_id));
create policy travel_delete_owner_or_editors on public.travel_segments
for delete to authenticated using ((created_by = auth.uid() and public.can_contribute_trip(trip_id)) or public.can_edit_trip(trip_id));

create policy accommodations_select_members on public.accommodations
for select to authenticated using (public.is_trip_member(trip_id));
create policy accommodations_insert_contributors on public.accommodations
for insert to authenticated with check (public.can_contribute_trip(trip_id) and created_by = auth.uid());
create policy accommodations_update_owner_or_editors on public.accommodations
for update to authenticated using ((created_by = auth.uid() and public.can_contribute_trip(trip_id)) or public.can_edit_trip(trip_id))
with check ((created_by = auth.uid() and public.can_contribute_trip(trip_id)) or public.can_edit_trip(trip_id));
create policy accommodations_delete_owner_or_editors on public.accommodations
for delete to authenticated using ((created_by = auth.uid() and public.can_contribute_trip(trip_id)) or public.can_edit_trip(trip_id));

create policy places_select_members on public.places
for select to authenticated using (public.is_trip_member(trip_id));
create policy places_insert_contributors on public.places
for insert to authenticated with check (public.can_contribute_trip(trip_id) and created_by = auth.uid());
create policy places_update_owner_or_editors on public.places
for update to authenticated using ((created_by = auth.uid() and public.can_contribute_trip(trip_id)) or public.can_edit_trip(trip_id))
with check ((created_by = auth.uid() and public.can_contribute_trip(trip_id)) or public.can_edit_trip(trip_id));
create policy places_delete_owner_or_editors on public.places
for delete to authenticated using ((created_by = auth.uid() and public.can_contribute_trip(trip_id)) or public.can_edit_trip(trip_id));

create policy clips_select_members on public.trip_clips
for select to authenticated using (public.is_trip_member(trip_id));
create policy clips_insert_contributors on public.trip_clips
for insert to authenticated with check (public.can_contribute_trip(trip_id) and created_by = auth.uid());
create policy clips_update_owner_or_editors on public.trip_clips
for update to authenticated using ((created_by = auth.uid() and public.can_contribute_trip(trip_id)) or public.can_edit_trip(trip_id))
with check ((created_by = auth.uid() and public.can_contribute_trip(trip_id)) or public.can_edit_trip(trip_id));
create policy clips_delete_owner_or_editors on public.trip_clips
for delete to authenticated using ((created_by = auth.uid() and public.can_contribute_trip(trip_id)) or public.can_edit_trip(trip_id));

create policy itinerary_select_members on public.itinerary_items
for select to authenticated using (public.is_trip_member(trip_id));
create policy itinerary_insert_contributors on public.itinerary_items
for insert to authenticated with check (public.can_contribute_trip(trip_id) and created_by = auth.uid());
create policy itinerary_update_owner_or_editors on public.itinerary_items
for update to authenticated using ((created_by = auth.uid() and public.can_contribute_trip(trip_id)) or public.can_edit_trip(trip_id))
with check ((created_by = auth.uid() and public.can_contribute_trip(trip_id)) or public.can_edit_trip(trip_id));
create policy itinerary_delete_owner_or_editors on public.itinerary_items
for delete to authenticated using ((created_by = auth.uid() and public.can_contribute_trip(trip_id)) or public.can_edit_trip(trip_id));

create policy expenses_select_members on public.expenses
for select to authenticated using (public.is_trip_member(trip_id));
create policy expenses_insert_contributors on public.expenses
for insert to authenticated with check (public.can_contribute_trip(trip_id) and created_by = auth.uid());
create policy expenses_update_owner_or_editors on public.expenses
for update to authenticated using ((created_by = auth.uid() and public.can_contribute_trip(trip_id)) or public.can_edit_trip(trip_id))
with check ((created_by = auth.uid() and public.can_contribute_trip(trip_id)) or public.can_edit_trip(trip_id));
create policy expenses_delete_owner_or_editors on public.expenses
for delete to authenticated using ((created_by = auth.uid() and public.can_contribute_trip(trip_id)) or public.can_edit_trip(trip_id));

create policy expense_splits_select_members on public.expense_splits
for select to authenticated using (public.is_expense_trip_member(expense_id));
create policy expense_splits_insert_managers on public.expense_splits
for insert to authenticated with check (
  public.can_manage_expense(expense_id)
);
create policy expense_splits_update_managers on public.expense_splits
for update to authenticated using (public.can_manage_expense(expense_id))
with check (
  public.can_manage_expense(expense_id)
);
create policy expense_splits_delete_managers on public.expense_splits
for delete to authenticated using (public.can_manage_expense(expense_id));

revoke all on schema public from anon;
revoke all on all tables in schema public from public, anon;
revoke all on all functions in schema public from public, anon;
revoke all on all sequences in schema public from public, anon;
alter default privileges in schema public revoke all on tables from public, anon;
alter default privileges in schema public revoke all on functions from public, anon;
alter default privileges in schema public revoke all on sequences from public, anon;
grant select, insert, update, delete on all tables in schema public to authenticated;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.handle_new_trip() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.prevent_trip_owner_change() from public, anon, authenticated;
revoke all on function public.prevent_created_by_change() from public, anon, authenticated;
revoke all on function public.prevent_trip_identity_change() from public, anon, authenticated;
revoke all on function public.protect_owner_membership() from public, anon, authenticated;
revoke all on function public.validate_iana_time_zone() from public, anon, authenticated;
revoke all on function public.validate_travel_time_zones() from public, anon, authenticated;

revoke all on function public.is_trip_member(uuid) from public, anon;
revoke all on function public.can_edit_trip(uuid) from public, anon;
revoke all on function public.can_contribute_trip(uuid) from public, anon;
revoke all on function public.is_trip_organizer(uuid) from public, anon;
revoke all on function public.shares_trip_with(uuid) from public, anon;
revoke all on function public.is_expense_trip_member(uuid) from public, anon;
revoke all on function public.can_manage_expense(uuid) from public, anon;
grant execute on function public.is_trip_member(uuid) to authenticated;
grant execute on function public.can_edit_trip(uuid) to authenticated;
grant execute on function public.can_contribute_trip(uuid) to authenticated;
grant execute on function public.is_trip_organizer(uuid) to authenticated;
grant execute on function public.shares_trip_with(uuid) to authenticated;
grant execute on function public.is_expense_trip_member(uuid) to authenticated;
grant execute on function public.can_manage_expense(uuid) to authenticated;

revoke all on function public.create_trip_invitation(uuid, public.trip_role, text, interval, integer)
from public, anon;
revoke all on function public.accept_trip_invitation(text) from public, anon;
revoke all on function public.revoke_trip_invitation(uuid) from public, anon;
grant execute on function public.create_trip_invitation(uuid, public.trip_role, text, interval, integer)
to authenticated;
grant execute on function public.accept_trip_invitation(text) to authenticated;
grant execute on function public.revoke_trip_invitation(uuid) to authenticated;

commit;
