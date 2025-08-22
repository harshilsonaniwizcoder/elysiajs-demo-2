alter table plan_members
  add column if not exists started_at timestamp with time zone default now(),
  add column if not exists expires_at timestamp with time zone,
  add column if not exists is_active boolean default true;
