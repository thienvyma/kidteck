-- Admin list/query performance helpers
-- Run this once in Supabase SQL Editor after deploying the matching app code.

create extension if not exists pg_trgm;

create index if not exists profiles_role_created_at_idx
  on public.profiles (role, created_at desc);

create index if not exists profiles_full_name_trgm_idx
  on public.profiles using gin (full_name gin_trgm_ops);

create index if not exists profiles_phone_trgm_idx
  on public.profiles using gin (phone gin_trgm_ops);

create index if not exists levels_name_trgm_idx
  on public.levels using gin (name gin_trgm_ops);

create index if not exists payments_status_created_at_idx
  on public.payments (status, created_at desc);

create index if not exists payments_transaction_id_trgm_idx
  on public.payments using gin (transaction_id gin_trgm_ops);

create index if not exists landing_leads_name_trgm_idx
  on public.landing_leads using gin (name gin_trgm_ops);

create index if not exists landing_leads_learner_name_trgm_idx
  on public.landing_leads using gin (learner_name gin_trgm_ops);

create index if not exists landing_leads_phone_trgm_idx
  on public.landing_leads using gin (phone gin_trgm_ops);

create index if not exists landing_leads_email_trgm_idx
  on public.landing_leads using gin (email gin_trgm_ops);

create index if not exists landing_leads_stage_trgm_idx
  on public.landing_leads using gin (stage gin_trgm_ops);

create or replace view public.admin_student_roster as
select
  p.id,
  p.full_name,
  p.phone,
  p.created_at,
  coalesce(current_enrollment.level_name, 'Chua kich hoat') as level,
  coalesce(current_enrollment.status, 'inactive') as status
from public.profiles as p
left join lateral (
  select
    e.status,
    e.enrolled_at,
    l.name as level_name
  from public.enrollments as e
  left join public.levels as l
    on l.id = e.level_id
  where e.student_id = p.id
  order by
    case when e.status = 'active' then 0 else 1 end,
    e.enrolled_at desc nulls last,
    e.id desc
  limit 1
) as current_enrollment on true
where p.role = 'student';

create or replace view public.admin_payment_rows as
select
  pay.id,
  pay.student_id,
  coalesce(p.full_name, '-') as student,
  pay.level_id,
  coalesce(l.name, '-') as level,
  pay.amount,
  coalesce(pay.status, 'pending') as status,
  coalesce(pay.method, 'other') as method,
  coalesce(pay.transaction_id, '') as transaction_id,
  pay.created_at,
  pay.paid_at,
  coalesce(e.status, 'inactive') as enrollment_status
from public.payments as pay
left join public.profiles as p
  on p.id = pay.student_id
left join public.levels as l
  on l.id = pay.level_id
left join public.enrollments as e
  on e.student_id = pay.student_id
 and e.level_id = pay.level_id;

create or replace function public.admin_payment_summary(
  filter_status text default null,
  filter_student_id uuid default null
)
returns table (
  total_paid bigint,
  total_pending bigint,
  count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    coalesce(sum(amount) filter (where status = 'paid'), 0)::bigint as total_paid,
    coalesce(sum(amount) filter (where status = 'pending'), 0)::bigint as total_pending,
    count(*)::bigint as count
  from public.payments
  where (filter_status is null or status = filter_status)
    and (filter_student_id is null or student_id = filter_student_id);
$$;

create or replace function public.admin_lead_summary()
returns table (
  total bigint,
  new_count bigint,
  contacted_count bigint,
  qualified_count bigint,
  enrolled_count bigint,
  archived_count bigint
)
language sql
security definer
set search_path = public
as $$
  select
    count(*)::bigint as total,
    count(*) filter (where status = 'new')::bigint as new_count,
    count(*) filter (where status = 'contacted')::bigint as contacted_count,
    count(*) filter (where status = 'qualified')::bigint as qualified_count,
    count(*) filter (where status = 'enrolled')::bigint as enrolled_count,
    count(*) filter (where status = 'archived')::bigint as archived_count
  from public.landing_leads;
$$;
