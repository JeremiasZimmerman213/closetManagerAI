# Closet Manager AI - Delivery Plan

## Milestone A (v1): Digital Closet + "What Should I Wear?"
### Goal
Ship MVP with auth, closet CRUD, photo upload, and rule-based outfit suggestions.

### Tasks
1. Initialize app stack with Next.js (TypeScript) and Supabase.
2. Set up authentication (sign up, sign in, sign out).
3. Define DB/storage for clothing items and photos.
4. Build item CRUD UI and APIs for fields in `SPEC.md`.
5. Implement outfit request form: occasion, optional vibe, optional temperature/weather, constraints.
6. Implement rule-based suggestion engine that returns 1-3 outfits from closet items only, each with a short explanation.
7. Add minimal high-value tests (core recommendation rules + critical auth/CRUD paths).
8. Document local setup and run steps clearly.

### Definition of Done
- All MVP (A) requirements in `SPEC.md` are complete.
- Suggestions always use only user closet items.
- Basic tests pass for critical behavior.
- Docs include accurate "how to run" instructions.

## Milestone B (v2): "What Should I Buy Next?" Gap Analysis
### Goal
Add simple recommendations for what to buy next based on closet gaps.

### Tasks
1. Define simple gap heuristics (for example, missing category coverage by use case/formality/warmth).
2. Build API/service to compute top gap suggestions.
3. Add UI to request and view buying suggestions.
4. Add minimal tests for heuristic correctness.
5. Update docs for usage and limitations.

### Definition of Done
- User can request "what should I buy next?" suggestions.
- Output is heuristic-based and explainable.
- Behavior is documented and covered by targeted tests.

## Milestone C (v3): Optional Body Measurements for Fit/Size Guidance
### Goal
Add optional body measurement profile to improve fit/size guidance.

### Tasks
1. Add optional measurement fields and secure storage.
2. Extend recommendation logic to include size/fit guidance signals.
3. Add UI to create/edit/delete measurement profile.
4. Add minimal tests for measurement-aware guidance.
5. Update docs, including privacy expectations.

### Definition of Done
- Measurements are optional and user-controlled.
- Guidance can include fit/size context when measurements are present.
- No 3D try-on or avatar functionality is introduced.

## Working Rules Across Milestones
- Follow A -> B -> C order; do not pull B/C features into A.
- Keep PRs small, runnable, and focused.
- Prefer simple heuristics over "AI magic" in v1.
- Update docs whenever commands or setup steps change.

