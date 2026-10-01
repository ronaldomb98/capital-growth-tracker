# Capital Growth Tracker

A bilingual (English and Spanish) simulator for projecting compound capital growth per trade, with summaries by day, week, month, or year.

## Development

Requires Node.js 22.12 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Test and build

```bash
npm run test
npm run lint
npm run typecheck
npm run build
npm run preview
```

`npm run build` produces a complete static site in `out/`.

## GitHub Pages

The deployment workflow runs only after a push to `main`; merging a pull request into `main` creates such a push. It publishes the generated `out/` directory to GitHub Pages.

Before the first deployment, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. The production site uses the `/capital-growth-tracker` base path. To use a different path for another static host, set `NEXT_PUBLIC_BASE_PATH` when building.

## Trade planning

Choose a date range and trades per week to calculate the total, or choose a trade count and trades per week to calculate the end date from a chosen start. Dates are inclusive and use your local calendar date, independent of daylight saving time.

Weeks run Monday through Sunday. For each week, the NYSE calendar excludes weekends and standard full-day holidays. The weekly quota is distributed across its open sessions: trade `i` (starting at zero) uses session `floor(i × openSessions / tradesPerWeek)`. For example, two trades in a normal week fall on Monday and Wednesday; ten trades produce two per session. Holiday weeks retain the weekly quota, distributed over fewer sessions. Partial weeks keep only scheduled trades inside the range. Multiple trades on the final date can mean a date-range query includes more trades than a count-based query ending on that same date.

Growth compounds once per trade. Charts show daily closing balances, while table summaries include every trade. Limits are 1–100 trades per week, 4,000 total trades, and dates from 2000 through 2100. Excessively long or overflowing projections show validation instead of silently truncating results. Ad-hoc exchange closures and early closing times are outside the calendar model.

## Dependency compatibility

Antares 0.9 uses composed fields (`Label`, `Group`, `Input`, `Button`, `FieldError`) and composed date pickers. TypeScript stays on the latest 6.0 patch because `@typescript-eslint/parser` 8.71 requires TypeScript below 6.1; TypeScript 7 is not yet supported by that parser. ESLint stays on the latest 9.x release because the React, import and accessibility plugins bundled with Next.js do not support ESLint 10 yet.
