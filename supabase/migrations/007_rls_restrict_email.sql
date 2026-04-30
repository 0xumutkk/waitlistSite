-- Restrict anon/authenticated roles from reading sensitive columns on waitlist_users.
-- The backend uses service_role_key (bypasses RLS), so this targets direct client access.

drop policy if exists "public waitlist users are readable" on public.waitlist_users;

create policy "public waitlist users are readable"
  on public.waitlist_users for select
  to anon, authenticated
  using (true);

-- Public view that omits sensitive columns (email, privy_user_id).
-- Consumers that only need public profile data should query this view instead.
create or replace view public.waitlist_users_public
  with (security_invoker = on) as
  select
    id,
    twitter_username,
    display_name,
    avatar_url,
    referral_code,
    created_at
  from public.waitlist_users;

revoke all privileges on public.waitlist_users from anon, authenticated;
grant select (
  id,
  twitter_username,
  display_name,
  avatar_url,
  referral_code,
  created_at
) on public.waitlist_users to anon, authenticated;
grant select on public.waitlist_users_public to anon, authenticated;
