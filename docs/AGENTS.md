# AGENTS.md — 底噪 (Background Noise)

## Quickstart

```bash
# Terminal 1 — backend
cd backend && cp .env.example .env && npm install
npx prisma generate && npx prisma db push && npm run prisma:seed
npm run start:dev        # → http://localhost:3000/api/v1

# Terminal 2 — frontend
cd frontend && cp .env.example .env && npm install
npm run dev              # → http://localhost:5173
```

Demo login: `13800000001` / `demo123456`

## Architecture

- **Backend**: NestJS (Express) + Prisma + SQLite (dev) / PostgreSQL (prod via `docker-compose.yml`)
- **Frontend**: React 18 + TypeScript + Vite, mobile-first PWA
- **API prefix**: `/api/v1` (set in `backend/src/main.ts`)
- **Dev proxy**: Vite proxies `/api` and `/uploads` → `localhost:3000`; no CORS config needed in dev
- **Auth**: JWT (passport-jwt), token in `Authorization: Bearer <token>`, stored in browser `localStorage` as `bn_token`
- **Two guard levels**: `JwtAuthGuard` (required) and `OptionalJwtGuard` (auth optional)

## Database

- **SQLite** in dev: `DATABASE_URL="file:./dev.db"` (file path relative to `backend/`)
- **PostgreSQL** for prod: `docker compose up`, change `DATABASE_URL` and `provider` to `postgresql` in `schema.prisma`
- **Migrations are gitignored** — use `npx prisma db push` for schema sync in dev
- **Unique show key**: composite unique on `(artistName, venueName, showDate)`
- **Repo visibility**: `PRIVATE` by default; must be explicitly set to `PUBLIC` to appear on show pages / memory wall

## Key directories

```
backend/src/
  app.module.ts       # all modules registered here
  auth/               # register, login, JWT strategy
  users/ shows/ repos/ media/
  likes/ comments/ search/ discover/ reports/
  prisma/             # PrismaModule + PrismaService (injectable)
  common/             # guards (jwt, optional-jwt) + decorators (current-user)

frontend/src/
  App.tsx             # React Router routes, ProtectedLayout for auth gating
  api/                # api() wrapper + TypeScript types (client.ts, types.ts)
  context/AuthContext.tsx  # auth state provider
  pages/              # LivePage, DiscoverPage, RecordPage, ProfilePage, ShowDetailPage, RepoDetailPage, LoginPage, RegisterPage
  components/         # Layout, TabBar, ShowCard, RepoCard
```

## Commands

| Task | Backend | Frontend |
|------|---------|----------|
| Dev | `npm run start:dev` | `npm run dev` |
| Build | `npm run build` | `npm run build` |
| DB push | `npx prisma db push` | — |
| DB seed | `npm run prisma:seed` | — |
| Clean (Windows) | `npm run clean` | — |

## Windows-specific

- Use `npm run clean` instead of `rm -rf dist`; it's a platform-safe Node.js one-liner.
- Prefer cmd or WSL; PowerShell is untested.

## MVP scope (what NOT to build)

- **NO POA** (Epic E): no EXIF-based ticket stubs, no identity verification badges, no memory archaeology
- **NO private chat / group chat** (G4, G5)
- **NO AI writing** (C7, C8)
- **NO NetEase Cloud Music integration** (H1)
- **NO mini-program** (J3)
- Current social features: likes (G1) + comments (G2) only

## Conventions

- New NestJS modules: create `module.ts`, `controller.ts`, `service.ts`, `dto/` as needed; register in `app.module.ts`
- New frontend pages: add to `pages/`, add route in `App.tsx`
- API calls: use the `api<T>()` helper from `frontend/src/api/client.ts`; it auto-attaches auth header
- Frontend types: co-locate in `frontend/src/api/types.ts`, mirroring backend DTOs
- Validation: backend uses `class-validator` + NestJS `ValidationPipe` with `whitelist: true`
- File uploads: `POST /api/v1/media/upload` (multipart `file`), served from `backend/uploads/`
