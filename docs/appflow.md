# Application Flow
## Atria Admission System — Complete User Journeys

---

## 1. STUDENT FLOW

### 1.1 Onboarding (First Time)

```
[Admin sends invite]
        │
        ▼
Student receives email:
"You have been invited to apply to Atria Institute of Technology.
Click here to begin your application."
        │
        ▼
Student clicks link → /invite/accept?token=abc123
        │
        ▼
[Token validation]
├── VALID → Show "Create Your Password" screen
│         Fields: New Password + Confirm Password
│         Rules: min 8 chars, 1 uppercase, 1 number
│         → POST /auth/set-password { token, password }
│         → Redirect to /dashboard
│
└── EXPIRED → "This invite link has expired."
              "Please contact the admissions office."
              [Show contact email/phone]
```

### 1.2 Application Completion Flow

```
/dashboard (Application Overview)
        │
        ├── Shows progress: Step 1/5 ●●○○○
        │
        ▼
STEP 1: Personal Information
┌──────────────────────────────────────────┐
│ Full Name (pre-filled from invite)       │
│ Date of Birth                            │
│ Gender                                   │
│ Father's Name                            │
│ Mother's Name                            │
│ Guardian Phone                           │
│ Address (Line 1, Line 2, City, State, PIN)│
└──────────────────────────────────────────┘
[Save & Continue] → auto-saves to DB on every blur
        │
        ▼
STEP 2: Academic Background
┌──────────────────────────────────────────┐
│ Admission Type: [KCET] [COMEDK] [Mgmt]  │ ← TRIGGERS form adaptation
│ Category: [Gen] [SC] [ST] [OBC] [PH]   │ ← TRIGGERS form adaptation
│ Board Type: [Karnataka] [CBSE] [ICSE]   │ ← TRIGGERS form adaptation
│                                          │
│ 10th Details:                            │
│   School Name, Board, Year, Percentage   │
│   Register Number                        │
│                                          │
│ 12th Details:                            │
│   School Name, Board, Year               │
│   Physics __, Chemistry __, Maths __     │
│   PCM Percentage (auto-calculated)       │
│   Register Number                        │
└──────────────────────────────────────────┘
        │
        ▼
STEP 3: Entrance Exam Details
[ADAPTIVE — rendered based on Step 2 choices]

IF admission_type == 'kcet':
┌──────────────────────────────────────────┐
│ CET Application Number                   │
│ CET Rank                                 │
│ Category Rank                            │
└──────────────────────────────────────────┘

IF admission_type == 'comedk':
┌──────────────────────────────────────────┐
│ COMEDK Application Number                │
│ COMEDK Rank                              │
└──────────────────────────────────────────┘

IF admission_type == 'management':
┌──────────────────────────────────────────┐
│ [Info box: Management quota — no         │
│  entrance exam required]                 │
└──────────────────────────────────────────┘
        │
        ▼
STEP 4: Document Uploads
[ADAPTIVE — required docs based on type + category + board]

Each document card shows:
┌──────────────────────────────────────────┐
│ 📄 10th Marks Card              [ⓘ]     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ Status: ○ Pending                        │
│                                          │
│ [Upload File]  PDF, JPG, PNG · Max 5MB  │
└──────────────────────────────────────────┘

After upload:
┌──────────────────────────────────────────┐
│ 📄 10th Marks Card     ✓ Uploaded  [ⓘ] │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ [Preview]   [Replace]                    │
│                                          │
│ 🔄 Extracting data...                   │ ← OCR processing
└──────────────────────────────────────────┘

After OCR done:
┌──────────────────────────────────────────┐
│ 📄 10th Marks Card     ✓ Uploaded  [ⓘ] │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ Extracted Data (please verify):          │
│   Name: RAVI KUMAR S         [Edit]     │
│   DOB: 15/03/2004            [Edit]     │
│   Register No: KA2345678     [Edit]     │
│   Percentage: 90.00%         [Edit]     │
│ [Confirm Data]                           │
└──────────────────────────────────────────┘

[ⓘ] Info Modal shows:
  - Sample document image with highlighted fields
  - What we extract from this document
  - Accepted formats and size limits
  - Why this document is needed
        │
        ▼
STEP 5: Review & Submit
┌──────────────────────────────────────────┐
│ APPLICATION SUMMARY                      │
│ ──────────────────────────────────────── │
│ Personal: ✓ Complete                     │
│ Academic: ✓ Complete                     │
│ Entrance: ✓ Complete                     │
│ Documents:                               │
│   ✓ 10th Marks Card — Uploaded          │
│   ✓ 12th Marks Card — Uploaded          │
│   ✓ KCET Rank Card  — Uploaded          │
│   ✓ Aadhaar         — Uploaded          │
│   ✓ Transfer Cert   — Uploaded          │
│   △ Caste Cert      — Missing (optional)│
│                                          │
│ ⚠ Validation Warnings:                  │
│   Name on Aadhaar differs slightly       │
│   from 10th marks card. Admin will       │
│   verify during review.                  │
│                                          │
│ [Submit Application]                     │
└──────────────────────────────────────────┘
```

### 1.3 Post-Submission Status Tracking

```
/status (read-only view after submission)

Timeline view:
  ✓ Application Submitted        Apr 10, 2025 2:34 PM
  ⏳ Documents Under Review      Apr 11, 2025 (estimated)
  ○ Verification Complete
  ○ Decision

Document Status:
  ✓ 10th Marks Card    — Verified
  ✓ 12th Marks Card    — Verified
  ⚠ KCET Rank Card    — Rejected [View reason] [Request Correction]
  ✓ Aadhaar            — Verified
  ✓ Transfer Cert      — Verified
```

### 1.4 Correction Request Flow

