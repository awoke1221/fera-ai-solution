-- Migration: Add one-to-one coaching requests table

create table if not exists one_to_one_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  preferred_time timestamptz,
  message text,
  handled boolean default false,
  handled_by uuid references profiles(id) on delete set null,
  handled_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_one_to_one_requests_user on one_to_one_requests(user_id);
