# Functional Specification — Job Application Tracking System (JATS)

**Version:** 1.1  
**Owner:** Program Management Office (PMO)  
**Last Updated:** 2025-11-06

---

## 1. Purpose & Scope
The Job Application Tracking System (JATS) provides a secure, data-driven way for users to record, manage, and analyze job applications across multiple sources.

---

## 2. System Goals
- Provide a unified platform for job application management.
- Deliver analytics to measure user progress and conversion rates.
- Maintain enterprise-grade security and privacy.
- Support mobile-friendly and accessible design.
- Enable extensibility for AI-based matching and analytics.

---

## 3. Functional Requirements
| ID | Category | Requirement | Priority | Acceptance Criteria |
|----|-----------|-------------|-----------|----------------------|
| REQ-AUTH-001 | Authentication | Register with email/password. | P0 | User created; password hashed; JWT returned. |
| REQ-AUTH-002 | Authentication | Login and receive JWT. | P0 | Valid credentials → 200 OK; invalid → 401. |
| REQ-AUTH-003 | Security | Enable 2FA (TOTP). | P1 | QR generated; TOTP verified; login requires code. |
| REQ-JOB-001 | Jobs | CRUD job records. | P0 | API responds 2xx; data persisted. |
| REQ-JOB-002 | Authorization | Access own jobs only. | P0 | Unauthorized → 403. |
| REQ-DASH-001 | Analytics | Chart of jobs by status. | P1 | Chart updates dynamically. |
| REQ-DASH-002 | Analytics | Weekly application trend. | P2 | Chart accurate to data. |
| REQ-NOTIF-001 | Productivity | Follow-up reminders. | P2 | Notification triggers as scheduled. |
| REQ-UX-001 | Accessibility | WCAG 2.1 AA compliance. | P1 | Lighthouse ≥ 90. |
| REQ-PERF-001 | Performance | API latency < 200 ms. | P1 | Load test passes 95th percentile. |

---

## 4. Non-Functional Requirements
| Category | Requirement |
|-----------|-------------|
| Performance | 95th percentile latency < 200 ms. |
| Security | JWT, TLS, encrypted secrets. |
| Reliability | 99.5 % uptime; /health endpoint. |
| Maintainability | Modular code; 85 %+ test coverage. |
| Observability | Structured logs + error correlation IDs. |

---

## 5. Traceability
Each REQ maps to tests defined in `/docs/spec-matrix.json`.
