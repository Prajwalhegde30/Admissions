# Phase Scope & Delivery Plan
## Atria Admission System

**Total Timeline:** ~14 weeks  
**Team assumption:** 2 frontend devs · 1 backend dev · 1 full-stack/lead

---

## PHASE 0 — Foundation (Week 1–2)

**Goal:** Nx monorepo scaffolded, database running, auth working end-to-end.

### Deliverables

| Task | Owner | Done When |
|------|-------|-----------|
| Initialize Nx monorepo with apps/libs structure | Lead | `nx build` passes for all apps |
| Set up PostgreSQL + Prisma with all migrations | Backend | All tables created, seeds working |
| Implement auth module (JWT + refresh tokens) | Backend | Login/logout/refresh endpoints pass tests |
| Invite system (single + bulk CSV) | Backend | Invite email sent with working token |
| Student first-login + set-password flow | Backend | Student can set password via invite token |
| Shared UI library scaffold (Button, Input, Layout) | Frontend | Components render in Storybook |
| Docker Compose dev environment | Lead | `docker compose up` brings everything live |
| `.env.example` documented | Lead | All required vars listed |

### Acceptance Criteria
- Admin can create an invite, student receives email, clicks link, sets password, receives JWT
- Admin and student can login with different RBAC guards working

---

## PHASE 1 — Student Form Engine (Week 3–5)

**Goal:** Students can complete the full adaptive application form with auto-save.

### Deliverables

| Task | Owner | Done When |
|------|-------|-----------|
| Multi-step form shell (5 steps) with progress indicator | Frontend | Navigation between steps works |
| Personal Information form (Step 1) | Frontend | All fields save on blur |
| Academic Background form (Step 2) | Frontend | Admission type + category + board fields |
| Adaptive form engine (conditional fields) | Frontend | Fields show/hide correctly per PRD logic |
| Entrance Exam form (Step 3) | Frontend | Adapts to KCET/COMEDK/Mgmt selection |
| Auto-save (PATCH /applications/mine/draft) | Frontend + Backend | Data persists on page reload |
| Draft restore on reload | Frontend | Form repopulates from saved state |
| Review & Submit screen (Step 5) | Frontend | Summary shows correct data |
| Submit endpoint with validation | Backend | Blocks submit if critical docs missing |

### Acceptance Criteria
- Student can complete all 5 steps
- Changing "Admission Type" to COMEDK hides KCET fields and shows COMEDK fields
- Closing browser and reopening restores all entered data

---

## PHASE 2 — Document Upload & OCR (Week 6–8)

**Goal:** Students can upload documents, OCR extracts and displays data for confirmation.

### Deliverables

| Task | Owner | Done When |
|------|-------|-----------|
| File upload component (drag + click, preview) | Frontend | Accepts PDF/JPG/PNG under 5MB |
| S3 upload integration | Backend | File stored in private S3 bucket |
| Document record creation + status tracking | Backend | Document row created on upload |
| OCR queue (Bull + Redis) | Backend | Jobs enqueue on document upload |
| Tesseract OCR processor | Backend | Extracts text from test documents |
| Extraction parsers (10th, 12th, KCET, Aadhaar) | Backend | Structured JSON returned per doc type |
| OCR status polling (frontend) | Frontend | UI updates automatically when OCR done |
| Extracted data confirmation UI | Frontend | Student can edit + confirm OCR fields |
| Document info modals ([ⓘ] button) | Frontend | Shows sample image + field guide |
| Adaptive required docs (based on form choices) | Frontend + Backend | Only relevant docs shown |
| Document status badges (Pending / Uploaded / Verified / Rejected) | Frontend | Correct status shown always |

### Acceptance Criteria
- Upload a 10th marks card JPG → OCR runs → name/DOB/percentage populated in form fields
- OCR failure shows manual entry prompt, not a blank error screen
- Document states update in real-time without page refresh

---

## PHASE 3 — Admin Portal (Week 9–11)

**Goal:** Admins can manage invites, review applications, and verify/reject documents.

### Deliverables

