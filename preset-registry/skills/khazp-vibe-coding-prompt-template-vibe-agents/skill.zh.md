---
name: vibe-agents
description: Generate project agent instructions from agreed requirements and technical decisions. Not for ordinary incremental feature changes.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
---
# Vibe Agents

在可用时，使用 `vibe.project.json` 中的路径读取已达成一致的 PRD 和 Tech Design；否则检查 `docs/PRD-*-MVP.md` 和 `docs/TechDesign-*-MVP.md`。协调冲突，并在提出任何问题之前复用 Handoff Context。

运行 `npx vibeworkflow --dry-run --json` 以检查设置变更，然后在现有授权范围内进行初始化。默认情况下保留现有文件。只有在明确需要替换并展示受影响文件后，才使用 `--force`。CLI 会直接安装选定的文件；不会创建 `templates/` 目录。

根据决策填写必需的占位符。`AGENTS.md` 包含稳定规则；`MEMORY.md` 包含当前进度；`agent_docs` 包含简明的构建上下文。运行 `npx vibeworkflow doctor` 并解决必需的设置错误。构建和行为仍保持为 Not checked。

对于无法访问文件系统的聊天，使用仓库中的可下载文档 `docs/context-pack.md` 以及用户的产品文档；输出清晰分隔的文件内容以供保存。不要臆造缺失的模板内容。工具配置遵循已安装客户端支持的设置；不要自动启用广泛权限。