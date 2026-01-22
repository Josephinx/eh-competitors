# Escape Hatch Competitor Intelligence

A competitor research dashboard for tracking bitcoin-backed lending competitors, built with Next.js and Supabase.

![Escape Hatch](https://img.shields.io/badge/Escape%20Hatch-Competitor%20Intel-F26522)

## Features

- **Comparison Matrix** - Side-by-side competitor analysis with priority categories
- **Competitor Management** - Add, edit, and categorize competitors (Core/Adjacent/Contrast)
- **Claims Tracking** - Track verified claims with source URLs and verbatim quotes
- **Export Options** - PNG, CSV, Markdown, and Investor Summary exports
- **Dark/Light Theme** - Automatic theme detection with manual toggle
- **Mobile Responsive** - Collapsible sidebar for smaller screens

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Auth**: Cookie-based session with bcrypt

## Project Structure

```
eh-competitor-intel/
├── app/                    # Next.js App Router pages
│   ├── api/                # API routes
│   │   ├── auth/           # Authentication
│   │   ├── claims/         # Claims CRUD
│   │   ├── competitors/    # Competitors CRUD
│   │   ├── export/         # Export generation
│   │   └── sources/        # Sources CRUD
│   ├── comparison-matrix/  # Matrix view page
│   ├── competitors/        # Competitors list & detail
│   ├── import-csv/         # CSV import page
│   └── login/              # Login page
├── components/             # React components
│   ├── ui/                 # Reusable UI primitives
│   └── *.tsx               # Feature components
├── lib/                    # Utilities & config
│   └── supabase/           # Supabase client & queries
├── public/                 # Static assets (logos)
├── supabase/               # Database migrations
│   └── migrations/         # SQL migration files
└── types/                  # TypeScript definitions
```

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account (free tier works)
- npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/Josephinx/eh-competitor-intel.git
cd eh-competitor-intel
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migrations in order:
   - `supabase/migrations/001_create_schema.sql`
   - `supabase/migrations/002_seed_data.sql`
   - `supabase/migrations/003_add_claim_details.sql`

### 3. Configure Environment

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AUTH_PASSWORD=your-secure-password
```

Find your Supabase keys in: **Project Settings → API**

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Import Project** → Select your repo
3. Add environment variables (same as `.env.local`)
4. Click **Deploy**

### 3. Connect Custom Domain

1. In Vercel: **Settings → Domains → Add**
2. Enter your domain (e.g., `intel.escapehatch.com`)
3. In Namecheap: Add DNS records as shown by Vercel

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (safe for client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) |
| `AUTH_PASSWORD` | Password for vault login |

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth` | Login authentication |
| GET/POST | `/api/competitors` | List/Create competitors |
| GET/PUT/DELETE | `/api/competitors/[id]` | Read/Update/Delete competitor |
| GET/POST | `/api/claims` | List/Create claims |
| GET/PUT/PATCH/DELETE | `/api/claims/[id]` | Read/Update/Delete claim |
| POST | `/api/claims/[id]/verify` | Verify a claim |
| GET | `/api/export` | Generate exports |

## License

Private - Escape Hatch © 2026
