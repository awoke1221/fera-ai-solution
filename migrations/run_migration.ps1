<#
Run the SQL migration against a Postgres database using `psql`.

Usage (PowerShell):
  $env:PG_CONN = "postgres://user:password@host:5432/postgres"
  .\migrations\run_migration.ps1

You can get the connection string from your Supabase project settings (Database → Connection string).
#>

$scriptPath = Join-Path -Path (Get-Location) -ChildPath "migrations/20260818_one_to_one_requests.sql"
if (-not (Test-Path $scriptPath)) {
  Write-Error "Migration file not found: $scriptPath"
  exit 1
}

$pg = $env:PG_CONN
if (-not $pg) {
  Write-Host "Environment variable PG_CONN is not set."
  Write-Host "Set it to your Postgres connection string, e.g. postgres://user:pass@host:5432/postgres"
  exit 1
}

Write-Host "Applying migration: $scriptPath"
Write-Host "Using PG_CONN: $($pg -replace ':(.*)@', ':****@')"

Start-Process -NoNewWindow -FilePath "psql" -ArgumentList @($pg, '-f', $scriptPath) -Wait -PassThru | Out-Null
$exit = $LASTEXITCODE
if ($exit -ne 0) {
  Write-Error "psql returned exit code $exit"
  exit $exit
}

Write-Host "Migration applied successfully."
