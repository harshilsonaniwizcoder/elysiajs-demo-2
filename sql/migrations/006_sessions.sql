create table if not exists sessions (
  id bigint primary key generated always as identity,
  user_id uuid not null references users (id) on delete cascade,
  device_id text not null,
  session_token text not null unique,
  login_time timestamp with time zone default now(),
  expiry_time timestamp with time zone,
  ip_address text,
  user_agent text,
  status text not null default 'active'
);
