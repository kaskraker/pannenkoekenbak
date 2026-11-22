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
