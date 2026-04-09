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
