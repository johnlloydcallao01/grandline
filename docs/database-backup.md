# Database Backup Guide

This guide documents the exact backup and restore workflow used for `apps/cms` with the Supabase Postgres database.

It is written for this project on Windows PowerShell.

## What This Backs Up

- Database roles and global settings into `roles.sql`
- Database schema into `schema.sql`
- Database data into `data.sql`
- A zipped copy of the backup folder for off-machine storage

## What This Does Not Back Up

- Supabase Storage file contents
- Anything outside the Postgres database itself

If your app uses Supabase Storage for uploaded files, back those files up separately.

## Current Project Paths

- Project root: `C:\Users\User\Desktop\grandline`
- CMS app: `C:\Users\User\Desktop\grandline\apps\cms`
- CMS env file: `C:\Users\User\Desktop\grandline\apps\cms\.env`
- Backup output folder: `C:\Users\User\Desktop\grandline\apps\cms\backups\supabase`

## Prerequisites

### 1. Confirm the database connection exists in `apps/cms/.env`

This guide assumes `apps/cms/.env` contains:

```env
DATABASE_URI=postgresql://...
```

### 2. PostgreSQL client tools must be installed

The backup was created using:

- `pg_dump.exe`
- `pg_dumpall.exe`
- `psql.exe`

Installed path on this machine:

```text
C:\Program Files\PostgreSQL\17\bin
```

If PostgreSQL client tools are not installed yet, install them with:

```powershell
winget install --id PostgreSQL.PostgreSQL.17 --accept-source-agreements --accept-package-agreements --silent
```

## Important Notes Before Running Backup

- The `DATABASE_URI` in this project currently uses the Supabase pooler on port `6543`.
- For the backup commands below, use port `5432`.
- Keep the password URL-encoded inside `DATABASE_URI` if it contains special characters.
- Do not commit generated backup files to git unless you intentionally want that.
- After creating a backup, immediately copy the `.zip` file to off-machine storage.

## Recommended Backup Folder Format

Use a timestamped folder:

```text
apps/cms/backups/supabase/YYYY-MM-DD_HHmmss
```

Example:

```text
C:\Users\User\Desktop\grandline\apps\cms\backups\supabase\2026-05-22_182454
```

## How To Create A Backup Again

### Step 1. Open PowerShell in `apps/cms`

```powershell
cd C:\Users\User\Desktop\grandline\apps\cms
```

### Step 2. Create a timestamped backup folder

```powershell
$ts = Get-Date -Format 'yyyy-MM-dd_HHmmss'
$backupDir = Join-Path (Get-Location) ("backups\supabase\$ts")
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
$backupDir
```

### Step 3. Run the schema backup

This reads `DATABASE_URI` from `.env`, switches port `6543` to `5432`, decodes the password, and writes `schema.sql`.

```powershell
$dbUrl = ((Get-Content '.env') | Where-Object { $_ -match '^DATABASE_URI=' } | Select-Object -First 1).Split('=',2)[1].Trim()
$uri = [System.Uri]($dbUrl -replace ':6543/',':5432/')
$userInfo = $uri.UserInfo.Split(':',2)
$username = $userInfo[0]
$password = [System.Uri]::UnescapeDataString($userInfo[1])
$dbHost = $uri.Host
$dbPort = $uri.Port
$dbName = $uri.AbsolutePath.TrimStart('/')
$outFile = Join-Path $backupDir 'schema.sql'
$env:PGPASSWORD = $password
& 'C:\Program Files\PostgreSQL\17\bin\pg_dump.exe' `
  --host=$dbHost `
  --port=$dbPort `
  --username=$username `
  --dbname=$dbName `
  --schema-only `
  --quote-all-identifiers `
  --no-owner `
  --no-privileges `
  --file=$outFile
```

### Step 4. Run the data backup

This writes `data.sql`.

```powershell
$outFile = Join-Path $backupDir 'data.sql'
& 'C:\Program Files\PostgreSQL\17\bin\pg_dump.exe' `
  --host=$dbHost `
  --port=$dbPort `
  --username=$username `
  --dbname=$dbName `
  --data-only `
  --quote-all-identifiers `
  --no-owner `
  --no-privileges `
  --exclude-table='storage.buckets_vectors' `
  --exclude-table='storage.vector_indexes' `
  --file=$outFile
```

