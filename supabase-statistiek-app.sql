-- Beveiligd statistiekscherm (statistiek.html). Enkel wie de geheime code kent, krijgt de cijfers.
-- Mag je opnieuw uitvoeren zonder schade.
--
-- STAP 1: kies zelf een lange code (bijvoorbeeld een zin van 4 woorden) en zet hem hieronder in plaats van KIES-HIER-JE-CODE.
--         Zet die code NIET in dit bestand op GitHub: voer deze SQL enkel in de Supabase SQL Editor uit met jouw code erin.
-- STAP 2: druk op Run. Daarna open je statistiek.html en vul je code in.

create table if not exists app_secret (k text primary key, v text not null);
alter table app_secret enable row level security;          -- geen enkel recht voor de app zelf
revoke all on app_secret from anon, authenticated;

insert into app_secret (k, v) values ('stats', 'KIES-HIER-JE-CODE')
  on conflict (k) do update set v = excluded.v;

create or replace function app_stats(code text) returns json
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from app_secret where k = 'stats' and v = code) then
    perform pg_sleep(1.5);                                  -- vertraagt het raden van codes
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
        from app_visits where at > now() - interval '30 days' group by 1) r)
  );
end $$;
revoke all on function app_stats(text) from public;
grant execute on function app_stats(text) to anon, authenticated;
