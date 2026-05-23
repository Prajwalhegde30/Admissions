# Atria Admission System

> Smart, adaptive, invite-only admission document processing platform for Atria Institute of Technology.

---

## What This Is

A web-based admission platform that replaces manual document collection and data entry. Students receive an email invite, fill a smart adaptive form, upload documents (OCR auto-fills the data), and submit. Admins review, verify, and approve — all from one dashboard.

**Two apps, one backend:**
- `student-portal` — Where applicants complete their admission
- `admin-portal` — Where Atria staff manage applications
- `api` — NestJS REST API serving both

---

## Quick Start (Development)

### Prerequisites
- Node.js 20+
- Docker Desktop (for PostgreSQL + Redis)
- pnpm (`npm install -g pnpm`)

### Setup

```bash
# 1. Clone and install
git clone https://github.com/atria/admission-system
cd admission-system
pnpm install

# 2. Start database and Redis
docker compose up -d postgres redis

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# 4. Run database migrations
cd apps/api
pnpm prisma migrate dev

# 5. Seed initial super admin
pnpm prisma db seed

# 6. Start all apps
npx nx run-many -t serve --all
```

### URLs

| App | URL |
|-----|-----|
| Student Portal | http://localhost:3000 |
| Admin Portal | http://localhost:3002 |
| API | http://localhost:3001 |
| API Docs (Swagger) | http://localhost:3001/docs |

### Default Seed Credentials

```
Super Admin: admin@atria.ac.in / Admin@1234
```

---

## Project Structure

```
atria-admission/
├── apps/
│   ├── student-portal/     # Next.js 14 — student application
│   ├── admin-portal/       # Next.js 14 — admin dashboard
│   └── api/                # NestJS — REST API
│
├── libs/
│   ├── shared/             # Types, constants, utilities (used by all)
│   ├── ui/                 # Shared React components
│   ├── forms/              # Adaptive form engine + Zod schemas
│   └── api-client/         # Typed API client
│
├── docker-compose.yml
├── nx.json
└── package.json
```

---

## Key Features

| Feature | Details |
|---------|---------|
| Invite-only access | No public signup. Admin creates and sends email invites. |
| Adaptive forms | Fields and required documents change based on admission type, category, and board |
| OCR extraction | Documents auto-populate form fields via Tesseract OCR |
| Auto-save | Every field change saved to DB; no data loss on browser close |
| Correction requests | Students can request field corrections; admins approve/unlock |
| Document verification | Admins verify/reject individual documents with reasons |
| Audit trail | Every admin action logged with timestamp and actor |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS, Shadcn/ui |
| State | Zustand (client), React Query (server) |
| Forms | React Hook Form + Zod |
| Backend | NestJS, Prisma ORM |
| Database | PostgreSQL 15 |
| Queue | Bull (Redis) |
| OCR | Tesseract.js |
| Storage | AWS S3 (presigned URLs) |
| Email | AWS SES / Nodemailer |
| Monorepo | Nx |

---

## Environment Variables

See `.env.example` for all required variables. Key ones:

```bash
DATABASE_URL=           # PostgreSQL connection string
JWT_SECRET=             # Strong random secret (32+ chars)
AWS_REGION=             # ap-south-1 recommended
S3_BUCKET_NAME=         # Private S3 bucket for documents
SES_FROM_EMAIL=         # Verified sender email
REDIS_URL=              # Redis connection string
STUDENT_PORTAL_URL=     # Public URL for email links
```

---

## Scripts

```bash
# Development
npx nx serve student-portal    # Start student portal
npx nx serve admin-portal      # Start admin portal
npx nx serve api               # Start API

# Build
npx nx build student-portal
npx nx build api

# Test
npx nx test api                # Unit tests
npx nx e2e student-portal-e2e  # E2E tests

# Database
cd apps/api
pnpm prisma migrate dev        # Run migrations
pnpm prisma studio             # Open Prisma Studio (DB GUI)
pnpm prisma db seed            # Seed test data
```

---

## Reference Documents

| Document | Purpose |
|----------|---------|
| `PRD.md` | Product requirements, user stories, business rules |
| `schema.md` | Complete database schema (SQL + Prisma) |
| `architecture.md` | System architecture, module map, infrastructure |
| `appflow.md` | User journeys, screen flows, adaptive logic |
| `data_api.md` | Full REST API reference with request/response examples |
| `phasescope.md` | 14-week delivery plan with acceptance criteria |
| `skills.md` | Coding rules and conventions for AI-assisted development |

---

## Deployment

### Production (AWS)

```bash
# Build Docker images
docker build -t atria-api ./apps/api
docker build -t atria-student ./apps/student-portal
docker build -t atria-admin ./apps/admin-portal

# Push to ECR and deploy via ECS (see deployment/aws/ scripts)
```

### Quick Deploy (Railway / Render)

Each app has its own `Dockerfile`. Deploy `api`, `student-portal`, and `admin-portal` as separate services. They share the same PostgreSQL and Redis instances.

Set all environment variables from `.env.example` in your deployment dashboard.

---

## Contributing

1. Create a branch: `feature/your-feature-name`
2. Follow conventions in `skills.md`
3. Write tests for new backend logic
4. All PRs require passing CI before merge

---

## License

Proprietary — Atria Institute of Technology. Not for public distribution.
