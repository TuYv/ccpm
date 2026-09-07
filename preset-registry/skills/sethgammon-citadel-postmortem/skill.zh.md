---
name: postmortem
license: MIT
description: >-
  Auto-generates a structured postmortem from a completed campaign. Reads the
  campaign file, telemetry logs, and feature ledger. Produces a documented
  analysis of what broke, what the safety systems caught, and what patterns
  emerged. Can also be invoked manually for any incident.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - postmortem
  - retro
  - what broke
  - what happened
  - debrief
effort: medium
---
# /postmortem — Campaign Postmortem Generator

## Orientation

**Use when:** A campaign just finished, and you want a structured analysis of what went wrong, what the safety systems intercepted, and what patterns emerged. It can also be used for ad-hoc incident analysis based on recent git history.

**Don't use when:** You want to preserve session context for the next conversation (use `/session-handoff`), extract reusable patterns from analysis results into the knowledge base (use `/learn`), or score and improve quality iteratively (use `/improve`).

## When to Use

- Run after any Archon campaign completes (Archon should proactively suggest this)
- Run after a difficult debugging session
- Run when the user says "what just happened" or "what broke"
- Run when /do routes "postmortem", "retro", "what broke", "what happened"

## Inputs

One of the following:
1. A campaign file path (.planning/campaigns/*.md)
2. A time range ("last session", "today", "this week")
3. Nothing (reads the most recently completed campaign)

## Protocol

### Step 1: Collect

Collect data from all available sources:

**From the campaign file (if it exists):**
- Direction vs what was actually built (any scope drift?)
- Phase completion timeline (which phases needed rework?)
- Decision log entries (what architectural choices were made?)
- Review queue items (what needed human review?)
- Circuit breaker activations (what triggered the limit?)
- Feature ledger (what was delivered?)

**From telemetry data (.planning/telemetry/):**
- hook-timing.jsonl: which hooks fired most, any patterns
- hook-errors.log: what was blocked, what failed, what had parse errors
- Circuit breaker trips
- Quality gate violations

**From git history:**
- Commits during the campaign period
- Files changed (which areas saw the most churn?)
- Any reverts (what was undone?)
- Commit message patterns (fix: commits indicate bugs found)

**From the session itself (if no campaign file):**
- Recent tool calls and their outcomes
- Files edited and errors encountered

### Step 2: Analyze

Identify patterns across the data:

1. **What went wrong:** List every failure, error, or unexpected outcome.
   For each item: what happened, what caught it (hook / quality gate / human / nothing),
   what it cost (time, rework, token count).

2. **What the safety systems intercepted:** Circuit breaker activations,
   quality gate blocks, anti-pattern warnings, typecheck failures.
   This is the "invisible value" part — i.e., problems that were prevented.

3. **What drifted:** Compare the campaign direction with what was actually built.
   Did scope expand? Were phases skipped or reordered? Did the
   architecture change mid-build?

4. **What patterns emerged:** Recurring error types, files that kept
   needing fixes, phases that took the longest, common anti-patterns.

### Step 3: Generate

Write to `.planning/postmortems/postmortem-{slug}-{date}.md`:

```markdown
# Postmortem: {Campaign Name or Session Description}

> Date: {ISO date}
> Campaign: {path to campaign file, or "ad-hoc session"}
> Duration: {time from first to last commit}
> Outcome: {completed | partial | parked}

## Summary
{2-3 sentences: what was attempted, what happened, what the result was}

## What Broke
{Numbered list. For each:}
### {N}. {Short description}
- **What happened:** {the failure}
- **Caught by:** {hook name / quality gate / human / nothing}
- **Cost:** {rework time, files affected, phases repeated}
- **Fix:** {what resolved it}
- **Infrastructure created:** {new hook rule, new anti-pattern, new end condition — or "none needed"}

## What Safety Systems Caught
{Things that WOULD have been problems without the hooks/gates}
| System | What It Caught | Times | Impact Prevented |
|--------|---------------|-------|-----------------|
| {hook/gate name} | {description} | {count} | {what would have happened} |

## Scope Analysis
- **Planned:** {what the campaign direction said}
- **Built:** {what the feature ledger shows}
- **Drift:** {none | minor | significant — with specifics}

## Patterns
{Recurring themes worth watching:}
- {pattern 1}
- {pattern 2}

## Recommendations
{Concrete next actions:}
1. {recommendation — e.g., "Add anti-pattern rule for X"}
2. {recommendation — e.g., "Phase Y needs tighter end conditions"}

## Numbers
| Metric | Value |
|--------|-------|
| Phases planned | {N} |
| Phases completed | {N} |
| Commits | {N} |
| Files changed | {N} |
| Circuit breaker trips | {N} |
| Quality gate blocks | {N} |
| Anti-pattern warnings | {N} |
| Rework cycles | {N} |
```

### Step 4: Handoff

Output the HANDOFF block from the Exit Protocol, then suggest: `Run /learn {campaign-slug} to extract patterns into the knowledge base.`

## What /postmortem Does Not Do

- Fabricate failures that never happened (real data only)
- Blame the user or the model (document what happened, not whose fault)
- Recommend changes to skill files (that's for the user to decide)
- Run during a campaign (only after completion or on demand)

## Quality Gates

- Every "What Broke" entry has all 5 fields filled
- The Numbers section contains real data (not estimates)
- Recommendations are concrete actions (not "be more careful")
- If no failures occurred, say so honestly (don't manufacture drama)

## Edge Cases

**Campaign not found**: If the specified campaign file does not exist, check `.planning/campaigns/` for the most recently modified campaign. If no campaigns exist at all, run in ad-hoc mode using recent git history and session context.

**No telemetry data**: Continue without telemetry data. Mark the "What Safety Systems Caught" table as "No telemetry available", and mark the fields in the Numbers section as "N/A". Do not fabricate data.

**Partial campaign** (parked or in progress): Generate the postmortem report with `Outcome: partial`. Document what was completed and what was parked. Include a "Remaining Work" section listing incomplete phases.

**If .planning/postmortems/ does not exist**: Create it before writing. If `.planning/` itself does not exist, output the postmortem report directly in the conversation and note: "Run /do setup to initialize .planning/ for future storage."

## Exit Protocol

```
---HANDOFF---
- Postmortem: {name}
- Document: .planning/postmortems/postmortem-{slug}-{date}.md
- Failures documented: {count}
- Safety catches: {count}
- Recommendations: {count}
- Reversibility: green — one file written to .planning/postmortems/; git rm to undo
---
```

After displaying the HANDOFF block, suggest: `Run /learn {campaign-slug} to extract patterns into the knowledge base.`
