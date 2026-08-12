-- Migration: Add session waitlist table

create table if not exists session_waitlist (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references group_sessions(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz default now()
);

create index if not exists idx_session_waitlist_session on session_waitlist(session_id, created_at);
