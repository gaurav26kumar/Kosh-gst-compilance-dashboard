# 🧾 Kosh — GST Compliance Dashboard

A modern GST (Goods & Services Tax) compliance tool built for Indian businesses — generate GST-correct invoices, track returns, and visualize tax trends, all in one dashboard. Includes a full marketing landing page with a 3D hero and app-wide light/dark theming.

**🔗 Live demo:** [gst-invoice-app-fawn.vercel.app](https://gst-invoice-app-fawn.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?logo=tailwindcss)
![Three.js](https://img.shields.io/badge/Three.js-0.170-black?logo=three.js)
![Supabase](https://img.shields.io/badge/Supabase-Postgres_%2B_Auth-3ECF8E?logo=supabase)

---

##  Features

- **3D marketing landing page** — an Apple-style hero built with Three.js, introducing the Ledger API and Dashboard products before visitors ever sign in.
- **Light & dark mode, everywhere** — one shared theme system (navy/paper + brass/teal accents) covers the landing page and the full app, persists across sessions, and switches with no flash on load.
- **Automatic tax engine** — enter a price and tax slab, the app works out CGST/SGST vs. IGST based on whether the transaction is intra-state or inter-state, straight from the buyer's and seller's GSTIN.
- **GSTIN-aware** — validates GSTIN format and derives the state of registration directly from the GSTIN's state code.
- **Special supply handling** — built-in support for Reverse Charge Mechanism (RCM), Exports, and SEZ supplies, both "with payment of IGST" and "without payment (LUT)".
- **Invoice management** — create, view, and delete invoices, with printable invoice output.
- **GST returns tracking** — log return filings and their status over time.
- **Analytics dashboard** — visual trends across invoices and tax collected, powered by Recharts.
- **Secure by default** — Supabase Auth + Postgres Row Level Security means every user only ever sees their own data.
- **Production-hardened** — themed 404 and error pages, a generated favicon, loading states, and a clean `next build` with strict TypeScript and ESLint.

##  Tech Stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| UI | [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) with a shared CSS-variable design system |
| 3D | [Three.js](https://threejs.org) for the landing page hero |
| Backend | [Supabase](https://supabase.com) — Postgres + Auth (no separate API server) |
| Charts | [Recharts](https://recharts.org) |

##  Screenshots

 ![Landing — dark] (<img width="1840" height="895" alt="Screenshot 2026-07-08 153122" src="https://github.com/user-attachments/assets/596a87a1-2f65-4cc8-9006-ac1cc00e3eb0" /> )
 
 ![Landing — light](<img width="1848" height="895" alt="Screenshot 2026-07-08 153145" src="https://github.com/user-attachments/assets/b703912c-f2e5-4e8e-9725-9c375a54d06e" />)
 
 ![Dashboard](<img width="1844" height="798" alt="Screenshot 2026-07-08 153201" src="https://github.com/user-attachments/assets/fafa55a6-1e7b-43b8-9823-5d040382ca47" /> )
 
 ![New Invoice](<img width="1850" height="898" alt="Screenshot 2026-07-08 153328" src="https://github.com/user-attachments/assets/a3530818-ff98-49d2-865c-2a329ce76b35" />)

##  Getting Started

### Requirements

- Node.js **20.9+**
- A free [Supabase](https://supabase.com) account

### 1. Clone and install

```bash
git clone https://github.com/gaurav26kumar/gst-invoice-app.git
cd gst-invoice-app
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **Project Settings → API** and copy your **Project URL** and **anon public key**.
3. Create a `.env.local` file in the project root:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Open the **SQL Editor** in your Supabase project, paste the contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates the `profiles`, `invoices`, `invoice_items`, and `gst_returns` tables along with Row Level Security policies.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page 🎉 — use the toggle in the nav to flip between light and dark, it'll stay in sync once you log in.

### 4. First-time app flow

1. From the landing page, click **Log in** (or go to `/signup` directly). If email confirmation is enabled in your Supabase project (**Authentication → Providers → Email**), confirm the email before logging in.
2. Go to **Profile** and fill in your business name + GSTIN — this auto-fills the seller GSTIN on new invoices.
3. Create an invoice under **Invoices → New Invoice** to see the tax engine (CGST/SGST vs. IGST, RCM, Export/SEZ) in action.
4. Log GST returns under **Returns** and track trends under **Analytics**.

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/            # /login, /signup — public routes
│   ├── (dashboard)/       # /dashboard, /invoices, /returns, /analytics, /profile
│   │                      # all behind auth, wrapped in a shared sidebar layout
│   ├── icon.tsx           # Generated favicon / apple-icon.tsx — apple touch icon
│   ├── not-found.tsx      # Themed 404
│   ├── global-error.tsx   # Themed top-level error boundary
│   └── page.tsx           # "/" — renders the marketing landing page
├── components/
│   ├── marketing/         # Landing page: Landing.tsx, HeroScene.tsx (Three.js),
│   │                      # Landing.module.css
│   ├── theme/             # ThemeProvider + ThemeToggle — shared across the
│   │                      # landing page and the app, persisted to localStorage
│   └── ui/                # Shared client components (forms, sidebar, charts)
├── lib/
│   ├── gst.ts             # GST calculation engine — GSTIN validation, state
│   │                      # lookup, CGST/SGST/IGST split, invoice totals
│   └── supabase/          # Browser + server Supabase client factories
├── proxy.ts               # Auth guard for protected routes (Next 16's
│                          # replacement for middleware.ts)
└── types/                 # Shared TypeScript types matching the DB schema
supabase/
└── schema.sql             # Full DB schema + RLS policies — run this first
```

##  Theming

Light and dark mode are driven by CSS custom properties defined once in `globals.css` (`--bg`, `--surface`, `--ink`, `--brass`, `--teal`, etc.) and flipped by a single `data-theme` attribute on `<html>`. `ThemeProvider` reads the saved preference from `localStorage` before React hydrates (via an inline script in the root layout) so there's no flash of the wrong theme, and the same toggle component is used on the landing page nav and in the app's sidebar — switching one switches both.

##  How the tax engine works

GST in India isn't a flat rate — it depends on where the buyer and seller are registered:

- **Intra-state** (same state) → split equally into **CGST + SGST**
- **Inter-state** (different states) → charged as a single **IGST**

The app determines this automatically by comparing the state codes embedded in the seller's and buyer's GSTIN, then applies the correct split for the chosen tax slab (0%, 5%, 12%, 18%, or 28%), with optional cess. It also correctly zeroes out tax collection for **RCM** (recipient pays) and **Export/SEZ under LUT** (no payment of IGST), while still tracking those invoices for compliance records.

##  Deployment

This app deploys cleanly to any platform that supports Next.js 16 (Vercel, Netlify, etc.) since Supabase is the entire backend — there's no separate server to host.

**Deploying to [Vercel](https://vercel.com):**

1. Import this repo into Vercel.
2. Add the two environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the project settings.
3. Deploy — Vercel auto-detects Next.js, no config needed.
4. In Supabase, add your production URL under **Authentication → URL Configuration** so auth redirects work correctly.

##  Roadmap

- [ ] PDF export for invoices
- [ ] GSTR-1 / GSTR-3B export formats
- [ ] Multi-currency support for export invoices
- [ ] E-invoicing / IRN integration

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/gaurav26kumar/gst-invoice-app/issues).

## 📄 License

This project is currently unlicensed. _Consider adding an [MIT License](https://choosealicense.com/licenses/mit/) if you'd like others to freely use and contribute to this project._

---

<p align="center">Built with ❤️ for Indian businesses navigating GST compliance</p>
