create table if not exists user_two_factor_settings (
  id bigint primary key generated always as identity,
  user_id uuid not null references users (id) on delete cascade,
  method_id bigint not null references two_factor_methods (id) on delete cascade,
  is_enabled boolean default false,
  config jsonb,
  unique (user_id, method_id)
);
