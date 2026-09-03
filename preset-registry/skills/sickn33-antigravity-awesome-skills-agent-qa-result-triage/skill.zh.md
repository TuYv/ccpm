---
name: agent-qa-result-triage
description: "Triage failed Agent QA runs with MCP evidence, artifacts, logs, fixed failure categories, confidence, and actionable next steps."
category: testing
risk: safe
source: https://github.com/vostride/agent-qa/tree/main/skills/agent-qa-result-triage
source_repo: vostride/agent-qa
source_type: official
date_added: "2026-08-16"
author: Vostride
tags: [testing, qa, triage, mcp, debugging]
tools: [claude, cursor, gemini, codex]
license: FSL-1.1-ALv2
license_source: https://github.com/vostride/agent-qa/blob/main/LICENSE.md
---
# Agent QA 结果分诊

## 概述

基于记录的证据对失败的 Agent QA 运行进行分类，而不是凭空猜测。检查运行、步骤、产物和日志；选择一个固定的类别；并返回置信度、可能的责任归属以及下一步有证据支持的操作。

## 适用场景

- 调查失败或中断的 Agent QA 运行。
- 检查运行产物、步骤结果或执行日志。
- 比较近期相关运行以发现反复出现的失败模式。
- 判断某个失败属于测试、产品、钩子（hook）、浏览器/移动端运行时，还是基础设施的责任方。

## 工作流程

1. 首先使用 `agent_qa_get_run` 获取运行状态、套件子上下文、步骤和尝试情况。
2. 在做出决定之前先获取证据：
   - `agent_qa_get_run_artifact`
   - `agent_qa_get_run_steps`
   - `agent_qa_get_run_logs`
   - `agent_qa_get_run_execution_logs`
3. 调用 `agent_qa_classify_failure`，除非有更强的证据与之矛盾，否则将其返回的类别作为默认分类。
4. 当分类器输出中提供近期相关运行时，对其进行比较。
5. 返回简明的分诊结果：类别、置信度、证据、可能的修复区域以及下一步操作。
6. 如需修改代码，在分诊完成后切换到 `agent-qa-debug-fix`。

## 类别

从 `references/triage-categories.md` 中选择且仅选择一个类别：

- `timeout`
- `appium_startup`
- `browser_disconnect`
- `element_not_found`
- `assertion_failure`
- `hook_failure`
- `infrastructure`
- `unknown_failure`

## 证据规则

- 引用或总结具体的产物、日志或步骤证据。
- 当缺失的产物部分限制了置信度时，要予以说明。
- 不要捏造 MCP 未返回的截图、视频、日志或内存上下文。
- 如果 MCP 不可用，则回退到仪表板 REST API 或 Agent QA CLI 输出，并说明哪些证据无法获取。
- 从报告中隐去凭证、会话令牌、个人数据以及无关的应用内容。

## 示例

```json
{
  "category": "element_not_found",
  "confidence": "high",
  "evidence": ["Step 4 could not resolve the described checkout button"],
  "likely_fix_area": "test definition or changed product UI",
  "next_action": "Inspect the captured UI context, then compare the current checkout screen"
}
```

## 局限性

- 分类的可靠性仅取决于所保留的运行产物和日志。
- 失败类别只能指出最可能的失败层面，并不能证明根本原因。
- 缺失截图、DOM/无障碍上下文、设备日志或历史运行时，必须降低置信度。
- 此技能不修改测试或应用代码；如需经授权的修复，请使用 `agent-qa-debug-fix`。
