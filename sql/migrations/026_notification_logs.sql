create table if not exists notification_logs (
  id bigint primary key generated always as identity,
  user_id uuid references users (id) on delete cascade,
  notification_type text not null,
  message text not null,
  status text not null,
  created_at timestamp with time zone default now(),
  sent_at timestamp with time zone
);

alter table notification_logs
  alter column message type jsonb using message::jsonb;
