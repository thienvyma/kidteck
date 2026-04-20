-- Harden profiles role handling and self-service updates.
-- Run this in Supabase SQL Editor before relying on the app-level fixes.

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

create or replace function public.prevent_profile_role_change()
returns trigger as $$
begin
  if auth.role() = 'authenticated'
     and auth.uid() = old.id
     and new.role is distinct from old.role then
    raise exception 'Role changes are not allowed';
  end if;

  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists prevent_profile_role_change on public.profiles;
create trigger prevent_profile_role_change
before update on public.profiles
for each row
execute function public.prevent_profile_role_change();

alter table public.profiles enable row level security;

drop policy if exists "Admin read all profiles" on public.profiles;
create policy "Admin read all profiles"
on public.profiles
for select
using (auth.uid() = id or public.is_admin());

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

revoke update on table public.profiles from authenticated;
grant update (avatar_url, website_url, updated_at) on table public.profiles to authenticated;
