---
name: ln-627-diagnosability-auditor
description: "Checks diagnosability through structured logs, metrics, traces, correlation IDs, and useful log levels. Use when auditing incident visibility."
allowed-tools: Read, Grep, Glob, Bash, mcp__hex-graph__find_references, mcp__hex-graph__trace_paths, mcp__hex-line__read_file, mcp__hex-line__grep_search, mcp__hex-line__outline
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# 可诊断性审计器（L3 工作器）

**类型：** L3 工作器

专门用于审计运维人员能否诊断事故的工作器。

## 目的与范围

- 审计**可诊断性**（类别 10：中优先级）
- 检查结构化日志、指标、追踪、关联 ID 和日志级别
- 输出 `ADD_DIAGNOSTIC_SIGNAL`、`STRUCTURE_LOGS` 或 `PROPAGATE_CORRELATION`
- 计算合规分数（X/10）

## 输入

**必须阅读：** 加载 `references/audit_worker_core_contract.md` 和 `references/mcp_tool_preferences.md`。
工具策略：你可能会作为隔离的子代理运行，此时宿主的 `AGENTS.md` 不在作用域内，因此对于文件读取、搜索和编辑，默认优先使用 hex-line MCP。仅当 MCP 行为不明确时，才加载 `references/mcp_integration_patterns.md`。

接收包含技术栈、框架、代码库根目录和 output_dir 的 `contextStore`。

当追踪信息、调用路径或跨文件引用能够显著改善审计效果时，优先使用 `hex-graph`。如果可用，读取本地代码时优先使用 `hex-line`。如果 MCP 不可用、不受支持或尚未建立索引，则继续使用内置的 `Read/Grep/Glob/Bash`，并在报告中说明已采用回退方案。

## 工作流程

检测策略：采用双层检测（候选项扫描，然后进行上下文验证）；仅当验证方法存在歧义时，才加载 `references/two_layer_detection.md`。

1) 解析上下文和 output_dir
2) **确定项目类型（第 2 层预检查）：** 这是 Web 服务（适用所有检查）、CLI 工具（健康检查/探针不适用），还是库（大多数检查可选）？相应调整适用的检查项。
3) 检查可观测性模式（第 1 层：grep）
4) 分析每个候选项的上下文（第 2 层）：
   - 结构化日志：这是库（可以不记录日志）还是服务（必须记录日志）？
   - 请求追踪：单体应用 -> 必要性较低。微服务 -> 至关重要
5) 收集已确认的问题
6) 计算分数
7) **编写报告：** 按照 `references/templates/audit_worker_report_template.md` 在内存中构建完整的 Markdown 报告，通过单次 Write 调用写入 `{output_dir}/ln-627--global.md`
8) **返回摘要：** 返回最简摘要

## 审计规则

### 1. 结构化日志
**检测：**
- Grep 搜索 `console.log`（非结构化）
- 检查是否使用了合适的日志记录器：winston、pino、logrus、zap

**严重程度：**
- **中：** 生产代码使用 console.log
- **低：** 开发代码使用 console.log

**建议：** 使用结构化日志记录器（winston、pino）

**工作量：** M（添加日志记录器，替换调用）

### 2. 关联 ID
**检测：**
- 检查是否存在请求 ID/关联 ID 中间件
- 验证 ID 是否出现在日志中，以及是否传播到出站调用

**严重程度：**
- **中：** 处理请求的服务中没有关联 ID

**建议：** 添加请求 ID 中间件，并在结构化日志中包含关联 ID

**工作量：** M

### 3. 指标收集
**检测：**
- 检查是否使用 Prometheus 客户端、StatsD、CloudWatch
- Grep 搜索指标记录：`histogram`、`counter`

**严重程度：**
- **中：** 缺少指标检测能力

**建议：** 添加 Prometheus 指标

**工作量：** M（对代码进行检测能力插桩）

### 4. 请求追踪
**检测方法：**
- 检查日志中是否包含关联 ID
- 验证追踪信息传播（OpenTelemetry、Zipkin）

**严重程度：**
- **中：** 缺少关联 ID（难以调试分布式系统）

**建议：** 添加请求 ID 中间件

**工作量：** M（添加中间件、传播 ID）

### 5. 日志级别
**检测方法：**
- 检查日志记录器是否支持不同级别（info、warn、error、debug）
- 验证日志级别的使用是否正确

**严重程度：**
- **低：** 仅记录错误日志（可见性不足）

**建议：** 添加 info/debug 日志

**工作量：** S（添加日志语句）

## 评分算法

**强制阅读：** 加载 `references/audit_scoring.md`。

## 输出格式

**强制阅读：** 加载 `references/templates/audit_worker_report_template.md`。

按照 `references/audit_summary_contract.md` 编写 JSON 摘要。在托管模式下，调用方会同时传入 `runId` 和 `summaryArtifactPath`；在独立模式下，工作器根据共享契约自行生成限定于本次运行的产物路径。

将报告写入 `{output_dir}/ln-627--global.md`，其中 `category: "Diagnosability"`，检查项为：structured_logging、correlation_ids、metrics_collection、request_tracing、log_levels。

按照 `references/audit_summary_contract.md` 返回摘要。

当 `summaryArtifactPath` 缺失时，将独立运行时摘要写入 `.hex-skills/runtime-artifacts/runs/{run_id}/evaluation-worker/{worker}--{identifier}.json`，并可选择在结构化输出中回显同一摘要。
```
Report written: .hex-skills/runtime-artifacts/runs/{run_id}/audit-report/ln-627--global.md
Score: X.X/10 | Issues: N (C:N H:N M:N L:N)
```

## 参考文件

- **审计输出模式：** `references/audit_output_schema.md`

## 关键规则

应用已加载的 `references/audit_worker_core_contract.md`。

- **不要自动修复：** 仅报告，绝不注入日志记录或端点
- **感知框架的检测：** 根据项目的技术栈调整检测模式（Node 使用 winston/pino，Go 使用 logrus/zap 等）
- **工作量须符合实际：** S = <1h，M = 1-4h，L = >4h
- **排除项：** 检测 console.log 时跳过测试文件，并跳过仅用于开发的脚本
- **根据上下文确定严重程度：** 生产代码中的 console.log = 中，开发工具中的 console.log = 低
- **独特关注点：** 仅审计诊断信号。存活/就绪探针和关闭行为属于生命周期/配置审计。
- **操作要求：** 每个发现项均使用 `ADD_DIAGNOSTIC_SIGNAL`、`STRUCTURE_LOGS` 或 `PROPAGATE_CORRELATION`。

## 完成定义

应用已加载的 `references/audit_worker_core_contract.md`。

- [ ] 已解析 contextStore（技术栈、框架、output_dir）
- [ ] 已完成全部 5 项检查（结构化日志、关联 ID、指标、请求追踪、日志级别）
- [ ] 已收集发现项，并包含严重程度、位置、工作量、操作和建议
- [ ] 已按照 `references/audit_scoring.md` 计算分数
- [ ] 已将报告写入 `{output_dir}/ln-627--global.md`（以单次原子 Write 调用完成）
- [ ] 已按照契约写入摘要

---
**Version:** 3.0.0
**Last Updated:** 2025-12-23