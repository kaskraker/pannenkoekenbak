-- Anoniem tellen wat er in de app gebeurt (welke schermen, straten aangeduid, berichten, rondleiding, ...).
-- Geen namen: alleen een willekeurig toestelnummer. Mag je opnieuw uitvoeren zonder schade.
-- Voer eerst supabase-statistiek.sql en supabase-statistiek-app.sql uit. Dit bestand vervangt de functie app_stats door een uitgebreidere.

create table if not exists app_events (
  id uuid primary key default gen_random_uuid(),
  device text not null,
  ev text not null,
  extra text,
  at timestamptz not null default now()
);
alter table app_events enable row level security;
grant insert on app_events to anon, authenticated;
drop policy if exists "ae_ins" on app_events;
create policy "ae_ins" on app_events for insert with check (true);

create or replace function app_stats(code text) returns json
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from app_secret where k = 'stats' and v = code) then
    perform pg_sleep(1.5);
    raise exception 'geen toegang' using errcode = '42501';
  end if;
  return json_build_object(
    'toestellen', (select count(distinct device) from app_visits),
    'vandaag', (select count(distinct device) from app_visits where (at at time zone 'Europe/Brussels')::date = (now() at time zone 'Europe/Brussels')::date),
    'zeven_dagen', (select count(distinct device) from app_visits where at > now() - interval '7 days'),
    'geinstalleerd', (select count(distinct device) filter (where standalone) from app_visits),
    'keren', (select count(*) from app_visits),
    'dagen', (select coalesce(json_agg(r order by r.dag), '[]'::json) from (
        select (at at time zone 'Europe/Brussels')::date as dag, count(distinct device) as toestellen, count(*) as keren
        from app_visits where at > now() - interval '30 days' group by 1) r),
    'events', (select coalesce(json_agg(r order by r.keren desc), '[]'::json) from (
        select ev, count(distinct device) as toestellen, count(*) as keren
        from app_events where at > now() - interval '30 days' group by ev) r)
  );
end $$;
revoke all on function app_stats(text) from public;
grant execute on function app_stats(text) to anon, authenticated;
