-- Make payment-to-access activation idempotent and atomic.
alter table public.payment_requests
  add column if not exists paypal_capture_id text,
  add column if not exists paypal_payer_id text;

create unique index if not exists payment_requests_paypal_order_unique
  on public.payment_requests (paypal_order_id)
  where paypal_order_id is not null;

create unique index if not exists payment_requests_paypal_capture_unique
  on public.payment_requests (paypal_capture_id)
  where paypal_capture_id is not null;

create or replace function public.activate_membership_for_payment(
  p_payment_request_id uuid,
  p_access_key text default null,
  p_reviewed_by uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  payment_record public.payment_requests%rowtype;
  plan_record public.membership_plans%rowtype;
  membership_record public.memberships%rowtype;
  activation_start timestamptz;
begin
  select * into payment_record
  from public.payment_requests
  where id = p_payment_request_id
  for update;

  if not found then
    raise exception 'Payment request not found';
  end if;

  select * into plan_record
  from public.membership_plans
  where id = payment_record.plan_id
    and is_active = true;

  if not found then
    raise exception 'Membership plan is not active';
  end if;

  select * into membership_record
  from public.memberships
  where payment_request_id = payment_record.id
  limit 1;

  if found and membership_record.is_active = true
    and membership_record.end_date > now() then
    return jsonb_build_object(
      'payment_request_id', payment_record.id,
      'membership_id', membership_record.id,
      'already_activated', true
    );
  end if;

  select * into membership_record
  from public.memberships
  where user_id = payment_record.user_id
  for update;

  activation_start := greatest(now(), coalesce(membership_record.end_date, now()));

  insert into public.memberships (
    user_id, plan_id, payment_request_id, start_date, end_date,
    is_active, auto_renew, access_key, access_key_issued_at
  ) values (
    payment_record.user_id,
    payment_record.plan_id,
    payment_record.id,
    activation_start,
    activation_start + make_interval(days => plan_record.duration_days),
    true,
    false,
    p_access_key,
    case when p_access_key is null then null else now() end
  )
  on conflict (user_id) do update set
    plan_id = excluded.plan_id,
    payment_request_id = excluded.payment_request_id,
    start_date = excluded.start_date,
    end_date = excluded.end_date,
    is_active = true,
    auto_renew = false,
    access_key = coalesce(excluded.access_key, memberships.access_key),
    access_key_issued_at = case
      when excluded.access_key is null then memberships.access_key_issued_at
      else excluded.access_key_issued_at
    end
  returning * into membership_record;

  update public.payment_requests
  set status = 'approved',
      reviewed_by = coalesce(p_reviewed_by, reviewed_by),
      reviewed_at = coalesce(reviewed_at, now())
  where id = payment_record.id;

  return jsonb_build_object(
    'payment_request_id', payment_record.id,
    'membership_id', membership_record.id,
    'already_activated', false
  );
end;
$$;

revoke all on function public.activate_membership_for_payment(uuid, text, uuid) from public;