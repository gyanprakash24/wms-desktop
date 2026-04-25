# Automotive WMS — Weekly Execution Board (12 Weeks)
## Planning Model
- **Method**: 6 sprints × 2 weeks each (mapped as Week 1–12)
- **Tracks**: Desktop App, Sync Engine, Backend Hub, Infra/DevOps, QA/Security
- **Priority Scale**: P0 (critical), P1 (high), P2 (normal)
- **Status**: TODO / IN-PROGRESS / BLOCKED / DONE
---
## Week 1 — Project Foundation & Monorepo Baseline
### Goals
- Initialize desktop app shell (Tauri + Preact + TypeScript + Tailwind).
- Establish coding standards, branching model, CI checks.
- Create baseline Prisma + SQLite integration.
### Tickets
1. **WMS-001 (P0)** — Initialize `wms-desktop` app skeleton with Tauri + Preact TS  
   - **Owner**: Desktop  
   - **Depends on**: None  
   - **Acceptance**: App boots on macOS/Windows dev machines; basic navigation works.
2. **WMS-002 (P0)** — Setup Tailwind theme tokens + base layout system  
   - **Owner**: Frontend  
   - **Depends on**: WMS-001  
   - **Acceptance**: Shared spacing, typography, color tokens consumed by sample screens.
3. **WMS-003 (P0)** — Configure Prisma schema + SQLite connection for local store  
   - **Owner**: Data  
   - **Depends on**: WMS-001  
   - **Acceptance**: Migration runs; local DB file created; seed script works.
4. **WMS-004 (P1)** — Add lint/typecheck/test pipeline in CI  
   - **Owner**: DevOps  
   - **Depends on**: WMS-001  
   - **Acceptance**: PR pipeline runs: lint + typecheck + unit tests.
---
## Week 2 — Core Domain Modeling & Auth/RBAC Skeleton
### Goals
- Define initial local entities and RBAC shape.
- Build login/session shell with JWT placeholder flow.
- Add encrypted local storage strategy decision record.
### Tickets
1. **WMS-005 (P0)** — Define local domain schema (Dealer, Vehicle, Claim, Evidence, SyncQueue, UserRole)  
   - **Owner**: Data  
   - **Depends on**: WMS-003  
   - **Acceptance**: Prisma models + constraints + indexes approved.
2. **WMS-006 (P0)** — Implement desktop auth shell + role-aware routing  
   - **Owner**: Desktop  
   - **Depends on**: WMS-001  
   - **Acceptance**: Admin/Advisor/Technician routes gated by role claims.
3. **WMS-007 (P1)** — SQLCipher feasibility spike & local key management design  
   - **Owner**: Security  
   - **Depends on**: WMS-003  
   - **Acceptance**: ADR published with selected encryption approach.
4. **WMS-008 (P1)** — Standardized API client (Axios/tRPC) with retry/backoff primitives  
   - **Owner**: Platform  
   - **Depends on**: WMS-001  
   - **Acceptance**: Shared client package consumed by one sample endpoint.
---
## Week 3 — VIN Lookup + Claim Creation MVP (Offline-First)
### Goals
- Deliver first usable workflow fully offline.
- Persist claim drafts and VIN lookup snapshots locally.
- Establish optimistic UI behavior with TanStack Query.
### Tickets
1. **WMS-009 (P0)** — VIN Lookup screen with cached lookup results  
   - **Owner**: Frontend  
   - **Depends on**: WMS-005  
   - **Acceptance**: VIN query works offline from local cache; clear stale indicators.
2. **WMS-010 (P0)** — Claim Creation form (labor codes, mileage, fault details)  
   - **Owner**: Frontend  
   - **Depends on**: WMS-005  
   - **Acceptance**: Form validation + local save as draft + status tags.
3. **WMS-011 (P0)** — Create local sync metadata fields (`sync_status`, `version`, `last_modified_at`)  
   - **Owner**: Data  
   - **Depends on**: WMS-005  
   - **Acceptance**: Every mutable entity tracks sync metadata consistently.
4. **WMS-012 (P1)** — UX resilience: conflict/stale badges and retry cues  
   - **Owner**: UX  
   - **Depends on**: WMS-009, WMS-010  
   - **Acceptance**: User sees actionable states (Pending Sync, Failed, Conflict).
