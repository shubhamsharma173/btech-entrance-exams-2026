# Architecture

## Runtime

The application uses Next.js App Router, React, TypeScript and Tailwind CSS. The production build prerenders the home page. There is no application database, account system or browser API for updating records.

```text
data/exams-data.json -> app/page.tsx -> ExamList
                                      |-- FilterBar
                                      |-- ExamCard -> registration status
                                                   -> ExamDetailsModal
```

Layout, header and footer are rendered on the server. The list, filters, cards, countdown/status and modal use client-side interaction. All profiles are supplied from the same static dataset; filtering does not fetch another dataset.

## Data semantics

cycleYear labels the admission/exam cycle used by the official source, not the computer's current year. It may differ from the calendar year of registration or examination, such as an admissions exam held in December of the previous year.

status distinguishes active, discontinued, merged and needs-review profiles. Active means an examination exists; it does not mean applications are open.

verification.reviewedAt is an attempted review date. verification.status distinguishes unverified, partial and fully verified profiles. verification.fields maps field names to checkedAt, sourceUrl and optional qualifications. Partial checks never establish that unrelated fees, placement statistics, eligibility or patterns are verified.

lastUpdated records a dataset edit. It must not be used as a blanket freshness guarantee. Unverified values and historical dates are labelled in the interface, and unknown numeric pattern values are null rather than invented zeros.

## Interface rules

Production helpers in lib/exam-utils.ts are also used by regression tests. They keep fee display text intact, extract numeric fees without concatenating categories/ranges, and handle unknown values separately. Date comparisons only rely on valid exact dates with the necessary field evidence. Month-only and tentative dates do not become fabricated deadlines. Session information remains intact, and confirmed end dates use the end of the Indian calendar day.

The UI exposes genuine priority labels and category-independent sorting. The details dialog includes source notes, accessible dialog semantics and keyboard/focus behavior. Application wording is conditional on sufficiently recent, verified registration bounds; other records link to the official site without implying registration is open.

## Research pipeline

The CLI imports its validation and selection code from scripts/lib. It is safe to import in tests and has an explicit entry-point guard. It treats fetched text as evidence to inspect, not executable instructions.

Tavily supplies search evidence and Groq proposes a restricted set of changes. Only registrationStart, registrationEnd, examDate, resultDate and applicationFee are eligible. A proposal requires appropriate source evidence, schema checks and compatible date chronology. The updater never edits the published JSON or its verification fields.

Selection is bounded and rotates to avoid permanently skipping records. Multi-session dates are retained. Retries and request/job timeouts are bounded. Missing evidence and API failures remain failures/unverified outcomes rather than successful checks. The CLI writes a review report only when not using --dry-run; workflow artifacts retain reports for review.

## SEO and configuration

lib/site.ts defines one public origin for canonical metadata, sitemap and robots. Social images are generated from app/opengraph-image.tsx and app/twitter-image.tsx. The page uses CollectionPage structured data rather than representing exam fees as offers for credentials.

The sitemap reflects the dataset revision. The site does not claim separate exam routes or full-profile initial rendering. No external Google Fonts stylesheet or analytics script is required.

## Validation boundaries

CI runs JSON integrity validation, ESLint, TypeScript, actual production-helper tests, dependency audit and a production build. Offline tests cover logic and mocked I/O; they do not validate the truth of provider responses or official admissions information. Browser checks and official-source review remain necessary.

No performance, accessibility or SEO score is claimed without a recorded measurement.
