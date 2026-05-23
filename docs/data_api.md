# API Reference
## Atria Admission System — REST API

**Base URL:** `https://api.atria-admission.ac.in/v1`  
**Auth:** Bearer JWT in `Authorization` header  
**Content-Type:** `application/json` (except file uploads: `multipart/form-data`)

---

## AUTHENTICATION

### POST /auth/login
Login for both admin and student roles.

**Request:**
```json
{
  "email": "student@example.com",
  "password": "SecurePass123"
}
```

**Response 200:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2g...",
  "expiresIn": 900,
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "firstName": "Ravi",
    "lastName": "Kumar",
    "role": "student",
    "mustChangePassword": false
  }
}
```

**Response 401:**
```json
{ "message": "Invalid credentials", "statusCode": 401 }
```

---

### POST /auth/refresh
Exchange refresh token for new access token.

**Request:**
```json
{ "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2g..." }
```

**Response 200:**
```json
{ "accessToken": "eyJhbGci...", "expiresIn": 900 }
```

---

### POST /auth/logout
Revoke refresh token.

**Request:**
```json
{ "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2g..." }
```

**Response 200:**
```json
{ "message": "Logged out successfully" }
```

---

### POST /auth/set-password
First-time password setup from invite token.

**Request:**
```json
{
  "inviteToken": "abc123xyz",
  "password": "NewSecurePass123",
  "confirmPassword": "NewSecurePass123"
}
```

**Response 200:** Same as login response.

---

## INVITES (Admin only)

### POST /invites
Create a single invite.

**Headers:** `Authorization: Bearer <admin_token>`

**Request:**
```json
{
  "firstName": "Ravi",
  "lastName": "Kumar",
  "email": "ravi.kumar@gmail.com"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "email": "ravi.kumar@gmail.com",
  "status": "pending",
  "expiresAt": "2025-04-13T10:00:00Z",
  "createdAt": "2025-04-10T10:00:00Z"
}
```

---

### POST /invites/bulk
Bulk invite from CSV.

**Request:** `multipart/form-data`
```
file: students.csv
```

**CSV Format:**
```
first_name,last_name,email
Ravi,Kumar,ravi@gmail.com
Priya,S,priya@gmail.com
```

**Response 200:**
```json
{
  "total": 50,
  "sent": 48,
  "failed": 2,
  "errors": [
    { "row": 23, "email": "duplicate@gmail.com", "reason": "Account already exists" },
    { "row": 31, "email": "bad-email", "reason": "Invalid email format" }
  ]
}
```

---

### GET /invites
List all invites with filters.

**Query params:** `status`, `page`, `limit`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "ravi@gmail.com",
      "firstName": "Ravi",
      "lastName": "Kumar",
      "status": "pending",
      "expiresAt": "2025-04-13T10:00:00Z",
      "createdAt": "2025-04-10T10:00:00Z"
    }
  ],
  "total": 120,
  "page": 1,
  "limit": 20
}
```

---

### POST /invites/:id/resend
Resend an invite (resets expiry to 72h from now).

**Response 200:**
```json
{ "message": "Invite resent", "expiresAt": "2025-04-16T10:00:00Z" }
```

---

### DELETE /invites/:id
Revoke an invite.

**Response 200:**
```json
{ "message": "Invite revoked" }
```

---

## APPLICATIONS

### GET /applications/mine
Get the current student's application (student only).

**Response 200:**
```json
{
  "id": "uuid",
  "studentId": "uuid",
  "admissionType": "kcet",
  "category": "general",
  "status": "draft",
  "formData": { "...full saved state..." },
  "submittedAt": null,
  "createdAt": "2025-04-10T10:00:00Z",
  "updatedAt": "2025-04-10T14:22:00Z"
}
```

---

### PATCH /applications/mine/draft
Auto-save form field(s). Called on every field change (debounced).

**Request:**
```json
{
  "fieldPath": "personal.fatherName",
  "value": "Suresh Kumar"
}
```

Or batch:
```json
{
  "fields": [
    { "fieldPath": "academic.tenthPercentage", "value": 90.5 },
    { "fieldPath": "academic.tenthYear", "value": 2020 }
  ]
}
```

**Response 200:**
```json
{ "savedAt": "2025-04-10T14:22:34Z" }
```

---

### POST /applications/mine/submit
Submit the application (irreversible, changes status from draft → submitted).

**Response 200:**
```json
{
  "id": "uuid",
  "status": "submitted",
  "submittedAt": "2025-04-10T14:30:00Z"
}
```

**Response 400 (validation errors):**
```json
{
  "message": "Application has validation errors",
  "errors": [
    { "field": "documents.kcet_rank_card", "message": "Required document not uploaded" }
  ]
}
```

---

### GET /applications
List all applications (admin only). Supports filters.

