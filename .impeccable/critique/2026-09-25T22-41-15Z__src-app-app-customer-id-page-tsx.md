---
target: customer/[id]/page.tsx
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:/Users/daniel/Documents/PROJECTS KARIMNOT/CHILLI GUALIJI/chilli-frontend/src/app/(app)/customer/[id]/page.tsx"
target_fingerprint: "sha256:9ce6f899714341ae336b9161369c79b4de9405e9fd77286fb52c402fd159fea4"
target_path: /Users/daniel/Documents/PROJECTS KARIMNOT/CHILLI GUALIJI/chilli-frontend/src/app/(app)/customer/[id]/page.tsx
timestamp: 2026-09-25T22-41-15Z
slug: src-app-app-customer-id-page-tsx
---
# Critique — `src/app/(app)/customer/[id]/page.tsx`

Method: degraded single-context (no sub-agent tool exposed; A completed from source before B ran)

## Design Health Score (Nielsen, Operate surface)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Skeletons exist, but errors offer no retry/refresh action |
| 2 | Match System / Real World | 3 | Good Spanish domain language; raw date/total/SLA strings leak through |
| 3 | User Control and Freedom | 2 | Rows not clickable; no escape from partial-failure states except back-link |
| 4 | Consistency and Standards | 3 | Shared components/tokens; header/dl repeat phone + name |
| 5 | Error Prevention | 2 | Read-only page; cases "Ver todos" searches by name (collision risk) |
| 6 | Recognition Rather Than Recall | 2 | Pills labeled; Factura column shows status with no invoice identity/link |
| 7 | Flexibility and Efficiency | 1 | One rigid path; no shortcuts, sort, bulk, or drill-down |
| 8 | Aesthetic and Minimalist Design | 3 | Clean and focused; minor header/dl redundancy |
| 9 | Error Recovery | 2 | Inline, near-source, non-blocking — but names problem, offers no next step |
| 10 | Help and Documentation | 1 | No contextual help for CSF / SLA / status vocabulary |
| **Total** | | **21/40** | **Acceptable** |

## Design Specificity Verdict

**LLM assessment:** Partially authored. The guajillo/marchantitx marker voice, `tiza`/`carbon` tokens, and the `toneFor`/`labelEs` pill system give it product character — but the composition (back-link → header → dl card → two 10-row tables) is a category-interchangeable admin stack. Missed opportunity: billing/facturación is this product's core and the page renders it as raw status strings with no invoice identity, amounts context, or action. Any SaaS admin could wear this page unchanged.

**Deterministic scan:** `impeccable detect --json` on the file and on the `[id]/` directory both returned `[]` (exit 0, clean). No mechanical findings; nothing the review missed, no false positives to discount.

**Visual overlays:** None available — honest fallback. The route is auth-gated: a fresh browser tab at `/customer/1` redirects to the login surface ("MARCHANTITX, PASA A LA CAJA"), and no session credentials exist to render the real page, so live injection was skipped rather than faked. Evidence for this run is source inspection + CLI scan + login-redirect confirmation.

## Overall Impression

Solid, resilient skeleton with good bones (per-section error isolation, skeleton parity, branded empty states) that stops one step short of useful: an operator can *see* a customer's tickets and cases but cannot *act* on anything — rows don't drill down, the invoice column is a contextless pill, and every error state is a dead end. Biggest opportunity: make each row a doorway.

## What's Working

1. **Resilient partial rendering.** `paginateResource` catches per-resource, so a tickets failure doesn't kill cases or the customer card — sections degrade independently. Correct architecture for an Operate surface.
2. **Branded, humane empty states.** `font-marker` guajillo messages ("Este marchantitx aún no tiene tickets") turn zero-data into a product-voice moment instead of a blank table.
3. **Skeleton/loading parity.** `loading.tsx` renders 5 pulse blocks matching back-link/header/card/two-lists layout — no layout jump on load.

## Priority Issues

