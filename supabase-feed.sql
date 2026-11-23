-- Plak dit in Supabase > SQL Editor > Run
-- Voor de feed: berichten met foto's, verhalen (24 uur) en hartjes.

-- Mag deze bezoeker handelen namens deze persoon? Zonder accounts: ja (vertrouwen). Met accounts: enkel de persoon zelf of een beheerder.
create or replace function can_act(p uuid) returns boolean
language plpgsql stable security definer set search_path = public as $$
begin
  begin
    if not exists (select 1 from people where user_id is not null) then return true; end if;
    return is_admin() or p = my_person();
  exception when others then
    return true;     -- accounts-SQL nog niet uitgevoerd
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

drop policy if exists "fp_read" on feed_posts; drop policy if exists "fp_ins" on feed_posts; drop policy if exists "fp_del" on feed_posts;
create policy "fp_read" on feed_posts for select using (true);
create policy "fp_ins"  on feed_posts for insert with check (can_act(person_id));
create policy "fp_del"  on feed_posts for delete using (can_act(person_id));
drop policy if exists "fl_read" on feed_likes; drop policy if exists "fl_ins" on feed_likes; drop policy if exists "fl_del" on feed_likes;
create policy "fl_read" on feed_likes for select using (true);
create policy "fl_ins"  on feed_likes for insert with check (can_act(person_id));
create policy "fl_del"  on feed_likes for delete using (can_act(person_id));

insert into storage.buckets (id, name, public) values ('posts', 'posts', true) on conflict (id) do nothing;
drop policy if exists "posts_read" on storage.objects; drop policy if exists "posts_insert" on storage.objects;
create policy "posts_read"   on storage.objects for select using (bucket_id = 'posts');
create policy "posts_insert" on storage.objects for insert to anon, authenticated with check (bucket_id = 'posts');

alter publication supabase_realtime add table feed_posts;
alter publication supabase_realtime add table feed_likes;
