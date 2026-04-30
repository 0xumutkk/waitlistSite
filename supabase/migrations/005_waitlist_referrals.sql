create extension if not exists pgcrypto;

create table if not exists public.waitlist_users (
  id uuid primary key default gen_random_uuid(),
  privy_user_id text not null unique,
  email text,
  twitter_username text,
  display_name text,
  avatar_url text,
  referral_code text not null unique,
  created_at timestamptz not null default now(),
  last_login_at timestamptz not null default now(),
  unique (id, referral_code)
);

create table if not exists public.waitlist_referral_visits (
  id uuid primary key default gen_random_uuid(),
  referral_code text not null,
  visitor_fingerprint_hash text,
  ip_hash text,
  user_agent_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.waitlist_referral_code_aliases (
  alias_code text primary key,
  user_id uuid not null references public.waitlist_users(id) on delete cascade,
  created_at timestamptz not null default now(),
  check (length(alias_code) >= 3)
);

create table if not exists public.waitlist_referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references public.waitlist_users(id) on delete cascade,
  referred_user_id uuid not null unique references public.waitlist_users(id) on delete cascade,
  referral_code text not null,
  status text not null default 'verified' check (status = 'verified'),
  created_at timestamptz not null default now(),
  check (referrer_user_id <> referred_user_id),
  foreign key (referrer_user_id, referral_code)
    references public.waitlist_users(id, referral_code)
    on update cascade
    on delete cascade
);

create table if not exists public.waitlist_leaderboard_stats (
  user_id uuid primary key references public.waitlist_users(id) on delete cascade,
  verified_invites_count integer not null default 0,
  rank_cache integer,
  updated_at timestamptz not null default now()
);

create index if not exists waitlist_referrals_referrer_status_idx
  on public.waitlist_referrals(referrer_user_id, status);

create index if not exists waitlist_referral_visits_code_created_idx
  on public.waitlist_referral_visits(referral_code, created_at);

create or replace view public.waitlist_leaderboard_entries
with (security_invoker = on) as
  select
    row_number() over (
      order by coalesce(ls.verified_invites_count, 0) desc, u.created_at asc
    ) as rank,
    u.id as user_id,
    coalesce(nullif(u.twitter_username, ''), nullif(u.display_name, ''), 'Perminal user') as username,
    u.avatar_url,
    u.referral_code,
    coalesce(ls.verified_invites_count, 0) as invites
  from public.waitlist_users u
  left join public.waitlist_leaderboard_stats ls on ls.user_id = u.id;

alter table public.waitlist_users enable row level security;
alter table public.waitlist_referral_visits enable row level security;
alter table public.waitlist_referral_code_aliases enable row level security;
alter table public.waitlist_referrals enable row level security;
alter table public.waitlist_leaderboard_stats enable row level security;

drop policy if exists "public waitlist users are readable" on public.waitlist_users;
create policy "public waitlist users are readable"
  on public.waitlist_users for select
  to anon, authenticated
  using (true);

revoke all privileges on public.waitlist_users from anon, authenticated;
grant select (
  id,
  twitter_username,
  display_name,
  avatar_url,
  referral_code,
  created_at
) on public.waitlist_users to anon, authenticated;

drop policy if exists "public waitlist leaderboard stats are readable" on public.waitlist_leaderboard_stats;
create policy "public waitlist leaderboard stats are readable"
  on public.waitlist_leaderboard_stats for select
  to anon, authenticated
  using (true);
