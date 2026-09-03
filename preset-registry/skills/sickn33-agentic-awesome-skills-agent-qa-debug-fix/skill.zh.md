---
name: agent-qa-debug-fix
description: "Debug, patch, and verify failed Agent QA runs from MCP evidence, artifacts, logs, and local code without hiding product or infrastructure defects."
category: testing
risk: critical
source: https://github.com/vostride/agent-qa/tree/main/skills/agent-qa-debug-fix
source_repo: vostride/agent-qa
source_type: official
date_added: "2026-08-16"
author: Vostride
tags: [testing, qa, debugging, mcp, self-healing]
tools: [claude, cursor, gemini, codex]
license: FSL-1.1-ALv2
license_source: https://github.com/vostride/agent-qa/blob/main/LICENSE.md
---
# Agent QA 调试修复

## 概述

根据已记录的证据和相关本地源码修复一次失败的 Agent QA 运行。将分类器的结论视为假设，做出最小且合理的改动，并在不通过重写测试来掩盖真实缺陷的前提下，验证受影响范围最窄的行为。

## 何时使用

- 一次失败的 Agent QA 运行已经过分类排查，现在需要进行代码或 YAML 修复。
- 产物和日志指向测试、钩子、产品、运行时或智能体行为方面的缺陷。
- 提议的修复必须通过范围最窄的 Agent QA 或单元测试重跑来验证。
- 用户要求根据证据自愈或更新过时的 Agent QA 定义。

## 前置条件与审批边界

- 确认用户授权你修改的仓库、工作区、目标环境和文件。
- 在重跑计划执行的测试之前，先检查其外部副作用；对于面向生产环境、具有破坏性或不可逆的操作，须获得明确确认。
- 保留无关的用户改动，并将补丁限制在有证据支撑的故障范围内。
- 不得泄露产物和日志中的凭据或敏感应用数据。

## 工作流程

1. 从收集证据开始：
   - `agent_qa_get_run`
   - `agent_qa_get_run_steps`
   - `agent_qa_get_run_artifact`
   - `agent_qa_get_run_logs`
   - `agent_qa_get_run_execution_logs`
2. 调用 `agent_qa_classify_failure`，并将其分类结果视为假设，而非定论。
3. 识别出错的层面：测试定义、钩子、被测应用、运行时基础设施或智能体行为。
4. 直接检查相关的本地文件。不要仅凭产物推断补丁。
5. 说明证据与改动之间的关联，然后应用能够解释该证据的最小代码或 YAML 改动。
6. 在执行之前验证任何已更改的 Agent QA 定义。
7. 在已批准的环境中重跑受影响范围最窄的 Agent QA 测试、套件、钩子或单元测试。
8. 报告根本原因、已更改的文件、验证命令或 MCP 操作、结果以及剩余风险。

## 修复规则

- 不得捏造选择器、屏幕状态、截图、日志或源文件。
- 当产物表明存在产品或运行时缺陷时，不得仅为让测试通过而重写测试。
- 在编辑测试、套件、钩子或记忆文件时，保留规范的 Agent QA ID。
- 在重跑已编辑的 YAML 之前，优先使用 `agent_qa_validate_test`、`agent_qa_validate_suite` 和 `agent_qa_validate_definition`。
- 当 MCP 不可用时，使用仪表板 REST API 或本地 `.agent-qa` 产物，并说明 MCP 证据不可用。
- 当证据无法区分存在实质差异的不同修复方案时，应停止操作并报告该阻塞问题。

## 示例

```text
User: Fix the failed staging checkout run, but do not touch production.

Expected handling: collect the failed run evidence, classify it, inspect the implicated local
definition and application code, patch only the evidenced cause, validate, rerun the single
staging test, and report changed files plus remaining uncertainty.
```

## 局限性

- 需要访问相关的运行证据和本地源码；仅凭产物可能无法确定根本原因。
- 无法保证偶发的浏览器、设备、网络或提供商故障在一次成功重跑后已被修复。
- 不授权进行超出用户批准范围的生产变更、数据修改、依赖安装或更大范围的重构。
- 一次通过的范围较窄的重跑并不能替代该仓库的正常测试套件或人工审查。
