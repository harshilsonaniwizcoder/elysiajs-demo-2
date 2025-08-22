alter table payment_gateways
  add column if not exists type text not null,
  add column if not exists description text;
