# Adhikar — National Land Acquisition & Management System

Hackathon prototype (SIH26016) digitizing India's RFCTLARR Act 2013 land
acquisition process — see `DOCS/` for the domain research this app is built
from.

## Manual Supabase setup

These steps happen once, by hand, in the Supabase dashboard (`.env.local` in
this repo already has the project's URL and keys filled in):

1. **Enable PostGIS.** Dashboard → Database → Extensions → search
   "postgis" → Enable. (`LandParcel.latitude`/`longitude` are plain decimals
   in this prototype's schema; PostGIS is enabled for future spatial-query
   headroom, per the build brief.)
2. **Get the DB password.** Dashboard → Project Settings → Database →
   Connection string. Copy the password into `DATABASE_URL` and `DIRECT_URL`
   in `.env.local` (both use the same password — one is the transaction
   pooler, the other the session pooler for migrations). **If the password
   contains `[`, `]`, `@`, or other URL-reserved characters, they must be
   percent-encoded** in the connection string (`[` → `%5B`, `]` → `%5D`,
   etc.) or `psql`/Prisma will silently mis-parse the URI and report
   "password authentication failed" even with the correct password.
3. **Run migrations:**
   ```
   npm run db:migrate
   ```
4. **Seed demo data** (creates the 5 demo Supabase Auth accounts + ~18
   sample projects spread across states/stages):
   ```
   npm run db:seed
   ```
   Demo login password for all seeded accounts: `Demo@12345`.

## Local development

```
npm install
npm run dev
```

## Deployment

Deploy to Vercel. Add `DATABASE_URL`, `DIRECT_URL`,
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and
`SUPABASE_SECRET_KEY` as environment variables in the Vercel project
settings — do not commit `.env.local`.

## Design system provenance

Color tokens in `src/app/globals.css` are grounded in UX4G Design System 3.0
(ux4g.gov.in): the brand purple (`#4a2bc2` / `#1e1465`) is UX4G's own
published CSS token; saffron and green are the two other hues UX4G's own
documentation names as its identity family ("Brand Purple, Saffron, Green").
