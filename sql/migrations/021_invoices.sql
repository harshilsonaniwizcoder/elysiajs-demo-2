create table if not exists invoices (
  id bigint primary key generated always as identity,
  order_id bigint not null references orders (id) on delete cascade,
  invoice_number text unique not null,
  amount numeric not null,
  currency text not null default 'USD',
  invoice_status text not null,
  issue_date timestamp with time zone default now(),
  due_date timestamp with time zone
);
