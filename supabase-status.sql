-- Plak dit in Supabase > SQL Editor > Run
-- Voegt de status "bezig" toe naast "gedaan" (voor straten waar je mee bezig bent maar nog niet klaar mee bent).
alter table done_streets
  add column if not exists status text not null default 'done';

alter table done_streets
  drop constraint if exists done_streets_status_check;
alter table done_streets
  add constraint done_streets_status_check check (status in ('done', 'busy'));
