---
name: improve-app
description: 'Guided journey from a shipped app that is getting more expensive to change to one that is stable, resilient, and polished where users feel it. Orchestrates eleven skills phase by phase - clean-code, refactoring-patterns, working-with-legacy-code, software-design-philosophy, release-it, ddia-systems, microinteractions, ux-heuristics, high-perf-browser, pragmatic-programmer, steve-jobs-design-review - asking the user questions at every decision point and recording results in the project docs/ folder (TECH-DEBT.md, TESTING.md, IMPROVE-APP-PLAN.md) so the journey resumes across sessions. Use when the user wants to improve an existing app without rewriting it, pay down code and design debt, harden a shaky production system, or says ''this app works but the code scares me''. No app yet: create-app. Works well, needs growth loops: grow-app. Code-only, no product/UX pass: improve-code-quality (fresh prototype) or remove-technical-debt (large aged codebase). For one framework in isolation, invoke that skill directly.'
license: MIT
metadata:
  author: wondelai
  version: "1.0.0"
---

# Improve an App

The app already works — paying users, a deploy pipeline, a year of git history — and every new feature costs a little more than the last. This journey improves the running system in small, verified increments instead of rewriting it, across eleven phases. It is interactive: at every decision point the agent asks before acting. It is resumable: all state lives in `docs/`, so you can run the whole sequence over a quarter or pull one phase for an afternoon.

## Core Principle

**Improve incrementally, never rewrite: understand, stabilize, change safely, deepen the design, harden production, then polish the experience.** A rewrite discards the edge cases your code silently handles and reproduces the same bugs in new syntax; the order of the small steps is the whole game.

This skill sequences the phases, asks the questions, and records every decision. The eleven constituent skills carry the method — invoke them rather than improvising their frameworks.

## Journey Map

| Phase | Skill | Question it answers | Artifact |
|---|---|---|---|
| 1 | clean-code | Is this code readable, and where is the debt that compounds? | Extends docs/TECH-DEBT.md |
| 2 | refactoring-patterns | Which named transformations fix the smells without changing behavior? | Extends docs/TECH-DEBT.md |
| 3 | working-with-legacy-code | Is behavior pinned by tests before we touch it? | Creates/Extends docs/TESTING.md + docs/TECH-DEBT.md — GATE |
| 4 | software-design-philosophy | Is the design deep, or just tidy? | Extends docs/ARCHITECTURE.md |
| 5 | release-it | Will it survive production, not just QA? | Extends docs/RELIABILITY.md |
| 6 | ddia-systems | Is the data layer correct under load? | Extends docs/ARCHITECTURE.md + docs/RELIABILITY.md |
| 7 | microinteractions | Does every action feel alive? | Extends docs/DESIGN.md |
| 8 | ux-heuristics | Where does friction make users think? | Extends docs/DESIGN.md |
| 9 | high-perf-browser | Is it fast where speed is a feature? | Extends docs/METRICS.md |
| 10 | pragmatic-programmer | What habits keep debt from coming back? | Extends docs/TECH-DEBT.md + docs/ARCHITECTURE.md |
| 11 | steve-jobs-design-review | Is it insanely great, or just better? | Extends docs/PRODUCT.md + docs/DESIGN.md |

## Operating Rules

