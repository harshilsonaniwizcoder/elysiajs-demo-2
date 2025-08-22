create table if not exists plans (
  id bigint primary key generated always as identity,
  name text not null unique,
  price numeric(10, 2) not null,
  billing_cycle text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
