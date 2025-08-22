alter table users
  add column if not exists is_verified boolean default false,
  add column if not exists verification_token text,
  add column if not exists verified_at timestamp with time zone;
