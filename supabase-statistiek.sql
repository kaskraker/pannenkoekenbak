-- Anoniem bijhouden hoeveel toestellen de app openen. Geen namen, enkel een willekeurig nummer per toestel.
-- Mag je opnieuw uitvoeren zonder schade.
create table if not exists app_visits (
  id uuid primary key default gen_random_uuid(),
  device text not null,
  standalone boolean not null default false,   -- true = geopend vanaf het beginscherm
  at timestamptz not null default now()
);
alter table app_visits enable row level security;
grant insert on app_visits to anon, authenticated;
drop policy if exists "av_ins" on app_visits;
create policy "av_ins" on app_visits for insert with check (true);
-- Er is bewust geen leesrecht: enkel jij ziet de cijfers, in Supabase zelf (SQL Editor).

-- Voorbeeldvragen om in de SQL Editor te plakken:
--   Unieke toestellen sinds het begin:
--     select count(distinct device) from app_visits;
--   Per dag: unieke toestellen en aantal keer geopend:
--     select (at at time zone 'Europe/Brussels')::date as dag, count(distinct device) as toestellen, count(*) as keren
--     from app_visits group by 1 order by 1 desc;
--   Hoeveel hebben de app op het beginscherm gezet:
--     select count(distinct device) filter (where standalone) as geinstalleerd, count(distinct device) as totaal from app_visits;
