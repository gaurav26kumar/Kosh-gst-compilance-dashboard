# GST Compliance Dashboard

A GST (Goods & Services Tax) compliance tool for Indian businesses — invoice
generation with automatic CGST/SGST/IGST calculation, GST return tracking,
and analytics. Built with Next.js 16 (App Router), React 19, TypeScript,
Tailwind CSS v4, and Supabase (Postgres + Auth).

## Stack

- **Next.js 16** (Turbopack, App Router)
- **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Supabase** — Postgres database + Auth (this is the entire backend, there
  is no separate API server)
- **Recharts** for analytics charts

## Getting started

### 1. Requirements

- Node.js **20.9+**

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **Project Settings → API** and copy your **Project URL** and
   **anon public key**.
3. Create `.env.local` in the project root:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Open **SQL Editor** in your Supabase project, paste the contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates
   the `profiles`, `invoices`, `invoice_items`, and `gst_returns` tables
   along with Row Level Security policies so each user only ever sees their
   own data.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. First-time app flow

1. Sign up at `/signup`. If your Supabase project has email confirmation
   enabled (Authentication → Providers → Email), confirm the email before
   logging in.
2. Go to **Profile** and fill in your business name + GSTIN — this auto-fills
   the seller GSTIN when creating new invoices.
3. Create an invoice at **Invoices → New Invoice** to see the tax engine
   (CGST/SGST vs IGST, RCM, Export/SEZ handling) in action.
4. Log GST returns under **Returns** and view trends under **Analytics**.

## Project structure

```
src/
  app/
    (auth)/            # /login, /signup — public routes
    (dashboard)/        # /dashboard, /invoices, /returns, /analytics, /profile
                         # all behind auth, wrapped in a shared sidebar layout
  components/ui/        # Shared client components (forms, sidebar, charts)
  lib/
    gst.ts               # GST calculation engine: GSTIN validation, state-code
                          # lookup, CGST/SGST/IGST split, invoice totals
    supabase/            # Browser + server Supabase client factories
  proxy.ts               # Auth guard for protected routes (Next 16's
                          # replacement for middleware.ts)
  types/                 # Shared TypeScript types matching the DB schema
supabase/
  schema.sql             # Full DB schema + RLS policies — run this first
```

## Notes

- All data access happens directly from pages/components via the Supabase
  client (`supabase.from('invoices')...` etc.) — there is no custom API
  route layer.
- `next.config.ts` and `tsconfig.json` are left at their defaults; adjust as
  needed for your deployment target (Vercel, Netlify, etc. all support
  Next.js 16 out of the box).