**Query params:** `admissionType`, `category`, `status`, `search`, `page`, `limit`, `sortBy`, `sortOrder`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "student": {
        "id": "uuid",
        "firstName": "Ravi",
        "lastName": "Kumar",
        "email": "ravi@gmail.com"
      },
      "admissionType": "kcet",
      "category": "general",
      "status": "under_review",
      "submittedAt": "2025-04-10T14:30:00Z",
      "documentsCount": { "total": 5, "verified": 3, "rejected": 1, "pending": 1 }
    }
  ],
  "total": 230,
  "page": 1,
  "limit": 20
}
```

---

### GET /applications/:id
Get single application detail (admin only).

**Response 200:**
```json
{
  "id": "uuid",
  "student": { "...user object..." },
  "studentProfile": { "...full profile..." },
  "admissionType": "kcet",
  "category": "general",
  "status": "under_review",
  "documents": [ "...see documents schema..." ],
  "correctionRequests": [ "..." ],
  "auditTimeline": [
    { "action": "application.submitted", "at": "2025-04-10T14:30:00Z", "by": "student" },
    { "action": "document.verified", "at": "2025-04-11T10:00:00Z", "by": "Admin Name", "meta": { "documentType": "marks_card_10th" } }
  ]
}
```

---

### PATCH /applications/:id/status
Update application status (admin only).

**Request:**
```json
{
  "status": "approved",
  "adminNotes": "All documents verified, application approved."
}
```

Valid transitions: `submitted → under_review`, `under_review → approved | rejected | correction_requested`

**Response 200:**
```json
{ "id": "uuid", "status": "approved", "reviewedAt": "2025-04-11T10:00:00Z" }
```

---

## DOCUMENTS

### POST /documents
Upload a document. (Student only)

**Request:** `multipart/form-data`
```
applicationId: uuid
documentType: marks_card_10th
file: [binary]
```

**Response 201:**
```json
{
  "id": "uuid",
  "documentType": "marks_card_10th",
  "status": "uploaded",
  "ocrStatus": "pending",
  "fileName": "ravi_10th.jpg",
  "fileSize": 1024000,
  "uploadedAt": "2025-04-10T10:00:00Z"
}
```

---

### GET /documents/:id/presign
Get a pre-signed S3 URL to view a document.

**Response 200:**
```json
{
  "url": "https://s3.amazonaws.com/bucket/key?X-Amz-Signature=...",
  "expiresAt": "2025-04-10T10:10:00Z"
}
```

---

### GET /documents/:id/ocr
Get OCR extraction results for a document.

**Response 200:**
```json
{
  "id": "uuid",
  "ocrStatus": "done",
  "ocrExtracted": {
    "name": "RAVI KUMAR S",
    "dob": "2004-03-15",
    "registerNo": "KA2345678",
    "percentage": 90.0
  },
  "ocrConfirmed": null
}
```

---

### PATCH /documents/:id/confirm-ocr
Student confirms (and optionally corrects) OCR data.

**Request:**
```json
{
  "name": "RAVI KUMAR S",
  "dob": "2004-03-15",
  "registerNo": "KA2345678",
  "percentage": 90.0
}
```

**Response 200:**
```json
{ "ocrConfirmed": { "...confirmed data..." }, "updatedAt": "..." }
```

---

### PATCH /documents/:id/review
Admin verifies or rejects a document.

**Request:**
```json
{
  "status": "rejected",
  "rejectionReason": "Document is blurry and rank number is not readable."
}
```

**Response 200:**
```json
{
  "id": "uuid",
  "status": "rejected",
  "rejectionReason": "...",
  "reviewedAt": "2025-04-11T10:00:00Z"
}
```

---

### DELETE /documents/:id
Student removes an uploaded document (only if not yet verified).

**Response 200:**
```json
{ "message": "Document removed" }
```

---

## CORRECTION REQUESTS

### POST /corrections
Student submits a correction request.

**Request:**
```json
{
  "applicationId": "uuid",
  "fieldPath": "documents.kcet_rank_card",
  "fieldLabel": "KCET Rank Card",
  "studentMessage": "I have a clearer scan. Please allow me to re-upload."
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "fieldPath": "documents.kcet_rank_card",
  "status": "pending",
  "createdAt": "..."
}
```

---

### GET /corrections
List correction requests.

- Student: sees only their own
- Admin: sees all, supports `?status=pending` filter

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "student": { "firstName": "Ravi", "lastName": "Kumar" },
      "applicationId": "uuid",
      "fieldPath": "documents.kcet_rank_card",
      "fieldLabel": "KCET Rank Card",
      "studentMessage": "I have a clearer scan...",
      "status": "pending",
      "createdAt": "..."
    }
  ]
}
```

---

### PATCH /corrections/:id/review
Admin approves or rejects a correction request.

**Request:**
```json
{
  "status": "approved",
  "adminNotes": "Re-upload approved. Please upload a clear scan.",
  "unlockField": true
}
```

**Response 200:**
```json
{
  "id": "uuid",
  "status": "approved",
  "fieldUnlocked": true,
  "reviewedAt": "..."
}
```

---

## NOTIFICATIONS

### GET /notifications
Get notifications for logged-in user.

**Query params:** `unreadOnly=true`, `page`, `limit`

**Response 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "document_rejected",
      "title": "Document Rejected",
      "body": "Your KCET Rank Card was rejected. Reason: Document is blurry.",
      "isRead": false,
      "createdAt": "2025-04-11T10:00:00Z"
    }
  ],
  "unreadCount": 3
}
```

---

### PATCH /notifications/:id/read
Mark a notification as read.

**Response 200:**
```json
{ "id": "uuid", "isRead": true }
```

---

## ANALYTICS (Admin only)

### GET /analytics/summary
Dashboard summary stats.

**Response 200:**
```json
{
  "totalApplications": 230,
  "byStatus": {
    "draft": 12,
    "submitted": 45,
    "under_review": 80,
    "approved": 85,
    "rejected": 8
  },
  "byAdmissionType": {
    "kcet": 150,
    "comedk": 60,
    "management": 20
  },
  "documentRejectionRate": {
    "marks_card_10th": 0.02,
    "marks_card_12th": 0.03,
    "kcet_rank_card": 0.12
  },
  "completionRate": 0.87,
  "avgTimeToSubmit": "2.4 days"
}
```

---

## ERROR RESPONSE FORMAT

All errors follow this structure:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Must be a valid email address" }
  ],
  "timestamp": "2025-04-10T10:00:00Z",
  "path": "/v1/invites"
}
```

| Code | Meaning |
|------|---------|
| 400 | Validation error or bad request |
| 401 | Missing or invalid token |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict (e.g., duplicate email) |
| 422 | Business logic error |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
