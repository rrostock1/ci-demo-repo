# Week 10 Demo — Instructor Setup & Script

Everything you need to set this up, verify it works, and run it in class.

---

## What This Repo Now Demonstrates

| Layer | File | How Tested |
|---|---|---|
| Pure logic | `src/cart.js`, `src/utils.js` | Unit tests, no mocking needed |
| Business logic with DB calls | `src/cartService.js` | Unit tests — `db.js` is **mocked** |
| Data access | `src/db.js` | Integration tests — real Postgres |
| Full stack | cartService → db → Postgres | Integration tests |
| Pipeline | `.github/workflows/ci.yml` | GitHub Actions: lint → unit → integration |

---

## Before Class: Setup Checklist

### 1. Install dependencies

```bash
cd ci-demo-repo
npm install
```

### 2. Verify unit tests pass (no Docker needed)

```bash
npm run test:unit
```

Expected: all tests green, coverage table shows 100% for `cart.js`, `utils.js`, `cartService.js`.

Note: `db.js` will show 0% coverage here — that's correct and expected. It's not called in unit tests. You can point this out in class.

### 3. Start local Postgres and verify integration tests

```bash
docker-compose up -d
```

Wait ~5 seconds for Postgres to be ready, then:

```bash
npm run test:integration
```

Expected: all integration tests green.

```bash
docker-compose down   # clean up when done
```

### 4. Push to GitHub and confirm the pipeline runs

```bash
git add .
git commit -m "week 10: add mocked db and integration tests"
git push
```

Go to your repo → Actions tab. You should see three jobs run in sequence:
`Lint` → `Unit Tests` → `Integration Tests`

All three should go green in ~2–3 minutes.

### 5. Pre-stage your demo breaks (optional but recommended)

Have these ready in a scratch file so you can paste quickly in class:

**Break the linter:**
```js
const unused = "oops";   // add inside any function in src/cart.js
```

**Break a unit test:**
```js
// In src/cartService.js, change addItem to not increment quantity:
existing[idx].quantity += item.quantity;
// → change to:
existing[idx].quantity += 0;   // bug: never increments
```

**Break an integration test:**
```js
// In src/db.js, corrupt the upsert — change the ON CONFLICT line:
ON CONFLICT (user_id) DO UPDATE SET items = '[]'   -- always clears cart!
```

---

## The Test Pyramid: What to Say in Class

Draw this on the whiteboard before the demo:

```
        /\
       /  \    Integration Tests
      / DB \   (slow, real infrastructure, test boundaries)
     /------\
    /        \  Unit Tests with Mocks
   /  mocked  \ (fast, isolated, test logic)
  /------------\
 /              \ Unit Tests (pure)
/   no deps      \ (fastest, test math/logic directly)
------------------
```

- **Bottom layer** — `cart.js` and `utils.js`. No imports, no mocks. Just call a function, check the result.
- **Middle layer** — `cartService.js`. Has a database dependency. We mock `db.js` so we can test the logic without a real DB.
- **Top layer** — Integration tests. Real Postgres. Tests that the whole chain works end-to-end.

Key point: "The mock in the middle layer is not cheating. It's intentional isolation. You're testing WHETHER the logic calls the DB correctly, not WHETHER Postgres works. Postgres already has its own tests."

---

## Class Demo Script

### Demo 1 — Green pipeline (5 min)

Push a clean commit. Open GitHub Actions. Narrate as all three jobs run.

Point out:
- Lint finishes first (~30s)
- Unit Tests start because `needs: lint` passed
- Integration Tests start because `needs: unit-tests` passed
- The `services:` block — "GitHub started a Postgres container for this job automatically"

### Demo 2 — Show the unit test mock (5 min)

Open `tests/unit/cartService.test.js`. Read out the first test out loud:

```js
db.getCart.mockResolvedValue(null);   // "the database returns: nothing"
db.saveCart.mockResolvedValue();      // "save succeeds"

const result = await addItem("user-1", { name: "Widget", price: 10, quantity: 2 });
expect(result).toEqual([...]);
```

Say: "There is no database running right now. `jest.mock('../../../src/db')` replaced the entire module with fakes we control. We decide what the 'database' returns for each test. This is mocking."

Show `jest.clearAllMocks()` in `beforeEach`. "Every test starts fresh. No state bleeds between tests."

### Demo 3 — Break a unit test (10 min)

In `src/cartService.js`, introduce the quantity bug:
```js
existing[idx].quantity += 0;  // was: += item.quantity
```

Push. Watch:
- Lint: green (valid JS)
- Unit Tests: RED — "increments quantity when item already exists" fails
- Integration Tests: SKIPPED (needs: unit-tests)

Read the Jest output: `Expected: 5, Received: 2`

Fix it. Push. All green.

### Demo 4 — Break an integration test (10 min)

Restore the unit test fix first so it's green.

In `src/db.js`, corrupt the upsert:
```sql
ON CONFLICT (user_id) DO UPDATE SET items = '[]'
```

Push. Watch:
- Lint: green
- Unit Tests: GREEN — mock doesn't care what the SQL says
- Integration Tests: RED — "upserts — adding the same item increments quantity"

Say: "The unit test couldn't catch this. It was mocking the database call. Only the integration test, which runs real SQL, found the bug. This is why you need both layers."

Fix it. Push. All green.

### Demo 5 — Show the services block in YAML (3 min)

Open `.github/workflows/ci.yml`. Scroll to the `integration` job. Point at:

```yaml
services:
  postgres:
    image: postgres:15
    ...
    options: --health-cmd pg_isready ...
```

"GitHub starts this Postgres container as a sidecar. It runs alongside the job's container. The health check waits until Postgres is actually ready. Our tests connect to it on localhost:5432, same as any Postgres."

"When the job ends, GitHub throws away both containers. The next run gets a fresh database."

### Demo 6 — Add the audit job live (3 min)

Uncomment the `audit` job at the bottom of `ci.yml`. Push. Watch a 4th job appear.

---

## File Structure After All Changes

```
ci-demo-repo/
├── src/
│   ├── cart.js          ← pure functions (no deps)
│   ├── utils.js         ← pure functions (no deps)
│   ├── db.js            ← data access layer (wraps pg)
│   └── cartService.js   ← business logic (calls db.js)
├── tests/
│   ├── unit/
│   │   ├── cart.test.js          ← pure, no mocks needed
│   │   ├── utils.test.js         ← pure, no mocks needed
│   │   └── cartService.test.js   ← mocks db.js
│   └── integration/
│       └── cart.integration.test.js  ← real Postgres
├── .github/
│   └── workflows/
│       └── ci.yml       ← lint → unit-tests → integration
├── docker-compose.yml   ← local Postgres for dev/demo
├── package.json
├── .eslintrc.json
└── .gitignore
```

---

## Common Issues

**"Cannot find module 'pg'"**
→ Run `npm install` first.

**Integration tests hang or timeout**
→ Postgres isn't running. Run `docker-compose up -d` and wait 5 seconds.

**Integration tests fail with "connection refused"**
→ Check `docker-compose ps` — is the container healthy?
→ Check your env vars: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`

**Unit tests show 0% coverage for db.js**
→ This is correct and expected. Explain it in class — db.js is only exercised by integration tests, which run separately.

**GitHub Actions integration job fails with "could not connect to server"**
→ The `options: --health-cmd pg_isready` block ensures Postgres is ready. If you see this, check that the `services:` block is properly indented in the YAML (YAML indentation is significant).
