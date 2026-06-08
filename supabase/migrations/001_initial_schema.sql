-- Haizier MVP initial Supabase schema
-- Educational decision-support persistence only. Not financial advice.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.risk_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  experience text not null,
  risk_tolerance text not null,
  goal text not null,
  consent boolean not null,
  consent_timestamp timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.analysis_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  risk_profile_id uuid not null references public.risk_profiles(id) on delete cascade,
  ticker text not null,
  horizon text not null,
  amount_range text,
  signals jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.analysis_results (
  id uuid primary key default gen_random_uuid(),
  analysis_request_id uuid not null references public.analysis_requests(id) on delete cascade,
  market_trend integer not null check (market_trend between 0 and 100),
  sentiment integer not null check (sentiment between 0 and 100),
  ai_confidence integer not null check (ai_confidence between 0 and 100),
  research_alignment integer not null check (research_alignment between 0 and 100),
  hype_risk integer not null check (hype_risk between 0 and 100),
  evidence_confidence integer not null check (evidence_confidence between 0 and 100),
  verdict text not null check (verdict in ('evidence-supported', 'hype-driven')),
  explanation text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.risk_profiles enable row level security;
alter table public.analysis_requests enable row level security;
alter table public.analysis_results enable row level security;

comment on table public.profiles is 'Minimal Haizier MVP profile/session identity records.';
comment on table public.risk_profiles is 'Risk profile and educational consent records.';
comment on table public.analysis_requests is 'Submitted stock analysis inputs.';
comment on table public.analysis_results is 'Generated educational analysis outputs.';