create table if not exists two_factor_methods (
  id bigint primary key generated always as identity,
  name text not null unique,
  description text
);
