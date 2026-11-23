-- ============================================================================
-- Pannenkoekenverkoop: ALLES IN ÉÉN KEER
-- Plak dit hele bestand in Supabase > SQL Editor > New query > Run.
-- Je mag het veilig meerdere keren uitvoeren: wat er al staat, blijft staan.
--
-- Dit bevat: status (gepland/bezig/gedaan), één kant of samen doen, de feed
-- (berichten, foto's, hartjes) en reacties.
--
-- Dit bevat NIET: supabase-accounts.sql (inloggen met e-mail + beheerscherm).
-- Daar moet je eerst de e-mailadressen van de beheerders invullen, en het zet
-- aanpassen achter een login. Voer dat apart uit, wanneer jullie zover zijn.
-- ============================================================================


-- ===== 1. Status: gepland / bezig / gedaan =====
alter table done_streets add column if not exists status text not null default 'done';
alter table done_streets drop constraint if exists done_streets_status_check;
alter table done_streets add constraint done_streets_status_check check (status in ('done', 'busy', 'assigned'));


-- ===== 2. Eén kant van een straat (oneven/even) en samen doen =====
alter table done_streets add column if not exists side text not null default 'all';
alter table done_streets drop constraint if exists done_streets_side_check;
alter table done_streets add constraint done_streets_side_check check (side in ('all', 'odd', 'even'));
alter table done_streets add column if not exists partner_id uuid references people(id) on delete set null;

do $$
begin
  -- de sleutel wordt (straat, kant) in plaats van enkel (straat)
  if not exists (
    select 1 from pg_index i
    join pg_attribute a on a.attrelid = i.indrelid and a.attnum = any(i.indkey)
    where i.indrelid = 'done_streets'::regclass and i.indisprimary and a.attname = 'side'
  ) then
    alter table done_streets drop constraint if exists done_streets_pkey;
    alter table done_streets add primary key (street_id, side);
  end if;
end $$;


-- ===== 3. Foto's bij profielen (als dat nog niet gebeurd was) =====
alter table people add column if not exists photo_url text;


-- ===== 4. Feed: berichten, foto's en hartjes =====
-- Mag deze bezoeker handelen namens deze persoon? Zonder accounts: ja.
-- Met accounts (later): enkel de persoon zelf of een beheerder.
create or replace function can_act(p uuid) returns boolean
language plpgsql stable security definer set search_path = public as $$
begin
  begin
    if not exists (select 1 from people where user_id is not null) then return true; end if;
    return is_admin() or p = my_person();
  exception when others then
    return true;     -- de accounts-SQL is nog niet uitgevoerd
  end;
end $$;
grant execute on function can_act(uuid) to anon, authenticated;

create table if not exists feed_posts (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references people(id) on delete cascade,
  street_id text,
  body text,
  photo_url text,
  is_story boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists feed_likes (
  target text not null,
  person_id uuid not null references people(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (target, person_id)
);
alter table feed_posts enable row level security;
alter table feed_likes enable row level security;
grant select, insert, update, delete on feed_posts, feed_likes to anon, authenticated;

drop policy if exists "fp_read" on feed_posts;
drop policy if exists "fp_ins" on feed_posts;
drop policy if exists "fp_del" on feed_posts;
create policy "fp_read" on feed_posts for select using (true);
create policy "fp_ins"  on feed_posts for insert with check (can_act(person_id));
create policy "fp_del"  on feed_posts for delete using (can_act(person_id));

drop policy if exists "fl_read" on feed_likes;
drop policy if exists "fl_ins" on feed_likes;
drop policy if exists "fl_del" on feed_likes;
create policy "fl_read" on feed_likes for select using (true);
create policy "fl_ins"  on feed_likes for insert with check (can_act(person_id));
create policy "fl_del"  on feed_likes for delete using (can_act(person_id));

-- Opslagmap voor foto's in de feed
insert into storage.buckets (id, name, public) values ('posts', 'posts', true) on conflict (id) do nothing;
drop policy if exists "posts_read" on storage.objects;
drop policy if exists "posts_insert" on storage.objects;
create policy "posts_read"   on storage.objects for select using (bucket_id = 'posts');
create policy "posts_insert" on storage.objects for insert to anon, authenticated with check (bucket_id = 'posts');


-- ===== 5. Reacties onder berichten =====
create table if not exists feed_comments (
  id uuid primary key default gen_random_uuid(),
  target text not null,
  person_id uuid not null references people(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 600),
  created_at timestamptz not null default now()
);
create index if not exists feed_comments_target on feed_comments (target, created_at);
alter table feed_comments enable row level security;
grant select, insert, delete on feed_comments to anon, authenticated;
drop policy if exists "fc_read" on feed_comments;
drop policy if exists "fc_ins" on feed_comments;
drop policy if exists "fc_del" on feed_comments;
create policy "fc_read" on feed_comments for select using (true);
create policy "fc_ins"  on feed_comments for insert with check (can_act(person_id));
create policy "fc_del"  on feed_comments for delete using (can_act(person_id));


-- ===== 6. Live bijwerken (negeert wat er al in staat) =====
do $$
declare t text;
begin
  foreach t in array array['people', 'done_streets', 'feed_posts', 'feed_likes', 'feed_comments'] loop
    begin
      execute format('alter publication supabase_realtime add table %I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;
