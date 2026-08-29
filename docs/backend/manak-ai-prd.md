# MānaK AI — SaaS Features PRD
**Version**: 1.0 | **Scope**: Post-core CRUD & UX additions | **Stack**: FastAPI + MongoDB + React

---

## Priority Matrix

| Feature | Effort | Value | Execution Phase | Status |
|---|---|---|---|---|
| Suggested Follow-ups | XS | High | 1 | Approved |
| Industry Profile | S | High | 1 | Approved |
| Project Status Labels | XS | High | 2 | Approved |
| Due Dates on Checklist Steps | S | High | 2 | Approved |
| Clone Workspace | S | High | 2 | Approved |
| Empty States | XS | High | 2 | Ongoing |
| Export Workspace PDF | M | High | 3 | Modified (Frontend) |
| Bookmark / Standards Library | M | High | 3 | Approved |
| Chat Feedback (thumbs) | S | Medium | - | Cut for MVP |
| File Attachments on Steps | M | Medium | - | Cut for MVP |
| Notification Center | S | Low | - | Cut for MVP |
| Activity Log per Workspace | M | Low | - | Cut for MVP |
| Chat History Search | M | Medium | - | Cut for MVP |

---

## Feature Specs

### F-01 — Project Status Labels
**Goal**: Make project list scannable; reflect real compliance lifecycle stages.

**Schema change** (`projects` collection):
```
status: enum["PLANNING", "IN_PROGRESS", "SUBMITTED", "CERTIFIED", "ON_HOLD"]
default: "PLANNING"
```

**API**: `PATCH /api/v1/projects/{project_id}` — already exists or extend with `status` field in body.

**UI**: Status chip on project card + dropdown on workspace detail header. Color map: Planning=gray, In Progress=blue, Submitted=amber, Certified=green, On Hold=red.

---

### F-02 — Due Dates on Checklist Steps
**Goal**: Turn the checklist into an actual compliance timeline.

**Schema change** (checklist step subdocument):
```
due_date: ISODate | null
```

**API**: Extend `POST /{project_id}/checklist` and `PATCH /{project_id}/checklist/{step_id}` to accept `due_date`.

**UI**: Inline date picker on each step. Overdue steps (due_date < today, not complete) get a red badge and sort to top. No notification dependency required — purely computed on render.

---

### F-03 — Notification Center
**Goal**: Surface standard update events and project deadline alerts without real-time infra.

**New collection** (`notifications`):
```
user_id, type: enum["STANDARD_UPDATE","DEADLINE","SYSTEM"], 
title, body, is_read: bool, 
ref_project_id?: ObjectId, ref_standard?: string,
created_at
```

**API**:
- `GET /api/v1/notifications` — paginated, sorted desc
- `PATCH /api/v1/notifications/{id}/read`
- `PATCH /api/v1/notifications/read-all`

**UI**: Bell icon in navbar with unread count badge. Dropdown panel with notification rows. Poll on page focus (no WebSocket needed). Admin/backend seeds standard update notifications manually for now.

---

### F-04 — Suggested Follow-up Questions
**Goal**: Guide users through compliance questions without extra LLM calls.

**Implementation**: Pure frontend. Map intent string returned by `/chat/message` to static suggestion arrays:

```js
const SUGGESTIONS = {
  CERTIFICATION: ["What documents do I need?", "How long does this take?", "Which labs can test this?"],
  VERIFICATION:  ["Check another product", "What does this mark mean?", "Show me the QCO"],
  GENERAL:       ["Is there a QCO for this?", "Which BIS scheme applies?", "Find related standards"],
}
```

**UI**: 2–3 chip buttons rendered below each AI response. Tapping a chip prefills the chat input and submits.

---

### F-05 — Clone / Duplicate Workspace
**Goal**: Let MSMEs with similar products reuse compliance roadmaps.

**API**: `POST /api/v1/projects/{project_id}/duplicate`

