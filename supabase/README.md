# Haizier Supabase Schema

This folder stores database schema files for the Haizier MVP.

## Migration order

Apply migrations from `supabase/migrations/` in numeric order.

For BUS4012 Assignment 3, `supabase/schema.sql` contains the single required table used by the Alpha Vantage + Python backend integration.

## Initial persistence goals

- Store minimal profile/session identity information.
- Store risk profile and consent timestamp.
- Store analysis request inputs.
- Store generated educational analysis results.

## Security notes

- Enable Row Level Security before production use.
- If Supabase Auth is introduced, policies should restrict users to their own rows.
- If the Python backend writes with the service role key, keep that key server-side only.