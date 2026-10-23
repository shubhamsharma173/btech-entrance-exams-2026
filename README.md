# Entrance Exam Guide

A Next.js guide to Indian engineering, medical, law, management and design entrance exams. The repository name reflects its original B.Tech-only scope.

The website displays searchable profiles, admission cycles, priority and difficulty filters, date/fee sorting, registration status, detailed exam information and official sources. There are no accounts, online tests, scores, payments or admin database.

## Data and verification

The application reads **data/exams-data.json**, not the older root-level exams-data.json sometimes present in local copies. Profiles include historical, merged, discontinued and partially checked records.

Each record has a cycleYear and explicit status. verification.reviewedAt records a review attempt; it does not mean the whole profile is accurate. verification.fields identifies the specific fields checked, their dates, official sources and qualifications. Only a full review may be marked verified. Unconfirmed numeric values use null, and unresolved facts are stated explicitly. Dataset lastUpdated is the content revision date, not a promise that every field was checked then.

Read [the evidence and unresolved items](docs/data-verification.md) before using or editing the data. Editorial priority and difficulty labels are not personalized recommendations. Official sources can change after a review.

## Setup

Use **Node.js 22.14 or newer** (Node 22 is used in CI) and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Build and serve production locally with:

```sh
npm run build
npm run start
```

The site needs no API keys or database. Optional configuration is documented in [.env.example](.env.example). NEXT_PUBLIC_SITE_URL controls the canonical origin, sitemap and robots. GOOGLE_SITE_VERIFICATION should only contain your real Search Console token.

## Validation

```sh
npm run validate:data
npm run lint
npm run typecheck
npm test
npm audit
npm run build
```

Tests exercise the production date/fee helpers and updater implementation, including mocked failures and filesystem behavior. Normal tests are offline. The separate test:update:api command deliberately contacts external services and requires API keys.

Next.js and React are pinned to reviewed releases; npm ci uses the committed lockfile. ESLint 9 is temporarily pinned because the Next.js React/import/accessibility plugins declare compatibility through ESLint 9. npm warns that this linter major is out of support; upgrade it when those plugins support ESLint 10. This is a development-tool limitation, not an exception to dependency auditing.

## Research updates

The updater produces **review proposals**, never edits the published dataset or marks fields verified. It uses Tavily search and Groq. Supply GROQ_API_KEY and TAVILY_API_KEY in the process environment; Node scripts do not automatically load .env files.

```sh
# Offline integrity validation
npm run validate:data

# External research, no file writes
node scripts/update-exams.mjs --dry-run --exam BITSAT

# External research, writes a local review report only
node scripts/update-exams.mjs
```

External calls are subject to provider quotas and charges. Missing keys, invalid responses, incomplete evidence and failed requests must not be interpreted as verified unchanged data. Reports distinguish failures, unchanged responses and proposals. A source URL in an AI proposal still requires a human to read and confirm it.

The daily workflow is configured for 02:00 UTC (07:30 IST). It validates the project and uploads research reports for review with read-only repository permissions. It does not push commits, open or merge data changes, publish data, or require GH_PAT. The previously disabled remote schedule remains disabled until deliberately enabled after the repaired code is reviewed.

To publish a data correction: inspect the official source for the correct cycle, preserve every session and qualification, edit the dataset, add field-level evidence and review notes, run validation, review the preview, and merge through the normal pull-request process.

## Structure

| Path | Role |
| --- | --- |
| app/ | Home page, metadata, robots, sitemap and generated social images |
| components/ | Filters, cards, details dialog and registration status |
| lib/exam-utils.ts | Shared UI date, fee and verification rules |
| lib/site.ts | Shared public site origin and metadata text |
| data/exams-data.json | Published profiles |
| docs/data-verification.md | Review evidence and unresolved data |
| scripts/update-exams.mjs | Research-only CLI |
| scripts/lib/ | Imported updater validation/research helpers |
| scripts/test-update.mjs, tests/ | Offline regression tests |
| .github/workflows/ | Pull-request checks and research schedule |

The old update-data.py and add-private-exams.py migrations now refuse execution because rerunning them would corrupt current categories or duplicate records. They remain as historical reference. Local untracked mockups, the root JSON snapshot and the separate antigravity prototype are not used by this application.

See [architecture](ARCHITECTURE.md) and [deployment](DEPLOYMENT.md). The package declares MIT; no separate license grant is introduced by this maintenance change. Data sources retain their original terms.
