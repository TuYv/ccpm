---
name: handoff
description: |
  Use when managing a two-session handoff — inspecting, picking up, or reviewing a committed handoff package produced by a session=two scope run. The operator interface over the cross-environment handoff lifecycle (plan in one session, build in another, review back in the first).
  Trigger with /hyperflow:handoff, "list handoffs", "pick up the handoff", "review the handoff build".
allowed-tools: Read, Write, Edit, Bash(git:*), Bash(mv:*), Glob, Grep, AskUserQuestion, Skill
argument-hint: "<list | status [slug] | pickup <slug> | review <slug> | complete <slug>>"
version: 1.0.1
license: MIT
compatibility: Designed for Claude Code; portable to Codex/OpenCode/Antigravity
tags: [handoff, two-session, cross-environment, orchestration]
---
# 交接

用于**双会话执行**的操作界面：一个会话负责规划（在 Step 0 门控处使用 `session=two`），另一个
环境中的第二个会话负责构建，第一个会话负责审查。生命周期和包格式定义在
[`../hyperflow/session-handoff.md`](../hyperflow/session-handoff.md) 中；此技能仅提供其上的一组精简动词
（类似于 `/hyperflow:flush` 如何作为延迟提交机制的前端）。

包位于 `.hyperflow-handoff/<slug>/`（已提交，因此可通过 git 传递）。`STATUS`（`planned → built →
reviewed`）是唯一事实来源，并决定你位于交接的哪一侧。

## 子命令

### `list`
只读。列出每个 `.hyperflow-handoff/*/`（不包括 `.archive/`）：slug · `STATUS` · `on_complete` · 存在时长。按
状态分组，使用户能够看到哪些正在等待构建，哪些正在等待审查。

### `status [<slug>]`
显示一个包（或全部包）的 `HANDOFF.md` 清单 + `STATUS`。当 `STATUS=built` 时，还要输出
`COMPLETION.md` 的差异范围和提交数量。只读。

### `pickup <slug>` — 构建侧
用于启动第二会话构建的精简别名：调用 `Skill`，其中 `skill: dispatch` 和 `args: "<slug>"`。
Dispatch 的 Step 1.0 会将 `artefact/` 重新注入 `.hyperflow/`，如果缓存缺失则运行 `/hyperflow:scaffold`，
构建各批次，写入 `COMPLETION.md` + `STATUS=built`，然后根据 `on_complete` 进行部署或停止。

### `review <slug>` — 规划侧
1. 要求 `STATUS=built`（否则："交接 `<slug>` 当前为 `<status>` — 尚无内容可审查"）。
2. 读取 `COMPLETION.md` → 提取 `Diff range = <base>..<head>`。
3. 调用 `Skill`，其中 `skill: audit` 和 `args: "<base>..<head> level=3"`（当 `HANDOFF.md` 中原始分诊
   流程为 `scientific` 或 `security` 时使用 `level=5`）。审计会针对第二会话的差异，调度相应领域的专业
   审查者。
4. 审计干净通过后 → 触发部署门控（`AskUserQuestion` — `Run /hyperflow:deploy? Yes / No`，二选一，无
   标记）。若为 `NEEDS_FIX` → 审计修复门控（`Yes` → `/hyperflow:plan` → `/hyperflow:dispatch`）会处理它。
5. 审查被接受后，将 `STATUS=reviewed`。

### `complete <slug>`
将生命周期标记为完成：将 `STATUS=reviewed`（若尚未设置），并将包归档至
`.hyperflow-handoff/.archive/<slug>/`。提交 `chore(handoff): archive <slug>`。

## 解析

- 省略 `status`/`pickup`/`review` 中的 `<slug>` 时，默认使用最近修改的包。
- `STATUS=planned` 的包是一个**构建侧**任务（运行 `pickup`）；`built` 是一个**审查侧**任务（运行
  `review`）。会话启动钩子会自动提示正确的动词。

## 铁律

- **绝不编辑构建产生的提交。** `review` 对差异范围只读；修复应通过审计修复门控 → 范围界定 → 调度，
  绝不可通过修改第二会话的提交进行。
- **绝不强制推送；绝不使用 `--no-verify`。** 自动推送失败时会显示准确的 `git push -u origin <branch>`。
- 任何提交或包文件中均不得有 **AI 署名**。
- 遵循 `handoff.*` 配置（`autoPush`、`remote`、`packageDir`）。

## 准则

共享规则见 [`../hyperflow/DOCTRINE.md`](../hyperflow/DOCTRINE.md)。包契约和模板见
[`../hyperflow/session-handoff.md`](../hyperflow/session-handoff.md)。