# Deployment and operations

## Before publication

Use Node 22.14+ and the committed lockfile. On a clean checkout run:

```sh
npm ci
npm run validate:data
npm run lint
npm run typecheck
npm test
npm audit
npm run build
```

Review the source evidence and unresolved records in docs/data-verification.md. A green build verifies the software, not the truth of every admission fact.

## Vercel

The existing Vercel project is entrance-exams, with public origin https://entrance-exams.vercel.app. Its connected production branch was main when inspected on 23 October 2026.

Import/connect the existing repository rather than creating a duplicate project. Use the Next.js framework preset, Node 22, npm ci and npm run build. Review a branch preview before merging into the configured production branch. A production-branch merge may trigger automatic publication.

Set NEXT_PUBLIC_SITE_URL to the canonical production origin when using a custom domain. It is embedded at build time and must be updated and rebuilt for a domain change. The same value drives canonical metadata, robots and sitemap. GOOGLE_SITE_VERIFICATION is optional; leave it unset until Search Console provides a real token.

The web application does not require Groq, Tavily or GitHub tokens. Keep research credentials in GitHub Actions secrets instead of browser-visible environment variables.

## Local production smoke check

```sh
npm run build
node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3107
```

Inspect /, /robots.txt, /sitemap.xml, /opengraph-image and /twitter-image. Check category switching, search, sorting, source notes, full fee/date text, keyboard dialog controls and a narrow viewport. Stop the temporary server after testing.

## Research schedule

.github/workflows/weekly-update.yml retains its historical filename but defines daily research at 02:00 UTC / 07:30 IST. It has read-only repository permissions and uploads review artifacts. It does not change or publish data.

The remote workflow was disabled_manually at the maintenance audit. Shipping a workflow file does not prove it has been enabled. After review, enable it deliberately in GitHub Actions and first dispatch a targeted run with the exact active exam name in `exam` and `dry_run` enabled. Check the uploaded log and any failures before relying on scheduling. Only GROQ_API_KEY and TAVILY_API_KEY are needed; the repaired workflow has no GH_PAT requirement.

A partial failure is not evidence that the remaining profiles are accurate. Investigate failed requests, provider quotas and malformed evidence. Keep source checking and human-reviewed data edits separate from automated proposals.

## Rollback

Revert the reviewed change or promote a known-good Vercel deployment through the existing project. Restore the matching dataset and lockfile with the code. Never rerun the retired Python migrations as a recovery method.

Keep the earlier antigravity prototype and local untracked snapshots separate from the production source; they are historical references, not database backups to overwrite current profiles.
