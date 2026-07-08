-- GST Compliance Dashboard — Supabase schema
-- Run this in your Supabase project: Dashboard → SQL Editor → New query → paste → Run
-- Matches the tables referenced in src/types/index.ts and every supabase.from(...) call in the app.

-- ─── profiles ───────────────────────────────────────────────────────────────
-- One row per user, keyed to auth.users. Holds the business/GSTIN details
-- used to auto-fill the seller GSTIN on new invoices.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_name text,
  gstin text,
  address text,
  state text,
  state_code text,
  created_at timestamptz default now()
);

-- ─── invoices ───────────────────────────────────────────────────────────────
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  invoice_number text,
  buyer_name text,
  buyer_gstin text,
  place_of_supply text,
  is_interstate boolean default false,
  is_reverse_charge boolean default false,
  is_export boolean default false,
  is_sez boolean default false,
  supply_type text,
  lut_number text,
  base_amount numeric default 0,
  cgst numeric default 0,
  sgst numeric default 0,
  igst numeric default 0,
  cess numeric default 0,
  total_tax numeric default 0,
  grand_total numeric default 0,
  tax_label text,
  status text default 'draft',
  created_at timestamptz default now()
);

-- ─── invoice_items ──────────────────────────────────────────────────────────
create table if not exists invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade,
  item_name text,
  hsn_code text,
  quantity numeric,
  unit_price numeric,
  tax_slab numeric,
  cess_rate numeric default 0,
  base_amount numeric,
  cgst numeric,
  sgst numeric,
  igst numeric,
  cess_amount numeric,
  line_total numeric
);

-- ─── gst_returns ────────────────────────────────────────────────────────────
create table if not exists gst_returns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  return_type text,
  period text,
  due_date date,
  filed_date date,
  status text default 'pending',
  tax_liability numeric default 0,
  created_at timestamptz default now()
);

-- ─── indexes ────────────────────────────────────────────────────────────────
create index if not exists idx_invoices_user_id on invoices(user_id);
create index if not exists idx_invoices_created_at on invoices(created_at desc);
create index if not exists idx_invoice_items_invoice_id on invoice_items(invoice_id);
create index if not exists idx_gst_returns_user_id on gst_returns(user_id);

-- ─── Row Level Security ─────────────────────────────────────────────────────
-- Every table is scoped to auth.uid() so users can only ever see their own data.
alter table profiles enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table gst_returns enable row level security;

drop policy if exists "own profile" on profiles;
create policy "own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own invoices" on invoices;
create policy "own invoices" on invoices
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own invoice items" on invoice_items;
create policy "own invoice items" on invoice_items
  for all using (
    auth.uid() = (select user_id from invoices where invoices.id = invoice_items.invoice_id)
  ) with check (
    auth.uid() = (select user_id from invoices where invoices.id = invoice_items.invoice_id)
  );

drop policy if exists "own returns" on gst_returns;
create policy "own returns" on gst_returns
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
