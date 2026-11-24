-- Meldingen op je telefoon via ntfy.sh (gratis app) als er iets gebeurt in de pannenkoekenapp:
--   nieuwe persoon, straat gedaan, nieuw bericht in de feed.
-- Mag je opnieuw uitvoeren zonder schade.
--
-- STAP 1: installeer de app "ntfy" (iPhone of Android) en kies "Abonneren op onderwerp".
--         Verzin een lang, onraadbaar onderwerp, bv. pannenkoeken-k8x2m9qvt4ju7w (iedereen die het onderwerp kent kan meelezen).
-- STAP 2: zet datzelfde onderwerp hieronder in plaats van KIES-HIER-JE-ONDERWERP.
--         Zet je echte onderwerp NIET in dit bestand op GitHub: voer deze SQL enkel in de Supabase SQL Editor uit met jouw onderwerp erin.
-- STAP 3: druk op Run. Test door een nieuw bericht in de feed te plaatsen.
--
-- Straten: er komt pas een melding vanaf de datum hieronder, zodat het invullen van oude straten geen tientallen meldingen geeft.
--          Pas de datum aan in de functie melding_straat, of zet hem in het verleden om meteen alles te melden.

create extension if not exists pg_net with schema extensions;

create table if not exists app_secret (k text primary key, v text not null);
alter table app_secret enable row level security;
revoke all on app_secret from anon, authenticated;
insert into app_secret (k, v) values ('ntfy', 'KIES-HIER-JE-ONDERWERP')
  on conflict (k) do update set v = excluded.v;

-- Stuurt één melding; mislukt dit, dan gebeurt er niets (de app wordt nooit gehinderd).
create or replace function melding(titel text, tekst text) returns void
language plpgsql security definer set search_path = public as $$
declare t text;
begin
  select v into t from app_secret where k = 'ntfy';
  if t is null or t = '' or t = 'KIES-HIER-JE-ONDERWERP' then return; end if;
  perform net.http_post(url := 'https://ntfy.sh', body := jsonb_build_object('topic', t, 'title', titel, 'message', tekst), headers := '{"Content-Type":"application/json"}'::jsonb);
exception when others then
  null;
end $$;
revoke all on function melding(text, text) from public, anon, authenticated;

-- Nieuwe persoon
create or replace function melding_persoon() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform melding('Nieuwe persoon', new.name || ' doet mee');
  return new;
exception when others then
  return new;
end $$;
drop trigger if exists melding_persoon_t on people;
create trigger melding_persoon_t after insert on people for each row execute function melding_persoon();

-- Straat gedaan (alleen wanneer de status gedaan wordt, niet bij bezig of gepland)
create or replace function melding_straat() returns trigger
language plpgsql security definer set search_path = public as $$
declare p text;
begin
  if new.status <> 'done' then return new; end if;
  if tg_op = 'UPDATE' and old.status = 'done' then return new; end if;
  if now() < timestamptz '2026-11-29 00:00:00+01' then return new; end if;          -- pas vanaf deze datum melden
  select name into p from people where id = new.person_id;
  perform melding('Straat gedaan', coalesce(p, 'Iemand') || ' deed ' || initcap(replace(new.street_id, '-', ' '))
    || case new.side when 'odd' then ' (oneven kant)' when 'even' then ' (even kant)' else '' end);
  return new;
exception when others then
  return new;
end $$;
drop trigger if exists melding_straat_t on done_streets;
create trigger melding_straat_t after insert or update of status on done_streets for each row execute function melding_straat();

-- Nieuw bericht in de feed
create or replace function melding_bericht() returns trigger
language plpgsql security definer set search_path = public as $$
declare p text;
begin
  select name into p from people where id = new.person_id;
  perform melding('Nieuw bericht', coalesce(p, 'Iemand') || ': ' || coalesce(nullif(left(new.body, 120), ''), '(foto)'));
  return new;
exception when others then
  return new;
end $$;
drop trigger if exists melding_bericht_t on feed_posts;
create trigger melding_bericht_t after insert on feed_posts for each row execute function melding_bericht();
