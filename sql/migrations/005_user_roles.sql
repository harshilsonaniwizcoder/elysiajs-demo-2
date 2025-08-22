create table if not exists user_roles (
  id bigint primary key generated always as identity,
  user_id uuid not null references users (id) on delete cascade,
  role_id bigint not null references roles (id) on delete cascade,
  unique (user_id, role_id)
);
