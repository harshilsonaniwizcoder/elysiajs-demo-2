create table if not exists tenant_migrations (
  id bigint primary key generated always as identity,
  tenant_id bigint not null,
  version text not null,
  name text,
  applied_at timestamp with time zone default now(),
  unique (tenant_id, version)
);
