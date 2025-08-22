create table if not exists plan_members (
  id bigint primary key generated always as identity,
  plan_id bigint not null references plans (id) on delete cascade,
  user_id uuid not null references users (id) on delete cascade,
  email text not null,
  login_count int default 0,
  unique (plan_id, user_id, email)
);
