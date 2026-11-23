-- Eigen feedberichten kunnen bewerken. Mag je opnieuw uitvoeren zonder schade.
drop policy if exists "fp_upd" on feed_posts;
create policy "fp_upd" on feed_posts for update using (can_act(person_id)) with check (can_act(person_id));
