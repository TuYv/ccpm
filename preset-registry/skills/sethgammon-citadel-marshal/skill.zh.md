---
name: marshal
license: MIT
description: >-
  Meta-orchestrator that takes any direction — broad, specific, or vague — and
  autonomously chains skills and context into actionable work. Gathers context
  from codebase, docs, and memory. Only asks the user when it genuinely cannot
  proceed. Single-session orchestrator.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - orchestrate
  - chain skills
  - multi-step
last-updated: 2026-03-20
---
# /marshal — Session Commander

## Orientation

Use Marshal in the following situations:
- Multi-step but bounded (completable within one session)
- Requires investigation before action
- Spans multiple skills but does not need campaign persistence
- Too complex for a single skill but does not need Archon/Fleet

**Do not use in the following situations:** the task spans multiple sessions (use /archon); the work can be decomposed into 3+ parallel streams (use /fleet); only research is needed with no action (use /research).
- Parallel execution (use Fleet)

## Commands

| Command | Behavior |
|---|---|
| `/marshal [direction]` | Full loop: understand → plan → execute → report |
| `/marshal assess [area]` | Read-only: understand the area, produce findings, do not fix |

## Protocol

### Phase 1: Understand

Parse the user's direction into structured intent:

1. Read CLAUDE.md to understand the project's architecture and conventions
2. Identify: scope (which files/directories), perspective (user, developer, administrator),
   mode (audit, fix, build, improve, map), depth (surface scan vs deep investigation)
3. If the direction is ambiguous, make a reasonable interpretation and state it explicitly.
   Unless truly stuck, do not ask clarifying questions.

### Phase 2: Plan Chain

Map the intent to a series of actions:

| Direction Pattern | Action Chain |
|---|---|
| "audit [area]" | explore → analyze → report findings |
| "fix [thing]" | investigate root cause → fix → verify → report |
| "map [area]" | read files in parallel → synthesize → produce analysis |
| "improve [area]" | audit current state → identify gaps → implement → verify |
| "what should [X] be" | research → analyze options → recommend with reasoning |
| "research [topic]" | search codebase + web → synthesize → report |

Announce the chain before executing: "I will first [step 1], then [step 2], then [step 3]."

### Phase 3: Execute

For each step in the chain, do the following:

1. Load the relevant skill if one exists (e.g., use `/review` for audit steps)
2. Gather context: read relevant files, check git history, search for patterns
3. Execute the action
4. Check the result against the plan — did it produce the expected outcome?
5. If a step fails, try one alternative approach before escalating the problem

### Phase 4: Report

Produce a structured report:

```
=== Marshal Report ===

Direction: {original direction}
Scope: {what was examined}

Findings:
- {finding 1 with file:line reference}
- {finding 2}

Actions Taken:
- {what was changed, if anything}

Recommendations:
- {next steps if applicable}
```

### Phase 5: Learn

If the investigation revealed reusable patterns or pitfalls:
- Record them in the report
- If a pattern will recur, suggest creating a skill: "This pattern is well suited to be made into a skill; run `/create-skill` to capture it."

## Agent Timeouts

When Marshal spawns sub-agents (e.g., for parallel investigation or delegated skill execution), it must enforce execution time limits. Sub-agents may hang indefinitely on tool calls — the circuit breaker catches failures, not hangs.

### Default Timeouts

| Agent Type | Default Timeout |
|---|---|
| Skill-level agents | 10 minutes |
| Research agents | 15 minutes |

Timeout durations can be configured in `harness.json` under `agentTimeouts` (the same config used by Fleet). If an agent exceeds its timeout:

1. Log the timeout in telemetry
2. Check for partial output — extract usable findings if any
3. Try one alternative approach (simpler prompt, reduced scope)
4. If retry also times out, skip it and note the gap in the report

Never wait indefinitely. A timed-out agent's scope will become a "gap" in the Findings section of the Marshal Report.

## Edge Cases

- **Direction is vague** (e.g., "do the thing", "fix it", "make it better"): ask one clarifying question before proceeding. For truly ambiguous input, do not attempt to guess scope — one focused question costs far less than executing the wrong plan.
- **A sub-task fails on first attempt**: retry once with a different approach (narrower scope, different tool, simpler method). If the second attempt also fails, record the blocker in the report and move on.
- **No relevant files found for the stated scope**: honestly report the empty result, do not fabricate findings, and suggest the user verify the scope or file paths.
- **CLAUDE.md missing**: proceed without it, and note the absence in the report so the user knows project conventions were not applied.
- **Type check not configured**: skip the verification step and mark it as "unverified" in the report rather than blocking completion.

## Quality Gates

- Every finding must cite a specific file and line number
- Every action must be verified (type check passes, tests pass)
- If a fix was applied, confirm the original issue has been resolved
- The report must be concise — no filler, no repetition
- If stuck on a step for more than 3 attempts, skip it and report the blocker

## Exit Protocol

1. Output the Marshal Report (format as above)
2. If work items were discovered but not handled, suggest creating intake items
3. Output a HANDOFF block summarizing the completed work

```
---HANDOFF---
- What: {behavior changed or goal achieved — not the file name, the outcome}
- Decisions: {key tradeoffs made — include the alternative that was rejected}
- Unresolved: {what is still open or blocked — actionable next step}
- Reversibility: {green | amber | red} — {how to undo}
---
```
