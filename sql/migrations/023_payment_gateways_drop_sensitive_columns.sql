alter table payment_gateways
  drop column if exists api_key,
  drop column if exists api_secret;
