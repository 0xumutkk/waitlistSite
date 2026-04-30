-- Defense-in-depth for existing deployments that already ran earlier waitlist migrations.

revoke all on function public.increment_invite_count(uuid) from public;
revoke all on function public.increment_invite_count(uuid) from anon;
revoke all on function public.increment_invite_count(uuid) from authenticated;
grant execute on function public.increment_invite_count(uuid) to service_role;

revoke all privileges on public.waitlist_users from anon, authenticated;
grant select (
  id,
  twitter_username,
  display_name,
  avatar_url,
  referral_code,
  created_at
) on public.waitlist_users to anon, authenticated;

create unique index if not exists waitlist_users_id_referral_code_idx
  on public.waitlist_users(id, referral_code);

alter table public.waitlist_referrals
  drop constraint if exists waitlist_referrals_referrer_user_id_referral_code_fkey;

alter table public.waitlist_referrals
  add constraint waitlist_referrals_referrer_user_id_referral_code_fkey
  foreign key (referrer_user_id, referral_code)
  references public.waitlist_users(id, referral_code)
  on update cascade
  on delete cascade
  not valid;
