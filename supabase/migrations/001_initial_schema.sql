create extension if not exists "pgcrypto";

create table if not exists public.laptops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null,
  price integer not null,
  cpu text,
  gpu text,
  ram_gb integer,
  storage_gb integer,
  screen_size numeric,
  screen_type text,
  weight_kg numeric,
  battery_hours integer,
  os text,
  use_cases text[],
  performance_score integer,
  portability_score integer,
  value_score integer,
  future_proof_score integer,
  gpu_tier integer,
  image_url text,
  buy_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  requirements jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions(id) on delete cascade,
  tier text check (tier in ('minimum', 'balanced', 'future_proof')),
  laptop_id uuid references public.laptops(id),
  score numeric,
  explanation text,
  created_at timestamptz not null default now()
);

create index if not exists idx_laptops_brand on public.laptops(brand);
create index if not exists idx_laptops_price on public.laptops(price);
create index if not exists idx_laptops_use_cases on public.laptops using gin(use_cases);
create index if not exists idx_recommendations_session_id on public.recommendations(session_id);

alter table public.laptops enable row level security;
alter table public.sessions enable row level security;
alter table public.recommendations enable row level security;

drop policy if exists "laptops are viewable by everyone" on public.laptops;
create policy "laptops are viewable by everyone"
  on public.laptops
  for select
  using (true);

drop policy if exists "anyone can insert sessions" on public.sessions;
create policy "anyone can insert sessions"
  on public.sessions
  for insert
  with check (true);

drop policy if exists "anyone can insert recommendations" on public.recommendations;
create policy "anyone can insert recommendations"
  on public.recommendations
  for insert
  with check (true);
