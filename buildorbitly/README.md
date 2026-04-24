# BuildOrbitly

BuildOrbitly is a **constraint-compiled AI execution system** that generates software through a deterministic pipeline:

`Intent → Constraint → Schema → Scaffold → Code → Verification → Learning`

It is **not** an agent swarm.
It is a **typed compiler for software generation**.

## Core Architecture

### 1) Intent Gate (semantic compiler front-end)
Converts unstructured user input into a typed `IntentContract`.

### 2) Schema Registry (binding layer)
Maps intent types to allowed project structures and tech stacks.

### 3) Scoped Schema Output (scaffold generator)
Produces a strict file tree from the selected schema.

### 4) Plan (constrained executor)
Plan can only operate inside the selected schema and cannot introduce new layers.

### 5) Code Generation
Code must match scaffold 1:1 with no structural additions.

### 6) Verify (hard gate)
Enforces schema compliance, required entry points, and forbidden layer checks.

### 7) ACL (learning layer)
Tracks misclassification, over-scoping, and schema violations to calibrate future intent routing.

## Minimal Repo Layout

```txt
buildorbitly/
├── README.md
├── package.json
├── .gitignore
└── src/
    ├── main.js
    ├── pipeline.js
    ├── schema-registry.js
    ├── types.js
    └── services/
        ├── intent-gate.js
        ├── schema-instantiator.js
        ├── planner.js
        ├── scaffold-generator.js
        ├── code-generator.js
        ├── verify.js
        └── acl.js
```

## Run

```bash
npm run start --prefix buildorbitly
```

This repository includes a deterministic reference implementation of the BuildOrbitly v1 pipeline and a sample run.
