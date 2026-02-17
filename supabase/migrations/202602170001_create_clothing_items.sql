create extension if not exists "pgcrypto";

create table if not exists public.clothing_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  category text not null check (category in ('top', 'bottom', 'shoes', 'outerwear', 'accessory')),
  colors text[] not null default '{}',
  material text,
  warmth text not null check (warmth in ('light', 'medium', 'heavy')),
  formality text not null check (formality in ('casual', 'smart', 'business')),
  notes text,
  photo_path text not null
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clothing_items_set_updated_at on public.clothing_items;
create trigger clothing_items_set_updated_at
before update on public.clothing_items
for each row
execute function public.set_updated_at();

alter table public.clothing_items enable row level security;

drop policy if exists "clothing_items_select_own" on public.clothing_items;
create policy "clothing_items_select_own"
on public.clothing_items
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "clothing_items_insert_own" on public.clothing_items;
create policy "clothing_items_insert_own"
on public.clothing_items
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "clothing_items_update_own" on public.clothing_items;
create policy "clothing_items_update_own"
on public.clothing_items
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "clothing_items_delete_own" on public.clothing_items;
create policy "clothing_items_delete_own"
on public.clothing_items
for delete
to authenticated
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('closet-photos', 'closet-photos', false)
on conflict (id) do nothing;

drop policy if exists "closet_photos_select_own" on storage.objects;
create policy "closet_photos_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'closet-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "closet_photos_insert_own" on storage.objects;
create policy "closet_photos_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'closet-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "closet_photos_update_own" on storage.objects;
create policy "closet_photos_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'closet-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'closet-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "closet_photos_delete_own" on storage.objects;
create policy "closet_photos_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'closet-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
