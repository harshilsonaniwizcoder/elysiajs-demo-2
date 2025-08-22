create table if not exists user_activity_history (
  id bigint primary key generated always as identity,
  user_id uuid not null references users (id) on delete cascade,
  activity_type text not null,
  activity_time timestamp with time zone not null default now(),
  details text,
  ip_address text,
  user_agent text
);
