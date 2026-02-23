-- ================================================================
-- AURA FINANCE — Complete Supabase Schema + Migration Fix
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- ================================================================

-- -- MIGRATION: drop FK constraints (dev mode - no real auth user) -
alter table if exists incomes  drop constraint if exists incomes_user_id_fkey;
alter table if exists expenses drop constraint if exists expenses_user_id_fkey;
alter table if exists budgets  drop constraint if exists budgets_user_id_fkey;

-- -- FIX: rename 'category' -> 'source' on incomes if needed --------
do $$
begin
  -- Add 'source' column if missing
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'incomes' and column_name = 'source'
  ) then
    alter table incomes add column source text;
    -- Copy data from category if it exists
    if exists (
      select 1 from information_schema.columns
      where table_name = 'incomes' and column_name = 'category'
    ) then
      update incomes set source = category;
      alter table incomes drop column category;
    end if;
  end if;
end $$;


-- -- 1. INCOMES -------------------------------------------------
create table if not exists incomes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null,            -- no FK — dev mode uses a mock user ID
  amount      numeric(12, 2) not null check (amount > 0),
  source      text not null,           -- e.g. 'Salary', 'Freelance', 'Business'
  description text,
  date        date not null default current_date,
  created_at  timestamptz not null default now()
);

create index if not exists incomes_user_id_idx on incomes(user_id);
create index if not exists incomes_date_idx    on incomes(date desc);

alter table incomes enable row level security;

-- Temporarily open access (since auth is bypassed in dev)
drop policy if exists "incomes: select own"  on incomes;
drop policy if exists "incomes: insert own"  on incomes;
drop policy if exists "incomes: update own"  on incomes;
drop policy if exists "incomes: delete own"  on incomes;
drop policy if exists "anon full access incomes" on incomes;

create policy "anon full access incomes" on incomes
  for all using (true) with check (true);


-- -- 2. EXPENSES ------------------------------------------------
create table if not exists expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null,            -- no FK — dev mode uses a mock user ID
  amount      numeric(12, 2) not null check (amount > 0),
  category    text not null,           -- e.g. 'Food & Dining', 'Transportation'
  description text,
  date        date not null default current_date,
  created_at  timestamptz not null default now()
);

create index if not exists expenses_user_id_idx  on expenses(user_id);
create index if not exists expenses_date_idx     on expenses(date desc);
create index if not exists expenses_category_idx on expenses(category);

alter table expenses enable row level security;

drop policy if exists "expenses: select own"  on expenses;
drop policy if exists "expenses: insert own"  on expenses;
drop policy if exists "expenses: update own"  on expenses;
drop policy if exists "expenses: delete own"  on expenses;
drop policy if exists "anon full access expenses" on expenses;

create policy "anon full access expenses" on expenses
  for all using (true) with check (true);


-- -- 3. BUDGETS -------------------------------------------------
create table if not exists budgets (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null,            -- no FK — dev mode uses a mock user ID
  month           text not null,            -- 'YYYY-MM'
  monthly_limit   numeric(12, 2) not null default 0,
  category_limit  jsonb not null default '{}',
  created_at      timestamptz not null default now(),
  unique (user_id, month)
);

create index if not exists budgets_user_id_idx on budgets(user_id);
create index if not exists budgets_month_idx   on budgets(month);

alter table budgets enable row level security;

drop policy if exists "budgets: select own"  on budgets;
drop policy if exists "budgets: insert own"  on budgets;
drop policy if exists "budgets: update own"  on budgets;
drop policy if exists "budgets: delete own"  on budgets;
drop policy if exists "anon full access budgets" on budgets;

create policy "anon full access budgets" on budgets
  for all using (true) with check (true);


-- -- 4. PROFILES ------------------------------------------------
create table if not exists profiles (
  user_id             uuid primary key,
  display_name        text,
  avatar_url          text,
  currency            text not null default 'INR',
  email_notifications boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists profiles_user_id_idx on profiles(user_id);

alter table profiles enable row level security;

drop policy if exists "anon full access profiles" on profiles;
create policy "anon full access profiles" on profiles
  for all using (true) with check (true);

-- -- 5. NOTIFICATION LOGS ---------------------------------------
create table if not exists notification_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null,
  type       text not null default 'budget_alert',
  message    text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notification_logs_user_id_idx on notification_logs(user_id);
create index if not exists notification_logs_created_at_idx on notification_logs(created_at desc);

alter table notification_logs enable row level security;

drop policy if exists "anon full access notification_logs" on notification_logs;
create policy "anon full access notification_logs" on notification_logs
  for all using (true) with check (true);


-- -- 6. STORAGE BUCKETS -----------------------------------------

-- Insert the 'avatars' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Temporarily open access for dev mode
drop policy if exists "Avatar images are publicly accessible." on storage.objects;
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

drop policy if exists "Anyone can upload an avatar." on storage.objects;
create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

drop policy if exists "Anyone can update an avatar." on storage.objects;
create policy "Anyone can update an avatar."
  on storage.objects for update
  with check ( bucket_id = 'avatars' );

drop policy if exists "Anyone can delete an avatar." on storage.objects;
create policy "Anyone can delete an avatar."
  on storage.objects for delete
  using ( bucket_id = 'avatars' );


-- -- 7. IOUS (Bill Splitter) ------------------------------------
create table if not exists ious (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null,
  type        text not null check (type in ('owes_me', 'i_owe')),
  person_name text not null,
  amount      numeric(12, 2) not null check (amount > 0),
  description text,
  is_settled  boolean not null default false,
  created_at  timestamptz not null default now(),
  settled_at  timestamptz
);

create index if not exists ious_user_id_idx on ious(user_id);
create index if not exists ious_type_idx on ious(type);

alter table ious enable row level security;

drop policy if exists "anon full access ious" on ious;
create policy "anon full access ious" on ious
  for all using (true) with check (true);

-- ================================================================
-- DONE. Tables: incomes, expenses, budgets, profiles, notification_logs, ious, storage buckets
-- Open RLS policies applied for dev mode (auth bypassed)
-- ================================================================
