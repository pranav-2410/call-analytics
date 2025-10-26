# Call Analytics UI (React + TypeScript + Supabase)

A demo React + TypeScript frontend for the Full Stack assessment:
- Displays call analytics charts (dummy data)
- Lets user save custom chart values to Supabase using their email
- Fetches previous values and prompts before overwriting
- Built with Vite, TailwindCSS, Recharts, Supabase JS

## Quick start (local)

1. Unzip the project and `cd` into it:
```bash
cd call-analytics-ui-full
```

2. Install dependencies
```bash
npm install
```

3. Create a Supabase project (see steps below). Copy the **URL** and **Anon Public Key** into a `.env` file based on `.env.example`.

4. Run locally
```bash
cp .env.example .env
# edit .env to add your supabase URL & anon key
npm run dev
```

Open http://localhost:5173

## Supabase setup

1. Sign up at https://app.supabase.com and create a new project (free tier is fine).
2. In your project, go to **Settings → API** to find:
   - `Project URL` (SUPABASE_URL)
   - `Anon Public` (SUPABASE_ANON_KEY)

3. Create table schema: Go to **SQL Editor** and run:
```sql
create extension if not exists "pgcrypto";

create table public.user_chart_values (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  chart_key text not null,
  chart_data jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index on public.user_chart_values (email);
alter table public.user_chart_values add constraint uq_email_chartkey unique (email, chart_key);
```

4. Row Level Security (RLS) and Policies:
For the demo, to allow client usage with anon key, enable permissive policies:

```sql
alter table public.user_chart_values enable row level security;

create policy "allow anon select" on public.user_chart_values for select using (true);
create policy "allow anon insert" on public.user_chart_values for insert with check (true);
create policy "allow anon update" on public.user_chart_values for update using (true) with check (true);
```

> NOTE: These policies are permissive. For production, use proper auth and restricted policies.

5. Save the SUPABASE_URL and SUPABASE_ANON_KEY in your `.env` and in Vercel environment variables (if deploying).

## Deploy to Vercel
1. Push repo to GitHub.
2. In Vercel dashboard, create a new project → import from GitHub.
3. Set environment variables in Vercel: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Build command: `npm run build` and Output directory: `dist`.

<img width="1710" height="775" alt="image" src="https://github.com/user-attachments/assets/a520f4e6-2560-4418-a1ff-3f04d7ee81cc" />

<img width="1700" height="953" alt="image" src="https://github.com/user-attachments/assets/53182df5-eb62-4569-a102-bebf890708a9" />