**Logic**:
1. Fetch source project document.
2. Deep-copy with new `_id`, `created_at`, reset all checklist step `completed` to `false`, append " (Copy)" to name.
3. Return new project document.

**UI**: "Duplicate" option in workspace card kebab menu (⋮). Redirects to new workspace on success.

---

### F-06 — Empty States
**Goal**: Remove dead ends; turn blank screens into actionable prompts.

**Screens to cover**:

| Screen | Heading | Body | CTA |
|---|---|---|---|
| No projects | "No workspaces yet" | "Describe your product and we'll build your compliance roadmap." | "Start a Chat" |
| No chat sessions | "Nothing here yet" | "Ask MānaK anything about BIS standards or certification." | "New Chat" |
| Empty checklist | "Checklist is empty" | "AI generates steps automatically, or add your own." | "Add Step" |
| No bookmarks | "No saved standards" | "Bookmark clauses from any AI response to build your library." | — |
| No notifications | "You're all caught up" | — | — |

**Implementation**: Conditional render in each list component. No backend changes.

---

### F-07 — Chat Message Feedback
**Goal**: Capture RAG quality signal; build judge/evaluator trust.

**Schema change** (chat messages):
```
feedback: enum["positive", "negative"] | null, default: null
```

**API**: `PATCH /api/v1/chat/message/{message_id}/feedback` — body: `{ "feedback": "positive" }`

**UI**: Thumbs up / thumbs down icon row below each AI message. Selected state persists. One feedback per message (toggling same value clears it).

---

### F-08 — File Attachments on Checklist Steps
**Goal**: Let users attach proof documents (test reports, forms, certificates) to steps.

**New collection** (`step_attachments`):
```
step_id, project_id, user_id,
filename, file_path, mime_type, size_bytes,
uploaded_at
```

**API**:
- `POST /api/v1/projects/{project_id}/checklist/{step_id}/attachments` — multipart upload
- `GET /api/v1/projects/{project_id}/checklist/{step_id}/attachments`
- `DELETE /api/v1/projects/{project_id}/checklist/{step_id}/attachments/{attachment_id}`

**Storage**: Local disk at `data/uploads/` (same pattern as existing `/pdfs` mount). Add S3 later via config flag.

**UI**: Paperclip icon on each step opens a mini file list + upload dropzone. Show filename, size, upload date. Max 10MB per file, PDF/PNG/JPG only.

---

### F-09 — Bookmark / Standards Library
**Goal**: Personal library of cited clauses saved from AI responses.

**New collection** (`bookmarks`):
```
user_id, standard_ref, clause_text (truncated),
pdf_path, page_number?, note?: string,
created_at
```

**API**:
- `POST /api/v1/bookmarks` — body: `{ standard_ref, clause_text, pdf_path, note? }`
- `GET /api/v1/bookmarks` — list all for user
- `PATCH /api/v1/bookmarks/{id}` — update note
- `DELETE /api/v1/bookmarks/{id}`

**UI**: Bookmark icon on each citation chip in AI responses. "Saved Standards" page in sidebar shows all bookmarks, grouped by standard. Inline note editing. Opens native PDF viewer at cited page on click.

---

### F-10 — Industry Profile
**Goal**: Personalize AI context without user effort on every query.

**Schema change** (`users` collection):
```
profile: {
  company_name?: string,
  industry_sector?: enum["Manufacturing","Import/Export","MSME","Consumer","Startup","Other"],
  state?: string,
  profile_complete: bool
}
```

**API**: `PATCH /api/v1/auth/profile` — partial update.

**RAG integration**: Inject profile as silent system context prefix:
```
[User context: MSME in Maharashtra, sector: Manufacturing]
```

**UI**: "Complete your profile" banner on dashboard (dismissible, reappears if incomplete). Simple form: company name, sector dropdown, state dropdown. Show completion percentage.

---

### F-11 — Export Workspace as PDF
**Goal**: Printable compliance progress report for auditors and internal use.

