# Pannenkoekenverkoop Ingelmunster

Interactieve kaart van Ingelmunster in de huisstijl van Kunst Veredelt. Iedereen duidt aan welke straten hij/zij gedaan heeft, met foto per persoon.

- Kaart: eigen vectorkaart (MapLibre) met OpenStreetMap-data, enkel Ingelmunster (`data/map.json`).
- Opslag: Supabase (`supabase.sql` en `supabase-fotos.sql`, config in `config.js`).
- Hosting: GitHub Pages.
- Testen zonder de echte database: voeg `?demo` toe aan de URL.

Lokaal: `python -m http.server 5180` in deze map.

## Opbouw
`index.html` is de app-schil met de tabbalk (Kaart, Feed, Ranglijst, Ik). De kaart is `map.html`, feed en ranglijst zijn `overzicht.html`, en "Ik" is `profiel.html` (foto, naam, cijfers, eigen straten en instellingen, met een knop naar je eigen straten op de kaart). Alle drie draaien naast elkaar in de schil, zodat wisselen van tab meteen gaat en niets opnieuw laadt.

## Supabase instellen
1. **Eerste keer:** `supabase.sql` en daarna `supabase-fotos.sql`.
2. **Alles wat erbij kwam, in één keer:** `supabase-alles.sql` (status, kant/samen, feed, foto's en reacties). Mag je opnieuw uitvoeren zonder schade.
3. **Later, apart:** `supabase-accounts.sql` (inloggen met e-mail en beheerscherm).

## Accounts en beheerscherm
1. Voer `supabase-accounts.sql` uit (en zet eerst de e-mailadressen van de beheerders in de `insert into admins`-regel).
2. Supabase > Authentication > URL Configuration: zet **Site URL** op het adres van de site (https://kaskraker.github.io/pannenkoekenbak/) en voeg datzelfde adres toe bij **Redirect URLs**.
3. Supabase > Authentication > Providers > Email: laat e-mail aan. Zet "Confirm email" uit als je enkel met wachtwoorden wil testen.
4. Beheerscherm: `beheer.html` (enkel voor beheerders). `beheer.html?demo` toont het met voorbeelddata.

## Foto's in de demo
`assets/demo/` bevat drie gratis stockfoto's van [Unsplash](https://unsplash.com/s/photos/pancake) (Unsplash-licentie), enkel gebruikt in de demo (`overzicht.html?demo`). Bij echte data komen de foto's van de gebruikers.
