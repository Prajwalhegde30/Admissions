# Smart Admission Document Processing & Management System
## Product Requirements Document — Atria Institute of Technology

**Version:** 2.0  
**Status:** Ready for Development  
**Platform Target:** Web (Desktop-first, Mobile-responsive)  
**Stack:** Next.js 14 (App Router) · NestJS · PostgreSQL · Nx Monorepo

---

## 1. PRODUCT OVERVIEW

### 1.1 Problem Statement

Atria Institute of Technology's current admission process is manual, error-prone, and time-consuming. Students submit physical documents, staff re-enter data by hand, and incomplete applications create back-and-forth delays. There is no single source of truth.

### 1.2 Solution

A web-based, invite-only admission platform that:
- Guides students through an adaptive, step-by-step application
- Extracts data from uploaded documents using OCR
- Validates consistency across documents automatically
- Gives admins a unified dashboard to review, verify, and manage applications
- Eliminates dead-ends — students can always save progress and return

### 1.3 Key Outcomes

| Metric | Target |
|--------|--------|
| Manual data entry reduction | ≥ 75% |
| Incomplete application rate | < 5% |
| OCR extraction accuracy | ≥ 85% |
| Admin verification time per application | < 10 minutes |

---

## 2. STAKEHOLDERS & ROLES

| Role | Description | Access Level |
|------|-------------|--------------|
| **Super Admin** | IT / System owner | Full system access |
| **Admission Admin** | Admission office staff | Manage applications, verify docs |
| **Student** | Applicant | Own application only |

---

## 3. SCOPE

### In Scope (v1.0)
- Invite-only student onboarding
- Adaptive multi-step application form
- Document upload with OCR extraction
- Admin dashboard with verification workflow
- Correction request system
- Email notifications
- Auto-save with draft state

### Out of Scope (v1.0 → v2.0 roadmap)
- Mobile native app
- AI-based document classification
- Government API integrations (DigiLocker, Aadhaar API)
- Rank-based branch prediction
- Payment gateway

---

## 4. USER STORIES

### 4.1 Student Stories

```
As a student, I want to receive an email invite so I can register securely without a public signup.
As a student, I want the form to adapt based on my admission type so I only see relevant fields.
As a student, I want uploaded documents to auto-fill form fields so I don't re-type what's already on paper.
As a student, I want to save my progress at any time so I can return without losing data.
As a student, I want to see exactly what documents are needed and why so I don't upload wrong files.
As a student, I want to request a correction on a rejected field so I can fix mistakes without restarting.
As a student, I want to track my application status in real time so I'm never left uncertain.
```

### 4.2 Admin Stories

```
As an admin, I want to bulk-invite students via CSV so I can onboard an entire batch efficiently.
As an admin, I want to see all applications with filters so I can prioritize my review queue.
As an admin, I want to see OCR-extracted data alongside the original document so I can verify accuracy.
As an admin, I want to approve/reject individual documents so I can handle partial verifications.
As an admin, I want to unlock specific fields for student correction so changes are controlled.
As an admin, I want summary analytics so I can report admission progress to management.
```

---

## 5. FUNCTIONAL REQUIREMENTS

### 5.1 Authentication & Invite System

- **No public registration.** All student accounts are created by admins.
- Admin uploads CSV or manually creates a student record.
- System generates a unique, time-limited invite token (72-hour expiry).
- Invite email sent with a one-time link.
- First login forces password change.
- JWT-based sessions with refresh tokens.
- Role-based access control (RBAC): `super_admin`, `admin`, `student`.

### 5.2 Adaptive Form Engine

The form renders fields conditionally based on:

| Condition | Fields Shown / Hidden |
|-----------|-----------------------|
| Admission type = KCET | KCET rank card required |
| Admission type = COMEDK | COMEDK rank card required |
| Admission type = Management | Neither rank card required |
| Category = General | Caste certificate hidden |
| Category = SC / ST / OBC | Caste certificate required |
| Board = Non-Karnataka | Migration certificate required |
| Board = Karnataka | Migration certificate hidden |

Form sections:
1. Personal Information
2. Academic Background
3. Entrance Exam Details
4. Document Uploads
5. Review & Submit

### 5.3 Document Management

**Supported document types:**

| Document | Required For |
|----------|-------------|
| 10th Marks Card | All |
| 12th Marks Card | All |
| KCET Rank Card | KCET admissions |
| COMEDK Rank Card | COMEDK admissions |
| Aadhaar Card | All |
| Transfer Certificate | All |
| Migration Certificate | Non-Karnataka boards |
| Caste Certificate | SC / ST / OBC |
| Income Certificate | SC / ST / OBC (fee waiver) |
| Medical Certificate | PH category |