1. **Resume first.** Before anything else, read `docs/IMPROVE-APP-PLAN.md` and every artifact in the Journey Map. If the tracker exists, summarize the journey state in 3-5 lines and ask which phase to enter. Done when the user has confirmed an entry point. A journey with a tracker is resumed, never restarted.
2. **Intake on first run only.** No tracker: run the Intake below, then create `docs/IMPROVE-APP-PLAN.md` with every phase statused `pending | in-progress | awaiting-evidence | done | deferred: reason | skipped: reason`. Done when the tracker exists and the user has confirmed the phase plan.
3. **Phase entry.** Announce: what the phase does, the decision it forces, the artifact it produces, rough effort. Offer proceed / skip / defer — phases marked GATE may be deferred, never skipped. Mark the phase `in-progress` on proceed. Done when the user chose.
4. **Skill invocation and fallback.** Invoke the phase's skill by its slug. If it is not available, offer: `npx skills add wondelai/skills/<slug> --global`. If the user declines, run the phase from its Brief — the minimum viable method. State which mode you are in.
5. **In-phase decisions.** Ask every question under "Decide with the user" — with concrete options and your recommendation. Record the choice in the tracker's Key Decisions. A decision made silently is a defect.
6. **Phase exit.** Present the draft artifact content for sign-off before writing. On approval: write or extend the docs/ files, update the tracker (status, Key Decisions, Next Actions). Done when the files are written and the phase row shows `done`.
7. **Artifact discipline.** Read before writing; create a file only if missing, otherwise extend — add or update your sections, preserve everyone else's. Files are UPPERCASE in `docs/`. Every recommendation lands as a checkbox or a table row with owner and priority. See [references/artifact-templates.md](references/artifact-templates.md) when creating a docs/ file for the first time — create it from the full skeleton (all section headings), then fill the sections your phase names.
8. **Untested code is refactored only after `working-with-legacy-code` pins its behavior.** Phase 3 gates Phases 1-2 for any module missing from the Safety Net Map (missing means not listed under Pinned behaviors; entries in the Gaps column are off-limits too). Structural and behavioral changes never share a commit: refactor with tests green in a structure-only commit, then change behavior in its own commit; a red test mid-refactoring means revert, not debug. Safety-net test additions and docs/ updates are single-purpose commits of their own.

## Intake

Ask these, then set the plan:

1. What hurts most right now — a scary service, a slow page, a flaky integration, a data race, or rough UX? (Sets the entry phase; you can start mid-sequence.)
2. Does the code you need to change have tests? (Gates Phases 1-2 behind Phase 3 per rule 8; "no" makes Phase 3 the first real move on that module.)
3. What are your highest-churn modules? Point me at `git log`. (Phase 1 baselines churn, not fear — a scary module nobody touches costs nothing.)
4. What is the deploy/release setup — feature flags, health checks, rollback? (Scopes Phase 5.)
5. Which datastore(s), and do you know the isolation level and largest table? (Scopes Phase 6; "no" is itself the finding.)
6. Which user flows leak users or draw support tickets, and is there a browser surface at all? (Targets Phases 7-9.)

Phase-skip heuristics: skip Phase 6 when there is no shared datastore or no concurrency/scale concern; skip Phase 9 when the app has no browser surface; skip Phases 7-8 when there is no user-facing UI. Do not skip Phases 1-2 on an untested module — reorder Phase 3 ahead of them (rule 8).

Then create `docs/IMPROVE-APP-PLAN.md` from the template and confirm the plan. Done when `docs/IMPROVE-APP-PLAN.md` exists with every phase statused and the user has confirmed the plan.

## Phases

### Phase 1 — Establish a quality baseline (clean-code)

**Purpose:** Turn "clean this up" into an objective 0-10 score you can defend, and surface the debt that compounds.

**Brief (fallback):** Code is read far more than written, so clarity is the yardstick. Score 0-10 on six disciplines: meaningful names, small single-purpose functions, comments that say why not what, error handling separated from logic, clean tests, and a smell catalog. The costliest smells are duplication, magic numbers, flag arguments, functions doing more than one thing, and returning null. Boy Scout Rule: leave each file cleaner than you found it.

**Invoke:** `clean-code` on the highest-churn modules from `git log`, not the scariest. Ask for a 0-10 score per discipline plus the top five concrete fixes with line ranges, grouped by smell type.

**Decide with the user:** (1) Which modules to baseline (recommend highest-churn). (2) Whether to wire `clean-code` into pull-request review so the baseline ratchets up on its own.

