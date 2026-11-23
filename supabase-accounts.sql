-- Plak dit in Supabase > SQL Editor > Run
-- Accounts voor verkopers en beheerders + beheerscherm. Maak eerst in de app zelf een account aan.
-- STAP 1 hieronder: zet de e-mailadressen van de beheerders (Patrick, Anja, jezelf) in de lijst.

-- 1) Beheerders (e-mailadres waarmee ze in de app inloggen)
create table if not exists admins (email text primary key);
alter table admins enable row level security;                      -- geen policies: onzichtbaar voor de website
-- Vul hieronder jullie eigen e-mailadressen in (haal de -- weg en pas aan), zodat Patrick, Anja en jij beheerder zijn:
-- insert into admins (email) values ('jouw@mailadres.be'), ('patrick@voorbeeld.be'), ('anja@voorbeeld.be') on conflict do nothing;

-- 2) Profielen koppelen aan accounts
alter table people add column if not exists user_id uuid unique references auth.users(id) on delete set null;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from admins where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))) $$;

create or replace function my_person() returns uuid
language sql stable security definer set search_path = public as
$$ select id from people where user_id = auth.uid() $$;

grant execute on function is_admin(), my_person() to anon, authenticated;

-- 3) Status 'toegewezen' (verdeeld door een beheerder, nog niet begonnen)
alter table done_streets drop constraint if exists done_streets_status_check;
alter table done_streets add constraint done_streets_status_check check (status in ('done', 'busy', 'assigned'));

-- 4) Regels: iedereen mag meekijken, aanpassen vraagt een account
grant select on people, done_streets to anon;
grant select, insert, update, delete on people, done_streets to authenticated;
drop policy if exists "people_all" on people;
drop policy if exists "done_all" on done_streets;
drop policy if exists "people_read" on people;
drop policy if exists "people_insert" on people;
drop policy if exists "people_update" on people;
drop policy if exists "people_delete" on people;
drop policy if exists "claims_read" on done_streets;
drop policy if exists "claims_insert" on done_streets;
drop policy if exists "claims_update" on done_streets;
drop policy if exists "claims_delete" on done_streets;

create policy "people_read"   on people for select using (true);
create policy "people_insert" on people for insert to authenticated with check (user_id = auth.uid() or is_admin());
-- een bestaand profiel zonder account mag je opeisen ("dit ben ik"); je eigen profiel mag je aanpassen
create policy "people_update" on people for update to authenticated
  using (user_id = auth.uid() or user_id is null or is_admin())
  with check (user_id = auth.uid() or is_admin());
create policy "people_delete" on people for delete to authenticated using (is_admin());

create policy "claims_read"   on done_streets for select using (true);
create policy "claims_insert" on done_streets for insert to authenticated with check (is_admin() or person_id = my_person());
create policy "claims_update" on done_streets for update to authenticated
  using (is_admin() or person_id = my_person()) with check (is_admin() or person_id = my_person());
create policy "claims_delete" on done_streets for delete to authenticated using (is_admin() or person_id = my_person());

-- 5) Foto's uploaden vraagt een account
drop policy if exists "avatars_insert" on storage.objects;
drop policy if exists "avatars_update" on storage.objects;
create policy "avatars_insert" on storage.objects for insert to authenticated with check (bucket_id = 'avatars');
create policy "avatars_update" on storage.objects for update to authenticated using (bucket_id = 'avatars');

-- 6) Beheerscherm: lijst binnen, geld binnen, aantal, bedrag, opmerking (enkel voor beheerders)
create table if not exists street_admin (
  street_id text primary key,
  list_in boolean not null default false,
  money_in boolean not null default false,
  quantity numeric,
  amount numeric,
  note text,
  updated_at timestamptz not null default now()
);
alter table street_admin enable row level security;
grant select, insert, update, delete on street_admin to authenticated;
drop policy if exists "street_admin_all" on street_admin;
create policy "street_admin_all" on street_admin for all to authenticated using (is_admin()) with check (is_admin());
