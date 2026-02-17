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

### Useful scripts
```bash
npm run lint
npm run typecheck
npm run build
npm run start
```
