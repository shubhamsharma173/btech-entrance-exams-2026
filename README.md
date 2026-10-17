# Entrance Exams Guide — 2026

A Next.js application for exploring Indian entrance exams by category, priority and deadline. It combines a searchable exam dataset with a reviewable data-update pipeline built around Tavily search, Groq and GitHub Actions.

The repository name reflects its original B.Tech scope. The checked-in dataset now contains **34 records across engineering, medical, law, management and design**, including discontinued or merged exams retained for context.

## What is implemented

- Exam cards and detail views with dates, fees, eligibility, college information and source links.
- Category and priority filters, search, sorting and registration countdowns.
- Next.js App Router pages, metadata, structured data, sitemap and robots configuration.
- A script that proposes changes to selected date and application-fee fields, with field restrictions, value checks and a dry-run mode.
- A scheduled workflow that opens a data-update pull request for human review.

**Stack:** Next.js 16, React 19, TypeScript and Tailwind CSS 4. Exam data is stored in JSON; the website does not require an application database or updater API keys to render that dataset.

## Data status and limitations

As inspected on **18 October 2026**, `data/exams-data.json` reports `lastUpdated: 2026-02-22`. That timestamp describes the dataset, not the freshness of every individual record. Dates, eligibility, fees and placement figures may be stale, and an updater reporting no changes does not establish their accuracy.

Use this as a software project and reference interface. Before making an application decision, verify the relevant information on the exam's official website. Priorities and difficulty labels are editorial data, not personalized recommendations. Automated proposals require source checking before merge; an LLM response is not verification.

## Run locally

Use npm and a supported Node.js release meeting the [Next.js minimum of Node 20.9](https://nextjs.org/docs/app/getting-started/installation#system-requirements). The existing update workflow selects Node 20.

```sh
git clone https://github.com/shubhamsharma173/btech-entrance-exams-2026.git
cd btech-entrance-exams-2026
npm ci
npm run dev
```

Open `http://localhost:3000`. To build and serve the production application:

```sh
npm run build
npm run start
```

The existing `npm run lint` script still invokes `next lint`; it has not been migrated to the direct ESLint/Biome configuration expected by current Next.js. Do not treat that script as a working quality gate. This documentation update does not change application dependencies or tooling.

## How data updates work

[`scripts/update-exams.mjs`](scripts/update-exams.mjs) reads the dataset, selects active exams with nearby deadlines and caps a normal run at 20 records. If no deadlines fall within the configured window, it falls back to active exams. A targeted `--exam` run bypasses that selection.

For each selected exam, the script searches through Tavily and asks Groq to propose a structured diff. Only registration dates, exam/result dates and application fees may change. The script applies value checks, validates the dataset shape and writes through a temporary file before renaming. New-exam suggestions are flagged for manual review rather than added automatically.

Set `GROQ_API_KEY` and `TAVILY_API_KEY` in the process environment to run the updater. They are only needed for update/API checks; never commit their values. The scripts read `process.env` directly and do not load a `.env` file themselves. Calls use external services and are subject to their limits and charges.

Start with a targeted dry run after supplying those environment variables:

```sh
npm run update-data -- --dry-run --exam BITSAT
```

`--dry-run` still calls the external APIs but does not write the dataset or update log. Running without it can update `data/exams-data.json` and `scripts/.last-update-log.json`; inspect the diff and verify every changed value against its official source.

Despite its filename, [`.github/workflows/weekly-update.yml`](.github/workflows/weekly-update.yml) is configured to run **daily at 02:00 UTC**. It checks out `dev`, uses repository secrets, and creates or updates `auto/daily-exam-update` with a pull request targeting `dev`. Its PR checklist calls for official-source verification, full-diff review, a build and preview checks. The workflow does not itself establish that those reviews have happened or publish changes to `main`.

## Checks and coverage boundaries

| Command | Purpose | External calls |
| --- | --- | --- |
| `npm run build` | Next.js production build | May fetch configured remote font resources |
| `npm run test:update:unit` | JSON extraction, field restrictions, date/fee checks, selection and temporary-file checks | No API calls |
| `npm run test:update:api` | Tavily and Groq connectivity smoke checks | Yes; both API keys required |
| `npm run test:update:integration` | Runs the production updater in dry-run mode for BITSAT and checks for unintended writes | Yes; both API keys required |
| `npm run test:update` | Runs all three updater-test phases | API phases skip when keys are absent |

Several unit-test helpers duplicate production logic rather than importing it, so those checks alone do not prove the updater behaves identically. The API/integration phases can skip without keys; a successful process exit does not mean every phase ran. There is no claim of complete application, accessibility or end-to-end coverage here. No checks were rerun as part of this README-only revision.

## Repository map

```text
app/                         Pages, layout, metadata and styles
components/                  Exam cards, detail views, filters and countdowns
data/exams-data.json          Dated exam dataset
types/exam.ts                Dataset types
scripts/update-exams.mjs      Search/LLM-assisted update pipeline
scripts/test-update.mjs       Phased updater checks
.github/workflows/           Scheduled data-update workflow
.github/PULL_REQUEST_TEMPLATE/ Data review checklist
```

[`ARCHITECTURE.md`](ARCHITECTURE.md) and [`DEPLOYMENT.md`](DEPLOYMENT.md) retain earlier design and deployment notes; some describe the original narrower dataset. Use the checked-in configuration and this README for current scope and commands.

## Next improvements

- Refresh and source-check the dataset, recording provenance for individual changes.
- Share validation helpers between the updater and tests, and add malformed-response and partial-failure coverage.
- Migrate lint tooling and add automated build, type and browser checks.
- Keep automated suggestions separate from reviewed published data.

## Attribution and licensing

Data-source credits are recorded in `data/exams-data.json`; individual records include official links. Source material remains subject to its original terms. The package manifest declares MIT, but this repository does not yet include a standalone license file; that documentation gap should be resolved before relying on the declaration for reuse.
