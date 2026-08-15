---
name: expo-cicd-workflows
description: Helps understand and write EAS workflow YAML files for Expo projects. Use this skill when the user asks about CI/CD or workflows in an Expo or EAS context, mentions .eas/workflows/, or wants help with EAS build pipelines or deployment automation.
allowed-tools: "Read,Write,Bash(node:*)"
version: 1.0.0
license: MIT License
---
# EAS Workflows Skill

帮助开发者编写和编辑 EAS CI/CD 工作流 YAML 文件。

## 参考文档

在生成或验证工作流文件之前，请先获取以下资源。首先确定此 Skill 的目录，然后使用其 `scripts/` 目录中的获取脚本。该脚本使用 Node.js 实现，并通过 ETags 缓存响应以提高效率：

```bash
# Fetch resources
node <skill-dir>/scripts/fetch.js <url>
```

1. **JSON Schema** — https://api.expo.dev/v2/workflows/schema
   - 必须获取此 schema
   - 它是验证的权威依据
   - 包含所有作业类型及其必需/可选参数
   - 包含触发器类型及配置
   - 包含运行器类型、VM 镜像以及所有枚举值

2. **语法文档** — https://raw.githubusercontent.com/expo/expo/refs/heads/main/docs/pages/eas/workflows/syntax.mdx
   - 工作流 YAML 语法概览
   - 示例和英文说明
   - 表达式语法和上下文

3. **预封装作业** — https://raw.githubusercontent.com/expo/expo/refs/heads/main/docs/pages/eas/workflows/pre-packaged-jobs.mdx
   - 支持的预封装作业类型文档
   - 特定于作业的参数和输出

不要依赖记忆中的值；随着新功能的加入，这些资源会不断演变。

## 工作流文件位置

工作流位于 `.eas/workflows/*.yml`（或 `.yaml`）中。

## 顶层结构

工作流文件包含以下顶层键：

- `name` — 工作流的显示名称
- `on` — 启动工作流的触发器（至少需要一个）
- `jobs` — 作业定义（必需）
- `defaults` — 所有作业的共享默认值
- `concurrency` — 控制并行工作流运行

请查阅 schema，了解每个部分的完整规范。

## 表达式

使用 `${{ }}` 语法表示动态值。schema 定义了可用的上下文：

- `github.*` — GitHub 仓库和事件信息
- `inputs.*` — 来自 `workflow_dispatch` 输入的值
- `needs.*` — 依赖作业的输出和状态
- `jobs.*` — 作业输出（替代语法）
- `steps.*` — 自定义作业中的步骤输出
- `workflow.*` — 工作流元数据

## 生成工作流

生成或编辑工作流时：

1. 获取 schema，以得到当前的作业类型、参数和允许值
2. 验证每种作业类型所需的字段是否均已提供
3. 验证 `needs` 和 `after` 中引用的作业是否存在于工作流中
4. 检查表达式是否引用了有效的上下文和输出
5. 确保 `if` 条件符合 schema 的长度限制

## 验证

生成或编辑工作流文件后，请依据 schema 对其进行验证：

```sh
# Install dependencies if missing
[ -d "<skill-dir>/scripts/node_modules" ] || npm install --prefix <skill-dir>/scripts

node <skill-dir>/scripts/validate.js <workflow.yml> [workflow2.yml ...]
```

验证器会获取最新的 schema 并检查 YAML 结构。在认为工作流已完成之前，请修复所有报告的错误。

## 回答问题

当用户询问可用选项（作业类型、触发器、运行器类型等）时，请获取 schema 并从中得出答案，而不是依赖可能已过时的信息。