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

使用此技能检查使用
[agenttrace](https://github.com/luoyuctl/agenttrace) 的本地 AI 编码代理会话。它关注一次运行背后的过程：token 和花费激增、工具失败、重试循环、延迟空档、异常、健康度评分，以及会话间差异。

agenttrace 是本地优先的，并读取来自 Claude Code、Codex CLI、Gemini CLI、Aider、Cursor 导出、OpenCode、Qwen Code、Kimi 以及通用 JSON 或 JSONL 跟踪日志的会话记录。

## 何时使用此技能

- 当用户询问为什么某次 AI 编码运行缓慢、昂贵、流于表面或不可靠时使用。
- 当在重试失败或可疑任务前，需要先回顾本地代理日志时使用。
- 当为 AI 辅助编码会话构建轻量 CI 健康门控时使用。
- 当比较两次尝试并查找工具路径变化、重试或成本模式时使用。

## 工作原理

### 第 1 步：发现可用会话

当 `PATH` 中有已安装的 `agenttrace` 二进制文件时优先使用。若当前仓库是 `luoyuctl/agenttrace`，则改用 `go run ./cmd/agenttrace`。

```bash
agenttrace --doctor
agenttrace --overview
```

若未检测到会话，请报告 `--doctor` 检查过的目录，并索要导出的会话文件或日志目录。

### 第 2 步：生成可读审计报告

当用户需要可快速查看或共享的简明报告时，使用 Markdown。

```bash
agenttrace --overview -f markdown -o agenttrace-overview.md
```

在报告中，以最高风险会话开头并说明其重要性：关键异常、反复工具失败、token 或花费浪费、长延迟空档、低健康度评分和可疑的“浅层”会话。

### 第 3 步：检查单个会话或目录

可用最新会话快速检查，或在用户提供路径时传入显式导出路径。

```bash
agenttrace --latest
agenttrace --latest -f json
agenttrace path/to/session-or-export.json
agenttrace --overview -d path/to/session-dir
```

### 第 4 步：在语义敏感场景下对比尝试

即使 token 和延迟指标看起来健康，代理也可能自信地走向错误实现路径。若存在语义漂移风险，请将跟踪审计与基线/历史成功尝试进行对比。

关注以下内容：

- 与预期任务不一致的变更文件或命令
- 与参考尝试相比缺失的测试或验证步骤
- 围绕同一文件反复编辑且无明确原因
- 通过跳过必要探索而导致的“更低成本”

### 第 5 步：添加自动化门控

对于 CI 或可重复的团队工作流，请使用 JSON 输出或健康阈值。

```bash
agenttrace --overview -f json -o agenttrace-overview.json
agenttrace --overview --fail-under-health 80 --fail-on-critical --max-tool-fail-rate 15
```

根据项目调整阈值。关键流程可使用严格门控；在团队尚未建立基线时，报告型命令更合适。

## 示例

### 快速本地审查

```bash
agenttrace --overview
agenttrace --latest
```

在一次较长的编码代理运行后使用它，判断下一条提示是否应拆分任务、避免失败的工具路径、补充缺失测试，或重置上下文。

### CI 健康检查

```bash
agenttrace --overview --fail-under-health 80 --fail-on-critical
```

当 CI 中可获得代理会话日志，且团队希望用简单的方式拦截关键异常或不健康运行时使用。

## 最佳实践

- 当会话发现存在不确定性时，先运行 `--doctor`。
- 直接汇报缺失字段；不要编造成本、模型、延迟或健康度数据。
- 将提示词、代码和会话内容视为私有本地数据。
- 首选 JSON 输出用于自动化，Markdown 输出用于人工复核。
- 使用 trace 指标用于过程性故障分析，使用 diff/参考对比用于语义漂移检查。

## 限制

- agenttrace 只能分析本地存在或作为导入提供的日志。
- 某些代理未暴露足够字段，无法推断成本、模型、缓存使用或延迟。
- 健康的 trace 指标并不意味着最终代码正确；仍需运行测试并复核差异。
- CI 门控应先作为参考建议使用，直到团队理解正常基线行为。

## 安全与风险提示

- 除非用户明确批准，不要将私有会话日志上传至外部服务。
- 不要覆盖用户报告，除非他们请求了该输出路径。
- 避免打印提示词、工具输出、环境变量或日志中发现的密钥信息。

## 常见陷阱

- **问题：** 未找到会话。
  **解决方案：** 运行 `agenttrace --doctor`，然后将 agenttrace 指向导出文件或日志目录。

- **问题：** 一次运行看起来既便宜又快，但却产生了错误重构。
  **解决方案：** 将该会话与先前尝试或已知良好的 diff 进行对比；仅凭成本指标会遗漏语义漂移。

- **问题：** 新增健康门控后，CI 失败过于频繁。
  **解决方案：** 先使用 JSON 或 Markdown 报告，检查正常基线，再逐步收紧阈值。

## 相关技能

- `@langfuse` - 用于生产环境 LLM 应用的 tracing 与评估。
- `@observability-engineer` - 用于更广泛的服务监控、SLO 和事故处理流程。
