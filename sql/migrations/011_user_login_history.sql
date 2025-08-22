create table if not exists user_login_history (
  id bigint primary key generated always as identity,
  user_id uuid not null references users (id) on delete cascade,
  login_time timestamp with time zone not null,
  logout_time timestamp with time zone,
  device_id text,
  ip_address text,
  user_agent text
);