**Artifact:** Extend docs/TECH-DEBT.md: add findings to `## Debt Ledger` (item | location | type | risk | effort | priority | status) and `## Smell Inventory` (smell | location | refactoring | status). Applying fixes to an untested module waits for Phase 3. Update the tracker.

**Done when:** TECH-DEBT.md holds a scored baseline for each chosen module, the top fixes are ledger rows with priority, and the user chose whether to gate PRs.

### Phase 2 — Refactor safely, one transformation at a time (refactoring-patterns)

**Purpose:** Fix structure without changing behavior, and prove it, via named reversible transformations.

**Brief (fallback):** Refactoring is not rewriting — a sequence of small behavior-preserving transformations, each backed by tests: verify green, apply one change, verify green, commit. Map each smell to its transformation: Long Method → Extract Method; switch on a type code → Replace Conditional with Polymorphism; a repeated parameter group → Introduce Parameter Object; nested ifs → Guard Clauses. Rule of Three before abstracting; preparatory refactoring before adding a feature.

**Invoke:** `refactoring-patterns` with the Smell Inventory rows from TECH-DEBT.md. Ask for a sequenced list of named refactorings, which test to confirm green before each step, applied one at a time.

**Decide with the user:** (1) Refactor now vs preparatory-refactor just before the next feature lands in that area. (2) Confirm each target has tests — if not, this target is blocked and routes to Phase 3 (rule 8).

**Artifact:** Extend docs/TECH-DEBT.md: update `## Smell Inventory` rows with the chosen refactoring and status. Update the tracker.

**Done when:** each refactored target's Smell Inventory row shows the transformation applied and status, tests stayed green across structure-only commits, and every untested target is deferred to Phase 3.

### Phase 3 — Get untested code under a net (working-with-legacy-code) — GATE

**Purpose:** Pin current behavior with characterization tests so Phases 1-2 can safely change any module. A module absent from the Safety Net Map may not be refactored.

**Brief (fallback):** Legacy code is code without tests. Algorithm: identify change points, find test points, break dependencies with the least-invasive seam (Parameterize Constructor with a production default), write characterization tests that pin actual behavior (assert absurd, read the failure, pin the real value), then change. When you cannot get an area under test in time, use Sprout Method/Class: new tested code called from one line in the untested host — track it as debt.

**Invoke:** `working-with-legacy-code` with the target module and its change points. Ask for the seams, the smallest characterization-test set, and any Sprout register entries.

**Decide with the user:** (1) Which modules to net first — the ones Phases 1-2 want to touch. (2) Bugs found while characterizing: pin the wrong behavior and file a ticket — never silently fix; callers may depend on the quirk. Confirm the user accepts this.

**Artifact:** Create/Extend docs/TESTING.md with `## Safety Net Map` (module | pinned behaviors | test files | gaps) and `## Characterization Backlog`; extend docs/TECH-DEBT.md `## Sprout / Wrap Register`. Update the tracker.

**Done when:** every module Phases 1-2 will change is pinned green in the Safety Net Map, sprouts are registered as debt, and the tracker shows Phase 3 done — only then are those targets unlocked.

### Phase 4 — Deepen the design (software-design-philosophy)

**Purpose:** Make code simple to change, not just safe to change — at the level of modules and interfaces.

**Brief (fallback):** Complexity is the enemy; the limit is our ability to understand the system. Prefer deep modules (a simple interface hiding powerful function) over shallow ones. Classitis — many tiny classes each adding interface cost — increases complexity; the cure is often to merge, not split. Hunt information leakage (one decision reflected in many modules) and temporal decomposition; organize modules around knowledge. Strategic over tactical: invest 10-20% extra to improve structure with each change.

**Invoke:** `software-design-philosophy` on the modules Phase 1 flagged as tangled. Ask which classes are shallow, where information leaks, and how to consolidate into one or two deep modules with a simpler interface.

**Decide with the user:** For each over-split area, merge vs keep — and confirm the target list (the notifications-style module with many classes for a simple job is the archetype).

