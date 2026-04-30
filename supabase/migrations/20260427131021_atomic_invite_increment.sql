-- Atomic increment for verified invite counts.
-- Replaces the read-then-write pattern in SupabaseAdapter.refreshStats,
-- which was susceptible to a race condition under concurrent signups.
create or replace function public.increment_invite_count(p_user_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  insert into waitlist_leaderboard_stats (user_id, verified_invites_count, updated_at)
  values (p_user_id, 1, now())
  on conflict (user_id) do update
    set verified_invites_count = waitlist_leaderboard_stats.verified_invites_count + 1,
        updated_at = now();
$$;

revoke all on function public.increment_invite_count(uuid) from public;
revoke all on function public.increment_invite_count(uuid) from anon;
revoke all on function public.increment_invite_count(uuid) from authenticated;
grant execute on function public.increment_invite_count(uuid) to service_role;
