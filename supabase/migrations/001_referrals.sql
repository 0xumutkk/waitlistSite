create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  privy_user_id text not null unique,
  email text,
  twitter_username text,
  display_name text,
  avatar_url text,
  referral_code text not null unique,
  created_at timestamptz not null default now(),
  last_login_at timestamptz not null default now()
);

create table if not exists public.referral_visits (
  id uuid primary key default gen_random_uuid(),
  referral_code text not null,
  visitor_fingerprint_hash text,
  ip_hash text,
  user_agent_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null references public.users(id) on delete cascade,
  referred_user_id uuid not null unique references public.users(id) on delete cascade,
  referral_code text not null,
  status text not null default 'verified' check (status = 'verified'),
  created_at timestamptz not null default now(),
  check (referrer_user_id <> referred_user_id)
);

create table if not exists public.leaderboard_stats (
  user_id uuid primary key references public.users(id) on delete cascade,
  verified_invites_count integer not null default 0,
  rank_cache integer,
  updated_at timestamptz not null default now()
);

create index if not exists referrals_referrer_status_idx
  on public.referrals(referrer_user_id, status);

create index if not exists referral_visits_code_created_idx
  on public.referral_visits(referral_code, created_at);

create or replace view public.leaderboard_entries as
  select
    row_number() over (
      order by coalesce(ls.verified_invites_count, 0) desc, u.created_at asc
    ) as rank,
    u.id as user_id,
    coalesce(nullif(u.twitter_username, ''), nullif(u.display_name, ''), 'Perminal user') as username,
    u.avatar_url,
    u.referral_code,
    coalesce(ls.verified_invites_count, 0) as invites
  from public.users u
  left join public.leaderboard_stats ls on ls.user_id = u.id;

alter table public.users enable row level security;
alter table public.referral_visits enable row level security;
alter table public.referrals enable row level security;
alter table public.leaderboard_stats enable row level security;

drop policy if exists "public leaderboard users are readable" on public.users;
create policy "public leaderboard users are readable"
  on public.users for select
  to anon, authenticated
  using (true);

drop policy if exists "public leaderboard stats are readable" on public.leaderboard_stats;
create policy "public leaderboard stats are readable"
  on public.leaderboard_stats for select
  to anon, authenticated
  using (true);

