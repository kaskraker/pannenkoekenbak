-- Plak dit in Supabase > SQL Editor > Run (na supabase-feed.sql)
-- Reacties onder berichten in de feed.
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
alter publication supabase_realtime add table feed_comments;
