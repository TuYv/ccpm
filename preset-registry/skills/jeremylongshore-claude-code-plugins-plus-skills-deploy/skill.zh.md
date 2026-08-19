---
name: deploy
description: |
  Use when ready to ship — runs pre-push gates (lint, typecheck, build, tests, security sweep), commits, releases, and pushes. Standalone, never auto-invoked. Push always requires explicit confirmation.
  Trigger with /hyperflow:deploy, "ship it", "ready to push", "release", "cut a release", "deploy".
allowed-tools: Read, Write, Edit, Bash(git:*), Bash(npm:*), Bash(pnpm:*), Bash(./scripts/*:*), Bash(scripts/*:*), Glob, Grep, Agent, AskUserQuestion
argument-hint: ""
version: 3.1.3
license: MIT
compatibility: Designed for Claude Code
tags: [release, ci, automation, push-gates]
---
# 部署

不得跳过任何门禁，不得忽略任何失败。如果任何门禁失败，立即停止并报告。绝不使用 `--no-verify`。绝不绕过门禁。

**失败恢复（规则 14）。** Worker 错误和质量门禁失败遵循 [`skills/hyperflow/failure-recovery.md`](../hyperflow/failure-recovery.md) 中的规范策略。门禁失败必须呈现给用户，绝不自动修复——打印失败的命令 + 完整 stderr，并停止推送。绝不使用 `--no-verify`，绝不强制推送到 main。

## 各步骤 Agent 映射

| 步骤 | 子阶段 | Workers | Reviewer | 备注 |
|---|---|---|---|---|
| 1a | 仓库状态扫描 | Worker A (git status)、Worker B (git log) | Reviewer | — |
| 1b | 工具检测 | Worker A (profile.md + lockfiles)、Worker B (testing.md + devDeps) | Reviewer | — |
| 2a | Lint + 类型检查（并行） | Worker A (linter)、Worker B (formatter)、Worker C (tsc) | Reviewer | 步骤 3（安全扫描）在编排器层面与步骤 2 并行运行；如果 2a 失败，则在进入 2b 前停止链路 |
| 2b | 构建门禁 | Worker A (prod build)、Worker B (dev build) | Reviewer | 依赖 2a PASS |
| 2c | 测试门禁 | Worker A (unit)、Worker B (integration/E2E) | Reviewer | 并行（P1）；依赖 2b PASS |
| 3a | 密钥扫描 | Worker A (diff pattern)、Worker B (file pattern) | **`security-reviewer`** | 与步骤 2 并行运行（构建前；只读） |
| 3b | 依赖审计 | Worker A (CVE audit)、Worker B (license check) | **`vulnerability-reviewer`**（优先进行网络检索） | — |
| 4 | 提交 | 单个 Worker | Reviewer | 豁免原子性（DOCTRINE 12.2） |
| 5a | 发布执行 | 单个 Worker | Reviewer | 豁免原子性（DOCTRINE 12.2） |
| 5b | 版本同步 | Worker A (manifests)、Worker B (changelog) | Reviewer | — |
| 6 | 推送门禁 | AskUserQuestion | — | 结构性门禁；豁免原子性 |
| 7 | 输出 | 单次打印 | — | 豁免原子性（§12.1） |

## 步骤 1 — 调查状态

子阶段并行运行（P1）。

### 步骤 1a — 仓库状态扫描

两个 Worker 并行运行：

- Worker A — `git status --short` — 未提交的更改、已暂存的文件
- Worker B — `git log origin/<branch>..HEAD --oneline` — 领先远程的提交；检测分支名称

Reviewer — 对仓库状态给出结论（干净 / 存在未提交更改 / 领先 N 个提交）。如果处于 detached HEAD 状态或未配置远程仓库，则说明原因并停止。

### 步骤 1b — 工具检测

两个 Worker 并行运行：

- Worker A — 读取 `.hyperflow/profile.md`，获取包管理器和项目类型；回退方案：检查 `package.json`、`pyproject.toml`、`Cargo.toml`、`go.mod`
- Worker B — 检查 `.hyperflow/testing.md`，获取测试运行器；回退方案：从 `package.json` 的 devDependencies 中检测（`vitest`、`jest`、`playwright`、`pytest` 等）

Reviewer — 生成单一工具清单（包管理器、测试运行器、类型项目标志、构建脚本是否存在）。步骤 2 的门禁将使用该清单。

## 步骤 2 — 质量门禁

步骤 2 在编排器层面与步骤 3（安全扫描）并行运行——两者都是构建前的只读检查。步骤 4（提交）开始前，两者都必须达到 `PASS`。在步骤 2 内部，子阶段 2a → 2b → 2c 按顺序运行（2b 依赖 2a PASS；2c 依赖 2b PASS）。在首次出现 `NEEDS_REVISION` 结论时停止。

墙钟时间说明：默认流程会同时运行 3 个门禁（lint + security + typecheck 并行），然后执行 build，最后运行测试——大致为 `max(lint, security, typecheck) + build + max(unit, integration)`，而旧流程为 4 个门禁时长之和的串行执行。典型节省：墙钟时间减少约 40%。在 `--thorough` 模式下，所有门禁完成后会额外执行一次独立的最终集成审查，并且子阶段内部的 Workers 会串行执行（DOCTRINE §12.2/clarification），因此完整的节省仅剩 2c 中单元测试 + 集成测试这一对并行项所带来的节省。

在每个子阶段之前打印 `Gate <letter> — <name>`。

### 步骤 2a — Lint + typecheck（并行；不需要 build 产物）

三个 Worker 并行执行（P1）。它们都不依赖 build 输出，可以与步骤 3 同时运行。

- Worker A — 检测并运行主要 linter：`npm run lint` / `pnpm lint` / `bun run lint` / `eslint .`。失败时：通过 `--fix` 自动修复，然后重新运行一次；报告最终错误数量。
- Worker B — 检测并运行格式化检查：`prettier --check .` / `biome check .` / 等效命令。报告差异数量。
- Worker C — 根目录 typecheck：`tsc --noEmit` / `npm run typecheck`。如果不是类型化项目，则跳过（依据步骤 1b 的工具清单）。如果检测到 workspace（pnpm/yarn workspaces），还要运行逐包 typecheck：在每个包中执行 `tsc --noEmit`。

Reviewer — 汇总三个 Worker 的总体判定：
- `PASS` — 全部通过（或不存在/未类型化）
- `NEEDS_REVISION` — 任一门禁失败 → 在 2b 之前停止。报告具体哪些门禁失败以及原因。不要继续执行 build。
- `ESCALATE` — 配置错误导致任何门禁都无法执行

### 步骤 2b — Build 门禁（串行；依赖 2a 的 PASS）

两个 Worker 并行执行：

- Worker A — Production build：`npm run build` / `pnpm build` / `bun run build`。捕获输出；如果输出中包含大小或产物路径，则进行报告。
- Worker B — 如果存在独立脚本，则执行 Dev/preview build（`npm run build:dev`、`vite build --mode development` 等）。如果没有独立的 dev-build 脚本，则跳过。

Reviewer — 判定：
- `PASS` — production build 成功
- `NEEDS_REVISION` — production build 失败 → 停止并附带输出
- `ESCALATE` — build 工具不存在或脚本缺失（静默跳过，不视为失败）

### 步骤 2c — Test 门禁（并行；依赖 2b 的 PASS）

两个 Worker 并行执行（P1）：

- Worker A — 单元测试：根据步骤 1b 中的 runner 运行完整单元测试套件（vitest、jest、pytest、cargo test 等）。运行完整套件，而不仅是受影响的部分。报告数量。
- Worker B — 如果检测到独立的 runner，则运行集成 / E2E 测试（playwright、cypress 等）。如果未找到集成测试 runner，则跳过。

Reviewer — 判定：
- `PASS` — 所有测试通过（或不存在集成测试）
- `NEEDS_REVISION` — 测试失败 → 停止并报告失败的测试名称。不要跳过。不要增加超时时间。
- `ESCALATE` — runner 配置错误，或已声明存在测试 runner 但未找到测试

有关门禁的详细信息，请参见 [quality-gates.md](references/quality-gates.md)。

## 步骤 3 — Security Sweep

在编排器层面与步骤 2 并行运行（P3 — 并发的独立前置条件；DOCTRINE §12.2）。步骤 2 和步骤 3 都是 build 之前的只读检查，不共享状态。步骤 4（Commit）开始前，两者都必须达到 `PASS`。一旦出现 `SECURITY_VIOLATION`，立即停止——不重试，也不要求先完成 2a。

子阶段 3a 和 3b 并行运行（P1）。

### 步骤 3a — 密钥和密钥材料扫描

两个 Worker 并行运行：

- Worker A — 对暂存区 + 最近差异进行模式扫描，查找硬编码密钥：API keys、private keys、connection strings、tokens。使用 `git diff HEAD~1..HEAD` 作为扫描范围。
- Worker B — 对本次变更集中修改的文件进行文件级扫描，查找常见密钥模式（SG.、sk-、ghp_、AKIA、BEGIN RSA PRIVATE KEY 等）。

**Reviewer** — 由 [`security-reviewer`](../../agents/security-reviewer.md) 专家负责调度，汇总 3a Workers 的发现结果。如果发现任何密钥 → 立即停止，并输出 `SECURITY_VIOLATION: <file>:<line> — <pattern>`。不执行自动修复 — 用户必须轮换并移除密钥。（如果变更集涉及 PII / 受监管数据，则加入 [`compliance-reviewer`](../../agents/compliance-reviewer.md)。）

### 步骤 3b — 依赖项审计

两个 Worker 并行运行：

- Worker A — `npm audit --audit-level=high` / `pnpm audit` / `pip-audit` / `cargo audit`。仅报告 critical 和 high CVE。
- Worker B — 许可证检查：如果 `.hyperflow/profile.md` 声明了许可证策略，则扫描本次变更集中新增的依赖项，查找被禁止的许可证（专有项目中的 GPL 等）。

Reviewer — 由 [`vulnerability-reviewer`](../../agents/vulnerability-reviewer.md) 专家负责调度（deploy 是 gated flow → 针对当前 advisories 优先进行 web-research，证明每个 CVE 是否适用于固定版本）— 判定结果：
- `PASS` — 没有 critical/high CVE；没有许可证违规
- `NEEDS_REVISION` — 发现 critical CVE → 停止并展示 CVE ID
- `ESCALATE` — 审计工具不存在 → 静默跳过（不视为失败）；缺少许可证策略 → 跳过

## 步骤 4 — 提交

原子操作 — 单个 Worker → Reviewer 对，不采用并行角度。根据 DOCTRINE 12.2 的原子操作豁免条款，不进行子阶段拆分。

- 步骤 2 中由 Worker 引入的修复 → 使用 conventional commit message 自动提交。
- 预先存在且由用户拥有的未提交更改 → 使用 `AskUserQuestion` 确认是否纳入。根据 DOCTRINE 规则 8，这是一个二元操作门禁 — 不添加建议标记：

  ```
  Include uncommitted user changes in this commit?
    Include — your local work + the pre-push fixes ship together
    Exclude — commit only the worker fixes; user changes stay local
  ```

  如果在便携式界面（Codex / OpenCode / Grok）上无法使用弹窗 UI，则将相同的纳入门禁打印为 `Hyperflow Question` 聊天块，并等待用户回答。

- **绝不**在提交消息中添加 `Co-Authored-By: Claude` — 参见 [git-workflow.md](references/git-workflow.md)。

## 步骤 5 — 发布

子阶段按顺序运行（5b 依赖 5a 的输出）。

### 步骤 5a — 发布脚本执行

单个 Worker（不采用并行角度 — 单一机械操作）：

- Worker — 如果存在 `scripts/release.sh` → 运行它。检测到 `release-please` / `changesets` → 使用它。如果“Nothing to release”或没有可发布的提交 → 跳过并记录 `Release: skipped`。

Reviewer — 捕获输出：新的版本字符串（如果版本已提升）或跳过原因。将版本传递给步骤 5b。

### 第 5b 步 — 版本同步验证

并行运行两个 Worker（仅当 5a 生成了新版本时运行）：

- Worker A — 验证所有清单中的版本是否一致：`package.json`、`plugin.json`、`marketplace.json`，以及第 1b 步中识别出的任何其他包含版本信息的文件。
- Worker B — 验证 CHANGELOG 是否由发布脚本更新：检查 `CHANGELOG.md`（或等效文件）中是否存在新版本标题。如果没有 changelog 文件则跳过。

审查者 — 结论：
- `PASS` — 所有清单同步；changelog 已更新
- `NEEDS_REVISION` — 版本不匹配或 changelog 缺少条目 → 停止
- （如果第 5a 步返回 `Release: skipped`，则完全跳过）

## 第 6 步 — 推送（遵循范围第 2.6 步中的 `push` 预选 · `push=ask` 时的结构性闸门）

从链路参数中读取 `push` 参数（当 `chain-mode=auto` 时，该参数由范围第 2.6 步传递）。有三种路径：

**`push=auto`** — 无需询问，立即推送。打印 `Push: pre-elected (auto) — pushing branch + tags…`。运行 `git push`；如果发布创建了标签，则随后运行 `git push --tags`。跳过 `AskUserQuestion` 调用。根据 DOCTRINE 规则 8，这不是人为跳过——用户已在范围第 2.6 步明确表示同意。

**`push=never`** — 完全跳过推送步骤。打印 `Push: pre-elected (never) — branch held local. Run \`git push\` manually when ready.` 不要调用 `git push`。

**`push=ask`**（默认值；当未进行操作性预选时也会触发——例如单独调用 deploy）— 触发结构性闸门 `AskUserQuestion`。根据 DOCTRINE 规则 8，这是一个二元操作闸门——两个选项都不要添加推荐标记。

```
Push to origin/<branch>?
  Push — all gates pass · safe to ship
  Hold — keep local; you can push later
```

- 无论 `push` 的值是什么，**永远不要强制推送到 main 或 master**。`push=auto` 使用普通的 `git push`；如果远程仓库拒绝该操作（非快进），显示错误并停止——不要添加 `--force`。
- 用户选择 yes（或使用 `push=auto`）时——运行 `git push`；如果发布创建了标签，则随后运行 `git push --tags`。
- 对于 `push=ask`，如果便携式界面（Codex / OpenCode / Grok）上无法使用弹出式 UI，则将推送闸门打印为 `Hyperflow Question` 聊天块，并等待用户回答。如果完全没有可用的交互通道，则保留推送并打印 `Push: held — interactive confirmation required`。

## 第 7 步 — 输出

```
── Ship Result ───────────────────
Branch: <name>
Gates: lint pass · typecheck pass · build pass · tests pass (<n> passed)
Security: pass
Commit: <sha> <message>
Release: v<x.y.z> (or skipped)
Push: confirmed (or held)
──────────────────────────────────
```

闸门失败时：

```
── Ship Result ───────────────────
Branch: <name>
Gates: lint pass · typecheck fail · build skipped · tests skipped
  typecheck: 3 errors in src/auth/middleware.ts
Halted at Step 2a
──────────────────────────────────
```

使用 `pass` / `fail` / `skipped` 作为普通单词——不要使用 `✓` / `✗` / `—` 符号。

## 反模式

- `--no-verify`、`--no-gpg-sign`、绕过钩子
- 忽略失败的测试
- 强制推送到 main
- 未经明确确认就自动推送
- 提交 `Co-Authored-By: Claude`

## 记忆

成功交付后，如果在各个门禁中确认了任何新模式，则追加到 `.hyperflow/memory/patterns.md`。如果没有新内容，则跳过。

## 规范

完整规则见 [DOCTRINE.md](../hyperflow/DOCTRINE.md)。输出样式见 [output-style.md](references/output-style.md)。

## 概览

`/hyperflow:deploy` 运行推送前门禁（并行执行 lint + typecheck + security sweep，然后执行 build，最后执行 tests），将 Worker 引入的修复合并为一个干净的提交，在存在发布脚本时运行该脚本，并在推送前询问用户。独立运行——绝不从链路中自动调用。推送始终需要通过 `AskUserQuestion` 获得明确确认。绝不绕过 hooks，绝不向 main 强制推送，绝不向提交添加 AI attribution。

## 前置条件

- 配置了远程仓库的 Git repository（用于推送步骤）。
- 可在 `package.json` 或 `.hyperflow/testing.md` 中检测到 lint / typecheck / build / test 脚本。缺少的脚本会被静默跳过（不会失败）。
- `scripts/release.sh`（或 `release-please` / `changesets`）是可选的——如果存在，则在第 5 步运行；否则由用户管理发布。
- 对于 security sweep：会派遣 security-reviewer 和 vulnerability-reviewer specialist agents。Sweep 是强制性的；派遣失败则停止。

## 指令

编号为 7 的步骤位于上文的 [第 1 步 — 调查状态](#step-1--survey-state) 至 [第 7 步 — 输出](#step-7--output) 中。摘要：

1. 调查状态——两个并行子阶段：1a repo-state 扫描（git status + ahead count），1b 工具检测（package manager、test runner、typed-project flag）。
2. 质量门禁——三个按顺序执行的子阶段：2a lint+typecheck（3 路并行 Workers，不需要 build artifact），2b build（依赖 2a PASS），2c tests（2 路并行，依赖 2b PASS）。在 orchestrator 层面与第 3 步并行运行。在首次出现 `NEEDS_REVISION` 时停止。
3. Security sweep——与第 2 步并行运行（P3，构建前只读）。两个并行子阶段：3a secrets/keys 扫描（security-reviewer specialist），3b dependency audit。在出现 `SECURITY_VIOLATION` 或 critical CVE 时停止。第 2 步和第 3 步都必须 PASS，才能进入第 4 步。
4. 提交——原子化执行。Worker 修复会自动提交；对于预先存在的未提交用户更改，使用 `AskUserQuestion` 询问。
5. 发布——两个按顺序执行的子阶段：5a 运行发布脚本，5b 验证各 manifest 之间的版本同步。
6. 推送门禁——原子结构化门禁。遵循 `push` pre-election（auto/never/ask）。`push=ask` 会触发 `AskUserQuestion`。绝不向 main 强制推送。
7. 输出结构化交付结果。

## 输出

请参见上文 [第 7 步 — 输出](#step-7--output) 中的交付结果块。两种格式：成功（所有门禁通过，内联列出）和失败（在首次失败的门禁处停止，并按顺序列出）。始终使用普通词语（`pass` / `fail` / `skipped`）——不使用装饰性符号。

## 错误处理

| 失败 | 行为 |
|---|---|
| 第 2a 步 — lint 失败 | 使用 `--fix` 自动重试一次。仍然失败 → 停止并报告错误数量。不要继续执行 2b。 |
| 第 2a 步 — typecheck 失败 | 在 2a 处停止。不自动修复——typecheck 错误需要人工检查。 |
| 第 2b 步 — build 失败 | 携带 build 输出停止。预先存在的构建问题很可能早于此次变更集。 |
| 第 2c 步 — tests 失败 | 在失败的测试名称处停止。不要跳过失败的测试。不要增加超时时间。 |
| Security sweep 发现 secrets | 使用 `SECURITY_VIOLATION:` 标记和 file:line 停止。由用户决定补救措施（还原 secret + 轮换 credential）。 |
| `scripts/release.sh` 报告 "nothing to release" | 跳过发布；输出 `Release: skipped (nothing to release)`。对于非发布提交，推送步骤仍会触发。 |
| 推送被拒绝（non-fast-forward） | 拒绝强制推送。输出：`Push rejected — branch is behind origin. Pull/rebase first.` |
| `AskUserQuestion` 弹窗不可用（Codex / OpenCode / Grok） | 将推送或提交包含范围门禁作为 `Hyperflow Question` 聊天块输出，并等待用户回答。 |
| Headless / 非交互模式 | 完全拒绝推送步骤。输出结构化结果，并显示 `Push: held — interactive confirmation required`。 |
| 预先存在的未提交用户更改 | 使用 `AskUserQuestion` 询问是否将其包含在提交中。默认：包含。 |

## 示例

### 顺利发布流程

```
/hyperflow:deploy

Step 2a — Lint + typecheck (parallel with Step 3 security sweep)
Worker A — running lint
Worker B — running formatter check
Worker C — running tsc
Step 3a/3b — security sweep (parallel)
Step 2a Reviewer — all clean
Step 3 Reviewer — no secrets found
Step 2b — Build
Step 2c — Tests (parallel)

? Push to origin/main?
   Push — all gates pass · safe to ship
   Hold — keep local; you can push later

[user picks Push]

── Ship Result ───────────────────
Branch: main
Gates: lint pass · typecheck pass · build pass · tests pass (147 passed)
Security: pass
Commit: dc38564 fix(skills): marketplace validator compliance
Release: v3.1.2
Push: confirmed
──────────────────────────────────
```

### 门禁失败会停止流水线

```
/hyperflow:deploy

Step 2a — Lint + typecheck (parallel with Step 3 security sweep)
Worker A — running lint
Lint failed: 3 errors in src/auth/middleware.ts
Auto-fix attempted... still failing.
Step 2a Reviewer — NEEDS_REVISION: lint gate failed (3 errors in src/auth/middleware.ts)
Halted at Step 2a. Build and tests skipped.

── Ship Result ───────────────────
Branch: main
Gates: lint fail · typecheck skipped · build skipped · tests skipped
  lint: 3 errors in src/auth/middleware.ts (unused vars, missing return type)
Halted at Step 2a
──────────────────────────────────
```

### 安全违规

```
/hyperflow:deploy

Gates pass: lint · typecheck · build · tests
**Reviewer** — security sweep
SECURITY_VIOLATION: src/config/email.ts:12 — hardcoded SendGrid API key (SG.xxx...)

Halted before commit. Rotate the credential and remove the literal from source before retrying.
```

## 资源

- [DOCTRINE.md](../hyperflow/DOCTRINE.md) — 编排规则（尤其是 #8 推送确认门禁）。
- [quality-gates.md](references/quality-gates.md) — 完整的 lint/typecheck/build/test 策略。
- [security.md](references/security.md) — 安全扫描策略和阻止列表。
- [git-workflow.md](references/git-workflow.md) — 分支/提交约定、禁止 AI 署名规则。
- [output-style.md](references/output-style.md) — 发布结果格式。