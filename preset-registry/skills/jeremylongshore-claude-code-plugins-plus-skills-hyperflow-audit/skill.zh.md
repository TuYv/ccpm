---
name: hyperflow-audit
description: Hyperflow code review. Use when the user wants the current diff, a commit, branch, or PR reviewed — verbs like audit, review, "check for issues", "security check", "code review". Multi-level review (L1 quick → L5 exhaustive), writes findings to .hyperflow/audits/, then a fix-gate.
---
# hyperflow-audit — 审查阶段（Antigravity 单代理）

对目标执行多级审查（默认：`git diff HEAD` + 暂存区）。遵循 `hyperflow` 宪章。L3 及以上级别必须执行安全扫描。

## 级别

| L | 检查项 |
|---|--------|
| 1 | 语法、明显错误、格式 |
| 2 | L1 + 规范合规性、命名、边界情况 |
| 3 | L2 + 跨文件一致性、集成风险、安全性（密钥、注入、路径遍历、XSS、缺少验证） |
| 4 | L3 + 架构、可扩展性、可访问性 |
| 5 | L4 + 对抗性探测、性能分析、替代方案 |

默认使用 L2；当差异涉及身份验证、数据、资金或外部输入时，提升至 L3。

## 步骤

1. **确定范围**（目标参数或当前差异）。读取已更改的文件及其直接依赖项。
2. **执行审查**，使用所选级别。为每个发现标注 `[Critical]` / `[Important]` / `[Suggestion]` / `[Praise]`，并附上 `file:line` 及具体修复方案。
3. **将完整报告**写入 `.hyperflow/audits/<YYYY-MM-DD-HHmm>-<scope>.md`（状态表 → TL;DR → 发现 → 安全扫描表）。打印一行指向该文件的摘要。
4. **修复门禁**：仅当存在 Critical/Important 时，通过 AskUserQuestion 提问：`Fix all (Recommended) / Critical+Important / Critical only / No`。选择修复选项后，将这些发现路由至 `hyperflow-plan` → `hyperflow-dispatch`。出现 `SECURITY_VIOLATION` 时，跳过门禁并立即报告。

## 规则

- 发现记录在文件中，而不是聊天中——聊天中仅显示摘要框。
- 如果运行结果干净（没有 Critical/Important），打印 `Audit clean`，并仍然写入文件以保留历史记录。