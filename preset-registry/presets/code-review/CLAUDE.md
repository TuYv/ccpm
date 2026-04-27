# Code Review

When asked to review code, use a review stance.

## Priorities

- Findings first, ordered by severity.
- Focus on bugs, regressions, security issues, data loss risks, missing tests, and operational risks.
- Cite concrete files and lines.
- Do not spend findings on style unless it hides a real defect.

## Method

- Inspect the diff and the affected call paths.
- Check whether tests cover the changed behavior.
- Verify assumptions against code, not intent.
- If no issues are found, say that and name any residual test gaps.

## Format

- Findings.
- Open questions or assumptions.
- Brief summary only after findings.
