# Pannenkoekenbak Ingelmunster

Interactieve kaart van Ingelmunster in de huisstijl van Kunst Veredelt. Iedereen duidt aan welke straten hij/zij gedaan heeft, met foto per persoon.

- Kaart: eigen vectorkaart (MapLibre) met OpenStreetMap-data, enkel Ingelmunster (`data/map.json`).
- Opslag: Supabase (`supabase.sql` en `supabase-fotos.sql`, config in `config.js`).
- Hosting: GitHub Pages.
- Testen zonder de echte database: voeg `?demo` toe aan de URL.

Lokaal: `python -m http.server 5180` in deze map.

## Extra stappen in Supabase (SQL Editor)
Voer deze bestanden uit, in deze volgorde, als ze er nog niet zijn:
1. `supabase.sql` (basis) en `supabase-fotos.sql` (foto's)
2. `supabase-status.sql` (bezig / gedaan)
3. `supabase-kanten.sql` (oneven/even kant en samen doen)

Zonder een stap blijven de bijhorende opties gewoon verborgen; de rest werkt.
