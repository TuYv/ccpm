---
name: team-poll
description: A synthetic poll type for the e2e tests; votes and the question live in its database.
---

# Team poll

A synthetic type for Open Artifact's end-to-end tests. Each artifact is a poll kept in its database:
`votes/<person>` holds `{ choice }`, and `config/main` holds `{ question }`. Anyone who can open it votes; only an
editor changes the question.