---
## Week 4 — Evidence Pipeline & Local Queueing
### Goals
- Support drag-drop evidence capture and local queue.
- Add pre-upload optimization hook via Tauri/Rust sidecar.
- Prepare multipart upload contract.
### Tickets
1. **WMS-013 (P0)** — Evidence module (drag-drop images, metadata tagging)  
   - **Owner**: Desktop  
   - **Depends on**: WMS-010  
   - **Acceptance**: Images attached to claim; thumbnails and metadata visible.
2. **WMS-014 (P0)** — Local upload queue folder + DB queue records  
   - **Owner**: Platform  
   - **Depends on**: WMS-013, WMS-011  
   - **Acceptance**: Queue survives restart and reconnect cycles.
3. **WMS-015 (P1)** — Rust optimization sidecar integration (resize/compress)  
   - **Owner**: Rust Core  
   - **Depends on**: WMS-013  
   - **Acceptance**: Evidence reduced size with quality threshold before upload.
4. **WMS-016 (P1)** — Multipart upload client contract + checksum verification  
   - **Owner**: Platform  
   - **Depends on**: WMS-014  
   - **Acceptance**: Upload API contract doc + client implementation tests.
---
## Week 5 — Central Server Foundation (FastAPI + PostgreSQL)
### Goals
- Stand up centralized manufacturer hub backend.
- Define canonical claim and vehicle schemas in Postgres.
- Implement auth and dealership scoping.
### Tickets
1. **WMS-017 (P0)** — FastAPI service bootstrap (modular routers, Pydantic models)  
   - **Owner**: Backend  
   - **Depends on**: None  
   - **Acceptance**: Health/version endpoints + structured logs.
2. **WMS-018 (P0)** — PostgreSQL schema for global VIN/claims/evidence refs  
   - **Owner**: Backend Data  
   - **Depends on**: WMS-017  
   - **Acceptance**: Alembic migrations pass; constraints/indexes tuned.
3. **WMS-019 (P0)** — JWT auth + RBAC middleware + dealer scoping  
   - **Owner**: Security Backend  
   - **Depends on**: WMS-017  
   - **Acceptance**: Access control matrix tests pass.
4. **WMS-020 (P1)** — Redis/RabbitMQ decision + queue adapter abstraction  
   - **Owner**: Platform  
   - **Depends on**: WMS-017  
   - **Acceptance**: ADR + pluggable queue interface merged.
---
## Week 6 — Sync API v1 + Delta/CDC Contracts
### Goals
- Implement sync endpoints for desktop clients.
- Introduce delta packets and server acknowledgment protocol.
- Add idempotency safeguards.
### Tickets
1. **WMS-021 (P0)** — `/sync/push` endpoint (claims/evidence metadata deltas)  
   - **Owner**: Backend  
   - **Depends on**: WMS-018, WMS-019  
   - **Acceptance**: Accepts batched changes, validates schema, persists atomically.
2. **WMS-022 (P0)** — `/sync/pull` endpoint for server-side updates by watermark  
   - **Owner**: Backend  
   - **Depends on**: WMS-021  
   - **Acceptance**: Returns only records newer than `last_sync_timestamp`.
3. **WMS-023 (P0)** — Idempotency keys + dedupe handling  
   - **Owner**: Backend  
   - **Depends on**: WMS-021  
   - **Acceptance**: Duplicate push does not create duplicate records.
4. **WMS-024 (P1)** — Desktop sync worker skeleton (heartbeat + exponential backoff)  
   - **Owner**: Rust/Desktop  
   - **Depends on**: WMS-021, WMS-022  
   - **Acceptance**: Worker retries safely and updates local sync states.
---
## Week 7 — Conflict Resolution & Reconciliation Engine
### Goals
- Resolve concurrent edits safely.
- Add explicit conflict events and UI tooling.
- Enable operator-assisted reconciliation for edge cases.
### Tickets
1. **WMS-025 (P0)** — Version-clock strategy (`entity_version`, `updated_by`, `updated_at`)  
   - **Owner**: Backend Data  
   - **Depends on**: WMS-022  
   - **Acceptance**: Conflicts deterministically detected.
