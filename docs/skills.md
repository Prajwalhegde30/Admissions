# Skills & Coding Rules
## Atria Admission System — AI Agent Instructions

> These are the rules the AI coding agent MUST follow when building this system.
> Read this file before generating any code.

---

## 1. PROJECT IDENTITY

- **Product:** Atria Institute of Technology — Admission Portal
- **Style:** Clean, institutional, professional. Not a startup landing page.
- **Primary colors:** Deep navy `#1a2744` + White + Accent blue `#2563eb`
- **Font:** `Geist` (headings) + `Inter` (body) — both available via `next/font`
- **UI library:** Shadcn/ui (Radix primitives + Tailwind). Never use MUI or Ant Design.
- **No emojis in UI.** Use Lucide icons only.

---

## 2. STACK RULES

### Frontend (Next.js 14 App Router)
- Always use **App Router**, never Pages Router
- Server Components by default; add `"use client"` only when needed (event handlers, state, browser APIs)
- Data fetching: server components use `fetch()` directly; client components use **React Query** (`@tanstack/react-query`)
- State management: **Zustand** for global client state (form store, auth store)
- Form handling: **React Hook Form** + **Zod** validation
- File structure per feature:
  ```
  app/(dashboard)/application/
  ├── page.tsx          ← Server component, data fetch
  ├── _components/      ← Feature-local components (underscore = private)
  │   ├── PersonalForm.tsx
  │   └── StepNav.tsx
  └── actions.ts        ← Server actions if needed
  ```
- Never put API calls directly in components. Use `lib/api/` functions.
- All API calls go through `libs/api-client/` typed client.

### Backend (NestJS)
- Module-per-feature architecture. Never put logic in controllers.
- Controllers: only handle HTTP, call service, return response
- Services: all business logic
- Repositories: all database queries (Prisma)
- Use `class-validator` + `class-transformer` for all DTOs
- Every endpoint needs a `@Roles()` guard
- Throw NestJS `HttpException` never raw `Error`

### Database
- **Never** run raw SQL. Use Prisma client only.
- Always use transactions for multi-table writes
- Never select `*`. Always specify fields in Prisma select.
- All timestamps in UTC. Return as ISO 8601 strings.

---

## 3. FILE NAMING CONVENTIONS

| Type | Convention | Example |
|------|-----------|---------|
| React components | PascalCase | `DocumentCard.tsx` |
| Hooks | camelCase with `use` prefix | `useApplicationStore.ts` |
| API modules | kebab-case | `correction-requests.module.ts` |
| DB migrations | Prisma auto-generated | `20250410_add_audit_logs` |
| Types/interfaces | PascalCase, suffix with type meaning | `ApplicationStatus`, `CreateInviteDto` |
| Zod schemas | camelCase with `Schema` suffix | `createInviteSchema` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE_BYTES` |

---

## 4. COMPONENT RULES

### Every form input must:
- Show label above the input (never placeholder-only)
- Show error message below (via React Hook Form `formState.errors`)
- Show loading state during async operations
- Be wrapped in `FormField` from shadcn

### Every page must:
- Have a loading skeleton (use `loading.tsx` in App Router)
- Have an error boundary (use `error.tsx` in App Router)
- Be wrapped in the correct layout (student layout vs admin layout)

### File upload component requirements:
- Drag and drop + click to upload
- Show file name + size after selection
- Show upload progress bar
- Show preview for images; show PDF icon for PDFs
- Show OCR status spinner after upload
- "Replace" button only visible if document not yet verified

### Document status badge colors:
```
pending       → gray
uploaded      → blue
under_review  → yellow
verified      → green
rejected      → red
```

---

## 5. API INTEGRATION RULES

- All API calls must handle these states: `loading`, `success`, `error`
- Never show a raw error message to the user. Map error codes to human-readable messages.
- Auth token stored in `httpOnly` cookie (not localStorage)
- On 401 response, automatically attempt token refresh once, then redirect to login
- File uploads must show progress percentage

### API client pattern:
```typescript
// libs/api-client/documents.ts
export const documentsApi = {
  upload: async (applicationId: string, type: DocumentType, file: File) => {
    const form = new FormData();
    form.append('applicationId', applicationId);
    form.append('documentType', type);
    form.append('file', file);
    return apiClient.post<Document>('/documents', form);
  },
  
  getPresignUrl: async (documentId: string) =>
    apiClient.get<{ url: string }>(`/documents/${documentId}/presign`),
}
```

---

## 6. ADAPTIVE FORM ENGINE

The form engine is the core of the student portal. Build it as:

```typescript
// libs/forms/form-engine/resolver.ts
export function resolveVisibleFields(context: FormContext): FieldConfig[] {
  // Returns only the fields the student should see
}

