# CI/CD Demo Repo — Week 10

A minimal Node.js project used to demonstrate CI/CD concepts live in class.
The code (a shopping cart + utility functions) is intentionally simple —
the focus is the pipeline, not the application.

---

## Repo Structure

```
ci-demo-repo/
├── src/
│   ├── cart.js          # Shopping cart logic
│   └── utils.js         # String/formatting helpers
├── tests/
│   ├── cart.test.js     # Jest tests for cart
│   └── utils.test.js    # Jest tests for utils
├── .github/
│   └── workflows/
│       └── ci.yml       # ← The main event
├── .eslintrc.json
└── package.json
```

---

## Setup

```bash
npm install
npm run lint    # run ESLint
npm test        # run Jest with coverage
```

---

## Demo Script (Instructor Notes)

### Step 1 — Green pipeline
Push a clean commit to any branch. Watch the Actions tab.
Both `lint` and `test` jobs should pass in ~60–90 seconds.

### Step 2 — Break the linter
Edit `src/cart.js`. Introduce one of these lint errors and push:

```js
// Unused variable — triggers no-unused-vars
const unused = "oops";
```

```js
// Missing semicolon — triggers semi rule
const x = 5
```

Watch the `lint` job fail. Read the error in the log out loud.
Fix it, push again, watch it go green.

### Step 3 — Break a test
Edit `src/cart.js`. Change `calculateSubtotal` to return the wrong value:

```js
// Break it:
function calculateSubtotal(items) {
  return 0; // wrong!
}

// Or break applyDiscount:
function applyDiscount(subtotal, discountPercent) {
  return subtotal + discountPercent; // wrong operator
}
```

Push. The `test` job fails (lint still passes — two separate jobs).
Point out that `test` was skipped in the first run because `lint` failed (`needs: lint`).
Fix it, push, green again.

### Step 4 — Add a step live
Uncomment the `audit` job at the bottom of `ci.yml`. Push.
Watch a third job appear in the Actions UI.
Point out: two lines of YAML, one new pipeline stage.

---

## Key Teaching Moments

| Moment | What to say |
|---|---|
| Pipeline first goes green | "This happened automatically. You didn't tell it to run — the push did." |
| Lint failure log | "Read the log like a compiler error. It tells you exactly what and where." |
| `needs: lint` in YAML | "Jobs can depend on other jobs. Fail fast — don't waste time running tests if the code doesn't even lint." |
| `upload-artifact` step | "The pipeline can produce outputs — coverage reports, build artifacts, anything." |
| Uncommenting the audit job | "Your pipeline is just a YAML file. Adding a stage is adding lines." |
