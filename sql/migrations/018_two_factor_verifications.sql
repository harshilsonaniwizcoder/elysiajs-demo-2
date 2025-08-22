create table if not exists two_factor_verifications (
  id bigint primary key generated always as identity,
  user_id uuid not null references users (id) on delete cascade,
  method_id bigint not null references two_factor_methods (id) on delete cascade,
  verification_code text,
  status text,
  created_at timestamp with time zone default now(),
  verified_at timestamp with time zone
);
