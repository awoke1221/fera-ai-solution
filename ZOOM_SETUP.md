# Zoom Integration Setup

1. Env vars to set

- `ZOOM_CLIENT_ID` — OAuth client ID from Zoom Marketplace app
- `ZOOM_CLIENT_SECRET` — OAuth client secret
- `ZOOM_WEBHOOK_VERIFICATION_TOKEN` — Verification token set in Zoom webhook (optional but recommended)
- `NEXT_PUBLIC_SITE_URL` — Your site origin (used for OAuth redirect URI)
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key for server uploads (already used by project)

2. Create or update Supabase DB

Option A — Supabase SQL editor

- Open Supabase dashboard → SQL Editor → run `migrations/20260813_add_zoom.sql`.

Option B — supabase CLI

- Install supabase CLI and run:

```bash
supabase db remote set <your-db-connection-string>
psql <connection-string> -f migrations/20260813_add_zoom.sql
```

3. Create a storage bucket for recordings

In Supabase Dashboard → Storage → Create bucket named `zoom-recordings` (set public or private, depending on use).

4. Zoom App setup

- Create an OAuth App in Zoom Marketplace. Set the redirect URI to:

  `https://<your-site>/api/membership/zoom/oauth/callback`

- Enable the following scopes: `meeting:write`, `recording:read`, `user:read` (adjust as needed).
- Create a webhook subscription for `Recording completed` events. Set the event callback URL to:

  `https://<your-site>/api/membership/zoom/webhooks`

- In the webhook settings, set a verification token and copy it to `ZOOM_WEBHOOK_VERIFICATION_TOKEN`.

5. Running locally

- Ensure `NEXT_PUBLIC_SITE_URL` points to your local tunnel (ngrok) URL used in Zoom app redirect and webhook (Zoom requires a public HTTPS URL).
- Example using `ngrok`:

```bash
ngrok http 3000
export NEXT_PUBLIC_SITE_URL=https://<your-ngrok>.ngrok.io
```

6. Post-setup checks

- Visit your membership dashboard and click "Connect Zoom". Complete the OAuth flow.
- Create a meeting via the dashboard. After the meeting ends and Zoom processes recordings, the webhook will upload files to Supabase storage and update the meeting row.
