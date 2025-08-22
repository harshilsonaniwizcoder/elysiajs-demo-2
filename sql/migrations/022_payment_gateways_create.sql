create table if not exists payment_gateways (
  id bigint primary key generated always as identity,
  name text not null unique,
  api_key text not null,
  api_secret text not null,
  is_active boolean not null default true
);
