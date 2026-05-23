# System Architecture
## Atria Admission System

**Pattern:** Monorepo (Nx) · Layered Architecture · Event-driven async jobs  
**Deployment:** Docker Compose (dev) · AWS (prod)

---

## 1. HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│                                                             │
│   ┌─────────────────────┐   ┌─────────────────────────┐    │
│   │   Student Portal     │   │     Admin Portal         │    │
│   │   Next.js 14         │   │     Next.js 14           │    │
│   │   (App Router)       │   │     (App Router)         │    │
│   └─────────┬───────────┘   └───────────┬─────────────┘    │
└─────────────┼───────────────────────────┼───────────────────┘
              │ HTTPS / REST + JWT         │
┌─────────────┼───────────────────────────┼───────────────────┐
│             ▼         API LAYER         ▼                    │
│   ┌──────────────────────────────────────────────┐          │
│   │            NestJS REST API                    │          │
│   │                                              │          │
│   │  AuthModule  │  StudentModule  │  AdminModule │          │
│   │  DocModule   │  OCRModule      │  NotifModule │          │
│   └──────┬───────────────┬─────────────┬─────────┘          │
└──────────┼───────────────┼─────────────┼─────────────────────┘
           │               │             │
┌──────────▼───┐  ┌────────▼──────┐  ┌──▼────────────────────┐
│  PostgreSQL  │  │  Bull Queue   │  │   AWS S3              │
│  (Prisma)    │  │  (Redis)      │  │   (Documents)         │
└──────────────┘  └────────┬──────┘  └───────────────────────┘
                           │
                  ┌────────▼──────────┐
                  │   OCR Worker      │
                  │   (Tesseract.js)  │
                  └───────────────────┘
```

---

## 2. NX MONOREPO STRUCTURE

```
atria-admission/
├── apps/
│   ├── student-portal/          # Next.js 14 - student-facing
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── set-password/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── application/
│   │   │   │   ├── documents/
│   │   │   │   └── status/
│   │   │   └── layout.tsx
│   │   └── ...
│   │
│   ├── admin-portal/            # Next.js 14 - admin-facing
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   └── login/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── applications/
│   │   │   │   ├── invites/
│   │   │   │   └── analytics/
│   │   │   └── layout.tsx
│   │   └── ...
│   │
│   └── api/                     # NestJS backend
│       └── src/
│           ├── modules/
│           │   ├── auth/
│           │   ├── invites/
│           │   ├── students/
│           │   ├── applications/
│           │   ├── documents/
│           │   ├── ocr/
│           │   ├── corrections/
│           │   └── notifications/
│           ├── common/
│           │   ├── guards/
│           │   ├── decorators/
│           │   ├── filters/
│           │   └── pipes/
│           └── main.ts
│
├── libs/
│   ├── shared/
│   │   ├── types/               # Shared TypeScript types & interfaces
│   │   ├── constants/           # Enums, magic values
│   │   └── utils/               # Pure utility functions
│   │
│   ├── ui/                      # Shared React components
│   │   ├── components/
│   │   │   ├── Button/
│   │   │   ├── FileUpload/
│   │   │   ├── DocumentPreview/
│   │   │   ├── StatusBadge/
│   │   │   └── ...
│   │   └── index.ts
│   │
│   ├── forms/                   # Form schemas, validation, adaptive logic
│   │   ├── schemas/
│   │   ├── validators/
│   │   └── form-engine/
│   │
│   └── api-client/              # Type-safe API client (generated from OpenAPI)
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── nx.json
├── package.json
└── tsconfig.base.json
```

---

## 3. BACKEND MODULE ARCHITECTURE

### NestJS Module Map

```
ApiModule
├── AuthModule
│   ├── JwtStrategy
│   ├── LocalStrategy
│   └── RolesGuard
│
├── InvitesModule
│   ├── InviteService
│   ├── InviteController (POST /invites, POST /invites/bulk, POST /invites/resend/:id)
│   └── InviteRepository
│
├── UsersModule
│   ├── UserService
│   └── UserRepository
│
├── ApplicationsModule
│   ├── ApplicationService
│   ├── ApplicationController (CRUD + status transitions)
│   └── FormEngineService       (dynamic field resolution)
│
├── DocumentsModule
│   ├── DocumentService
│   ├── DocumentController
│   ├── StorageService          (S3 upload/presign)
│   └── DocumentValidator
│
├── OcrModule
│   ├── OcrService              (queues OCR jobs)
│   ├── OcrProcessor            (Bull worker)
│   ├── TesseractAdapter
│   └── ExtractionParsers/
│       ├── MarksCard10thParser
│       ├── MarksCard12thParser
│       ├── KcetRankCardParser
│       └── AadhaarParser
│
├── CorrectionsModule
│   ├── CorrectionService
│   └── CorrectionController
│
└── NotificationsModule
    ├── NotificationService
    ├── EmailService            (Nodemailer / AWS SES)
    └── NotificationController
