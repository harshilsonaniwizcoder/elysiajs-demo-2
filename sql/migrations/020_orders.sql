create table if not exists orders (
  id bigint primary key generated always as identity,
  user_id uuid not null references users (id) on delete cascade,
  plan_id bigint not null references plans (id) on delete cascade,
  order_status text not null,
  order_date timestamp with time zone default now(),
  unique (user_id, plan_id, order_date)
);
