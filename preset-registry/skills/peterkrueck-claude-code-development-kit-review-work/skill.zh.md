---
name: review-work
description: Review uncommitted code changes using parallel Claude sub-agents (Bug Hunter, Rules Auditor, optional Architect). The invoking agent triages the diff by file path into impacted modules and risk surfaces, then spawns reviewers scaled to the change. Each reviewer self-primes via /prime, verifies any API/library claim via Context7 (mandatory — unverified claims are auto-discarded), and reports an intent verdict against progress.md before its findings. Catches bugs, security issues, CLAUDE.md compliance, and test-coverage gaps. Skip for trivial typos/formatting. Use after substantive implementation work, or when the Stop hook requests it. Also invocable manually with /review-work.
user_invocable: true
---
# 审查工作 — 自动化代码审查

使用 **Claude 子代理**作为独立审查者，审查未提交的代码变更。调用该技能的代理（你）负责对差异进行分流并决定由谁审查；审查者通过 `/prime` 自行完成初始化，通过 Context7 验证 API/库相关声明，并依据 `progress.md` 中的意图进行报告。

该技能由**AI**运行，而非人类运行——请根据你刚刚做出的变更进行判断。不要机械地套用固定检查标准。零外部依赖：审查者是 Claude 子代理。

## 流程

### 步骤 1：获取差异（+ 测试）

运行以下命令并保存输出：

```bash
git diff --stat HEAD
```

```bash
git diff HEAD
```

`git diff HEAD` 会捕获**未提交**的工作内容——这是正常的提交前流程。如果工作已经提交（例如直接提交到 `main`），则改为审查最近一次提交：`git diff HEAD~1 HEAD`（或 `git show HEAD`）。

如果项目配置了测试命令且相关源代码发生了变更，请运行该命令并捕获输出：

```bash
# Use whatever test/build command is appropriate for this project's stack.
# e.g. npm test · pytest · cargo test · go test ./... · the test_command in
# hooks/config/pipeline.json if set.
```

测试/构建失败是每位审查者的首要发现——将失败输出原样包含在每位审查者的提示中。

### 步骤 2：分流

查看发生变更的文件路径，并生成两个列表。

**受影响的模块** — 默认情况下，整个项目属于一个范围（每个仓库对应一个项目）。只有当差异明确跨越不同的顶层区域（例如 `api/` 与 `web/`、`backend/` 与 `frontend/`）时，才拆分为多个模块/组件。如果全部属于同一区域，则视为单一范围——不要人为拆分。

**风险面** — 标记以下通用风险面中存在的项目。对于每个触发的风险面，在步骤 4 的审查者提示中注入对应的关注领域行：

| 风险面 | 注入此关注领域行 |
|---|---|
| 身份验证 / 授权 | "Auth code touched — check for privilege escalation, missing access checks, and tokens/sessions handled correctly." |
| 数据库 / 架构迁移 | "Schema migration touched — check locking, backfills, NOT NULL on existing rows, and that access rules/constraints are preserved." |
| 配置 / 密钥 | "Config or secrets touched — confirm no secrets are hardcoded or logged, and environment-specific values aren't baked into source." |
| 依赖清单 | "Dependency manifest changed — confirm new deps are pinned, sourced legitimately, and not duplicating existing functionality." |
| 关键路径 / 面向用户的流程 | "Critical-path or user-facing flow touched — check error handling, input validation at boundaries, and that the happy path plus failure modes are covered." |

如果没有任何风险面触发，则完全省略关注领域部分。

### 步骤 3：决定审查者 — 判断标准

当变更确实属于以下简单情况时，**完全跳过该技能**：
- 仅注释 / 格式调整 / 拼写修正
- 不影响逻辑或契约的单行修复
- 不涉及代码引用的纯文档编辑

如果跳过，请只告诉用户一次："Change is trivial, skipping review." 然后继续。

对于非琐碎变更，根据差异规模调整审查者：

- **变更行数少于约 50 行 → 一名审查者**，使用合并后的 Bug Hunter + Rules Auditor 检查清单（步骤 4，单审查者模板）。
- **约 50 行以上，或涉及 2 个以上模块 → 并行的专业审查者**：一名 **Bug Hunter**（正确性 + 安全性）和一名 **Rules Auditor**（项目规则 + 测试）。当差异分为不同模块时，为每名专业审查者提供其负责模块的范围说明。

