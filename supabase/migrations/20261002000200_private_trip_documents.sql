begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'trip-documents',
  'trip-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'application/vnd.apple.pkpass',
    'application/octet-stream',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists trip_documents_select_members on storage.objects;
create policy trip_documents_select_members on storage.objects
for select to authenticated
using (
  bucket_id = 'trip-documents'
  and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/'
  and public.is_trip_member((storage.foldername(name))[1]::uuid)
);

drop policy if exists trip_documents_insert_contributors on storage.objects;
create policy trip_documents_insert_contributors on storage.objects
for insert to authenticated
with check (
  bucket_id = 'trip-documents'
  and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/'
  and (storage.foldername(name))[2] = auth.uid()::text
  and public.can_contribute_trip((storage.foldername(name))[1]::uuid)
);

drop policy if exists trip_documents_delete_owner_or_editors on storage.objects;
create policy trip_documents_delete_owner_or_editors on storage.objects
for delete to authenticated
using (
  bucket_id = 'trip-documents'
  and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/'
  and (
    (
      (storage.foldername(name))[2] = auth.uid()::text
      and public.can_contribute_trip((storage.foldername(name))[1]::uuid)
    )
    or public.can_edit_trip((storage.foldername(name))[1]::uuid)
  )
);

commit;