```

---

## 4. AUTHENTICATION FLOW

```
Admin                   API                     DB
  │                      │                       │
  │── POST /invites ─────►│                       │
  │                      │── INSERT invite ──────►│
  │                      │── Send email ─────────►│ (queue)
  │◄─ 201 invite_id ─────│                       │
  
Student                 API                     DB
  │                      │                       │
  │── GET /invites/accept?token=xxx ────────────►│
  │                      │── Validate token ─────►│
  │◄─ 200 { email } ─────│                       │
  │                      │                       │
  │── POST /auth/set-password ──────────────────►│
  │  { token, password } │                       │
  │                      │── Create user ────────►│
  │                      │── Mark invite accepted►│
  │◄─ 200 { access_token, refresh_token } ───────│
```

---

## 5. OCR ASYNC FLOW

```
Student                 API              Queue          OCR Worker       DB
  │                      │                │                │              │
  │── POST /documents ──►│                │                │              │
  │   (file upload)      │── S3 upload ──────────────────────────────────►│
  │                      │── INSERT doc ──────────────────────────────────►│
  │                      │── Enqueue ────►│                │              │
  │◄─ 201 { doc_id }  ───│                │                │              │
  │                      │                │── Process ────►│              │
  │                      │                │                │── Tesseract  │
  │                      │                │                │── Parse      │
  │                      │                │                │── UPDATE doc►│
  │                      │                │                │   ocr_status │
  │                      │                │                │   ocr_extracted
  │                      │                │                │              │
  │── GET /documents/:id ►│                │                │              │
  │◄─ 200 { ...ocr_extracted, status: 'done' } ────────────────────────── │
```

---

## 6. FRONTEND STATE MANAGEMENT

**Library:** Zustand (lightweight) + React Query (server state)

```typescript
// Application form store (Zustand)
interface ApplicationStore {
  formData: FormData;
  currentStep: number;
  completionStatus: Record<string, boolean>;
  lastSavedAt: Date | null;

  setField: (path: string, value: unknown) => void;
  setStep: (step: number) => void;
  loadDraft: () => Promise<void>;
  saveDraft: () => Promise<void>;           // debounced, fires on every change
}

// React Query for server state
const useDocuments = (applicationId: string) =>
  useQuery(['documents', applicationId], () => api.documents.list(applicationId), {
    refetchInterval: (data) =>
      data?.some(d => d.ocrStatus === 'processing') ? 3000 : false   // poll while OCR running
  });
```

---

## 7. INFRASTRUCTURE (PRODUCTION)

```yaml
# AWS Services
services:
  compute:
    - ECS Fargate (API + Next.js apps)
  database:
    - RDS PostgreSQL (Multi-AZ)
  cache:
    - ElastiCache Redis (Bull queues + session)
  storage:
    - S3 (private bucket, documents)
    - CloudFront (CDN for static assets)
  email:
    - SES (transactional email)
  monitoring:
    - CloudWatch Logs
    - Sentry (error tracking)
  secrets:
    - AWS Secrets Manager
```

```yaml
# docker-compose.yml (development)
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: atria_admission
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: dev_password
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  api:
    build: ./apps/api
    depends_on: [postgres, redis]
    env_file: .env.local
    ports: ["3001:3001"]

  student-portal:
    build: ./apps/student-portal
    ports: ["3000:3000"]

  admin-portal:
    build: ./apps/admin-portal
    ports: ["3002:3002"]
```

---

## 8. ENVIRONMENT VARIABLES

```bash
# Database
DATABASE_URL=postgresql://admin:password@localhost:5432/atria_admission

# Auth
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# AWS
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=atria-admission-docs
S3_PRESIGN_EXPIRY=600          # 10 minutes

# Email
SES_FROM_EMAIL=admissions@atria.ac.in
SMTP_HOST=email-smtp.ap-south-1.amazonaws.com

# Redis / Queue
REDIS_URL=redis://localhost:6379

# App
STUDENT_PORTAL_URL=https://apply.atria.ac.in
ADMIN_PORTAL_URL=https://admin-admissions.atria.ac.in
NODE_ENV=development
```

---

## 9. SECURITY ARCHITECTURE

```
Request Flow with Security Layers:

Client → [HTTPS/TLS] → [Rate Limiter] → [JWT Auth Guard] → [Roles Guard] → Controller

Document Access:
Client → API → [Ownership Check] → S3 PreSigned URL (10 min expiry)
                                    ↑
                              Never serve files directly from API
```

**Key security decisions:**
- Documents never served via API — only pre-signed S3 URLs
- Student can only access their own application/documents (enforced at service layer)
- Admin cannot access other admin accounts
- All destructive actions logged to audit_logs
- Invite tokens are single-use and expire after 72h
