---
name: eas-workflows
description: EAS service (paid). Helps understand and write EAS workflow YAML files for Expo projects. Use this skill when the user asks about CI/CD or workflows in an Expo or EAS context, mentions .eas/workflows/, or wants help with EAS build pipelines or deployment automation.
allowed-tools: "Read,Write,Bash(node:*),Bash(npx *eas-cli@*)"
version: 1.0.0
license: MIT License
---
# EAS Workflows 技能

> **EAS 服务会产生费用。** EAS Workflows 运行在 Expo Application Services 上，这是一项付费产品，免费套餐设有额度限制。每个工作流作业都会消耗你所订阅套餐的构建/计算分钟数，而执行构建或提交的作业还需要付费的 Apple Developer 和 Google Play 账户。触发运行前，请查看 https://expo.dev/pricing。

帮助开发者编写和编辑 EAS CI/CD 工作流 YAML 文件。

## 参考文档

在生成或编辑工作流文件之前，或回答语法问题时，请获取以下资源。首先确定此技能所在的目录，然后使用其 `scripts/` 目录中的获取脚本。该脚本使用 Node.js 实现，并通过 ETags 缓存响应以提高效率：

```bash
# Fetch resources
node <skill-dir>/scripts/fetch.js <url>
```

1. **JSON Schema** — https://api.expo.dev/v2/workflows/schema
   - 必须获取此 schema
   - 工作流 YAML 结构的事实来源；EAS CLI 仍是具有权威性的最终验证工具
   - 所有作业类型及其必需/可选参数
   - 触发器类型和配置
   - 运行器类型、VM 镜像以及所有枚举值

2. **语法文档** — https://raw.githubusercontent.com/expo/expo/refs/heads/main/docs/pages/eas/workflows/syntax.mdx
   - 工作流 YAML 语法概述
   - 示例和英文说明
   - 表达式语法和上下文

3. **预封装作业** — https://raw.githubusercontent.com/expo/expo/refs/heads/main/docs/pages/eas/workflows/pre-packaged-jobs.mdx
   - 受支持的预封装作业类型文档
   - 作业特有的参数和输出

不要依赖记忆中的值；随着新功能的加入，这些资源会持续演进。

## 工作流文件位置

工作流位于 `.eas/workflows/*.yml`（或 `.yaml`）中。每个文件不得超过 16 KiB。

## 顶层结构

工作流文件包含以下顶层键：

- `name` — 工作流的显示名称
- `on` — 启动工作流的触发器（至少需要一个）
- `jobs` — 作业定义（必需）
- `defaults` — 所有作业共用的默认值
- `concurrency` — 控制并行工作流运行

请查阅 schema，了解各部分的完整规范。

## 表达式

使用 `${{ }}` 语法表示动态值。schema 定义了以下可用上下文：

- `github.*` — GitHub 仓库和事件信息
- `inputs.*` — 来自 `workflow_dispatch` 输入的值
- `needs.*` — 依赖作业的输出和状态
- `jobs.*` — 作业输出（替代语法）
- `steps.*` — 自定义作业中的步骤输出
- `workflow.*` — 工作流元数据

## 生成工作流

生成或编辑工作流时：

1. 获取 schema，以取得当前的作业类型、参数和允许值
2. 验证每种作业类型的必需字段是否存在
3. 确认 `needs` 和 `after` 中引用的作业存在于工作流中
4. 检查表达式是否引用有效的上下文和输出
5. 确保 `if` 条件符合 schema 的长度限制

## 验证

生成或编辑工作流文件后，请从 Expo 项目根目录使用 EAS CLI 对其进行验证：

```sh
npx -y eas-cli@latest workflow:validate .eas/workflows/<workflow.yml> --non-interactive
```

请针对每个已更改的工作流文件分别运行该命令。该命令要求 EAS CLI 已登录，并且已关联 Expo 项目。与仅验证架构不同，它还会根据项目的 `eas.json` 检查构建配置文件引用，并执行 EAS 服务端验证。修复报告的每个错误，并重新运行该命令，直到它输出 `Workflow configuration YAML is valid.`。请勿使用本地 YAML 或 JSON Schema 验证器替代此命令。

## 回答问题

当用户询问可用选项（作业类型、触发器、运行器类型等）时，请获取架构并从中推导答案，而不要依赖可能已过时的信息。

## 提交反馈
如果你发现此技能中存在错误、误导性信息或过时信息，请进行报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "eas-workflows" "<actionable feedback>"
```
仅当你有具体且可操作的问题需要报告时才提交。请尽可能包含相关上下文。
如果 AI 代理反复失败，或用户不得不接手 Expo 任务，请加载 expo-skill-feedback 技能并遵循其 eval-candidate 流程，而不要重复使用上述命令。