在满足以下任一条件时，**可选地添加一名 Architect 审查者**：
- 变更涉及 2 个以上模块/组件
- 引入了新的抽象或 API 契约（不只是配置调整）
- 重构/迁移未完成，或文件被重命名/移动
- 差异显示存在范围蔓延——超出了当前任务要求的内容

大多数变更只需要 1 名审查者。较大或涉及多个模块的变更需要 2 名。只有当变更在设计上具有重要意义时才添加 Architect——不要预先启动它。

### 步骤 4：启动审查者（并行，单条消息）

使用 `Agent` 工具，并将 `subagent_type` 设为 `"Explore"`（只读）。在**单条消息**中发送所有审查者，使其并行运行。直接内联角色说明——无需自定义子代理文件。

每个审查者的提示词都必须包含以下共享区块。定义一次，然后粘贴到每个模板中：

```
## Required reading (self-prime)
Before reviewing, run /prime — read .claude/commands/prime.md and follow its
file-loading instructions to load this project's core docs (spec,
project-structure, progress). Skip the acknowledgement step — load the files,
then review.

## The diff
{full `git diff HEAD` output}

## Test results
{Step 1 test/build output, or "n/a — no testable files in this diff"}

## Focus areas flagged by triage
{relevant lines from the Step 2 catalogue; omit this section if none fired}

## Mandatory verification (Context7)
If you flag a finding about an API signature, library usage, deprecation, or
SDK version behavior, you MUST first call the Context7 query-docs tool to
verify it. If that tool isn't directly callable, load it via ToolSearch first
(`select:mcp__context7__query-docs`) — don't skip verification just because the
tool wasn't preloaded. Tag every finding:
- [verified]   — Context7 confirmed the issue.
- [unverified] — you couldn't or didn't check. AUTO-DISCARDED by the judge.
                 Don't bother reporting these.
- [n/a]        — finding is not an API/library claim (most bugs and rules).

## Intent verification (required, output FIRST)
Before your findings, output exactly one line:

    INTENT: [yes | partial | no | n/a] — <one-line reason referencing progress.md>

- yes     — diff fulfills the active task in docs/ai-context/progress.md.
- partial — fulfills part of it, or fulfills it but adds unrelated changes (scope creep).
- no      — diff doesn't match anything in progress.md's active scope.
- n/a     — there is no progress.md, or no active task to verify against.

## Output format
INTENT line first, then one finding per line:

    [high|medium|low] [verified|unverified|n/a] path/to/file:line — Description. Reason: <why this is a problem>.

Check ONLY for real issues. Don't nitpick style, naming, or formatting unless
it causes a bug. If a category is clean, omit it. Don't invent issues to seem
thorough — only report what you can point to in the diff.
```

---

#### 模板：单一审查者（小型差异）

```
You are a code reviewer for an uncommitted-diff code review. Cover both
correctness/security AND project-rule/test compliance.

{shared blocks}

## Checklist
**BUGS** — Logic errors, null/undefined handling, off-by-one, race conditions,
async/await mistakes, state-machine violations, wrong return types, unreachable
code, missing error handling, incorrect boolean logic.

**SECURITY** — Secrets or PII logged or exposed, missing input validation at
system boundaries, internals leaked in error messages, hardcoded secrets,
injection vulnerabilities, broken access checks.

**PROJECT RULES** — Violations of the loaded CLAUDE.md and ai-context docs:
architecture decisions, coding conventions, wrong storage/transport layer, any
documented project-specific constraint.

**TESTS** — If this touches shared modules or critical paths, do corresponding
tests exist? Are assertions structural rather than exact-string matches?
```

---

#### 模板：Bug Hunter（正确性 + 安全性）

```
You are the Bug Hunter for an uncommitted-diff code review. Your ONLY job is
logic errors and security vulnerabilities. Ignore style, naming, and project
rules — the Rules Auditor handles those.

{shared blocks}

## Checklist
**BUGS** — Logic errors, null/undefined handling, off-by-one, race conditions,
async/await mistakes, state-machine violations, wrong return types, unreachable
code, missing error handling, incorrect boolean logic.

**SECURITY** — Secrets or PII logged or exposed, missing input validation at
system boundaries, internals leaked in error messages, hardcoded secrets,
injection vulnerabilities, unsafe deserialization, broken access checks.
```

---

#### 模板：Rules Auditor（项目规则 + 测试覆盖率）

