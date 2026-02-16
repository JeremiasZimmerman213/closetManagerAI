# Closet Manager AI - Product Spec

## 1) Problem
I do not find fashion intuitive. I struggle with what to wear and what to buy.

## 2) Product Concept
Closet Manager AI is a digital closet app that first helps with outfit recommendations and later with buying recommendations.

## 3) Scope and Sequence
Delivery sequence is fixed: **A -> B -> C**.

- **A (v1 / MVP):** manual closet entry + photo upload + tags; "what should I wear?" recommendations.
- **B (v2):** "what should I buy next?" simple gap analysis.
- **C (v3):** optional body measurements for fit/size guidance (no 3D try-on).

## 4) Non-Goals (for now)
- Barcode/label lookup
- Scraping arbitrary retailers
- Social feed
- 3D avatars or virtual try-on

## 5) MVP (A) Functional Requirements
### Authentication
- User can create an account.
- User can sign in.
- User can sign out.

### Closet Item Management
User can add clothing items with:
- Photo
- Category: `top | bottom | shoes | outerwear | accessory`
- Color(s)
- Material (optional)
- Warmth: `light | medium | heavy`
- Formality: `casual | smart | business`
- Free-text notes

User can:
- View items
- Edit items
- Delete items

### Outfit Suggestion Request
User can request suggestions by providing:
- Occasion (examples: casual, date, interview)
- Vibe (optional)
- Temperature/weather (optional)
- Constraints (example: "no hoodies")

System returns:
- 1-3 outfit suggestions
- Suggestions use only items already in the user's closet
- A short explanation for each suggestion

## 6) Implementation Constraints
- Prefer **Next.js (TypeScript)** + **Supabase** (auth + DB + storage).
- Keep v1 recommendations rule-based first.
- LLM-based reasoning/ranking is a later enhancement.
- Make small, testable changes.
- Add minimal tests only where valuable.
- Keep docs clean and include clear run instructions.

## 7) Success Criteria for MVP (A)
- Account creation and sign in/out work end-to-end.
- CRUD for closet items works, including photo storage.
- User can request outfit suggestions using required/optional inputs.
- System returns 1-3 valid suggestions with short explanations, using only closet items.

