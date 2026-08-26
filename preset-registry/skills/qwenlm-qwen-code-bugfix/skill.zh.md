---
name: bugfix
description: Fix a bug from a GitHub issue, following the reproduce-first
  workflow. Use when the user asks to fix a bug, investigate a GitHub issue, or
  debug a user-reported problem. Takes a GitHub issue URL or number as input.
---
# Bug 修复工作流

请按照此工作流处理 GitHub issue 的 bug 修复。不要跳过复现；未先复现 bug 就进行修复，往往会导致修复不完整并引入回归问题。

## 输入

GitHub issue URL 或编号。Slash 命令参数会由 Qwen Code 附加到此 skill 正文之后。

## 工件路径

在此仓库中使用 `.qwen/issues/`。在以下步骤中，`<issue-file>` 表示选定的 issue Markdown 文件。

## 步骤 1：读取 Issue

如有需要，先创建工件目录，然后使用 `gh` 将 issue 直接写入 Markdown 文件：

```bash
mkdir -p .qwen/issues
gh issue view <number> \
  --json number,title,body \
  -t '# Issue #{{.number}}: {{.title}}

{{.body}}

---

## Reproduction report

_Pending - to be filled by the test engineer._

## Verification report

_Pending - to be filled by the test engineer._
' > .qwen/issues/issue-<number>.md
```

## 步骤 2：复现

启动 `test-engineer` agent，并让它处理 `<issue-file>`。只说明目标：复现 bug。保持提示词简洁；复现策略由测试工程师负责。

等待测试工程师完成。然后读取 `<issue-file>` 以获取复现报告。如果状态为 `NOT_REPRODUCED`，报告该状态并停止。

## 步骤 3：修复

阅读相关代码并进行修复。使用复现报告作为上下文；其中应包含观察到的行为、预期行为以及有用的代码路径。

如果 bug 复杂到首次尝试未能奏效，请使用 `structured-debugging` skill，系统地分析各个假设。

## 步骤 4：验证

构建并打包你的更改：

```bash
npm run build && npm run bundle
```

再次启动 `test-engineer` agent，并让它处理同一个 issue 文件。说明目标：使用 `node dist/cli.js` 验证修复。

如果验证状态为 `STILL_BROKEN`，读取更新后的 issue 文件，返回步骤 3 并继续迭代。在验证返回 `VERIFIED_FIXED` 之前不要继续。

## 步骤 5：测试

运行你修改过的所有包的单元测试。如果测试工程师在复现过程中编写了失败测试，请确保该测试在修复后通过。否则，请针对失败场景添加聚焦的回归测试覆盖。

## 步骤 6：自查与代码审查

首先，按照 AGENTS.md 的 General workflow 中自查步骤的要求，对完整 diff 进行自查（开放式检查加上假定有误验证，直到连续两次检查均无问题；对于简单修复，一次无问题的检查即可）。如果自查修改了源代码，请在继续自查之前重新运行步骤 4。只有对于普通的单行修复或简单配置修复，才跳过下面的审查。对于其他情况，使用 `/review`，并提供一项列出所有已更改文件的审查任务。为每条评论给出以下判定：

- **有效**：确实存在 bug 或有意义的改进。修复它。
- **误报**：审查者遗漏了上下文。跳过它。
- **过度思考**：技术上合理，但不值得增加复杂性。跳过它。

修复有效问题后，重新运行单元测试，并快速进行一次验证健全性检查。

## 迭代规则

- 如果第 4 步失败，则返回第 3 步，然后重新运行第 4 步。
- 如果第 6 步发现有效问题，请修复这些问题，重新运行第 4 步进行合理性检查，
  并重新运行自我审查。
- 在未询问用户的情况下，第 3—6 步之间的循环次数不得超过 3 次。