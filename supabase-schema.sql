-- WAYU Chess realtime rooms (Supabase SQL Editor)
create extension if not exists pgcrypto;

create table if not exists public.wayu_rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text not null unique check (room_code ~ '^[A-Z0-9]{6}$'),
  fen text not null,
  white_name text not null default 'White',
  black_name text,
  status text not null default 'waiting' check (status in ('waiting','playing','finished')),
  moves jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.wayu_rooms enable row level security;
-- Public MVP policies: anyone can create a room, find a waiting room by code,
-- and update a room. For a production tournament, replace these with authenticated
-- participant policies and server-side move validation.
drop policy if exists "wayu rooms public read" on public.wayu_rooms;
drop policy if exists "wayu rooms public insert" on public.wayu_rooms;
drop policy if exists "wayu rooms public update" on public.wayu_rooms;
create policy "wayu rooms public read" on public.wayu_rooms for select to anon, authenticated using (true);
create policy "wayu rooms public insert" on public.wayu_rooms for insert to anon, authenticated with check (true);
create policy "wayu rooms public update" on public.wayu_rooms for update to anon, authenticated using (true) with check (true);

alter publication supabase_realtime add table public.wayu_rooms;
