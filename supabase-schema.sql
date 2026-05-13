-- Run this in your Supabase dashboard → SQL Editor

-- 1. Profiles table
create table if not exists profiles (
  id          uuid references auth.users primary key,
  display_name text not null,
  created_at  timestamptz default now()
);

-- 2. Pins table
create table if not exists pins (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null check (category in ('food','tourist','accommodation','transport','shopping','airport')),
  address     text,
  lat         float8 not null,
  lng         float8 not null,
  notes       text,
  link        text,
  added_by    uuid references profiles(id),
  created_at  timestamptz default now()
);

-- 3. Row Level Security
alter table profiles enable row level security;
alter table pins     enable row level security;

-- Profiles: anyone authenticated can read; only own row can update
create policy "read profiles" on profiles
  for select using (auth.role() = 'authenticated');

create policy "update own profile" on profiles
  for update using (auth.uid() = id);

create policy "insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Pins: anyone can read (map is public); only authenticated users can write
create policy "read pins" on pins
  for select using (true);

create policy "insert pins" on pins
  for insert with check (auth.role() = 'authenticated');

create policy "delete pins" on pins
  for delete using (auth.role() = 'authenticated');

-- 4. Enable realtime on pins
alter publication supabase_realtime add table pins;
