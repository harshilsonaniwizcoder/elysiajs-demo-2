create table if not exists role_permissions (
  id bigint primary key generated always as identity,
  role_id bigint not null references roles (id) on delete cascade,
  permission_id bigint not null references permissions (id) on delete cascade,
  unique (role_id, permission_id)
);
