# Architecture Overhaul & Feature Implementation: Drag-and-Drop Workflow Maker for Recurring Jobs & APIs

This document outlines the architectural review, security hardening, performance optimization, reliability fixes, and UX/UI enhancements for **Floowsynk** — a high-performance Workflow Automation & Orchestration Platform.

---

## User Review Required

> [!IMPORTANT]
> **Key Architectural Decisions & Breaking Changes for Security & Stability:**
> 1. **Password Hashing Migration**: Existing passwords encrypted via fixed-nonce AES-GCM in `Server/crypto` will be migrated to standard **Bcrypt** password hashing.
> 2. **Webhook Endpoint Authentication**: Webhook triggers (`/api/webhook/{workflow_id}`) will enforce secret header/query parameter validation (`X-Webhook-Secret`) to prevent unauthorized triggers of internal workflows.
> 3. **Interval Job Polling Throttle**: The unthrottled infinite loop in `Jobs/Interval` (which currently spins at 100% CPU) will be throttled with a 5-second ticker and atomic Redis distributed locks (`SETNX`).
> 4. **HTTP Client Panic Prevention**: The API node processor will be patched to check `err != nil` before dereferencing HTTP response headers, preventing server panics.
> 5. **Task Tracker Persistence**: All 12 granular tasks have been structured and saved in [`tasks_tracker.json`](file:///Users/raenard/Documents/floowsynk/tasks_tracker.json).

---

## Open Questions

> [!NOTE]
> Currently, all technical and architectural requirements have clear remediation steps. If you have preferences regarding default polling intervals or specific secret header names, please let us know.

---

## Proposed Changes

### 🔒 Security Hardening

#### [MODIFY] [crypto.go](file:///Users/raenard/Documents/floowsynk/Server/crypto/crypto.go)
- Replace AES-GCM fixed-nonce logic with `golang.org/x/crypto/bcrypt` for secure `HashPassword` and `ComparePassword`.

#### [MODIFY] [users.go](file:///Users/raenard/Documents/floowsynk/Database/users.go)
#### [MODIFY] [API.Methods.go](file:///Users/raenard/Documents/floowsynk/Server/API.Methods.go)
- Integrate bcrypt verification into user authentication and creation routines.

#### [MODIFY] [workflow.proto](file:///Users/raenard/Documents/floowsynk/proto/workflow.proto)
#### [MODIFY] [workflows.go](file:///Users/raenard/Documents/floowsynk/Database/workflows.go)
#### [MODIFY] [main.go](file:///Users/raenard/Documents/floowsynk/Server/main.go)
- Add `WebhookSecret` field to Workflow definitions.
- Enforce secret header validation in `runWebhookHandler` for `/api/webhook/{workflow_id}`.

#### [MODIFY] [workflow.node.process.go](file:///Users/raenard/Documents/floowsynk/Server/workflow/workflow.node.process.go)
- Add evaluation timeouts and input length bounds for regular expressions and math expressions to guard against ReDoS.

---

### 🛡️ Reliability & Fault Tolerance

#### [MODIFY] [workflow.helpers.go](file:///Users/raenard/Documents/floowsynk/Server/workflow/workflow.helpers.go)
- Fix Nil Pointer Dereference in `makeRequest`: check `err != nil` immediately after `client.Do(req)` before accessing `resp.StatusCode`.

#### [MODIFY] [Jobs/Consumer/main.go](file:///Users/raenard/Documents/floowsynk/Jobs/Consumer/main.go)
- Wrap `replayData` slice accesses in `ConsumerGroupHandler.ConsumeClaim` and the periodic flusher with `sync.Mutex` to eliminate concurrent slice mutation data races.

#### [MODIFY] [Jobs/Interval/main.go](file:///Users/raenard/Documents/floowsynk/Jobs/Interval/main.go)
#### [MODIFY] [cache.go](file:///Users/raenard/Documents/floowsynk/Database/cache.go)
- Use atomic `SetNX` Redis distributed locking for interval jobs to prevent duplicate execution across multiple worker replicas.

#### [MODIFY] [workflow.node.process.go](file:///Users/raenard/Documents/floowsynk/Server/workflow/workflow.node.process.go)
- Implement recursion depth tracking (max depth 10) and cycle detection for `SubProcessNodeProcess`.

---

### ⚡ Performance & Optimization

#### [MODIFY] [Jobs/Interval/main.go](file:///Users/raenard/Documents/floowsynk/Jobs/Interval/main.go)
- Convert unthrottled `for { ... }` infinite DB query loop into a controlled `time.NewTicker(5 * time.Second)` loop.

#### [MODIFY] [workflows.go](file:///Users/raenard/Documents/floowsynk/Database/workflows.go)
- Standardize interval workflow Redis cache keys (`interval_workflows:`) and implement complete cache invalidation on workflow creation, update, and deletion.

---

### 🎨 User Experience & Drag-and-Drop Workflow Maker

#### [MODIFY] [App/src/views/Workflow/Canvas](file:///Users/raenard/Documents/floowsynk/App/src/views/Workflow/Canvas)
#### [MODIFY] [App/src/views/Workflow/Sidebar](file:///Users/raenard/Documents/floowsynk/App/src/views/Workflow/Sidebar)
- Refine Vue Flow canvas with drag-and-drop node sidebar, snap-to-grid alignment, category search filter (Triggers, Actions, Logic, Data), and node handle validation.

#### [NEW] [IntervalNode.vue](file:///Users/raenard/Documents/floowsynk/App/src/views/Workflow/Nodes/IntervalNode.vue)
- Add dedicated recurring job configuration panel (interval magnitude, unit selector, weekly day picker, active schedule toggle).

#### [NEW] [WebhookNode.vue](file:///Users/raenard/Documents/floowsynk/App/src/views/Workflow/Nodes/WebhookNode.vue)
- Add dedicated Webhook Trigger Node UI featuring auto-generated URL generator, secret token manager, sample payload builder, cURL snippet generator, and interactive "Test Trigger" button.

---

## Task Breakdown Summary ([`tasks_tracker.json`](file:///Users/raenard/Documents/floowsynk/tasks_tracker.json))

| Task ID | Category | Title | Target File(s) |
| :--- | :--- | :--- | :--- |
| **TASK-001** | Security | Upgrade Password Storage to Bcrypt Hashing | `Server/crypto/crypto.go`, `Database/users.go` |
| **TASK-002** | Security | Webhook API Authentication & Secret Verification | `proto/workflow.proto`, `Server/main.go` |
| **TASK-003** | Security | Hardening Input Validation & ReDoS Protection | `Server/workflow/workflow.node.process.go` |
| **TASK-004** | Reliability | Fix Nil Pointer Dereference in HTTP API Node | `Server/workflow/workflow.helpers.go` |
| **TASK-005** | Reliability | Fix Data Race in Kafka Consumer Replay Flusher | `Jobs/Consumer/main.go` |
| **TASK-006** | Reliability | Atomic Redis SETNX Lock for Recurring Jobs | `Jobs/Interval/main.go`, `Database/cache.go` |
| **TASK-007** | Reliability | Recursion Depth & Cycle Detection in SubProcess | `Server/workflow/workflow.node.process.go` |
| **TASK-008** | Performance | Throttle Interval Job Polling Loop | `Jobs/Interval/main.go`, `Database/workflows.go` |
| **TASK-009** | Performance | Optimize Template Variable Substitution | `Server/workflow/workflow.helpers.go` |
| **TASK-010** | UX/UI | Visual Drag-and-Drop Node Builder & Palette | `App/src/views/Workflow/*` |
| **TASK-011** | UX/UI | Recurring Job (Scheduler) UI & Day Selector | `App/src/views/Workflow/Nodes/IntervalNode.vue` |
| **TASK-012** | UX/UI | Webhook API Generator & cURL Exporter UI | `App/src/views/Workflow/Nodes/WebhookNode.vue` |

---

## Verification Plan

### Automated Tests & Code Verification
- `go test ./...` across server, database, and workflow packages.
- `go run -race Jobs/Consumer/main.go` to verify zero data races under concurrent execution.
- `npm run build` and `npm run test` inside `App/` directory for Vue TypeScript type checking.

### Manual Verification
- **Recurring Jobs**: Create an interval workflow scheduled for 5 seconds, start `make job-interval`, and verify execution logs trigger automatically without CPU spikes.
- **API Webhooks**: Execute a cURL POST to `/api/webhook/{workflow_id}` with and without secret header, verifying authentication and instant execution.
- **Workflow Builder**: Test node drag-and-drop, line connections, node data saving, and live execution replay stream in the web UI.
