---
name: hyperflow-deploy
description: Hyperflow ship phase. Use when the user is ready to release — verbs like ship, push, release, deploy, "cut a release", "ready to push". Runs pre-push gates (lint + typecheck + build + tests + security sweep), then asks before pushing. Never --no-verify, never force-push to main.
---
# hyperflow-deploy — 发布阶段（Antigravity 单代理）

先通过门禁，再发布。遵循 `hyperflow` 准则。推送始终是一个明确且经过确认的步骤。

## 步骤

1. **推送前门禁** — 按顺序运行，失败时修复或停止：
   - lint · typecheck · build · tests · 快速安全检查（差异中没有机密信息，没有提交被阻止的文件）。
2. **报告** 门禁结果，用一个简短区块说明每个门禁通过/失败。
3. 通过 AskUserQuestion 执行**推送门禁** — 二选一：`Push / Hold`（不要添加推荐标记）。说明分支、相对于远程仓库的 ahead/behind 状态，以及任何注意事项（例如：其他人的文件导致门禁失败）。
4. 选择 **Push**：推送该分支（绝不对 `main`/`master` 使用 `--force`）。选择 **Hold**：保留本地提交并明确说明。

## 硬性规则

- **绝不**使用 `git push --no-verify`。如果推送前钩子失败 — 即使失败发生在你不负责的文件上 — 也要报告并暂停；不要绕过。
- **绝不**强制推送到 `main`/`master`。
- 如果门禁因并行会话未提交/未跟踪的文件而失败，请报告推送因外部失败而暂停 — 你的提交保持干净并留在本地，直到工作树变为绿色。