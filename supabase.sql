-- Plak dit in Supabase > SQL Editor > Run

create table if not exists people (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null,
  created_at timestamptz not null default now()
);

create table if not exists done_streets (
  street_id text primary key,
  person_id uuid not null references people(id) on delete cascade,
  done_at timestamptz not null default now()
);

alter table people enable row level security;
alter table done_streets enable row level security;

-- Vertrouwensmodel: iedereen met de link mag lezen en aanduiden.
create policy "people_all" on people for all using (true) with check (true);
create policy "done_all" on done_streets for all using (true) with check (true);

-- Live updates
alter publication supabase_realtime add table people;
alter publication supabase_realtime add table done_streets;

-- Rechten voor de publieke (anon) sleutel
grant usage on schema public to anon;
grant select, insert, update, delete on people, done_streets to anon;
