# closetManagerAI

AI Closet Manager and Stylist.

## Local Development

### Prerequisites
- Node.js 20+
- npm 10+
- Docker Desktop (required for local Supabase)
- Supabase CLI (installed with this project via npm)

### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment variables
```bash
cp .env.example .env.local
```

Set values in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3A) Use Supabase locally (CLI-first)
```bash
npx supabase init
npx supabase start
npx supabase db reset
npx supabase status
```

Use the `API URL` and `anon key` from `npx supabase status` to fill `.env.local`.

### 3B) Or connect to a hosted Supabase project (CLI-first)
```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
npx supabase projects api-keys --project-ref <your-project-ref>
```

Set:
- `NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from api-keys command>`

### 4) Run the app
```bash
npm run dev
```

Open `http://localhost:3000`.

### Outfit Suggestions (Milestone A)
- Sign in and add enough closet items to include at least one `top`, one `bottom`, and one `shoes`.
- Open `http://localhost:3000/outfits`.
- Submit occasion/vibe/weather/constraints to generate 1-3 outfit suggestions from your own closet items only.
- Open `http://localhost:3000/settings` to reset all closet items for the signed-in user (requires typing `DELETE`).

### Seeding
Use the one-time seed script to add a realistic closet for an existing user.

```bash
SEED_EMAIL=test@example.com SEED_PASSWORD=testpass npm run seed
```

Notes:
- The script reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from `.env.local`.
- If `SEED_EMAIL` and `SEED_PASSWORD` are not provided, it defaults to `test@example.com` / `testpass`.
- The script is idempotent and only inserts missing items for the signed-in user.

### Useful scripts
```bash
npm run lint
npm run typecheck
npm run build
npm run start
npm run seed
```
