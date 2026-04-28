# Disaster Response MIS - Next.js Frontend

This repository contains a Next.js frontend and API layers for the Disaster Response MIS. It connects to an existing SQL Server database named `DisasterResponseMIS`.

Prerequisites
- Node.js 18+
- SQL Server with the provided database and connection string

Setup

1. Copy `.env.example` to `.env.local` and fill your DB credentials and `NEXTAUTH_SECRET`.

2. Install dependencies:

```bash
npm install
```

3. Run the app:

```bash
npm run dev
```

Files generated
- `src/lib/db.ts` - MSSQL pool and helpers
- `src/lib/auth.ts` - NextAuth configuration
- `src/app/api/*` - API routes interacting with the database
- `src/actions/*` - server-side helpers (transactions)
- `src/app/(dashboard)` - dashboard layouts and pages

Notes
- All DB queries use parameterization helpers in `src/lib/db.ts`. Session context is set before writes where applicable.
- This scaffold assumes the database schema, triggers, and views already exist and should not be modified.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
