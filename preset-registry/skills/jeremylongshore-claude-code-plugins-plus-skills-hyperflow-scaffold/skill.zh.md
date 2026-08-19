---
name: hyperflow-scaffold
description: Hyperflow project setup. Use when starting hyperflow in a new project or refreshing its cache — "init hyperflow", "set up hyperflow", "refresh hyperflow", "scaffold hyperflow". One-shot setup of the .hyperflow/ project cache + memory and the .agent/workflows/hyperflow* slash commands. Does not start the plan → dispatch chain.
---
# hyperflow-scaffold — 项目设置（Antigravity 单代理）

一次性设置 hyperflow 的项目界面。遵循 `hyperflow` 方法论。

## 步骤

1. **在仓库根目录创建 `.hyperflow/` 缓存**（如果不存在）：
   - `.hyperflow/memory/`，包含 `decisions.md`、`learnings.md`、`pitfalls.md`、`patterns.md`（空桩文件，每个文件包含一行标题）。
   - `.hyperflow/tasks/`、`.hyperflow/specs/`、`.hyperflow/audits/`（空目录）。
2. **通过读取仓库来编写上下文文件**（`.hyperflow/profile.md`、`architecture.md`、`conventions.md`）：包括技术栈、顶层布局、测试/代码检查约定、提交约定。每个文件都应简短且基于事实。
3. **安装项目斜杠命令**：将 `hyperflow*` 工作流文件复制到 `<repo>/.agent/workflows/`（这样 `/hyperflow`、`/hyperflow-plan`、`/hyperflow-design` ……即可在 Antigravity 的 `/` 菜单中解析）。来源：hyperflow 随附的 `templates/antigravity/workflows/`。
4. **注明**全局 hyperflow 技能位于 `~/.gemini/config/skills/`（自动触发），全局规则位于 `~/.gemini/AGENTS.md`。
5. 打印一行已创建内容的摘要。不要启动流程链。

## 规则

- 幂等——绝不覆盖现有的 `.hyperflow/` 内容；只创建缺失的内容。
- `.hyperflow/tasks` 和 `.hyperflow/specs` 是运行时产物；`.hyperflow/memory` 具有持久性，值得提交。