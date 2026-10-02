create role anon nologin;
create role authenticated nologin;
create schema auth;
create schema storage;
grant usage on schema public, auth, storage to authenticated;
create table auth.users (
  id uuid primary key,
  email text,
  email_confirmed_at timestamptz,
  is_anonymous boolean not null default false,
  raw_user_meta_data jsonb not null default '{}'::jsonb
);
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
create or replace function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb)
$$;
grant select on auth.users to authenticated;

create table storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);

create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null references storage.buckets(id) on delete cascade,
  name text not null,
  owner_id text,
  metadata jsonb,
  unique (bucket_id, name)
);
alter table storage.objects enable row level security;

create or replace function storage.foldername(name text)
returns text[]
language sql
immutable
as $$
  select string_to_array(regexp_replace(name, '/[^/]+$', ''), '/')
$$;

grant select, insert, update, delete on storage.objects to authenticated;
grant select on storage.buckets to authenticated;
-- Model permissive platform defaults that the migration must explicitly remove.
alter default privileges in schema public grant all on tables to anon;
alter default privileges in schema public grant execute on functions to anon;
