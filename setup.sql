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

-- Reviews table
create table public.reviews (
  id bigint generated always as identity primary key,
  name text not null,
  city text,
  rating integer not null check (rating >= 1 and rating <= 5),
  text text not null,
  created_at timestamptz default now()
);

alter table public.reviews enable row level security;

-- Everyone can read all reviews
create policy "public read all" on public.reviews for select using (true);
-- Logged-in owners can read, add, edit, delete all reviews
create policy "owners read all" on public.reviews for select to authenticated using (true);
create policy "owners insert" on public.reviews for insert to authenticated with check (true);
create policy "owners update" on public.reviews for update to authenticated using (true);
create policy "owners delete" on public.reviews for delete to authenticated using (true);
