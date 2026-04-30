-- Remove legacy broad table/column grants from the public roles.
-- RLS already blocks writes, but grants should also express the intended read-only public surface.

revoke all privileges on public.waitlist_users from anon, authenticated;
grant select (
  id,
  twitter_username,
  display_name,
  avatar_url,
  referral_code,
  created_at
) on public.waitlist_users to anon, authenticated;
