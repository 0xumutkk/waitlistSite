-- Make existing users' canonical referral links match their Twitter username.
-- Existing random/legacy links are preserved as private aliases resolved by the server.

create table if not exists public.waitlist_referral_code_aliases (
  alias_code text primary key,
  user_id uuid not null references public.waitlist_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (length(alias_code) >= 3)
);

alter table public.waitlist_referral_code_aliases enable row level security;
revoke all privileges on public.waitlist_referral_code_aliases from anon, authenticated;

with candidates as (
  select
    id,
    referral_code as old_referral_code,
    lower(regexp_replace(regexp_replace(twitter_username, '^@', ''), '[^a-zA-Z0-9_]', '', 'g')) as twitter_referral_code
  from public.waitlist_users
  where twitter_username is not null
),
safe_updates as (
  select c.*
  from candidates c
  where length(c.twitter_referral_code) >= 3
    and c.old_referral_code <> c.twitter_referral_code
    and not exists (
      select 1
      from public.waitlist_users other
      where other.referral_code = c.twitter_referral_code
        and other.id <> c.id
    )
)
insert into public.waitlist_referral_code_aliases (alias_code, user_id)
select old_referral_code, id
from safe_updates
on conflict (alias_code) do nothing;

with candidates as (
  select
    id,
    referral_code as old_referral_code,
    lower(regexp_replace(regexp_replace(twitter_username, '^@', ''), '[^a-zA-Z0-9_]', '', 'g')) as twitter_referral_code
  from public.waitlist_users
  where twitter_username is not null
),
safe_updates as (
  select c.*
  from candidates c
  where length(c.twitter_referral_code) >= 3
    and c.old_referral_code <> c.twitter_referral_code
    and not exists (
      select 1
      from public.waitlist_users other
      where other.referral_code = c.twitter_referral_code
        and other.id <> c.id
    )
)
update public.waitlist_users u
set referral_code = s.twitter_referral_code
from safe_updates s
where u.id = s.id;
