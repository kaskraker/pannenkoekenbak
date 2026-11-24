-- Statistiek per kwartier en per uur (voor statistiek.html). Mag je opnieuw uitvoeren zonder schade.
-- Voer eerst supabase-statistiek.sql, supabase-statistiek-app.sql en supabase-statistiek-events.sql uit.
-- Dit bestand vervangt de functie app_stats door dezelfde met extra 'kwartieren' (laatste 24 uur) en 'uren' (laatste 3 dagen).
-- De geheime code staat niet in dit bestand; die blijft zoals je hem eerder instelde.

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
        from app_events where at > now() - interval '30 days' group by ev) r),
    'kwartieren', (select coalesce(json_agg(r order by r.t), '[]'::json) from (
        select t, count(distinct device) as toestellen, count(*) as acties from (
          select device, to_char(date_trunc('hour', at at time zone 'Europe/Brussels') + floor(extract(minute from at at time zone 'Europe/Brussels') / 15) * interval '15 minutes', 'YYYY-MM-DD"T"HH24:MI') as t
          from (select device, at from app_visits union all select device, at from app_events) u
          where at > now() - interval '24 hours') x group by t) r),
    'uren', (select coalesce(json_agg(r order by r.t), '[]'::json) from (
        select t, count(distinct device) as toestellen, count(*) as acties from (
          select device, to_char(date_trunc('hour', at at time zone 'Europe/Brussels'), 'YYYY-MM-DD"T"HH24:MI') as t
          from (select device, at from app_visits union all select device, at from app_events) u
          where at > now() - interval '72 hours') x group by t) r)
  );
end $$;
revoke all on function app_stats(text) from public;
grant execute on function app_stats(text) to anon, authenticated;
