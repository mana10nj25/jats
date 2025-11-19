# Technical Specification — JATS

**Version:** 1.1  
**Owner:** Engineering Department  
**Last Updated:** 2025-11-06

---

## 1. Overview
Architecture: Angular 17 (Frontend) + Node.js 20 (Backend) + MongoDB Atlas.  
Security: JWT + 2FA (TOTP).  
Deployment: Render (API) + Vercel (UI).

---

## 2. Architecture Decisions
| Decision | Rationale |
|-----------|------------|
| Stateless JWT Auth | Enables horizontal scaling |
| REST API | Simplicity & interoperability |
| MongoDB Atlas | Managed NoSQL with uptime SLA |
| Separate front/backend | Independent deploy + CI/CD |

---

## 3. Data Models
### User
```js
{
  _id: ObjectId,
  email: String,
  password: String,
  twoFASecret: String?,
  createdAt: Date,
  updatedAt: Date
}
```
### Job
```js
{
  _id: ObjectId,
  userId: ObjectId,
  company: String,
  title: String,
  status: String,
  dateApplied: Date?,
  nextFollowUp: Date?,
  notes: String?,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 4. API Endpoints
| Method | Endpoint | Description |
|---------|-----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| POST | /api/auth/2fa/setup | Generate secret + QR |
| POST | /api/auth/2fa/verify | Verify token |
| GET | /api/jobs | Get all jobs |
| POST | /api/jobs | Create job |
| PUT | /api/jobs/:id | Update job |
| DELETE | /api/jobs/:id | Delete job |

---

## 5. Security Controls
- Helmet + rate limiting  
- Joi validation on inputs  
- AES-256 encryption for secrets  
- Winston logging with rotation  
- CORS restricted to Vercel domain  

---

## 6. Testing
| Type | Tool | Description |
|------|------|-------------|
| Unit | Jest | Core logic |
| Integration | Supertest | API endpoints |
| E2E | Cypress | Full flow |
| Load | Artillery | 100 concurrent users |

---

## 7. Deployment
- **Backend:** Render auto-deploy via GitHub Action.  
- **Frontend:** Vercel auto-deploy.  
- CI/CD: lint → test → build → deploy.