### Step 5. Run the roles backup

This writes `roles.sql`.

```powershell
$outFile = Join-Path $backupDir 'roles.sql'
& 'C:\Program Files\PostgreSQL\17\bin\pg_dumpall.exe' `
  --host=$dbHost `
  --port=$dbPort `
  --username=$username `
  --globals-only `
  --file=$outFile
```

### Step 6. Zip the backup folder

```powershell
$zipPath = "$backupDir.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path (Join-Path $backupDir '*') -DestinationPath $zipPath
```

### Step 7. Verify files exist

```powershell
Get-ChildItem $backupDir | Select-Object Name, Length | Format-Table -AutoSize
Get-Item $zipPath | Select-Object Name, Length | Format-Table -AutoSize
```

### Expected Files

- `roles.sql`
- `schema.sql`
- `data.sql`
- `YYYY-MM-DD_HHmmss.zip`

## Full Backup Script Example

If you want to run the whole backup flow in one go, use this:

```powershell
cd C:\Users\User\Desktop\grandline\apps\cms

$ts = Get-Date -Format 'yyyy-MM-dd_HHmmss'
$backupDir = Join-Path (Get-Location) ("backups\supabase\$ts")
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

$dbUrl = ((Get-Content '.env') | Where-Object { $_ -match '^DATABASE_URI=' } | Select-Object -First 1).Split('=',2)[1].Trim()
$uri = [System.Uri]($dbUrl -replace ':6543/',':5432/')
$userInfo = $uri.UserInfo.Split(':',2)
$username = $userInfo[0]
$password = [System.Uri]::UnescapeDataString($userInfo[1])
$dbHost = $uri.Host
$dbPort = $uri.Port
$dbName = $uri.AbsolutePath.TrimStart('/')
$env:PGPASSWORD = $password

& 'C:\Program Files\PostgreSQL\17\bin\pg_dump.exe' `
  --host=$dbHost `
  --port=$dbPort `
  --username=$username `
  --dbname=$dbName `
  --schema-only `
  --quote-all-identifiers `
  --no-owner `
  --no-privileges `
  --file=(Join-Path $backupDir 'schema.sql')

& 'C:\Program Files\PostgreSQL\17\bin\pg_dump.exe' `
  --host=$dbHost `
  --port=$dbPort `
  --username=$username `
  --dbname=$dbName `
  --data-only `
  --quote-all-identifiers `
  --no-owner `
  --no-privileges `
  --exclude-table='storage.buckets_vectors' `
  --exclude-table='storage.vector_indexes' `
  --file=(Join-Path $backupDir 'data.sql')

& 'C:\Program Files\PostgreSQL\17\bin\pg_dumpall.exe' `
  --host=$dbHost `
  --port=$dbPort `
  --username=$username `
  --globals-only `
  --file=(Join-Path $backupDir 'roles.sql')

$zipPath = "$backupDir.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path (Join-Path $backupDir '*') -DestinationPath $zipPath

Get-ChildItem $backupDir | Select-Object Name, Length | Format-Table -AutoSize
Get-Item $zipPath | Select-Object Name, Length | Format-Table -AutoSize
```

## How To Restore A Specific Backup

## Warning

Restoring into the live Supabase database can overwrite current data and may cause downtime.

Before restoring:

- Confirm you really want to replace current data
- Take a fresh backup first
- Make sure you selected the correct backup folder
- Make sure nobody is actively writing important production data during the restore

## Restore Order

Always restore in this order:

1. `roles.sql`
2. `schema.sql`
3. `data.sql`

## Example Backup To Restore

Example backup folder:

```text
C:\Users\User\Desktop\grandline\apps\cms\backups\supabase\2026-05-22_182454
```

## Step 1. Open PowerShell in `apps/cms`

```powershell
cd C:\Users\User\Desktop\grandline\apps\cms
```

## Step 2. Load the current database connection from `.env`