```
Student sees rejection on KCET Rank Card
        │
        ▼
[Request Correction] button
        │
        ▼
Modal: "What needs to be corrected?"
┌──────────────────────────────────────────┐
│ Field: KCET Rank Card                    │
│ Rejection reason: "Document is blurry,   │
│ rank number not readable"               │
│                                          │
│ Your message:                            │
│ [I have uploaded a clearer scan. ___]    │
│                                          │
│ [Submit Request]                         │
└──────────────────────────────────────────┘
        │
        ▼
Admin receives notification
Admin approves → Student can replace document
```

---

## 2. ADMIN FLOW

### 2.1 Invite Management

```
/admin/invites

[+ Invite Single Student]     [↑ Bulk Import CSV]

Single invite modal:
┌──────────────────────────────────────────┐
│ Student Name: [_______________]          │
│ Email:        [_______________]          │
│ [Send Invite]                            │
└──────────────────────────────────────────┘

Bulk CSV format:
  first_name, last_name, email
  Ravi, Kumar, ravi.kumar@gmail.com
  Priya, S, priya.s@gmail.com

Invite list table:
  Name       | Email           | Status   | Sent     | Actions
  Ravi Kumar | ravi@gmail.com  | Pending  | Apr 1    | [Resend] [Revoke]
  Priya S    | priya@gmail.com | Accepted | Mar 28   | —
```

### 2.2 Application Review Flow

```
/admin/applications

Filters: [All Types ▼] [All Status ▼] [All Categories ▼] [Date Range]
Search: [_______________]

Applications table:
  Name          | Type   | Category | Status        | Submitted | Actions
  Ravi Kumar    | KCET   | General  | Under Review  | Apr 10    | [Review]
  Priya S       | Mgmt   | OBC      | Submitted     | Apr 11    | [Review]

[Review] → /admin/applications/:id
```

### 2.3 Single Application Review

```
/admin/applications/:id

Left panel (40%):          Right panel (60%):
┌──────────────────┐      ┌──────────────────────────────┐
│ Student Profile  │      │ Document Viewer               │
│ ──────────────── │      │ [← Prev] 10th Marks Card [Next →] │
│ Ravi Kumar S     │      │                              │
│ ravi@gmail.com   │      │ [Document Image Preview]     │
│ KCET · General   │      │                              │
│                  │      │ Extracted Data:              │
│ Application      │      │   Name: RAVI KUMAR S         │
│ Status: Review   │      │   DOB: 15/03/2004            │
│                  │      │   Register: KA2345678        │
│ Documents (5/5): │      │   Percentage: 90.00%         │
│ ✓ 10th Marks    │      │                              │
│ ✓ 12th Marks    │      │ Actions:                     │
│ ⏳ KCET Card    │ ←──  │ [✓ Verify] [✗ Reject]       │
│ ✓ Aadhaar       │      │                              │
│ ✓ Transfer Cert │      │ Rejection reason (optional): │
│                  │      │ [___________________________]│
│ [Approve All]    │      │                              │
│ [Request Resubmit]│     │ [Submit Decision]            │
└──────────────────┘      └──────────────────────────────┘
```

### 2.4 Correction Request Handling

```
/admin/corrections (or inline in application view)

Pending corrections:
  Student    | Field           | Message               | Actions
  Ravi K     | KCET Rank Card  | "Uploaded clearer..." | [Approve] [Reject]

[Approve] → Unlocks document replacement for student
             Sends email notification to student
[Reject]  → Admin enters reason
             Student notified, cannot re-upload
```

---

## 3. SCREEN MAP

```
STUDENT PORTAL
├── /login                          → JWT login
├── /invite/accept?token=           → First-time setup
├── /set-password                   → Force password change
├── /dashboard                      → Application overview + progress
├── /application/                   → Multi-step form (Steps 1–5)
│   ├── personal
│   ├── academic
│   ├── entrance
│   ├── documents
│   └── review
├── /status                         → Read-only status tracker (post-submit)
└── /profile                        → Edit contact info only

ADMIN PORTAL
├── /login                          → Admin JWT login
├── /dashboard                      → Overview stats
├── /invites                        → Invite management
├── /applications                   → Application list with filters
├── /applications/:id               → Single application review
├── /corrections                    → All pending correction requests
└── /analytics                      → Summary charts (optional v1)
```

---

## 4. AUTO-SAVE BEHAVIOR

```
User types in any form field
        │
        ▼
onChange → update local Zustand store (instant, no API call)
        │
        ▼ (debounce 1000ms)
PATCH /applications/:id/draft { field_path: value }
        │
        ├── Success → "Last saved: just now" ✓
        └── Fail    → "Save failed — retrying..." (retry x3)
                     If all fail: "Changes saved locally — will sync when reconnected"

On page reload:
        │
        ▼
GET /applications/:id/draft → restore full form_data JSONB
        │
        ▼
Populate all form fields from saved state
Show: "Draft restored from Apr 10, 2:34 PM"
```

---

## 5. FORM ADAPTATION LOGIC (Decision Tree)

```
Input:  { admission_type, category, board_type }
Output: { required_documents[], visible_fields[] }

function resolveRequiredDocuments(input):
  docs = [
    'marks_card_10th',
    'marks_card_12th',
    'aadhaar',
    'transfer_certificate'
  ]

  if input.admission_type == 'kcet':
    docs.push('kcet_rank_card')
  
  if input.admission_type == 'comedk':
    docs.push('comedk_rank_card')

  if input.category in ['sc', 'st', 'obc']:
    docs.push('caste_certificate')
    docs.push('income_certificate')  // optional
  
  if input.category == 'ph':
    docs.push('medical_certificate')

  if input.board_type != 'karnataka_state':
    docs.push('migration_certificate')

  return docs
```
