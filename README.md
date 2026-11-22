# Pannenkoekenbak Ingelmunster

Interactieve kaart van Ingelmunster in de huisstijl van Kunst Veredelt. Iedereen duidt aan welke straten hij/zij gedaan heeft, met foto per persoon.

- Kaart: eigen vectorkaart (MapLibre) met OpenStreetMap-data, enkel Ingelmunster (`data/map.json`).
- Opslag: Supabase (`supabase.sql` en `supabase-fotos.sql`, config in `config.js`).
- Hosting: GitHub Pages.
- Testen zonder de echte database: voeg `?demo` toe aan de URL.

Lokaal: `python -m http.server 5180` in deze map.
