---
name: agent-qa-authoring
description: "Create, edit, validate, and run Agent QA tests, suites, and hooks through MCP or CLI while preserving canonical IDs and schema contracts."
category: testing
risk: critical
source: https://github.com/vostride/agent-qa/tree/main/skills/agent-qa-authoring
source_repo: vostride/agent-qa
source_type: official
date_added: "2026-08-16"
author: Vostride
tags: [testing, qa, mcp, web-testing, mobile-testing]
tools: [claude, cursor, gemini, codex]
license: FSL-1.1-ALv2
license_source: https://github.com/vostride/agent-qa/blob/main/LICENSE.md
---
# Agent QA 编写

## 概述

编写 Agent QA 测试、套件和钩子时，不得凭空捏造 schema 字段或标识符。优先使用 Agent QA 的 MCP 工具，使用内置的契约参考获取精确字段，并在保存或运行每个定义之前对其进行验证。

## 何时使用

- 创建或编辑 Agent QA 测试、套件或钩子。
- 验证 Agent QA YAML 或规范 ID。
- 通过 MCP 或 CLI 运行新编写的 Agent QA 定义。
- 调查哪些 Agent QA 配置字段或工作区模式适用。

## 前提条件与审批边界

- 仅在用户已授权且已配置好的 Agent QA 工作区中操作。
- 在执行任何创建、更新、删除或测试运行操作之前，先检查所请求的范围。
- 在删除定义或运行可能改变外部应用状态的测试之前，须获得明确确认。
- 不要将凭据放入定义或输出中；使用工作区配置的密钥处理机制。

## 工作流程

1. 使用 `agent_qa_discover` 探索本地可用接口。
2. 使用 `agent_qa_get_config` 检查当前生效的配置，尤其是 targets、devices、providers 和 `services.mcp`。
3. 当需要精确的 schema 字段或 ID 契约时，加载 `references/agent-qa-contracts.json`。
4. 使用 Agent QA 工具生成每个新 ID：
   - MCP：`agent_qa_generate_id`
   - CLI 备选方案：`agent-qa ids generate <test|suite|hook|run|observation>`
   - 如果这两种接口均未安装，则停止并请用户批准确切的 Agent QA 安装。不要在运行时通过 `npx` 或其他不固定的包引用来获取并执行该包。
5. 绝不手写 ID。使用 `agent_qa_validate_id` 或 `agent-qa ids validate <type> <id> --json` 验证现有 ID。
6. 保存前先验证定义：
   - 测试：`agent_qa_validate_test` 或带 `kind: "test"` 的 `agent_qa_validate_definition`
   - 套件：`agent_qa_validate_suite` 或带 `kind: "suite"` 的 `agent_qa_validate_definition`
   - 钩子：带 `kind: "hooks"` 的 `agent_qa_validate_definition`
7. 优先使用 MCP 执行编写类变更操作：
   - 测试：`agent_qa_create_test`、`agent_qa_update_test`、`agent_qa_delete_test`
   - 套件：`agent_qa_create_suite`、`agent_qa_update_suite`、`agent_qa_delete_suite`
   - 钩子：`agent_qa_create_hook`、`agent_qa_update_hook`、`agent_qa_delete_hook`
8. 仅在 MCP 不可用时才使用 CLI 或 YAML 备选方案。保持文件路径与 `workspace.testMatch` 或 `workspace.suiteMatch` 匹配。

## 必需的 ID 契约

- 测试 ID：`t_` 加上 10 个 id-agent 词。
- 套件 ID：`s_` 加上 10 个 id-agent 词。
- 钩子 ID：`h_` 加上 10 个 id-agent 词。
- 运行 ID：`r_` 加上 10 个 id-agent 词。
- 观察 ID：`obs_` 加上 10 个 id-agent 词。

## 运行之前

- 先验证 YAML。
- 相较于直接调用 shell 命令，优先使用 `agent_qa_enqueue_test_run` 和 `agent_qa_enqueue_suite_run`。
- 如果使用 CLI 备选方案，仅在验证成功后才运行。
- 当测试可能修改真实数据或触发外部操作时，重新确认目标与环境。

## 示例

```text
User: Add an Agent QA checkout test for the staging target and validate it, but do not run it yet.

Expected handling: discover the workspace, inspect the staging target, generate the test ID,
create the smallest valid definition, validate it, and stop before enqueueing a run.
```

## 局限性

- 需要已安装且已配置好的 Agent QA 工作区，以及所选目标用到的任何浏览器、移动端、模型提供方或应用依赖。
- 不推断未在文档中说明的配置键、选择器、UI 状态、凭据或测试数据。
- MCP 的可用性和权限因工作区而异；需说明使用了哪种 CLI 或 YAML 备选方案。
- 验证只能证明 schema 兼容性，并不能证明应用行为或外部环境可以安全地执行。

## 禁止事项

- 不要捏造配置键，也不要使用旧版根配置桶。
- 不要手写 ID。
- 不要修改已配置工作区模式之外的文件。
- 未经用户明确划定范围并确认，不得运行破坏性或面向生产的场景。
