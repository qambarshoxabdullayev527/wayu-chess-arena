WAYU CHESS ARENA — SEPARATE PROJECT

This folder is an isolated starter for the new chess arena. It does not include the old Telegram registration API or webhook, and it does not modify the existing WAYU CHESS deployment.

Files:
- index.html: single unified site with tournament information, registration form, and chess arena
- api/register.js: registration endpoint that sends new registration notifications to Telegram (does not change the bot webhook)
- supabase-config.js: browser-only Supabase URL and anon key placeholders
- supabase-schema.sql: initial realtime room table/policies
- package.json: project metadata

IMPORTANT STATUS
This is a starter build, not a verified production release. The AI/local board and local browser stats are present in the source. Stockfish is loaded from a CDN and has a simple fallback. Online rooms require a separate Supabase project and configuration. The current room SQL is an open MVP and is NOT suitable for ranked public tournaments without authentication, strict row-level security, server-side move validation and anti-cheat protections. Local ELO and leaderboard are browser-specific, not a global verified ranking.

NEXT SETUP
1. Create a NEW GitHub repository, e.g. wayu-chess-arena. Do not reuse the existing wayu-chess repo.
2. Create a NEW Vercel project linked only to that new repository.
3. Create a separate Supabase project for the arena; never reuse the old site's credentials or database.
4. Run supabase-schema.sql in the new Supabase SQL Editor.
5. Put the new Supabase Project URL and anon/public key in supabase-config.js. Never use service_role keys in browser code.
6. Test AI, local two-player, and online room sync before sharing the site.

The existing WAYU CHESS deployment and its Telegram webhook are not changed. The new project has its own /api/register endpoint. Configure its own Vercel environment variables before enabling registration.
