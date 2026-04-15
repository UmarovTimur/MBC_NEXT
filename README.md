# MBC Monorepo

Bible reader and commentary platform. Two separate sites in one repository.

| App | Language | Mode | Domain |
|-----|----------|------|--------|
| `apps/uz` | Uzbek | Static export (FTP) | kitobook.com |
| `apps/az` | Azerbaijani | Server mode | TBD |

---

## Structure

```
apps/
  uz/               — Uzbek site: Bible reader + McDonald commentary
  az/               — Azerbaijani site: Bible reader, DB, admin (in progress)
packages/
  bible-reader/     — Shared components (populated as needed)
migration/          — Scripts for converting source HTML to app format
docker-compose.yml  — PostgreSQL for local development (az)
```

---

## Setup

### Requirements

- Node.js 24+
- Yarn

### Install dependencies

```bash
yarn install
```

This installs dependencies for all workspaces at once.

---

## Development

### Uzbek site (uz)

```bash
# Copy and configure env
cp apps/uz/.env.example apps/uz/.env
# Edit apps/uz/.env as needed (APP_LANG=uz is the default)

# Start dev server
yarn workspace @mbc/uz dev
```

Open [http://localhost:3000](http://localhost:3000).

Bible HTML content lives in `apps/uz/html/`:
- `mbc/` — McDonald commentary
- `muqaddas-kitob/` — Uzbek Bible translation

---

### Azerbaijani site (az)

```bash
# Copy and configure env
cp apps/az/.env.example apps/az/.env
# Edit apps/az/.env: set DB credentials

# Start PostgreSQL
docker-compose up db -d

# Start dev server
yarn workspace @mbc/az dev
```

Open [http://localhost:3000](http://localhost:3000).

Bible HTML content lives in `apps/az/html/`:
- `azb/` — Azerbaijani Bible translation
- `barclay/` — Barclay commentary

---

## Build

```bash
# Build uz (outputs to apps/uz/out/)
yarn workspace @mbc/uz build

# Build az
yarn workspace @mbc/az build
```

---

## Deploy

Deploy is automated via GitHub Actions on push to `main`.

- **uz** → FTP deploy to kitobook.com (uses secrets: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `ENV_FILE`)
- **az** → Build runs, deploy step TBD (uses secret: `ENV_FILE_AZ`)

Both jobs run in parallel. See [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

---

## Environment variables

### apps/uz/.env

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_LANG` | Language code for i18n | `uz` |
| `NODE_ENV` | Environment | `development` |
| `BASE_PATH` | Subdirectory path (empty = root) | `` |
| `DOMAIN` | Full domain with trailing slash | `https://example.com/` |

### apps/az/.env

| Variable | Description |
|----------|-------------|
| `APP_LANG` | `az` |
| `NODE_ENV` | `development` or `production` |
| `BASE_PATH` | Subdirectory path |
| `DATABASE_URL` | PostgreSQL connection string |
| `POSTGRES_*` | DB connection details |

---

## Adding new HTML content

Bible HTML files are converted from source formats using migration scripts in `migration/`.

```bash
# Example: convert azb source HTML
cd migration
node index.js
```

Output goes to `apps/az/html/azb/`.

---

## Useful commands

```bash
# Lint uz
yarn workspace @mbc/uz lint

# Run uz unit tests
yarn workspace @mbc/uz unit

# Add a dependency to az
yarn workspace @mbc/az add <package>
```
