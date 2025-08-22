alter table plans
  add column if not exists max_logins int not null default 1;
