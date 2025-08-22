alter table payments
  drop column if exists payment_method_id;

alter table payments
  rename column if exists payment_gateway_id to payment_method_gateway_id;
