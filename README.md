# Pannenkoekenbak Ingelmunster

Interactieve kaart: iedereen duidt aan welke straten hij/zij gedaan heeft. Klik een naam om enkel zijn/haar straten te zien.

## Live zetten (gedeeld voor iedereen)
1. Maak een gratis project op https://supabase.com
2. Plak `supabase.sql` in **SQL Editor** en klik Run.
3. Zet bij **Project Settings > API** de `Project URL` en `anon public` key in `config.js`.
4. Zet de map online (Netlify Drop, Vercel of GitHub Pages). Het zijn enkel statische bestanden.

Zonder stap 3 werkt de site in demo-modus (data enkel in je eigen browser).

## Lokaal testen
`python -m http.server 5180` in deze map, dan http://localhost:5180

Straten komen uit OpenStreetMap (175 stuks, deelgemeente Ingelmunster). Kaartdata © OpenStreetMap-bijdragers.
