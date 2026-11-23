# Pannenkoekenverkoop Ingelmunster

Interactieve kaart van Ingelmunster in de huisstijl van Kunst Veredelt. Iedereen duidt aan welke straten hij/zij gedaan heeft, met foto per persoon.

- Kaart: eigen vectorkaart (MapLibre) met OpenStreetMap-data, enkel Ingelmunster (`data/map.json`).
- Opslag: Supabase (`supabase.sql` en `supabase-fotos.sql`, config in `config.js`).
- Hosting: GitHub Pages.
- Kaartlooks vergelijken op je telefoon: open `kaartlooks.html` (demo-data met een rij keuzes bovenaan de kaart).
- Testen zonder de echte database: open `demo.html` (of voeg `?demo` toe aan de URL). Wil je de demo op je beginscherm zetten, doe dat vanaf `demo.html`: die heeft een eigen manifest, zodat hij ook als demo opent.

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

## Nieuwe versies bij gebruikers
De app controleert bij het openen, bij terugkomen in de app en bij het trekken-om-te-verversen één klein bestand (`version.txt`). Is dat getal veranderd, dan haalt hij alle bestanden vers op en herlaadt hij; anders blijft het bij een gewone gegevensverversing. **Verhoog `version.txt` bij elke wijziging die gebruikers moeten krijgen** (bijvoorbeeld `date +%s > version.txt` in Git Bash), anders blijft de browser tot 10 minuten de oude bestanden tonen.
