# AGENTS.md

Read [PROJECT_RULES.md](PROJECT_RULES.md) before making changes. It records the implemented business rules and pnpm verification commands.

## 1. Project Overview

- This repository is the frontend, built with React, Vite and TypeScript.
- Consume the REST API provided by the separate Backend repository; do not add Express controllers or Mongoose models here.
- Follow a modular, maintainable architecture.
- Follow the frontend structure documented in [docs/frontend-structure.md](docs/frontend-structure.md).

## 2. Coding Rules

- Use TypeScript with strict type checking.
- Prefer async/await for asynchronous operations.
- Use meaningful variable, function and file names.
- Avoid `any` unless there is a justified reason.
- Do not duplicate business logic across modules.

## 3. Architecture

- `router/` defines browser routes, route guards and session bootstrap.
- `pages/<area>/<feature>/` composes screens, navigation and URL state.
- `features/<feature>/` owns domain-specific code: `components/`, `hooks/`, `services/`, `schemas/`, `types/` and `utils/` as needed.
- Feature hooks own API queries, mutations and cache invalidation; services own HTTP calls and API data mapping.
- Put domain validation in feature `schemas/` and domain types in feature `types/`, separate from HTTP services.
- `components/` contains reusable UI; `layout/` contains page shells, headers, footers and navigation.
- `services/` contains shared HTTP/query clients; shared API contracts belong in `types/api.ts`.
- Use TanStack Query for server data, Zustand for the auth session, and local React state for local UI.
- Keep example components and fixture data in `pages/template/`, separate from active business screens.
- Use the `@/` import alias and create folders only when they contain actual code.

## 4. API Conventions

- Use HTTP methods and payloads that match the Backend contract.
- Validate form input and URL parameters before sending requests; Backend validation remains authoritative.
- Model JSON responses using shared API contracts, retaining endpoint-specific differences where necessary.
- Normalize API errors through the shared error utility and query client; display actionable messages without internal stack traces.
- Route guards and conditional UI must match the intended roles; authorization must also be enforced by the Backend.

## 5. Security

- Never hardcode secrets or database credentials.
- Read configuration from environment variables.
- Do not commit `.env` files.
- Password hashing and credential storage belong to the Backend; never persist passwords or tokens in browser storage.
- Verify authentication and authorization on protected endpoints.
- Validate and sanitize untrusted input.

## 6. Testing and Verification

- Inspect existing code before making changes.
- Reuse existing dependencies and conventions where possible.
- Run relevant tests and type checks after changes.
- Report which commands were run and whether they passed.
- Never claim tests passed if they were not executed.

## 7. Agent Workflow

- Explain the implementation plan before complex changes.
- Keep changes focused on the requested task.
- Do not delete files or change public APIs without justification.
- Ask for approval before destructive operations or changes affecting production data.
- Summarize changed files and verification results after each task.
