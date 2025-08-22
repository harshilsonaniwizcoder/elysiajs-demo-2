alter table users
  add column if not exists reset_token text,
  add column if not exists reset_expiry timestamp with time zone;
