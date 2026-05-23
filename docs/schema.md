# Database Schema
## Atria Admission System — PostgreSQL

**ORM:** Prisma  
**Database:** PostgreSQL 15+  
**Conventions:** snake_case tables, UUID primary keys, timestamps on every table

---

## ENUMS

```sql
-- User roles
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'student');

-- Admission types
CREATE TYPE admission_type AS ENUM ('kcet', 'comedk', 'management');

-- Student category
CREATE TYPE student_category AS ENUM ('general', 'sc', 'st', 'obc', 'ph');

-- Board types
CREATE TYPE board_type AS ENUM ('karnataka_state', 'cbse', 'icse', 'other');

-- Application status
CREATE TYPE application_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'correction_requested'
);

-- Document types
CREATE TYPE document_type AS ENUM (
  'marks_card_10th',
  'marks_card_12th',
  'kcet_rank_card',
  'comedk_rank_card',
  'aadhaar',
  'transfer_certificate',
  'migration_certificate',
  'caste_certificate',
  'income_certificate',
  'medical_certificate'
);

-- Document status
CREATE TYPE document_status AS ENUM (
  'pending',
  'uploaded',
  'under_review',
  'verified',
  'rejected'
);

-- Correction request status
CREATE TYPE correction_status AS ENUM ('pending', 'approved', 'rejected');

-- Invite status
CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');

-- Notification type
CREATE TYPE notification_type AS ENUM (
  'invite_sent',
  'application_submitted',
  'document_verified',
  'document_rejected',
  'correction_requested',
  'correction_approved',
  'correction_rejected',
  'application_approved',
  'application_rejected'
);
```

---

## TABLES

### users
```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  role            user_role NOT NULL DEFAULT 'student',
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  phone           VARCHAR(20),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  must_change_password BOOLEAN NOT NULL DEFAULT false,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### invites
```sql
CREATE TABLE invites (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) NOT NULL,
  token           VARCHAR(255) NOT NULL UNIQUE,
  status          invite_status NOT NULL DEFAULT 'pending',
  created_by      UUID NOT NULL REFERENCES users(id),
  student_id      UUID REFERENCES users(id),         -- set when accepted
  expires_at      TIMESTAMPTZ NOT NULL,               -- NOW() + 72 hours
  accepted_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invites_token ON invites(token);
CREATE INDEX idx_invites_email ON invites(email);
CREATE INDEX idx_invites_status ON invites(status);
```

### student_profiles
```sql
-- Extended profile for students only (1:1 with users where role = 'student')
CREATE TABLE student_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

  -- Personal
  date_of_birth     DATE,
  gender            VARCHAR(20),
  father_name       VARCHAR(150),
  mother_name       VARCHAR(150),
  guardian_phone    VARCHAR(20),

  -- Address
  address_line1     VARCHAR(255),
  address_line2     VARCHAR(255),
  city              VARCHAR(100),
  state             VARCHAR(100),
  pincode           VARCHAR(10),

  -- Academic background
  admission_type    admission_type,
  category          student_category,
  board_type        board_type,
  preferred_branch  VARCHAR(100),

  -- 10th details
  tenth_school      VARCHAR(255),
  tenth_board       VARCHAR(100),
  tenth_year        INTEGER,
  tenth_percentage  DECIMAL(5,2),
  tenth_register_no VARCHAR(50),

  -- 12th details
  twelfth_school    VARCHAR(255),
  twelfth_board     VARCHAR(100),
  twelfth_year      INTEGER,
  twelfth_percentage DECIMAL(5,2),
  twelfth_register_no VARCHAR(50),
  twelfth_physics   DECIMAL(5,2),
  twelfth_chemistry DECIMAL(5,2),
  twelfth_maths     DECIMAL(5,2),
  twelfth_pcm_percentage DECIMAL(5,2),

  -- Entrance exam
  cet_number        VARCHAR(20),
  cet_rank          INTEGER,
  cet_category_rank INTEGER,
  comedk_number     VARCHAR(20),
  comedk_rank       INTEGER,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### applications
```sql
CREATE TABLE applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL UNIQUE REFERENCES users(id),
  admission_type  admission_type NOT NULL,
  category        student_category NOT NULL,
  status          application_status NOT NULL DEFAULT 'draft',
  form_data       JSONB NOT NULL DEFAULT '{}',       -- full form state for auto-save
  submitted_at    TIMESTAMPTZ,
  reviewed_by     UUID REFERENCES users(id),
  reviewed_at     TIMESTAMPTZ,
  admin_notes     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_admission_type ON applications(admission_type);
```

