-- Run once in Supabase SQL editor. The backend uses the service-role key (bypasses RLS).
-- RLS is enabled with NO policies, so the anon/public key can read nothing even if it leaks.
create extension if not exists pgcrypto;

create table if not exists leads (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  phone                text not null,              -- normalised "91XXXXXXXXXX"
  destination          text not null,
  departure_city       text,
  travel_dates         text,
  group_size           text,
  service              text not null check (service in ('blueprint','custom','complete')),
  budget               text,
  utm_source           text,
  utm_medium           text,
  utm_campaign         text,
  referrer             text,
  travel_mode          text,                       -- train | flight | road | flexible
  trip_length          text,                       -- 2-3 | 4-5 | 6-8 | 9+ (days)
  group_type           text,
  stay_pref            text,
  interests            text,                       -- comma-separated
  notes                text,                       -- free text from the customer: untrusted
  status               text not null default 'new' check (status in
                         ('new','generating','preview_ready','needs_manual','failed','quoted','paid','delivered','lost')),
  preview_pdf_path     text,
  full_pdf_path        text,
  quote_total_paise    bigint,
  quote_per_person_paise bigint,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index if not exists leads_status_created on leads (status, created_at desc);

create table if not exists itineraries (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null unique references leads(id) on delete cascade,
  data       jsonb not null,
  model      text,
  tokens_in  int,
  tokens_out int,
  created_at timestamptz not null default now()
);
create index if not exists itineraries_created on itineraries (created_at);

create table if not exists payments (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid not null references leads(id) on delete cascade,
  kind          text not null check (kind in ('blueprint','custom_plan','advance')),
  blueprint_id  text,
  amount_paise  bigint not null check (amount_paise > 0),
  status        text not null default 'pending' check (status in ('pending','created','paid','failed','expired')),
  rp_link_id    text unique,
  rp_payment_id text,
  short_url     text,
  expire_at     timestamptz,
  created_at    timestamptz not null default now(),
  paid_at       timestamptz
);
-- One live link per lead+kind: stops double-click duplicate links at the DB level.
create unique index if not exists payments_one_active
  on payments (lead_id, kind) where status in ('pending','created');

-- Existing database? run once:
--   alter table leads alter column departure_city drop not null, alter column travel_dates drop not null,
--     alter column group_size drop not null, alter column budget drop not null;
--   alter table leads add column if not exists utm_source text, add column if not exists utm_medium text,
--     add column if not exists utm_campaign text, add column if not exists referrer text;
--   alter table leads add column if not exists travel_mode text, add column if not exists trip_length text,
--     add column if not exists group_type text, add column if not exists stay_pref text,
--     add column if not exists interests text, add column if not exists notes text;

alter table leads        enable row level security;
alter table itineraries  enable row level security;
alter table payments     enable row level security;

-- Private buckets (signed URLs only).
insert into storage.buckets (id, name, public) values ('itineraries','itineraries', false)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('blueprints','blueprints', false)
  on conflict (id) do nothing;
