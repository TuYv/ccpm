---
name: triage
description: Triage open herdr GitHub issues into a concise decision-first Markdown table. Use when the user says "triage", asks to triage open issues, asks which issues need attention, or wants issue priority/recommendation lights for herdr.
---
# Herdr Issue 分诊

仅在 herdr 仓库中使用此技能。

当用户说 `triage` 时，检查 `herdrdev/herdr` 中未关闭的 GitHub Issue，并返回一个简洁的 Markdown 表格。优先使用 GitHub MCP 工具。如果这些工具不可用，仅在已配置好身份验证访问权限时使用 `gh issue list` / `gh issue view`。

使用以下表格格式：

| 指示灯 | 建议 | Issue | 存在时间 | 反应数 | 原因 |
|---|---|---|---:|---:|---|
| 🔴 | 立即修复 | [#123](https://github.com/herdrdev/herdr/issues/123) | 18d | 5 | 用户可见的回归问题 |
| 🟡 | 排队处理 | [#124](https://github.com/herdrdev/herdr/issues/124) | 42d | 2 | 有用但不构成阻塞 |
| 🔵 | 推迟处理 | [#125](https://github.com/herdrdev/herdr/issues/125) | 7d | 0 | 外观细节优化 |

将 Issue 编号保留为 Markdown 链接。`Age` 使用从 Issue 创建之日起经过的天数。`Reactions` 使用反应总数；仅当简要分类会影响理解时才加入，例如 `7 (5 👍, 2 👀)`。

使用以下指示灯进行分类：

- 🔴 `fix now`：可复现的 Bug、崩溃、数据丢失、工作流受阻、发布风险，或可信度较高的用户可见回归问题。
- 🟡 `queue`：实用功能、重要的质量问题、反复出现的用户反馈、仍然有效的陈旧 Issue，或值得安排处理的行为。
- 🔵 `defer`：外观细节优化、反馈信号较弱的想法、不明确的报告、仅涉及文档的细枝末节，或实施前可能需要更多证据的 Issue。

建议应使用简短的祈使短语：`fix now`、`queue`、`defer`、`needs repro`、`close?` 或 `needs owner decision`。

仅在需要说明范围时，在表格前写一句话，例如检查了多少个未关闭的 Issue。表格后最多添加一条关于不确定性或后续操作的简短注释。除非用户要求深入说明，否则不要写冗长的叙述。