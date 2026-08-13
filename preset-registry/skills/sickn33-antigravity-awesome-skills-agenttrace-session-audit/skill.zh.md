---
name: agenttrace-session-audit
description: "Audit local AI coding-agent sessions with agenttrace for cost, tool failures, latency, anomalies, health, diffs, and CI gates."
category: development
risk: safe
source: community
source_repo: luoyuctl/agenttrace
source_type: community
date_added: "2026-05-10"
author: luoyuctl
tags: [ai-coding, observability, cost-tracking, session-analysis]
tools: [claude, cursor, gemini, codex-cli]
license: "MIT"
license_source: "https://github.com/luoyuctl/agenttrace/blob/master/LICENSE"
---
# agenttrace 会话审计

## 概览

使用此技能检查本地 AI 编码代理会话，并结合 [agenttrace](https://github.com/luoyuctl/agenttrace) 进行分析。它关注的是一次运行背后的过程：`token` 和成本峰值、工具失败、重试循环、延迟空档、异常、健康评分，以及会话间差异。

agenttrace 是 local-first 的，会读取来自如 Claude Code、Codex CLI、Gemini CLI、Aider、Cursor 导出、OpenCode、Qwen Code、Kimi，以及通用 JSON 或 JSONL traces 等工具的会话日志。

## 何时使用此技能

- 当用户询问 AI 编码运行为何缓慢、昂贵、过于浅尝或不可靠时使用。
- 在重试失败或可疑任务前，审阅本地代理日志时使用。
- 在为 AI 辅助编码会话构建轻量级 CI 健康门禁时使用。
- 在对比两次尝试并查找工具路径变化、重试行为或成本模式变化时使用。

## 工作原理

### 第 1 步：发现可用会话

优先使用可在 `PATH` 上可用的 `agenttrace` 可执行文件。如果当前仓库是 `luoyuctl/agenttrace`，请改用 `go run ./cmd/agenttrace`。

```bash
agenttrace --doctor
agenttrace --overview
```

若未检测到会话，请报告 `--doctor` 检查过的目录，并请求导出的会话文件或日志目录。

### 第 2 步：生成可读审计报告

当用户需要可检查或可共享的简明报告时，请使用 Markdown。

```bash
agenttrace --overview -f markdown -o agenttrace-overview.md
```

在报告中，先列出最高风险会话并说明其重要性：
关键异常、重复的工具失败、`token` 或成本浪费、长延迟间隙、低健康评分，以及可疑的浅层会话。

### 第 3 步：检查单个会话或目录

可快速检查时使用最新会话，或在用户提供显式导出路径时直接使用该路径。

```bash
agenttrace --latest
agenttrace --latest -f json
agenttrace path/to/session-or-export.json
agenttrace --overview -d path/to/session-dir
```

### 第 4 步：在语义关键时进行对比

即使 `token` 和延迟指标看起来健康，代理也可能自信地走向错误实现路径。当语义漂移是风险时，将 trace 审计与前一次或已知良好的尝试进行对比。

请查找：

- 与预期任务偏离的文件或命令变更
- 与参考尝试相比缺失的测试或验证步骤
- 围绕同一文件反复编辑却缺乏明确原因
- 通过跳过必要探索导致的“成本下降”

### 第 5 步：添加自动化门禁

对于 CI 或可复用的团队工作流，请使用 JSON 输出或健康阈值。

```bash
agenttrace --overview -f json -o agenttrace-overview.json
agenttrace --overview --fail-under-health 80 --fail-on-critical --max-tool-fail-rate 15
```

根据项目调整阈值。严格门禁适用于关键工作流；团队尚未建立基线时，使用仅报告命令更合适。

## 示例

### 快速本地复盘

```bash
agenttrace --overview
agenttrace --latest
```

在一次耗时较长的 coding-agent 运行后使用此方法，决定下一次提示是否应拆分任务、规避失败的工具路径、补充缺失测试，或重置上下文。

### CI 健康检查

```bash
agenttrace --overview --fail-under-health 80 --fail-on-critical
```

当 CI 中可获得 agent 会话日志且团队希望对关键异常或不健康运行设置简单保护时，使用此命令。

## 最佳实践

- 当会话发现不确定时先运行 `--doctor`。
- 明确报告缺失字段；不要伪造成本、模型、延迟或健康数据。
- 将提示、代码和会话内容视为私有本地数据。
- 自动化场景优先使用 JSON 输出，人工审核优先使用 Markdown 输出。
- 使用 trace 指标用于过程失败排查，使用 diff/reference 复核用于语义漂移检测。

## 限制

- agenttrace 只能分析本地存在或以导出形式提供的日志。
- 某些代理未暴露足够字段，无法推断成本、模型、缓存使用或延迟。
- 健康 trace 指标良好并不证明最终代码正确；仍需运行测试并复查 diff。
- CI 门禁在团队未理解正常基线前应先以建议模式运行。

## 安全与安全说明

- 除非用户明确授权，不要将私有会话日志上传到外部服务。
- 不要覆盖用户报告，除非他们请求了该精确输出路径。
- 避免打印在提示、工具输出、环境变量或日志中发现的密钥/敏感信息。

## 常见陷阱

- **问题：** 未找到会话。
  **解决方案：** 先运行 `agenttrace --doctor`，然后将 agenttrace 指向导出的文件或日志目录。

- **问题：** 一次运行看起来很便宜且很快，但产出了错误的重构。
  **解决方案：** 将该会话与先前尝试或已知良好 diff 进行对比；仅凭成本指标会漏掉语义漂移。

- **问题：** 添加健康门禁后 CI 失败次数过高。
  **解决方案：** 先使用 JSON 或 Markdown 报告，检查正常基线，再逐步收紧阈值。

## 相关技能

- `@langfuse` - 用于生产环境 LLM 应用的追踪与评估。
- `@observability-engineer` - 用于更广泛的服务监控、SLO 和事件流程。
