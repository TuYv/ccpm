---
name: vibe-agents
description: "Create project agent instructions and tool configuration from agreed product and technical decisions."
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
---
# 项目代理指令

使用已达成的需求、技术决策和现有仓库，仅编写稳定且不明显的指导内容。对于针对性的 `AGENTS.md` 编辑，直接更新受影响的指令；不要要求安装程序、新的 PRD 或完整访谈。将进度保存在项目的记忆/交接文件中，而不是始终加载的规则中。

对于初始 Vibe Workflow 设置，使用已配置的清单路径。如果 `vibeworkflow` CLI 可用，请检查 `npx vibeworkflow --dry-run --json`，并在用户授权范围内进行初始化。保留现有文件；替换标志仅用于有意进行的替换，且前提是已审查受影响的文件。CLI 会直接安装文件，而不是安装到新的 `templates/` 目录中。

根据已知决策填写相关占位符。将特定任务的流程保存在 skills 或 references 中，并仅在相关时加载。区分本地实现、外部发送、生产环境变更和新增访问权限。不要仅为了方便设置而启用广泛的工具权限。

如果可用，请对 CLI 生成的设置使用 `npx vibeworkflow doctor`；它会检查配置，而不是可用的构建或用户流程。在没有文件系统访问权限的聊天中，使用仓库的 docs/context-pack.md 和提供的产品决策来生成分离的待保存文件。说明缺失的模板/上下文限制，而不是凭空编造。仅当用户请求包含继续实施时，才继续进行实施。