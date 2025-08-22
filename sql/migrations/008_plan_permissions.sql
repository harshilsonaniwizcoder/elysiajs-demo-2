create table if not exists plan_permissions (
  id bigint primary key generated always as identity,
  plan_id bigint not null references plans (id) on delete cascade,
  permission_id bigint not null references permissions (id) on delete cascade,
  unique (plan_id, permission_id)
);
