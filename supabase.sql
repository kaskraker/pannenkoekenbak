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

-- ===== Foto's per persoon (tweede ronde) =====
alter table people add column if not exists photo_url text;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_insert" on storage.objects for insert with check (bucket_id = 'avatars');
create policy "avatars_update" on storage.objects for update using (bucket_id = 'avatars');

-- ===== Status "bezig" =====
alter table done_streets add column if not exists status text not null default 'done';
alter table done_streets drop constraint if exists done_streets_status_check;
alter table done_streets add constraint done_streets_status_check check (status in ('done', 'busy'));
-- Plak dit in Supabase > SQL Editor > Run
-- Maakt het mogelijk dat een straat per kant (oneven / even) door verschillende mensen wordt gedaan,
-- en dat twee mensen een straat samen doen.
alter table done_streets
  add column if not exists side text not null default 'all';
alter table done_streets
  drop constraint if exists done_streets_side_check;
alter table done_streets
  add constraint done_streets_side_check check (side in ('all', 'odd', 'even'));

alter table done_streets
  add column if not exists partner_id uuid references people(id) on delete set null;

-- Eén rij per straat én kant (was: één rij per straat)
alter table done_streets drop constraint if exists done_streets_pkey;
alter table done_streets add primary key (street_id, side);