2. **WMS-026 (P0)** — Conflict policy implementation (default: latest timestamp wins; policy hooks)  
   - **Owner**: Backend  
   - **Depends on**: WMS-025  
   - **Acceptance**: Policy configurable by entity type.
3. **WMS-027 (P1)** — Desktop conflict inbox UI and manual resolve actions  
   - **Owner**: Frontend  
   - **Depends on**: WMS-026  
   - **Acceptance**: Users can inspect diff and choose keep-local/accept-server.
4. **WMS-028 (P1)** — Reconciliation audit trail tables + export endpoint  
   - **Owner**: Compliance  
   - **Depends on**: WMS-026  
   - **Acceptance**: Every auto/manual merge has immutable audit log.
---
## Week 8 — Evidence Cloud Storage + End-to-End Sync Hardening
### Goals
- Move large media via object storage direct upload.
- Persist only secure URLs and metadata in Postgres.
- Improve sync observability and failure recovery.
### Tickets
1. **WMS-029 (P0)** — Pre-signed URL flow (S3/Azure Blob)  
   - **Owner**: Backend  
   - **Depends on**: WMS-016, WMS-018  
   - **Acceptance**: Desktop obtains signed URL and uploads directly.
2. **WMS-030 (P0)** — Evidence finalize callback + metadata commit endpoint  
   - **Owner**: Backend  
   - **Depends on**: WMS-029  
   - **Acceptance**: DB row only created after upload integrity checks.
3. **WMS-031 (P1)** — Sync telemetry dashboard (latency, queue depth, retry rates)  
   - **Owner**: DevOps  
   - **Depends on**: WMS-024  
   - **Acceptance**: Metrics visible per dealership and environment.
4. **WMS-032 (P1)** — Disaster recovery runbook (queue replay, stuck sync recovery)  
   - **Owner**: SRE  
   - **Depends on**: WMS-031  
   - **Acceptance**: Dry-run completed in staging.
---
## Week 9 — Fraud Detection Pipeline (Phase 3 Start)
### Goals
- Introduce initial anomaly scoring for claims.
- Integrate ML inference path without blocking transaction flow.
- Add model governance basics.
### Tickets
1. **WMS-033 (P0)** — Feature extraction job for claim fraud signals  
   - **Owner**: ML/Backend  
   - **Depends on**: WMS-021..WMS-030  
   - **Acceptance**: Feature set versioned and reproducible.
2. **WMS-034 (P1)** — Isolation Forest inference service + scoring endpoint  
   - **Owner**: ML  
   - **Depends on**: WMS-033  
   - **Acceptance**: Claims get risk score and explanation payload.
3. **WMS-035 (P1)** — Risk flag integration in desktop/web workflows  
   - **Owner**: Frontend + Backend  
   - **Depends on**: WMS-034  
   - **Acceptance**: High-risk claims highlighted with review gates.
4. **WMS-036 (P2)** — Model monitoring (drift, false positive review queue)  
   - **Owner**: MLOps  
   - **Depends on**: WMS-034  
   - **Acceptance**: Weekly model quality report generated.
---
## Week 10 — Reserve Forecasting & Executive Analytics
### Goals
- Build forecasting pipeline (Prophet/ARIMA).
- Deliver central executive dashboard MVP.
- Add supplier recovery intelligence hooks.
### Tickets
1. **WMS-037 (P1)** — Time-series data mart for reserve forecasting  
   - **Owner**: Data Platform  
   - **Depends on**: WMS-018  
   - **Acceptance**: Forecast-ready tables with quality checks.
2. **WMS-038 (P1)** — Forecast service (Prophet/ARIMA baseline)  
   - **Owner**: ML  
   - **Depends on**: WMS-037  
   - **Acceptance**: Monthly reserve projections exposed via API.
3. **WMS-039 (P1)** — Executive dashboard: trends, outliers, regional comparisons  
   - **Owner**: Web Hub Frontend  
   - **Depends on**: WMS-038  
   - **Acceptance**: Role-based dashboard views with filter/export.
4. **WMS-040 (P2)** — Supplier chargeback candidate detector v1  
   - **Owner**: Analytics  
   - **Depends on**: WMS-033  
   - **Acceptance**: Candidate list with rationale and confidence.
