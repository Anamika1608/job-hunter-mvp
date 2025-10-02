# Job Hunter MVP

A small server-rendered app that crawls a public job source, stores jobs in a local database, and exposes a simple web UI with search, filters, sorting, pagination, and external Apply links.

## Tech Stack
- Next.js (App Router)
- tRPC for API layer
- Prisma ORM with PostgreSQL
- Playwright (initially) then Remotive public API for reliable ingestion
- Tailwind CSS (v4) for styling

## Prerequisites
- Node.js 18+ (tested with Node 22)
- PostgreSQL database URL in `DATABASE_URL` (Neon or local Postgres works)

Create a `.env` file in the project root:

```bash
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
NODE_ENV=development
```

## Install & Setup
```bash
# install deps
npm install

# push Prisma schema to your DB and generate client
npm run db:push
npx prisma generate

# install Playwright browsers (for crawler if using Playwright)
npx playwright install --with-deps
```

If you see a Prisma permission error on Windows during generate, re-run `npx prisma generate` (antivirus tools can lock files temporarily).

## Development
```bash
# start the Next.js dev server
npm run dev
# open http://localhost:3000
```
- Landing page with hero and CTA → `/`
- Jobs page with search, filters, sorting, pagination → `/jobs`

## Crawling Jobs
The project ingests jobs from Remotive.

Two implementations are available:
- Playwright page scraper (initial draft; not used by default)
- Remotive public API (default) – stable selectors and permitted access

Run the crawler (Remotive API):
```bash
# fetch ~100 jobs per page, default 3 pages
npm run crawl:remotive

# customize page count
CRAWL_PAGES=5 npm run crawl:remotive
```

What the crawler does:
- Fetches jobs from Remotive public API
- Polite delays and simple retry w/ exponential backoff on transient errors
- Upserts by unique `url` into the `Job` table

## Database Schema
Prisma `Job` model (see `prisma/schema.prisma`):
- id (PK)
- title, company
- location, employmentType
- isRemote
- postedAt
- url (unique), source
- description
- createdAt, updatedAt

## API
`tRPC` router `job.list` supports:
- keyword search: `q`
- filters: `company`, `location`, `employmentType`, `isRemote`, `source`
- sorting: `postedAtDesc|postedAtAsc|titleAsc|titleDesc`
- pagination: `page`, `pageSize`

The UI calls this API at runtime to query the DB.

## UI
- Landing page hero with CTA to `/jobs`
- `/jobs` page includes:
  - keyword search
  - filters (company, location, employment type, remote toggle)
  - sorting by date/title
  - pagination
  - Apply button linking to the external posting

## Architectural Choices & Assumptions
- Server-side only crawler: implemented as a Node script under `src/scripts/`.
- Data source: Remotive public API chosen for reliability, explicit permission to fetch, and stable fields. If the API becomes unavailable, a Playwright-based crawler can be adapted.
- Single source: Spec requires one source only; we chose Remotive.
- No auth: App is public per requirements.
- Polite throttling: Small random delays and retry with backoff for transient failures.
- Upsert strategy: Use `url` as unique identifier to avoid duplicates.
- Filters: Interpreted broadly via `contains` (case-insensitive) for a forgiving UX.
- Remote flag: `isRemote=true` for Remotive; location is informational.

## Scripts
```json
{
  "dev": "next dev --turbo",
  "preview": "next build && next start",
  "crawl:remotive": "tsx ./src/scripts/crawl-remotive.ts",
  "db:push": "prisma db push",
  "db:migrate": "prisma migrate deploy",
  "db:generate": "prisma migrate dev"
}
```

## Troubleshooting
- Prisma generate errors on Windows: re-run `npx prisma generate`. Ensure antivirus is not locking `.prisma/client` files.
- Empty job list: re-run `npm run crawl:remotive`. Confirm DB connectivity and `DATABASE_URL`.
- Styles not applied: ensure `npm run dev` restarted after dependency updates.

## License
For demo purposes only.
