-- Run this ONCE in Supabase: SQL Editor -> New query -> paste -> Run

create table public.products (
  id bigint generated always as identity primary key,
  name text not null,
  category text default 'Shoes',
  price integer not null,
  old_price integer,
  tag text,
  description text,
  colors text,
  sizes integer[] default '{}',
  image_url text,
  sold_out boolean default false,
  visible boolean default true,
  created_at timestamptz default now()
);

alter table public.products enable row level security;

-- Customers (everyone): can only READ shoes that are visible
create policy "public read visible" on public.products for select using (visible = true);
-- Logged-in owners: can read, add, edit, delete everything
create policy "owners read all"  on public.products for select to authenticated using (true);
create policy "owners insert"    on public.products for insert to authenticated with check (true);
create policy "owners update"    on public.products for update to authenticated using (true) with check (true);
create policy "owners delete"    on public.products for delete to authenticated using (true);

-- Photo storage
insert into storage.buckets (id, name, public) values ('shoe-images', 'shoe-images', true) on conflict do nothing;
create policy "public read images"  on storage.objects for select using (bucket_id = 'shoe-images');
create policy "owners upload images" on storage.objects for insert to authenticated with check (bucket_id = 'shoe-images');
create policy "owners update images" on storage.objects for update to authenticated using (bucket_id = 'shoe-images');
create policy "owners delete images" on storage.objects for delete to authenticated using (bucket_id = 'shoe-images');
