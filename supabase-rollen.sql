-- Optioneel: een functie bij je profiel (Gieter, Verpakker, ...). Mag je opnieuw uitvoeren zonder schade.
alter table people add column if not exists role text;
