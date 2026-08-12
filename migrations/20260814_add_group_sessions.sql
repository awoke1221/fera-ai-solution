-- Migration: Add group coaching session tables and secure join links

create table if not exists group_sessions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  zoom_meeting_id text,
  host_id uuid references profiles(id) on delete set null,
  start_time timestamptz,
  duration_minutes integer default 60,
  capacity integer default 50,
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_group_sessions_start on group_sessions(start_time);

create table if not exists session_attendees (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references group_sessions(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  status text default 'registered' check (status in ('registered', 'cancelled'))
);

create index if not exists idx_session_attendees_session on session_attendees(session_id);

create table if not exists meeting_links (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references group_sessions(id) on delete cascade,
  zoom_meeting_id text,
  token text not null unique,
  created_by uuid references profiles(id),
  expires_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_meeting_links_token on meeting_links(token);