**API**: `GET /api/v1/projects/{project_id}/export` — returns `application/pdf`

**Content**:
- Header: project name, status, generated date, user company name
- Summary: total steps, completed steps, % progress
- Checklist table: step title | due date | status | attachments count
- Footer: "Generated by MānaK AI — manak.ai"

**Library**: `weasyprint` (HTML→PDF) or `reportlab`. Render an HTML template server-side, stream PDF response.

**UI**: "Export PDF" button on workspace detail page header.

---

### F-12 — Activity Log per Workspace
**Goal**: Audit trail of all actions taken on a workspace.

**New collection** (`project_activity`):
```
project_id, user_id, action: enum[
  "PROJECT_CREATED","STATUS_CHANGED","STEP_ADDED",
  "STEP_COMPLETED","STEP_UNCOMPLETED","FILE_ATTACHED",
  "CHAT_LINKED","DUPLICATE_CREATED"
],
meta: object (e.g., { from: "IN_PROGRESS", to: "SUBMITTED" }),
created_at
```

**API**: `GET /api/v1/projects/{project_id}/activity` — paginated, desc

**Logging**: Insert activity document inside each relevant endpoint handler (fire-and-forget, don't block response).

**UI**: Collapsible "Activity" panel at bottom of workspace detail. Timeline format: icon + action text + relative timestamp.

---

### F-13 — Chat History Search
**Goal**: Let returning users find past AI responses without scrolling.

**Backend**: Add MongoDB text index on `chats.content`. 

**API**: `GET /api/v1/chat/search?q={query}&limit=10` — returns matching messages with `session_id`, truncated content snippet, timestamp.

**UI**: Search bar above session list in chat sidebar. Results show session title + matched snippet. Clicking navigates to that session and highlights the matched message.

---

## Execution Plan (MVP Adjusted)

Based on feasibility and hackathon impact, the features have been reprioritized into three execution phases. High-impact AI/UX features are prioritized, while enterprise boilerplate features are cut or modified.

### Phase 1: High-Impact AI & UX (Immediate)
- **F-04 (Suggested Follow-up Questions)**: Pure frontend implementation mapped to intent. Massive UX boost with zero backend latency.
- **F-10 (Industry Profile)**: Add profile fields to `users` and inject into the Gemini system prompt for silent RAG personalization.

### Phase 2: Workspace Project Management (Core Polish)
- **F-01 (Project Status Labels)**: Add to schema and update Workspace UI.
- **F-02 (Due Dates on Steps)**: Update checklist subdocument schema and add inline date pickers.
- **F-05 (Clone Workspace)**: Simple backend duplication logic for easy reuse of roadmaps.

### Phase 3: Fast Feature Adds
- **F-11 (Export Workspace PDF)**: *Modified from PRD.* Shifted from backend (Weasyprint/Reportlab) to frontend (`html2pdf.js` or `window.print`) to avoid complex C-library dependencies on the host machine.
- **F-09 (Bookmarks)**: Personal library for cited clauses.

---

## Data Model Summary (Net New)

| Collection | Purpose |
|---|---|
| `bookmarks` | Saved standard citations per user |

**Modified collections**: `projects` (+status), checklist step subdoc (+due_date), `users` (+profile).

---

## Out of Scope (Cut for MVP)
The following features have been cut from the hackathon scope as they add enterprise boilerplate complexity without highlighting the core AI value proposition:
- **F-08 (File Attachments)**: File handling and storage limits distract from the core flow.
- **F-03 (Notification Center)**: Since the dataset is currently static, mock notifications add unnecessary UI clutter.
- **F-12 (Activity Log)**: Audit trails are deferred to post-MVP.
- **F-07 (Chat Feedback)**: Deferred (would require significant changes to expose MongoDB `_id` mappings for individual messages to the frontend).
- Voice input
- Real-time WebSockets
- Multilingual UI (Gemini handles Hindi in prompts; full i18n deferred)
- Multi-user / team collaboration on workspaces
