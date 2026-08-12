-- Migration: Add Zoom integration tables
-- Run this SQL against your Supabase database (SQL editor or supabase CLI)

create extension if not exists "pgcrypto";

create table if not exists zoom_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  access_token text not null,
  refresh_token text not null,
  scope text,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_zoom_tokens_user on zoom_tokens(user_id);

create table if not exists zoom_meetings (
  id uuid primary key default gen_random_uuid(),
  zoom_meeting_id text not null,
  user_id uuid not null references profiles(id) on delete cascade,
  topic text,
  start_time timestamptz,
  duration_minutes integer,
  join_url text,
  start_url text,
  raw_response jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_zoom_meetings_user on zoom_meetings(user_id);

-- Optional: create a storage bucket for recordings
-- supabase storage create-bucket zoom-recordings --public
