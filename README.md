# Perminal — Landing Page

Marketing site for Perminal, the social prediction market. Built from the [Figma design](https://www.figma.com/design/fRoj4qvMxvjEp4rl3ZG87p/Perminal_?node-id=2750-3035).

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + TypeScript
- Tailwind CSS v4
- Privy auth for email + X/Twitter login
- Supabase Postgres as the referral backend
- SQLite for local development and leaderboard backup snapshots
- `next/font` for Geist (UI) + EB Garamond (display serif used for the hero)

## Page structure

```
src/
├── app/
│   ├── layout.tsx         Fonts + metadata
│   ├── page.tsx           Page composition (Header / Hero / FeatureScroller / Footer)
│   └── globals.css        Design tokens + global styles
└── components/
    ├── Header.tsx         Perminal wordmark + X link
    ├── Hero.tsx           "Trade What Happens. Together." + email capture + counter
    ├── FeatureScroller.tsx   Horizontally scrolling feature row
    └── features/
        ├── shared.tsx
        ├── SocialFeed.tsx       Tweet / market-call card
        ├── BrowseMarkets.tsx    Multi-outcome + binary market cards
        ├── CopyTrades.tsx       Earnings dashboard with bar chart
        ├── FollowPeople.tsx     Profile card with Follow CTA
        ├── NeverMiss.tsx        Stacked notification cards
        ├── EasyOnboarding.tsx   Apple / Google / Email / Phone sign-in
        └── MoneyInOut.tsx       Credit-card + Apple Pay visual
```

## Design tokens

All colors/typography are defined as CSS variables in `src/app/globals.css` so it's
easy to swap in brand assets later. See `:root` for the full palette.

## Development

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build
npm run start     # serve the production build
npm run backup:sqlite # export leaderboard snapshot from Supabase
```

## Backend setup

Create the Supabase schema with `supabase/migrations/001_referrals.sql`, then configure:

```bash
NEXT_PUBLIC_PRIVY_APP_ID=
PRIVY_APP_ID=
PRIVY_API_KEY=
PRIVY_JWT_VERIFICATION_KEY=
SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
REFERRAL_COOKIE_SECRET=
SQLITE_BACKUP_PATH=.data/perminal-backup.sqlite
```

`SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_URL` can point to the same Supabase project; the server
adapter reads `SUPABASE_URL` first and falls back to `EXPO_PUBLIC_SUPABASE_URL`. The anon key is
public/client-safe, but authenticated waitlist writes still require `SUPABASE_SERVICE_ROLE_KEY` on
the server. Use `DATABASE_URL=sqlite:.data/perminal.sqlite` for local SQLite development. In
production, omit SQLite as the writer and use Supabase; `SQLITE_BACKUP_PATH` is only read when the
public leaderboard needs a snapshot fallback.

Waitlist data intentionally uses prefixed tables so it can live in the same Supabase project as
the mobile app without colliding with app-owned tables:

- `waitlist_users`
- `waitlist_referrals`
- `waitlist_referral_visits`
- `waitlist_leaderboard_stats`
- `waitlist_leaderboard_entries`

## Visual QA helpers

`scripts/snap.mjs` and `scripts/snap-right.mjs` use Playwright to capture screenshots
for comparing against the Figma source. Run them with `node scripts/snap.mjs`.
