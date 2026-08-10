# Capital Growth Tracker

A bilingual (English and Spanish) simulator for projecting compound capital growth by day, week, month, or year.

## Development

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Test and build

```bash
npm run test
npm run build
npm run preview
```

`npm run build` produces a complete static site in `out/`.

## GitHub Pages

The deployment workflow runs only after a push to `main`; merging a pull request into `main` creates such a push. It publishes the generated `out/` directory to GitHub Pages.

Before the first deployment, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. The production site uses the `/capital-growth-tracker` base path. To use a different path for another static host, set `NEXT_PUBLIC_BASE_PATH` when building.
