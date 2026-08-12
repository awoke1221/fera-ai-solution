## Running migrations

This folder contains SQL migrations and small runner scripts to apply them to your Postgres (Supabase) database.

Scripts

- `run_migration.sh` — Bash script. Set `PG_CONN` to your Postgres connection string and run it:

```bash
export PG_CONN="postgres://user:password@host:5432/postgres"
./migrations/run_migration.sh
```

- `run_migration.ps1` — PowerShell script. Set `PG_CONN` and run:

```powershell
$env:PG_CONN = "postgres://user:password@host:5432/postgres"
.\migrations\run_migration.ps1
```

Migration file

- `20260818_one_to_one_requests.sql` — Adds `one_to_one_requests` table to store incoming 1:1 coaching requests.

Notes

- Use your Supabase project's database connection string from the Project Settings -> Database -> Connection string.
- Running migrations requires `psql` (Postgres client) installed and reachable on your PATH.
