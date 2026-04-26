create unique index if not exists waitlist_users_email_unique_idx
  on public.waitlist_users (lower(email))
  where email is not null;

create unique index if not exists waitlist_users_twitter_unique_idx
  on public.waitlist_users (lower(twitter_username))
  where twitter_username is not null;