```
You are the Rules Auditor for an uncommitted-diff code review. Your ONLY job is
compliance with this project's rules and test coverage. Ignore general
correctness and security — the Bug Hunter handles those.

{shared blocks}

## Checklist
**PROJECT RULES** — Violations of the loaded CLAUDE.md and ai-context docs:
architecture decisions, coding conventions, wrong storage/transport layer, any
documented project-specific constraint.

**TESTS** — If this touches shared modules or critical paths, do corresponding
tests exist? Are assertions structural rather than exact-string matches?
```

---

#### 模板：Architect（可选——具有设计影响的变更）

```
You are the Architect reviewer for an uncommitted-diff code review. You look at
the diff AS A WHOLE — design coherence, structural soundness, invariants. You do
NOT report line-level bugs or style; the other reviewers handle that.

{shared blocks}

## What to check
- **Premature abstraction** — a new abstraction wrapping one caller, or where a
  few inline lines would have been clearer.
- **Half-finished migrations** — files renamed inconsistently, removed code
  still referenced, dual code paths left after a rewrite.
- **Cross-file invariants** — type renames, signature/contract changes: are all
  call sites updated?
- **Cross-module impact** — when a shared module changes, do its consumers still
  hold conceptually? Are public APIs preserved, or the break noted?
- **Dead code** — branches, parameters, or files no longer reachable.
- **Scope creep** — does the diff do more than progress.md's active task called
  for? Refactor mixed into feature work?

Architect findings tend to be MEDIUM/HIGH because they're structural. Be
precise — point to specific files and behaviors, not vibes.
```

### 第 5 步：判断发现

合并所有审查者的输出，并评估每项发现。审查者拥有全新的视角，但缺少你的对话上下文——他们不知道你为什么做出某些选择。

**无条件自动丢弃：**
- 关于 API/库/SDK 声明且标记为 `[unverified]` 的发现。Context7 是强制要求的——未经验证，就不能算作发现。

**对于其他所有发现：**

| 判定 | 操作 |
|---------|--------|
| 有效（高/中）——确实存在问题，且意见一致 | 立即修复 |
| 有效（低）——确实存在问题，但影响较小 | 告知用户，除非用户要求，否则不要修复 |
| 误报——审查者误解了上下文，或指出的是有意为之的选择 | 用一句话说明原因后拒绝 |

如果任一审查者报告了 `partial` 或 `no`，则应**以意图为先**——这是核心结论，而不是逐行问题。代码局部上可能很干净，但如果解决的是错误的问题，情况会更糟。

### 第 6 步：向用户输出

```
## Code Review Results

Reviewers: <list, e.g. "Bug Hunter + Rules Auditor (parallel)" or "single reviewer">
Modules touched: <list, or "whole project">
Tests: <pass | fail | n/a>
**Intent: <yes | partial | no | n/a>** — <one-line reason>

### Blockers
- [high] file:line — <description>. **Action:** Fixed | Rejected (reason) | Noted

### Mediums
- [med] file:line — <description>. **Action:** …

### Lows
<N findings — expand if you want details>
```

如果一切正常：只需输出一行——“No blockers. N low-severity items (expand if interested). Intent: <verdict>。”

## 重要规则

1. **对于非琐碎工作，绝不能跳过审查。** 自我审查不算审查。
2. **琐碎就是琐碎。** 注释、格式、拼写错误、不影响逻辑的单行修复。任何会改变行为的修改都不是琐碎修改。
3. **绝不能盲目接受发现。** 审查者可能会捏造文件路径、误读逻辑，或指出有意为之的选择。你才是最终裁判。
4. **自动丢弃关于 API/库且标记为 `[unverified]` 的发现。** Context7 是强制要求的——未经验证，就不能算作发现。不要放宽这一要求。
5. **以 INTENT 为先。** 一个干净但偏离目标的差异，比一个包含可修复 bug 的差异更糟。
6. **审查者只能读取。** 使用 `subagent_type: "Explore"`。他们绝不能编辑代码——只有裁判（你）可以应用修复。
7. **测试失败优先级最高。** 如果测试失败，那就是第一个发现；其他一切都居于其次。
8. **不要预先启动 Architect。** 使用评判标准——大多数修改都不需要 Architect。
9. **并行启动。** 多个审查者 → 在同一条消息中发起多个 Agent 调用。
</content>
</invoke>