**Document states:**
`PENDING` → `UPLOADED` → `UNDER_REVIEW` → `VERIFIED` | `REJECTED`

**Upload requirements:**
- Formats: PDF, JPG, JPEG, PNG
- Max file size: 5MB per document
- Preview before submission
- Replace document (if not yet verified)

### 5.4 OCR & Data Extraction

Extracted fields per document:

| Document | Extracted Fields |
|----------|----------------|
| 10th Marks Card | Name, DOB, Register No., Subject marks, Total, Percentage, Board |
| 12th Marks Card | Name, Register No., Subject marks, Total, Percentage, Board, Year |
| KCET Rank Card | Name, CET No., Rank, Category rank |
| COMEDK Rank Card | Name, COMEDK No., Rank |
| Aadhaar | Name, DOB, Gender, Aadhaar No. (last 4 only) |

**OCR flow:**
1. Student uploads document
2. System queues OCR job (async)
3. Extracted data shown in editable fields alongside document preview
4. Student confirms or corrects extracted data
5. Both raw OCR result and confirmed data stored separately

### 5.5 Validation Engine

Cross-document validations:
- Name consistency across all documents (fuzzy match, flag mismatch)
- DOB match between Aadhaar and marks cards
- Marks in valid range (0–100 per subject)
- Percentage calculation verification
- CET number format validation (Karnataka: 10-digit numeric)

### 5.6 Auto-Save System

- Form state saved to database on every field blur
- Draft restored automatically on page reload
- "Last saved" timestamp displayed
- No data loss on browser close or network interruption

### 5.7 Correction Request System

**Student side:**
- Can flag any field for correction after admin rejection
- Must provide a reason/message
- Cannot edit locked fields without admin approval

**Admin side:**
- Receives correction request notification
- Can approve (unlocks specific field for student) or reject (with reason)
- Audit trail of all correction actions

### 5.8 Notification System

| Event | Recipient | Channel |
|-------|-----------|---------|
| Invite sent | Student | Email |
| Application submitted | Admin | Email + Dashboard |
| Document verified | Student | Email |
| Document rejected | Student | Email |
| Correction request | Admin | Email + Dashboard |
| Correction approved | Student | Email |
| Application approved | Student | Email |

### 5.9 Admin Dashboard

**Application list view:**
- Filters: admission type, category, status, date range
- Sort: submission date, name, status
- Bulk actions: approve, reject, request correction

**Single application view:**
- Student profile summary
- Side-by-side: original document + extracted data
- Per-document verify / reject with notes
- Timeline of all actions

**Analytics panel:**
- Total applications by status
- Applications by admission type
- Completion rate
- Document rejection rate by type

---

## 6. NON-FUNCTIONAL REQUIREMENTS

### 6.1 Performance
- Page load (initial): < 3 seconds on 4G
- OCR processing: < 8 seconds (async, non-blocking)
- API response (non-OCR): < 500ms (p95)
- File upload: progress indicator, resumable for files > 2MB

### 6.2 Security
- Passwords hashed with bcrypt (cost factor 12)
- JWT access tokens (15-min expiry) + refresh tokens (7-day)
- File uploads scanned for malware (ClamAV or S3 virus scan)
- Documents stored in private S3 bucket (pre-signed URLs, 10-min expiry)
- All API routes protected with RBAC middleware
- Rate limiting on auth endpoints (5 attempts / 15 min)
- HTTPS enforced

### 6.3 Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigable
- Screen reader compatible labels
- Error messages are descriptive, not just color-coded

### 6.4 Reliability
- Auto-save on every change (no data loss)
- Graceful OCR failure fallback (manual entry still possible)
- Retry logic for failed email sends (3 attempts, exponential backoff)

---

## 7. EDGE CASES & HANDLING

| Edge Case | Handling |
|-----------|----------|
| OCR fails (low quality image) | Show warning, allow manual entry, flag for admin review |
| Duplicate email invite | Block creation, show existing account status |
| Invite token expired | Admin can resend from dashboard |
| Document upload fails mid-way | Retry button, no partial data saved |
| Name mismatch across documents | Yellow warning (not blocking), admin notified |
| Student submits without all optional docs | Allowed with missing docs flagged in admin view |
| Network interruption during form | Auto-save ensures no data loss, reconnect toast |

---

## 8. SUCCESS METRICS (POST-LAUNCH)

- % of invited students who complete and submit: target ≥ 80%
- Average time from invite to submission: target ≤ 3 days
- Admin verification time per application: target ≤ 10 min
- OCR accuracy on marks cards: target ≥ 85%
- Support tickets related to form confusion: target < 5%
