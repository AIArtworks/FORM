-- ============================================================
-- FORM — Supabase schema
-- Run in the Supabase SQL editor to create the store's tables.
-- Products live in the client catalog (assets/js/catalog.js); this
-- schema captures orders, leads, and messages. Extend as needed.
-- ============================================================

-- Orders placed through checkout ---------------------------------
create table if not exists public.orders (
  id           uuid primary key default gen_random_uuid(),
  ref          text unique not null,
  email        text,
  customer     jsonb,
  items        jsonb not null,
  subtotal     numeric(10,2),
  shipping     numeric(10,2),
  total        numeric(10,2) not null,
  currency     text default 'USD',
  status       text default 'pending',   -- pending | paid | shipped | cancelled
  stripe_session_id text,
  demo         boolean default false,
  created_at   timestamptz default now()
);

-- Newsletter / notify-me signups ---------------------------------
create table if not exists public.newsletter_signups (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  source     text,
  created_at timestamptz default now(),
  unique (email, source)
);

-- Contact / trade messages ---------------------------------------
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text,
  subject    text,
  message    text,
  source     text,
  created_at timestamptz default now()
);

-- Row Level Security --------------------------------------------
alter table public.orders             enable row level security;
alter table public.newsletter_signups enable row level security;
alter table public.contact_messages   enable row level security;

-- Allow anonymous inserts for signups + messages (public forms).
create policy "anon insert signups"  on public.newsletter_signups
  for insert to anon with check (true);
create policy "anon insert messages" on public.contact_messages
  for insert to anon with check (true);

-- Orders are written by the Edge Function using the service-role key,
-- which bypasses RLS. No anon read/write policy on orders on purpose.
