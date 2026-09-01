-- Cleanup stale duplicate active memberships
-- This migration deactivates older active membership rows when a user has multiple active memberships.
-- It keeps the newest active membership record based on end_date, then marks older duplicates inactive.

with ranked_memberships as (
  select
    id,
    user_id,
    end_date,
    created_at,
    row_number() over (
      partition by user_id
      order by end_date desc nulls last, created_at desc nulls last, id desc
    ) as rn
  from public.memberships
  where is_active = true
)
update public.memberships m
set is_active = false
where m.is_active = true
  and exists (
    select 1
    from ranked_memberships r
    where r.user_id = m.user_id
      and r.id = m.id
      and r.rn > 1
  );

-- Optional: ensure no user has more than one active membership row after cleanup.
create unique index if not exists memberships_one_active_per_user
on public.memberships (user_id)
where is_active = true;