These variables are also used during restore:

```powershell
$dbUrl = ((Get-Content '.env') | Where-Object { $_ -match '^DATABASE_URI=' } | Select-Object -First 1).Split('=',2)[1].Trim()
$uri = [System.Uri]($dbUrl -replace ':6543/',':5432/')
$userInfo = $uri.UserInfo.Split(':',2)
$username = $userInfo[0]
$password = [System.Uri]::UnescapeDataString($userInfo[1])
$dbHost = $uri.Host
$dbPort = $uri.Port
$dbName = $uri.AbsolutePath.TrimStart('/')
$env:PGPASSWORD = $password
```

## Step 3. Point to the backup folder you want to restore

```powershell
$restoreDir = 'C:\Users\User\Desktop\grandline\apps\cms\backups\supabase\2026-05-22_182454'
```

## Step 4. Restore roles

```powershell
& 'C:\Program Files\PostgreSQL\17\bin\psql.exe' `
  --host=$dbHost `
  --port=$dbPort `
  --username=$username `
  --dbname=$dbName `
  --file=(Join-Path $restoreDir 'roles.sql')
```

## Step 5. Restore schema

```powershell
& 'C:\Program Files\PostgreSQL\17\bin\psql.exe' `
  --host=$dbHost `
  --port=$dbPort `
  --username=$username `
  --dbname=$dbName `
  --file=(Join-Path $restoreDir 'schema.sql')
```

## Step 6. Restore data

The generated `data.sql` may contain tables with circular foreign keys. Because of that, restore data with replication role temporarily set to `replica`.

```powershell
& 'C:\Program Files\PostgreSQL\17\bin\psql.exe' `
  --host=$dbHost `
  --port=$dbPort `
  --username=$username `
  --dbname=$dbName `
  --command='SET session_replication_role = replica' `
  --file=(Join-Path $restoreDir 'data.sql')
```

## Safer Transactional Restore Example

Use this if you want restore to stop on the first SQL error:

```powershell
& 'C:\Program Files\PostgreSQL\17\bin\psql.exe' `
  --single-transaction `
  --variable ON_ERROR_STOP=1 `
  --host=$dbHost `
  --port=$dbPort `
  --username=$username `
  --dbname=$dbName `
  --file=(Join-Path $restoreDir 'roles.sql') `
  --file=(Join-Path $restoreDir 'schema.sql') `
  --command='SET session_replication_role = replica' `
  --file=(Join-Path $restoreDir 'data.sql')
```

## If You Need To Restore From The Zip File

First unzip it:

```powershell
$zipPath = 'C:\Users\User\Desktop\grandline\apps\cms\backups\supabase\2026-05-22_182454.zip'
$extractDir = 'C:\Users\User\Desktop\grandline\apps\cms\backups\supabase\2026-05-22_182454_unzipped'
if (Test-Path $extractDir) { Remove-Item $extractDir -Recurse -Force }
Expand-Archive -Path $zipPath -DestinationPath $extractDir
```

Then set:

```powershell
$restoreDir = $extractDir
```

## Recommended Restore Checklist

- Confirm the exact backup timestamp you want
- Confirm you are restoring to the correct Supabase project
- Take a fresh backup before restore
- Restore `roles.sql`, then `schema.sql`, then `data.sql`
- Verify the app after restore
- Re-check important records manually
- Re-check auth, RLS, and any app-critical flows

## Post-Restore Checks

After restore, verify:

- Tables and schema objects exist
- Important data is present
- Authentication-related tables behave as expected
- CMS can connect and load data correctly
- Any required policies, functions, and triggers still work

## Example Of The Backup We Already Created

Existing backup from this session:

```text
C:\Users\User\Desktop\grandline\apps\cms\backups\supabase\2026-05-22_182454
```

Zip file:

```text
C:\Users\User\Desktop\grandline\apps\cms\backups\supabase\2026-05-22_182454.zip
```

## Final Recommendation

For future backups:

- Always create a fresh timestamped backup folder
- Always zip it
- Always upload the zip to off-machine storage
- Always take a fresh backup again before doing any restore
