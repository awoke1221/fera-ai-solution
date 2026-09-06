alter table public.memberships
  add column if not exists access_key text,
  add column if not exists access_key_issued_at timestamptz;

create unique index if not exists memberships_access_key_unique
  on public.memberships (access_key)
  where access_key is not null;