**Artifact:** Extend docs/ARCHITECTURE.md: record shallow/deep and leakage findings in `## Layer Map & Dependency Rule` (violation | location | fix | status) and note the design decision in `## Decision Log`. Update the tracker.

**Done when:** each shallow or leaky module has a consolidation decision, violations are tracked with a fix and status, and the Decision Log records why.

### Phase 5 — Make it survive production (release-it)

**Purpose:** Harden the running system against hostile production, not just QA.

**Brief (fallback):** Software that passes QA is not what survives production. Integration points are the number-one killer; slow responses are worse than failures because they exhaust thread pools. Counters: a timeout on every outbound call (connect and read), a circuit breaker that trips on a failure threshold, a bulkhead isolating pools per dependency, retry with exponential backoff and jitter. Separate deploy from release (feature flag + off switch); make health checks deep; alert on symptoms (error rate, latency), not causes (CPU).

**Invoke:** `release-it` on the outbound calls in the riskiest integrations. Ask for the calls missing timeout/breaker/bulkhead, then concrete implementations and a deep health-check design.

**Decide with the user:** (1) Which integration points to harden first (payment, search, third-party). (2) Circuit-breaker thresholds. (3) Confirm chaos experiments are planned only — authorized engineers run them; the agent does not inject failures into production.

**Artifact:** Extend docs/RELIABILITY.md: `## Integration-Point Audit` (dependency | timeout | circuit breaker | bulkhead | retry policy | status), `## Health Checks & Metrics`, `## Deploy vs Release`. Update the tracker.

**Done when:** every audited integration point has timeout/breaker/bulkhead status, deep health checks are specified, deploy/release separation is recorded, and chaos runs are flagged human-only.

### Phase 6 — Fix the data layer (ddia-systems)

**Purpose:** Make consistency, durability, and latency trade-offs explicit before data outlives the code and hits a wall.

**Brief (fallback):** Data outlives code. Confirm the database's actual isolation level — rarely serializable — and check for write skew (two transactions read the same rows and each writes, with no lock) behind oversell and overdraw bugs. Catch unbounded result sets (a list endpoint with no LIMIT that OOMs as data grows), replication lag (read-your-writes bugs), and partition hotspots. Fix races with SELECT FOR UPDATE, a serializable transaction, or a race-free redesign.

**Invoke:** `ddia-systems` with the schema and the hot transactional paths. Ask for the actual isolation level, the write-skew risks, and the unbounded queries with a pagination + index plan.

**Decide with the user:** (1) For each race, which fix — locking / serializable / redesign. (2) Which endpoints get pagination first. (3) The target row-count multiple for the scaling check.

**Artifact:** Extend docs/ARCHITECTURE.md `## Data & Storage Decisions` (isolation level, consistency choices) and docs/RELIABILITY.md `## Query & Resource Findings` (unbounded sets, missing LIMITs). Update the tracker.

**Done when:** the isolation level is documented, each write-skew risk has a chosen fix, unbounded queries are logged with a pagination/index plan, and both artifacts are updated.

### Phase 7 — Polish the microinteractions (microinteractions)

**Purpose:** Make every small moment users touch feel alive, not dead.

**Brief (fallback):** The difference between a product you tolerate and one you love is almost always the microinteractions. Each has four parts — Trigger, Rules, Feedback, Loops & Modes. The common failure is missing or late feedback: direct manipulation needs a response under 100ms, usually by animating the element the user touched (a button depresses to "Saving…"), not a separate toast. Map every state — empty, loading, partial, full, error, disabled — and avoid feedback overload; use the smallest feedback that communicates.

**Invoke:** `microinteractions` on the most-used interactions (save, submit, toggle, delete, loading). Ask for a Trigger/Rules/Feedback/Loops audit, the exact feedback each needs, and a full state map.

**Decide with the user:** Which interactions to audit first, and confirm the sub-100ms feedback bar and the animate-the-element approach over toasts.

