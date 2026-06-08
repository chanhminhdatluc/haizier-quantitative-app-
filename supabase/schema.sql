-- BUS4012 Assignment 3: Haizier full-stack persistence schema
-- Stores the React user request, Alpha Vantage market summary, and generated Haizier analysis result.

create extension if not exists "pgcrypto";

create table if not exists public.haizier_analysis_records (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  ticker text not null,
  request_payload jsonb not null,
  market_data jsonb not null,
  analysis_result jsonb not null,
  alpha_vantage_symbol text not null,
  alpha_vantage_last_refreshed text not null
);

alter table public.haizier_analysis_records enable row level security;

comment on table public.haizier_analysis_records is
  'Haizier analysis records saved by the Python backend using Alpha Vantage market data.';

comment on column public.haizier_analysis_records.request_payload is
  'Original analysis input submitted by the React frontend.';

comment on column public.haizier_analysis_records.market_data is
  'Normalised Alpha Vantage market data summary retrieved by the Python backend.';

comment on column public.haizier_analysis_records.analysis_result is
  'Generated Haizier educational decision-support analysis result.';