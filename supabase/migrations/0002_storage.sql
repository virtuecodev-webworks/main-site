-- =============================================================================
--  Virtue & Co. Webworks — storage bucket for portfolio media
--  Public read (screenshots are shown on the marketing site), admin-only write.
-- =============================================================================

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-media',
  'project-media',
  true,
  5242880, -- 5 MB
  array['image/png', 'image/jpeg', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Anyone may view portfolio screenshots.
drop policy if exists "project_media_public_read" on storage.objects;
create policy "project_media_public_read"
  on storage.objects for select
  using (bucket_id = 'project-media');

-- Only studio admins may add media.
drop policy if exists "project_media_admin_insert" on storage.objects;
create policy "project_media_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-media' and public.is_admin());

drop policy if exists "project_media_admin_update" on storage.objects;
create policy "project_media_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-media' and public.is_admin())
  with check (bucket_id = 'project-media' and public.is_admin());

drop policy if exists "project_media_admin_delete" on storage.objects;
create policy "project_media_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-media' and public.is_admin());

commit;