**Artifact:** Extend docs/DESIGN.md `## Microinteraction Inventory` (interaction | trigger/rules/feedback/loops | fix | status). Update the tracker.

**Done when:** each audited interaction has its four parts and required feedback logged, every state is mapped, and fixes are rows with status.

### Phase 8 — Remove the friction that makes users think (ux-heuristics)

**Purpose:** Make the app understandable — cut cognitive load on the flows that leak users.

**Brief (fallback):** "Don't Make Me Think." Users scan, satisfice, and muddle through. Run a heuristic evaluation against Nielsen's ten heuristics with 0-4 severity ratings. Target jargon labels, missing status feedback, error messages that state a problem but not the fix, mystery-meat icons, and forms with no inline validation. Trunk Test: drop a user on any page cold — can they tell what site, what page, their options, and where search is? Get rid of half the words; error messages say what, why, and how.

**Invoke:** `ux-heuristics` on the highest-drop flow. Ask for a heuristic evaluation with 0-4 severities and a single fix list ordered by severity × how often users hit it.

**Decide with the user:** Which flow to evaluate first (settings, checkout, account), and confirm the ordering metric (severity × hit frequency).

**Artifact:** Extend docs/DESIGN.md `## UX Audit Findings` (issue | heuristic | severity 0-4 | fix | status). Update the tracker.

**Done when:** each violation is rated 0-4 with a fix, the list is ordered by severity × frequency, and error and empty states are rewritten to say what/why/how.

### Phase 9 — Make it fast where speed is a feature (high-perf-browser)

**Purpose:** Fix perceived slowness by cutting round trips, not by buying bandwidth.

**Brief (fallback):** Latency, not bandwidth, is the bottleneck — most pain is too many round trips. Diagnose against Core Web Vitals: LCP under 2.5s (preload the hero, raise fetchpriority), INP under 200ms (break long tasks, defer non-critical JS), CLS under 0.1 (reserve space with explicit dimensions). Defer render-blocking scripts, add content-hashed immutable caching, and undo HTTP/1.1 workarounds (domain sharding, sprites, concatenation) that hurt on HTTP/2.

**Invoke:** `high-perf-browser` on the slowest key page. Ask for the render-blocking resources and long main-thread tasks, then an impact-ordered fix list to hit the CWV targets.

**Decide with the user:** Which pages to measure first, and confirm the CWV targets as the lines in the sand.

**Artifact:** Extend docs/METRICS.md `## Baselines & Targets` (metric | baseline (date) | target | line in the sand) with LCP/INP/CLS, and note any speed-gated step in `## Funnel`. Update the tracker.

**Done when:** current CWV baselines are recorded with dated numbers, targets are set (LCP < 2.5s, INP < 200ms, CLS < 0.1), and the fix list is ordered by impact.

### Phase 10 — Lock in the habits that keep debt out (pragmatic-programmer)

**Purpose:** Install the meta-principles so the gains do not erode once attention moves on.

**Brief (fallback):** Care about your craft; every line is an asset that must earn its place. DRY is about knowledge, not textual similarity — two identical blocks serving different rules are not duplication. Orthogonality: changing the database should not break the UI; the test is "if the requirements behind this function change, how many modules are affected?" — the answer should be one. Broken Window Theory: one un-repaired hack permits the next — fix it now or board it up with a real ticket. Reversibility: abstract vendors behind your own interfaces.

**Invoke:** `pragmatic-programmer` across the codebase. Ask for the worst coupling (change-one-edit-many), where to add a repository/adapter layer, and the untracked broken windows.

**Decide with the user:** (1) Which coupling to break first with an adapter/repository layer. (2) The debt budget per iteration and the board-it-up policy (no bare TODOs).

**Artifact:** Extend docs/TECH-DEBT.md `## Debt Budget & Broken-Windows Policy` and `## Adopted Conventions`; log coupling fixes in docs/ARCHITECTURE.md `## Layer Map & Dependency Rule`. Update the tracker.

