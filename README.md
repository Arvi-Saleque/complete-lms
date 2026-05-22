# Madrasa Admin Panel

Next.js App Router admin panel for a single madrasa/institution. It uses Supabase Auth, Supabase Postgres, Row Level Security, Tailwind CSS, and Vercel-friendly environment variables.

## Features

- Principal-only admin login
- Student CRUD with classes and sections
- Fees, fee types, payments, due tracking, receipts, and student fee statements
- Attendance / hajira by class, section, and date
- Exams, subjects, marks entry, result sheets, grades, pass/fail, and merit positions
- Custom student metadata fields
- Dashboard and printable reports

## Requirements

- Node.js 20+
- A Supabase project
- A Vercel project for deployment

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

3. Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000/admin/login`.

## Supabase Setup

1. In Supabase, open SQL Editor.
2. Run the full SQL in `supabase/schema.sql`.
3. Create an auth user:
   - Supabase Dashboard > Authentication > Users > Add user
   - Use the principal/admin email and password.
4. Copy the new auth user UUID.
5. Run this SQL with that UUID:

```sql
insert into public.profiles (id, full_name, role)
values ('AUTH_USER_UUID_HERE', 'Principal', 'principal')
on conflict (id)
do update set role = 'principal', full_name = excluded.full_name;
```

Only users with `profiles.role = 'principal'` can access `/admin/*` in this version.

## RLS / Security

The schema enables Row Level Security on every application table. Policies use `public.is_principal()` so:

- anonymous users cannot read or write admin data
- logged-in non-principal users cannot manage admin data
- principal users can manage the first-version admin records

The `public.add_fee_payment(...)` RPC also checks `public.is_principal()` before inserting payments.

## Vercel Deployment

1. Push the repository to GitHub.
2. Import the repo in Vercel.
3. Add environment variables in Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

4. Deploy.
5. In Supabase Auth settings, add your deployed Vercel URL to allowed redirect/site URLs if needed.
6. Confirm the principal user can log in at:

```text
https://your-vercel-domain/admin/login
```

## Useful Commands

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Notes

- `.env.local` is ignored by git.
- `node_modules`, `.next`, build output, and `.vercel` are ignored.
- Demo seed data lives in code. The dashboard preset buttons always require two confirmations before changing data.
- Use Fee Types for money-related fields. Custom Fields are for non-money metadata only.
- Roll numbers are unique per class, section, and session. The same roll may exist in another section of the same class/session.