---
## Week 11 — Hardware Integration + Performance Optimization
### Goals
- Integrate scanner/serial workflows.
- Optimize heavy UI/data operations for lower-spec machines.
- Harden security posture before release candidate.
### Tickets
1. **WMS-041 (P1)** — Rust SerialPort integration for barcode/VIN scanners  
   - **Owner**: Rust Core  
   - **Depends on**: WMS-009  
   - **Acceptance**: Plug-and-scan populates VIN/part fields reliably.
2. **WMS-042 (P1)** — Desktop performance pass (virtualized tables, query tuning, memoization)  
   - **Owner**: Frontend  
   - **Depends on**: WMS-009..WMS-027  
   - **Acceptance**: Large-claim screens maintain target FPS and response times.
3. **WMS-043 (P0)** — Security hardening (TLS 1.3 enforcement, secrets rotation, audit checks)  
   - **Owner**: Security  
   - **Depends on**: WMS-019, WMS-031  
   - **Acceptance**: Pre-release security checklist signed off.
4. **WMS-044 (P1)** — End-to-end chaos testing (network loss, partial uploads, duplicate pushes)  
   - **Owner**: QA  
   - **Depends on**: WMS-024..WMS-032  
   - **Acceptance**: Recovery paths validated with documented MTTR.
---
## Week 12 — UAT, Release, and Go-Live Readiness
### Goals
- Complete UAT with pilot dealerships.
- Freeze release candidate and complete rollback planning.
- Publish operational playbooks and training assets.
### Tickets
1. **WMS-045 (P0)** — UAT execution with pilot service centers  
   - **Owner**: Product + QA  
   - **Depends on**: All critical P0/P1 prior tickets  
   - **Acceptance**: Signed UAT report with defect closure.
2. **WMS-046 (P0)** — Release candidate packaging (desktop installers + backend tags)  
   - **Owner**: Release Engineering  
   - **Depends on**: WMS-045  
   - **Acceptance**: Reproducible build artifacts and checksums.
3. **WMS-047 (P1)** — Go-live runbook + rollback strategy + on-call rota  
   - **Owner**: SRE  
   - **Depends on**: WMS-046  
   - **Acceptance**: Runbook rehearsal completed.
4. **WMS-048 (P1)** — Training docs and dealership onboarding kit  
   - **Owner**: Enablement  
   - **Depends on**: WMS-045  
   - **Acceptance**: Technician/admin guides distributed.
---
## Cross-Cutting Definition of Done (All Tickets)
- Unit/integration tests added or updated.
- Typecheck/lint pass.
- Security implications documented.
- Telemetry/logging added for critical flows.
- User-facing changes include UX states for offline/errors.
- Acceptance criteria validated in staging.
---
## Dependency Milestones
- **M1 (End Week 4)**: Offline desktop MVP (VIN + claim + evidence queue)
- **M2 (End Week 8)**: Reliable centralized sync with conflict handling + cloud evidence
- **M3 (End Week 10)**: Analytics/fraud baseline in production-like staging
- **M4 (End Week 12)**: UAT complete and release-ready
---
## Risk Register (Tracked Weekly)
1. **Unstable dealership connectivity**  
   - Mitigation: robust queue + retry + resumable uploads + local-first UX.
2. **Conflict complexity across channels**  
   - Mitigation: deterministic versioning + conflict inbox + immutable audit logs.
3. **Large evidence payload bottlenecks**  
   - Mitigation: local optimization sidecar + multipart direct uploads + checksum.
4. **Model false positives (fraud)**  
   - Mitigation: human review queue + threshold tuning + drift monitoring.
5. **Hardware variability (scanner vendors)**  
   - Mitigation: adapter abstraction + certified device matrix + fallback manual entry.
---
## Suggested Jira Setup
- **Epics**: Desktop Foundation, Sync Core, Central Hub, Evidence Pipeline, Intelligence, Release
- **Issue Types**: Story, Task, Spike, Bug
- **Labels**: `desktop`, `sync`, `backend`, `security`, `ml`, `release`
- **Boards**: Delivery Board (engineering), Risk & Compliance Board
EOF