**Done when:** broken windows are either fixed or boarded up with tracked tickets, the debt budget and conventions are written, and coupling fixes are logged as violations with status.

### Phase 11 — Submit the result to a brutal, honest review (steve-jobs-design-review)

**Purpose:** Judge the whole experience against "insanely great, or not done" — and decide what to subtract.

**Brief (fallback):** Start from the customer experience and work back to the technology. Experience the product cold as a customer, name the one thing it must do, audit against simplicity and focus, and deliver a verdict with a cut list and a fix list. Focusing is saying no — every feature added is a candidate for deletion. Audit the back of the fence: empty states, error copy, 404, billing, cancellation, receipt email — held to the hero-screen bar.

**Invoke:** `steve-jobs-design-review` on the whole app. Ask for a cold walkthrough, the one thing, the step count to core value, a binary verdict, a ranked cut and fix list, and a back-of-the-fence audit.

**Decide with the user:** (1) Accept the cut list — which features to actually remove. (2) Which back-of-the-fence fixes ship now vs later.

**Artifact:** Extend docs/PRODUCT.md `## Outcome Roadmap` (mark cut candidates with disposition) and docs/DESIGN.md `## UX Audit Findings` (back-of-the-fence surfaces). Update the tracker.

**Done when:** the verdict is recorded, the cut list is agreed with each item's disposition, back-of-the-fence findings are rows in DESIGN.md, and the tracker closes Phase 11.

## Optional Phases

| Skill | Add when | Artifact |
|---|---|---|
| improve-retention | activation or retention numbers sag | Extends docs/PRODUCT.md |
| continuous-discovery | improvement ideas come from opinions, not weekly user contact | Extends docs/CUSTOMER.md |
| hooked-ux | the app should be habitual but is not | Extends docs/PRODUCT.md |
| lean-ux | fixes need cheap validation before full builds | Extends docs/EXPERIMENTS.md |
| inspired-product | the backlog is a feature list with no outcomes | Extends docs/PRODUCT.md |
| design-everyday-things | users make repeated errors in core flows | Extends docs/DESIGN.md |

Optional phases follow the same operating rules; insert where the Add-when condition first becomes true.

## Common Mistakes

| Mistake | Fix |
|---|---|
| Reaching for the rewrite | Change the running system incrementally; `refactoring-patterns` and `working-with-legacy-code` exist so you never choose between "untouchable" and "rewrite". |
| Refactoring code that has no tests | Run `working-with-legacy-code` first for a characterization net, then `refactoring-patterns` — never the reverse (rule 8). |
| Mixing structural and behavioral changes in one commit | Refactor in a tests-green structure-only commit, change behavior in its own; a red test mid-refactor means revert, not debug. |
| "Cleaning up" by adding abstraction | `software-design-philosophy`: classitis increases complexity — merge shallow classes rather than split, unless the abstraction hides real complexity. |
| Treating performance as a bandwidth problem | `high-perf-browser`: latency and round trips are the cost — measure Core Web Vitals and fix the specific cause before buying throughput. |
| Trusting the database default | `ddia-systems`: confirm the actual isolation level and check for write skew and unbounded result sets before they surface in production. |

## Completing the Journey

Exit checklist:

- [ ] TECH-DEBT.md and TESTING.md show a scored baseline and a Safety Net Map for every module Phases 1-2 touched
- [ ] Every refactor and behavior change shipped as separate commits with tests green
- [ ] RELIABILITY.md and ARCHITECTURE.md record integration-point resilience and the data-layer trade-offs made explicit
- [ ] DESIGN.md, METRICS.md, and PRODUCT.md carry the UX audit, CWV baselines/targets, and the steve-jobs cut list

Close the tracker: every phase `done` or `skipped: reason`, and Next Actions carried into the owning artifacts rather than left in the plan.

Forward routing: when code health is the dominant problem and needs its own sustained campaign, continue with `remove-technical-debt`. When the friction lives on the marketing site rather than the product, continue with `improve-website`.