### documents
```sql
CREATE TABLE documents (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id    UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  student_id        UUID NOT NULL REFERENCES users(id),
  document_type     document_type NOT NULL,
  status            document_status NOT NULL DEFAULT 'pending',

  -- Storage
  file_name         VARCHAR(255),
  file_path         VARCHAR(500),                    -- S3 key
  file_size         INTEGER,                          -- bytes
  mime_type         VARCHAR(50),

  -- OCR
  ocr_raw           JSONB,                            -- raw OCR output
  ocr_extracted     JSONB,                            -- structured extraction
  ocr_confirmed     JSONB,                            -- student-confirmed data
  ocr_status        VARCHAR(20) DEFAULT 'pending',    -- pending | processing | done | failed
  ocr_error         TEXT,

  -- Review
  reviewed_by       UUID REFERENCES users(id),
  reviewed_at       TIMESTAMPTZ,
  rejection_reason  TEXT,

  uploaded_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(application_id, document_type)               -- one doc per type per application
);

CREATE INDEX idx_documents_application ON documents(application_id);
CREATE INDEX idx_documents_student ON documents(student_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_type ON documents(document_type);
```

### correction_requests
```sql
CREATE TABLE correction_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES applications(id),
  student_id      UUID NOT NULL REFERENCES users(id),
  field_path      VARCHAR(255) NOT NULL,              -- e.g. "student_profiles.cet_rank"
  field_label     VARCHAR(255) NOT NULL,              -- human-readable
  current_value   TEXT,
  requested_value TEXT,
  student_message TEXT NOT NULL,
  status          correction_status NOT NULL DEFAULT 'pending',
  reviewed_by     UUID REFERENCES users(id),
  reviewed_at     TIMESTAMPTZ,
  admin_notes     TEXT,
  field_unlocked  BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_corrections_application ON correction_requests(application_id);
CREATE INDEX idx_corrections_status ON correction_requests(status);
```

### audit_logs
```sql
CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id        UUID REFERENCES users(id),
  actor_role      user_role,
  action          VARCHAR(100) NOT NULL,              -- e.g. 'document.verified', 'application.approved'
  entity_type     VARCHAR(50),                        -- e.g. 'document', 'application'
  entity_id       UUID,
  metadata        JSONB DEFAULT '{}',
  ip_address      VARCHAR(45),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
```

### notifications
```sql
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  type            notification_type NOT NULL,
  title           VARCHAR(255) NOT NULL,
  body            TEXT NOT NULL,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);
```

### refresh_tokens
```sql
CREATE TABLE refresh_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash      VARCHAR(255) NOT NULL UNIQUE,
  expires_at      TIMESTAMPTZ NOT NULL,
  revoked_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
```

---

## PRISMA SCHEMA (prisma/schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                   String    @id @default(uuid())
  email                String    @unique
  passwordHash         String    @map("password_hash")
  role                 UserRole  @default(student)
  firstName            String    @map("first_name")
  lastName             String    @map("last_name")
  phone                String?
  isActive             Boolean   @default(true) @map("is_active")
  mustChangePassword   Boolean   @default(false) @map("must_change_password")
  lastLoginAt          DateTime? @map("last_login_at")
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")

  studentProfile       StudentProfile?
  application          Application?
  invitesCreated       Invite[]           @relation("InviteCreatedBy")
  invite               Invite?            @relation("InviteStudent")
  documentsReviewed    Document[]         @relation("DocumentReviewer")
  correctionsReviewed  CorrectionRequest[] @relation("CorrectionReviewer")
  applicationsReviewed Application[]      @relation("ApplicationReviewer")
  notifications        Notification[]
  refreshTokens        RefreshToken[]
  auditLogs            AuditLog[]

  @@map("users")
}

// ... (remaining models follow same pattern)
```

---

## OCR DATA STRUCTURES (JSONB schemas)

### ocr_extracted for marks_card_10th
```json
{
  "name": "RAVI KUMAR S",
  "dob": "2004-03-15",
  "register_no": "KA2345678",
  "board": "Karnataka Secondary Education Board",
  "year": 2020,
  "subjects": [
    { "name": "Mathematics", "marks": 95, "max_marks": 100 },
    { "name": "Science", "marks": 88, "max_marks": 100 }
  ],
  "total_marks": 540,
  "max_total_marks": 600,
  "percentage": 90.0
}
```

### ocr_extracted for kcet_rank_card
```json
{
  "name": "RAVI KUMAR S",
  "cet_number": "K2400012345",
  "rank": 4523,
  "category_rank": 1200,
  "category": "GM",
  "year": 2024
}
```

---

## VALIDATION RULES

```typescript
// Cross-document validation checks
const VALIDATION_RULES = [
  {
    id: 'name_consistency',
    description: 'Name must match across all uploaded documents',
    severity: 'warning',       // warning = flag but don't block
    documents: ['marks_card_10th', 'marks_card_12th', 'aadhaar'],
    field: 'name',
    method: 'fuzzy_match',
    threshold: 0.85
  },
  {
    id: 'dob_consistency',
    description: 'Date of birth must match between Aadhaar and marks cards',
    severity: 'error',         // error = block submission
    documents: ['marks_card_10th', 'aadhaar'],
    field: 'dob',
    method: 'exact_match'
  },
  {
    id: 'percentage_range',
    description: 'Percentage must be between 0 and 100',
    severity: 'error',
    field: 'percentage',
    method: 'range',
    min: 0,
    max: 100
  }
]
```