- **[P1] Rows are dead ends — no drill-down.** *What:* `RecordList` renders `record.id` only as React `key`; no cell links anywhere, so a ticket, case, or invoice can't be opened from here. *Why it matters:* the page answers "what exists" but blocks the next step of every operator workflow; users must memorize IDs and re-search elsewhere. *Fix:* link first column to `/ticket/[id]` / `/case/[id]`; link the Factura pill to its invoice (requires selecting invoice id in the query). *Suggested command:* `/impeccable polish`
- **[P1] Cases "Ver todos" searches by name — fragile and inconsistent.** *What:* tickets link via `search=phone`, cases via `search=name`, while the page itself fetches by `customerId`. Names collide; unnamed customers get no link at all. *Why it matters:* operators can land on wrong-customer results — a data-trust issue on a billing-adjacent surface. *Fix:* link both to a `customerId`-filtered list (`/case?customerId=…`), matching the fetch semantics. *Suggested command:* `/impeccable harden`
- **[P2] Raw value formatting.** *What:* `ticketDate`, `total`, `slaDueAt` render as raw strings via `CellValue` — no date, currency, or relative-time formatting; nested `invoice.status` assumes object shape. *Why it matters:* operators scanning 10-row tables parse ISO dates and bare decimals slower and misread SLA urgency. *Fix:* format dates/amounts in `CellValue` (or column `format`), relative SLA ("vence en 2 h") with tone. *Suggested command:* `/impeccable polish`
- **[P2] Error states are dead ends.** *What:* `ListError` (section and full-page variants) shows a message with no retry, refresh, or contact path. *Why it matters:* transient API failures strand the operator; only recourse is full reload or back-nav. *Fix:* add a "Reintentar" affordance (link refresh / client retry) to both variants. *Suggested command:* `/impeccable harden`
- **[P3] Header/dl redundancy.** *What:* phone is both header description and a `dl` row; name is both title and row. *Why it matters:* minor noise on an otherwise clean card. *Fix:* drop duplicated fields from `DATA_FIELDS` or demote description. *Suggested command:* `/impeccable distill`

## Persona Red Flags (Operate/admin: Alex, Sam + Riley)

**Alex (Power User):** Cannot open any ticket/case/invoice from this page — every follow-up requires navigating to Ver-todos and re-searching. No keyboard path, no sorting, first-10-only tables. Primary *view* completes in seconds; primary *workflow* (act on a ticket) cannot start here.
**Sam (Keyboard/SR):** `th scope="col"` and text-labeled pills are good; color never stands alone. Risks: truncated cells (`max-w-56 truncate`) rely on `title` tooltips, announced inconsistently by screen readers; skeleton blocks are bare divs with no `aria-busy`/live region; link affordance is `hover:underline` only — keyboard focus visibility depends entirely on unverified global styles.
**Riley (Stress Tester):** 1000-ticket customer shows 10 + total with a phone-search link whose server semantics may not reproduce the same set (count mismatch confusion). Missing invoice renders "—" gracefully; but if `invoice` ever arrives as a string id instead of an object, the Factura cell shows a raw id next to status-styled pills — shape-dependent rendering with no guard.

## Minor Observations

- `BackLink` styling is copy-pasted across `page.tsx`, `not-found.tsx`, and `RecordList`'s "Ver todos" — one shared component would hold the pattern.
- `not-found.tsx` is a nice branded dead-end ("No encontramos a este marchantitx") — good tone, consistent voice.
- `accent="marchantitx"` is hardcoded brand text in the header; fine if intentional, but it reads as a placeholder where an RFC, status, or segment cue could orient the operator.
- Tables force `min-w-[560px]` horizontal scroll on mobile — acceptable for data, but the dl card + stacked sections already carry the page on small screens, so this is contained.

## Questions to Consider

- What would a confident, billing-first version of this page lead with — the RFC/invoice state, not the phone number?
- Does the operator ever need all 20 rows expanded at once, or should one list be primary and the other summarized?
- If a section fails to load at 9am on invoicing day, what is the operator's next click?

## Cognitive load

Checklist: 1 failure of 8 (progressive disclosure — both 10-row tables always fully expanded) → **low cognitive load**. No decision point exceeds 4 visible options (back + 2 view-all links). Working-memory demand is mild (comparing ticket totals to invoice pills across rows).

## Emotional journey

Flat utilitarian curve. Peak: charming branded empty states. Valley: dead-end errors and unclickable rows at the billing moment that matters most. No reassurance at high-stakes points (factura status is a bare pill with no recourse path).
