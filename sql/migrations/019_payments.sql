create table if not exists payments (
  id bigint primary key generated always as identity,
  user_id uuid not null references users (id) on delete cascade,
  plan_id bigint not null references plans (id) on delete cascade,
  amount numeric not null,
  currency text not null default 'USD',
  payment_method text not null,
  payment_status text not null,
  transaction_id text unique,
  payment_date timestamp with time zone default now()
);
