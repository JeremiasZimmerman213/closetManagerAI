# Repository Guidelines

## Project Structure & Module Organization
This repository is currently in bootstrap state and contains only `README.md`. As code is added, use a predictable layout:

- `src/` for application code (feature folders under `src/features/<feature-name>/`).
- `tests/` for automated tests mirroring `src/` paths.
- `assets/` for static files (images, sample data, prompts).
- `docs/` for design notes, architecture decisions, and onboarding docs.

Keep modules small and focused. Prefer one responsibility per file.

## Build, Test, and Development Commands
No build/test runner is configured yet. When introducing tooling, expose it through a single entry point (prefer `Makefile` or npm scripts) and document it in `README.md`.

Recommended command set to add with the first implementation:

- `make setup` installs dependencies.
- `make lint` runs static checks/format validation.
- `make test` runs the full test suite.
- `make run` starts the app locally.

Contributors should keep commands deterministic and CI-friendly.

## Coding Style & Naming Conventions
Use 4 spaces for Python and 2 spaces for JavaScript/TypeScript/JSON/YAML. Keep line length near 100 characters.

- Files/modules: `snake_case` (Python) or `kebab-case` (web/config files).
- Classes/components: `PascalCase`.
- Functions/variables: `snake_case` (Python) or `camelCase` (JS/TS).
- Branch names: `feature/<short-name>`, `fix/<short-name>`, `chore/<short-name>`.

Add formatter/linter config in the same PR that introduces a language runtime.

## Testing Guidelines
Place tests in `tests/` with names matching source modules (`test_<module>.py`, `<module>.test.ts`, etc.). Prefer fast, isolated unit tests first, then integration tests for cross-module behavior.

Require tests for new features and bug fixes before merge.

## Commit & Pull Request Guidelines
Current history is minimal (`Initial commit`), so use clear imperative commit messages going forward:

- `feat: add outfit recommendation service`
- `fix: handle empty wardrobe input`
- `docs: update setup instructions`

PRs should include: purpose, scope, test evidence (`make test` output), and linked issue(s). Add screenshots or sample payloads when UI/API behavior changes.

## Closet Manager AI: Project-Specific Rules
- Treat `SPEC.md` and `PLAN.md` as the source of truth for scope and sequencing.
- Do not add features that are not explicitly in `SPEC.md`.
- Follow milestone order strictly: A (v1) -> B (v2) -> C (v3).
- Keep PRs small, runnable, and easy to review.
- Prefer simple, explainable heuristics over "AI magic" for v1 outfit recommendations.
- Use Next.js (TypeScript) and Supabase by default unless explicitly changed in `SPEC.md`.
- Add minimal, high-value tests only where they reduce meaningful risk.
- Always update docs when commands, setup steps, or developer workflow changes.
- Respect current non-goals: no barcode lookup, retailer scraping, social feed, or 3D try-on.