export function resolveRequiredDocuments(context: FormContext): DocumentType[] {
  // Returns only the documents the student needs to upload
}

// FormContext = { admissionType, category, boardType }
```

Rules:
- This function is **pure** (no side effects, no API calls)
- It must be importable in both frontend AND backend (lives in `libs/shared/`)
- Backend uses it during submit validation to enforce same rules
- Frontend uses it to show/hide fields
- Tests are required for this function (all combinations)

---

## 7. OCR INTEGRATION

OCR is async. Never block the UI waiting for it.

Pattern:
1. Upload file → get back `{ documentId, ocrStatus: 'pending' }`
2. Poll `GET /documents/:id/ocr` every 3 seconds while `ocrStatus === 'processing'`
3. When `ocrStatus === 'done'`, show extracted fields inline
4. When `ocrStatus === 'failed'`, show: "We couldn't read this document automatically. Please enter the details manually."
5. Student confirms / edits extracted data → `PATCH /documents/:id/confirm-ocr`

OCR extracted fields should pre-fill the corresponding form fields automatically (e.g., name from 10th card fills "Full Name" in Step 1 if not already filled).

---

## 8. AUTO-SAVE PATTERN

```typescript
// Debounced auto-save hook
function useAutoSave(applicationId: string) {
  const { formData } = useApplicationStore();
  const saveField = useMutation(api.applications.saveDraft);

  const debouncedSave = useDebouncedCallback((path, value) => {
    saveField.mutate({ applicationId, fieldPath: path, value });
  }, 1000);

  return { debouncedSave, isSaving: saveField.isPending };
}
```

- "Last saved" timestamp shown in header on all form pages
- On save failure, show inline warning (not modal/toast blocking the form)
- On page load, always fetch draft first before rendering form

---

## 9. SECURITY CHECKLIST (implement all of these)

- [ ] RBAC: every route decorated with `@Roles('admin')` or `@Roles('student')`
- [ ] Document ownership: student can only access own documents (service layer check)
- [ ] Presigned URLs: only generated after ownership verification
- [ ] File type validation: check MIME type server-side (not just extension)
- [ ] File size: reject files > 5MB before S3 upload
- [ ] Input sanitization: all text inputs sanitized (DOMPurify on frontend)
- [ ] Rate limiting: `@Throttle` on auth endpoints
- [ ] No stack traces in production error responses

---

## 10. DO NOT DO THESE

- ❌ Do not use `any` in TypeScript. Use `unknown` and narrow types.
- ❌ Do not store JWT in localStorage. Use httpOnly cookies.
- ❌ Do not expose S3 bucket URLs directly. Always use presigned URLs.
- ❌ Do not do database queries in controllers. Only in repositories/services.
- ❌ Do not hardcode URLs, API keys, or credentials. Use `.env` variables.
- ❌ Do not use `console.log` in production code. Use NestJS Logger.
- ❌ Do not skip loading states. Every async operation needs a loading indicator.
- ❌ Do not use inline styles. Use Tailwind classes only.
- ❌ Do not create new Shadcn components from scratch. Use `npx shadcn-ui add` first.
- ❌ Do not mutate Zustand state directly. Always use store actions.

---

## 11. TESTING REQUIREMENTS

### For every new feature, write:
1. **Unit test** for the service method (Jest + mock Prisma)
2. **Integration test** for the API endpoint (Supertest)
3. **Unit test** for form engine resolver (pure function, easy to test)

### Test naming:
```
describe('DocumentService')
  describe('uploadDocument')
    it('should create a document record and enqueue OCR job')
    it('should throw ForbiddenException if student does not own the application')
    it('should throw BadRequestException if file type is not allowed')
```

---

## 12. IMPORTANT BUSINESS RULES (never violate these)

1. A student can only have **one** application.
2. A document type can only be uploaded **once** per application (replace, not add).
3. A submitted application **cannot go back to draft** status.
4. An admin **cannot approve an application** if any required documents are not verified.
5. A student **cannot re-upload** a verified document.
6. Invite tokens are **single-use** — accepting invalidates the token.
7. Correction requests are **field-level**, not whole-document (admin unlocks one field at a time).