| Task | Owner | Done When |
|------|-------|-----------|
| Admin login + protected routes | Frontend | Admin and student routes separated |
| Invite list page + single invite creation | Frontend | Admin can send invite, table updates |
| Bulk CSV upload UI | Frontend | CSV upload with error report display |
| Application list with filters + pagination | Frontend | Filters by type/status/category work |
| Single application review page | Frontend | Side-by-side doc + extracted data view |
| Document presigned URL viewer | Frontend | Document opens in panel without download |
| Verify / Reject document action | Frontend + Backend | Status updates, student notified |
| Application approve/reject action | Frontend + Backend | Status changes, notification sent |
| Correction request list + approve/reject | Frontend + Backend | Admin can unlock fields for student |
| Admin dashboard summary stats | Frontend + Backend | Counts by status correct |

### Acceptance Criteria
- Admin can see all submitted applications, filter by KCET/Under Review
- Rejecting a document sends student an email notification
- Approving a correction request allows student to re-upload

---

## PHASE 4 — Notifications, Validation & Polish (Week 12–13)

**Goal:** All notifications working, cross-document validation, edge cases handled.

### Deliverables

| Task | Owner | Done When |
|------|-------|-----------|
| Email notification service (SES / Nodemailer) | Backend | All 8 notification types send correct emails |
| In-app notification bell + panel | Frontend | Unread count shows, marks as read |
| Cross-document validation (name + DOB match) | Backend | Warnings shown on review screen |
| Form field validation (marks range, formats) | Frontend + Backend | Client + server side |
| OCR failure graceful fallback | Frontend | Manual entry prompt shown |
| Network interruption handling | Frontend | Toast + local cache fallback |
| Loading states everywhere | Frontend | No blank/broken states during API calls |
| Empty states for all list views | Frontend | Helpful empty state messages |
| Audit log on all admin actions | Backend | All actions recorded in audit_logs |
| Rate limiting on auth endpoints | Backend | 5 attempts / 15 min enforced |

### Acceptance Criteria
- Submitting application with name mismatch shows yellow warning (not block)
- All email types send and render correctly in Gmail / Outlook
- Admin actions visible in audit log

---

## PHASE 5 — Testing, Hardening & Launch (Week 14)

**Goal:** Production-ready. Tested, secured, deployed.

### Deliverables

| Task | Owner | Done When |
|------|-------|-----------|
| Unit tests for all API services | Backend | ≥ 80% coverage on service layer |
| Integration tests (upload → OCR → store flow) | Backend | Full pipeline tested |
| E2E test: student invite → submit flow | Full-stack | Playwright test passes |
| E2E test: admin invite → review → approve flow | Full-stack | Playwright test passes |
| Security audit: RBAC, token validation, S3 access | Lead | No unauthenticated access possible |
| Performance: load test (100 concurrent users) | Backend | API p95 < 500ms |
| Production deployment (ECS / Render / Railway) | Lead | App live on production URL |
| Seed data for demo/UAT | Backend | Admin can log in and see 50 sample applications |
| UAT with Atria admissions staff | All | Sign-off from stakeholders |

---

## FEATURE FLAG MAP

Features that can be toggled off for initial launch:

| Feature | Flag | Default |
|---------|------|---------|
| OCR auto-extraction | `ENABLE_OCR` | `true` |
| Bulk CSV invite | `ENABLE_BULK_INVITE` | `true` |
| Analytics dashboard | `ENABLE_ANALYTICS` | `false` |
| Cross-doc validation warnings | `ENABLE_CROSS_VALIDATION` | `true` |

---

## RISK REGISTER

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| OCR accuracy too low for Indian documents | High | Medium | Fallback to manual entry; can swap Tesseract for Google Vision API post-launch |
| Student browsers block file uploads | Low | High | Test on Chrome, Firefox, Safari, Edge on Windows + Mac + Android |
| Email deliverability issues | Medium | High | Use SES with SPF/DKIM; test with real Gmail accounts |
| Large PDFs slow upload | Medium | Medium | Compress client-side before upload; show progress bar |
| S3 presign URL expires mid-review | Low | Low | Generate fresh URL on each document open |

---

## DEFINITION OF DONE (Per Feature)

A feature is "done" when:
1. ✅ Works on Chrome, Firefox, Safari
2. ✅ Works on mobile viewport (375px wide)
3. ✅ API endpoint has input validation
4. ✅ Error states handled (not just happy path)
5. ✅ Loading states shown
6. ✅ Relevant notification sent (if applicable)
7. ✅ Audit log entry created (if admin action)
