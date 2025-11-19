# Coding Guidelines — JATS

**Version:** 1.1  
**Owner:** Engineering Leadership  
**Last Updated:** 2025-11-06

---

## 1. Principles
- Readable, testable, and maintainable code.  
- All commits must pass linting, tests, and review.

---

## 2. Style Rules
- ESLint (Airbnb base) + Prettier.  
- Max line length: 100; no console logs.  
- Async/await only; no .then() chains.  
- JSDoc required for all exported functions.

---

## 3. Testing
- TDD required for new code.  
- Coverage goals: Backend ≥ 85 %, Frontend ≥ 80 %.  
- Every API route and UI component must have tests.

---

## 4. Security
- Validate all inputs (Joi / Validators).  
- Never commit `.env` or credentials.  
- Use Helmet, rate limit, and HTTPS.  
- 2FA secrets encrypted (AES-256).

---

## 5. Branching & Commits
- Branches: `feature/*`, `fix/*`, `chore/*`.  
- Commit style (enforced via Commitlint):  
  - `feat(api): add CRUD route`  
  - `fix(ui): correct pie chart labels`

---

## 6. CI/CD
- Pre-commit: lint + test.  
- PR: must link REQ IDs from `/docs/spec-matrix.json`.  
- DoD: green tests, coverage, docs updated.
