# isUD Website

Next.js application for managing Universal Design projects, checklists, teams, and certification progress.

## Getting Started

Install dependencies:

```powershell
npm install
```

Apply database migrations and seed the reference data:

```powershell
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

Start the development server:

```powershell
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

## Useful Scripts

- `npm run dev` starts Next.js on port 3001 and clears stale `.next` output first.
- `npm run build` creates a production build. It refuses to run while the dev server is active to avoid missing CSS assets.
- `npm run smoke` checks that the local page and generated CSS load correctly.
- `npm run lint` runs ESLint.

## Project Structure

- `src/app/(dashboard)` contains authenticated project pages.
- `src/app/(marketing)` contains public/legal/register pages.
- `src/app/api` contains Next.js route handlers.
- `src/components` contains shared UI and feature components.
- `src/lib` contains auth, Prisma, and scoring helpers.
- `prisma` contains the schema, migrations, and seed script.
- `data/legacy` and the root `UD_S_*.csv` files are seed inputs and should stay committed.

## Notes

Keep secrets in `.env`; it is ignored by git.
