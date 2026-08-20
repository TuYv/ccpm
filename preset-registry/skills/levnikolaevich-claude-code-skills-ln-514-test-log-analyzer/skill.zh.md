---
name: ln-514-test-log-analyzer
description: "Analyzes application logs: classifies errors, checks log quality, maps stack traces to source. Use when logs need review after test runs or during development."
license: MIT
model: claude-sonnet-4-6
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# 测试日志分析器

**类型：** L3 工作器
**类别：** 5XX 质量

对应用程序日志进行双层分析。Node.js 脚本负责收集和定量分析；AI 负责分类、质量评估和修复建议。

## 输入

无必需输入。在当前项目目录中运行，并自动检测日志源。

可选的 `args` — 调用方指令（自然语言）：时间窗口、预期错误、测试上下文。示例：`"review logs for last 30min, auth 401 errors expected from negative tests"`。

## 目的与范围
- 分析应用程序日志（测试运行后、开发期间或按需）
- 将错误分为 4 类：真实缺陷、测试产物、预期行为、运维警告
- 评估日志质量：噪声程度、完整性、日志级别正确性、格式、结构化日志记录
- 将堆栈跟踪映射到源文件；提供修复建议
- 报告用于质量判定的发现（只有真实缺陷会造成阻塞）
- **不更改状态或创建任务** — 仅报告

## 使用时机
- 分析任意项目中的应用程序日志（默认：最近 1 小时）
- 测试运行后对错误进行分类并评估日志质量
- 可使用上下文指令调用：`Skill(skill: "ln-514-test-log-analyzer", args: "review last 30min, 401 errors expected")`

## 工作流程

### 阶段 0：解析指令

如果提供了 `args` — 提取：时间窗口（默认：1 小时）、预期错误列表、测试上下文。
如果未提供 `args` — 使用默认值（最近 1 小时，无预期错误）。

### 阶段 1：日志源检测和脚本执行

读取目标项目中的以下文件（如果存在）：`docs/project/infrastructure.md`、`docs/project/runbook.md`

1) 检查目标项目中是否存在 `scripts/analyze_test_logs.mjs`。如果缺失，则从 `references/scripts/analyze_test_logs.mjs` 复制。
2) 检测日志源模式（自动检测优先级：docker → file → loki）：

| 模式 | 检测方式 | 来源 |
|------|-----------|--------|
| `docker` | `docker compose ps` 返回正在运行的容器 | `docker compose logs --since {window}` |
| `file` | 存在 `.log` 文件，或 `tests/manual/results/` 中有输出 | infrastructure.md 中的文件路径或 `*.log` glob |
| `loki` | 存在 `LOKI_URL` 环境变量或 `environment_state.json` 的可观测性部分 | Loki HTTP query_range API |

3) 运行脚本：`node scripts/analyze_test_logs.mjs --mode {detected} [options]`
4) 如果未找到日志源 → 返回 `NO_LOG_SOURCES` 状态，并跳至阶段 5。

**基于级别的错误检测（关键）：**
构造 Loki 查询或 grep 命令来扫描错误时，始终按**解析后的 level 字段**进行过滤，而不是通过在完整日志行中匹配单词 "error"。像 `uvicorn.error` 这样的日志记录器名称包含 "error"，但其日志级别为 INFO — 文本匹配会产生误报。

| 日志格式 | 正确的错误过滤器 | 错误的过滤器 |
|------------|---------------------|--------------|
| 管道分隔（`ts \| LEVEL \| ...`） | `\| ERROR` 或 `\| CRITICAL`（匹配 level 字段的位置） | `grep -i error`（会匹配日志记录器名称） |
| Loki 结构化日志 | `{service_name="X"} \| level="ERROR"` 或 `\| pattern` 提取 | `{service_name="X"} \|= "error"` |
| 键值对（`level=ERROR msg=...`） | `level=ERROR` 或 `level=FATAL` | `\|~ "(?i)error"` |
| Docker 日志（本地） | `grep -E '\| ERROR \| \| CRITICAL '` | `grep -iE 'error\|exception'` |

`analyze_test_logs.mjs` 脚本通过结构化正则表达式解析器正确处理了这一问题。这些规则适用于分析期间构造的**临时 Loki/grep 查询**。

### 阶段 2：四类错误分类

对脚本 JSON 输出中的每个错误组进行分类：

| 类别 | 操作 | 判定标准 |
|----------|--------|----------|
| **真实缺陷** | 修复 | 意外崩溃、数据丢失、流水线中断 |
| **测试产物** | 跳过 | 来自测试脚本、刻意进行的错误路径验证 |
| **预期行为** | 跳过 | 限流、输入验证、由无效令牌导致的身份验证失败 |
| **运维警告** | 监控 | 时钟漂移、资源压力、暂时不可用 |

**测试产物检测启发式规则：**
- 测试名称包含：`invalid`、`error`、`fail`、`reject`、`unauthorized`、`forbidden`、`not_found`、`bad_request`、`timeout`
- 测试断言非 2xx 状态码（4xx、5xx）
- 测试使用 `pytest.raises`、`expect(...).rejects`、`assertThrows`、`should.throw`
- 错误与回归测试输出中的测试执行时间戳相关
- 与 `tests/manual/` 脚本匹配的模式

**错误分类法参见** `references/error_taxonomy.md` **（9 个类别：CRASH、TIMEOUT、AUTH、DB、NETWORK、VALIDATION、CONFIG、RESOURCE、UNSUPPORTED_API）。**

### 阶段 3：日志质量评估

**必须阅读：** 加载 `references/error_taxonomy.md`（各级别判定标准表 + 级别正确性参考）

**步骤 1：检测配置的日志级别。** 按以下顺序检查：
1. `LOG_LEVEL` / `LOGLEVEL` 环境变量（`.env`、`docker-compose.yml`、`infrastructure.md`）
2. 框架配置：Python `logging.conf` / Django `LOGGING` / Node `LOG_LEVEL`
3. 默认值：如果未检测到，则假定为 `INFO`

配置的级别决定日志中会出现哪些级别，但无论配置如何，每个级别都有自己的噪声阈值。

**步骤 2：评估 6 个质量维度：**

| 维度 | 检查内容 | 信号 |
|-----------|---------------|--------|
| **噪声程度** | `error_taxonomy.md` 第 4 节中的各级别噪声阈值：TRACE（生产环境中为零）、DEBUG（占比 >50%）、INFO（>30%）、WARNING（占总量 >1%）、ERROR（占总量 >0.1%） | `NOISY: {level} template "{msg}" at {ratio}%` |
| **完整性与可追踪性** | 关键操作缺少日志条目 + 可追踪性缺口（见下表） | `MISSING: No log for {operation}` / `TRACEABILITY_GAP: {type} in {file}:{line}` |
| **级别正确性** | `error_taxonomy.md` 第 4 节中的各级别判定标准：内容、反模式、库规则 | `WRONG_LEVEL: should be {level}` |
| **结构化日志** | 缺少 trace_id/request_id/用户上下文；非结构化纯文本 | `UNSTRUCTURED: lacks {field}` |
| **敏感性** | 日志消息中包含 PII/机密/令牌/密码 | `SENSITIVE: {type} exposure` |
| **上下文丰富度** | 错误缺少可操作的上下文（order_id、user_id、operation） | `LOW_CONTEXT: lacks context` |

**可追踪性缺口检测** — 扫描源代码，查找没有 INFO 级别日志的操作：

| 操作类型 | 预期日志 | 添加位置 |
|---------------|-------------|--------------|
| 传入请求处理 | 收到请求 + 响应状态 | 路由处理器的入口/出口 |
| 外部 API 调用 | 已发送请求 + 响应状态 + 持续时间 | HTTP 客户端调用之前/之后 |
| DB 写入（INSERT/UPDATE/DELETE） | 操作 + 受影响的实体 + 数量 | ORM/查询调用之前/之后 |
| 身份验证决策 | 结果（允许/拒绝）+ 原因 | 身份验证检查之后 |
| 状态转换 | 旧状态 → 新状态 + 触发因素 | 状态转换点 |
| 后台任务 | 开始 + 完成/失败 + 持续时间 | 任务处理器的入口/出口 |
| 文件/资源操作 | 打开/关闭 + 路径 + 大小 | I/O 操作处 |

**日志格式质量**（依据 `references/log_analysis_output_format.md` 的 10 项标准检查清单）：

| # | 标准 | 检查项 |
|---|-----------|-------|
| 1 | 双重格式 | 生产环境使用 JSON，开发环境使用可读格式 |
| 2 | 时间戳 | 格式一致且包含时区信息 |
| 3 | 级别字段 | 存在且为大写 |
| 4 | 追踪/关联 ID | 每条日志中均存在，且异步安全 |
| 5 | 服务名称 | 能够标识来源服务 |
| 6 | 源代码位置 | module:line + function |
| 7 | 额外上下文 | 使用结构化字段，而非字符串插值 |
| 8 | PII 脱敏 | 妥善处理密码、API 密钥和电子邮件地址 |
| 9 | 噪声抑制 | 过滤重复项并抑制第三方日志 |
| 10 | 可解析性 | 开发环境：竖线分隔；生产环境：每行均为有效 JSON |

得分：通过的标准数 / 10。

### 阶段 4：堆栈跟踪映射 + 修复建议

对于每个真实缺陷：
1) 提取堆栈跟踪帧；识别起始帧（项目代码中的第一个帧，而非 node_modules/site-packages 中的帧）
2) 映射到源文件：行号
3) 生成修复建议：修改内容、修改位置、工作量估算（S/M/L）

**使用受 Sentry 启发的维度确定优先级：**
- 高发生量（出现次数）、测试后回归（新错误）、高影响路径（身份验证/支付/数据库）、关联追踪（跨服务的 trace_id）

### 阶段 5：生成报告

**强制阅读：** 加载 `references/log_analysis_output_format.md`

在聊天中输出报告，标题为 `## Test Log Analysis`。包括：
- 信号表（真实缺陷数量、已过滤的测试产物、日志噪声状态、日志格式得分、日志质量得分）
- 真实缺陷表（优先级、类别、错误、来源、修复建议）
- 已过滤项表（类别、数量、示例）
- 日志质量问题表（维度、服务、问题、建议）
- 噪声报告表（数量、比例、服务、级别、模板、操作）
- 用于程序化处理的机器可读块 `<!-- LOG-ANALYSIS-DATA ... -->`

### 阶段 6：元分析

可选参考：仅当用户要求进行运行后元分析或采用协议格式的运行反思时，加载 `references/meta_analysis_protocol.md`。

技能类型：`execution-worker`。收到请求时，在所有阶段完成后运行。

## 对判定结果的影响

质量协调器归一化矩阵组件：

| 状态 | 映射为 | 扣分 |
|--------|---------|---------|
| CLEAN | -- | 0 |
| WARNINGS_ONLY | -- | 0 |
| REAL_BUGS_FOUND | FAIL | -20 |
| SKIPPED / NO_LOG_SOURCES | 忽略 | 0 |

日志质量/格式问题仅供参考——不影响质量判定。只有真实缺陷会阻断。

## 关键规则
- 不更改状态或创建任务；仅生成报告。
- 测试产物和预期行为一律过滤——绝不计为缺陷。
- 日志质量问题仅作为建议——提供信息，但不阻断流程。
- 脚本必须妥善处理以下情况：无 Docker、无日志文件、无 Loki → `NO_LOG_SOURCES`。
- 保留注释中的语言（EN/RU）。

## 运行时摘要产物

**强制阅读：** 加载 `references/quality_summary_contract.md`、`references/quality_worker_runtime_contract.md`

运行时配置：
- family: `quality-worker`
- worker: `ln-514`
- summary kind: `quality-worker`
- 协调器使用的 payload 字段：`worker`、`status`、`verdict`、`issues`、`warnings`、`artifact_path`

调用规则：
- 独立模式：省略 `runId` 和 `summaryArtifactPath`
- 托管模式：同时传入 `runId` 和准确的 `summaryArtifactPath`
- 在输出最终结果之前，始终写入经过验证的摘要

## 完成定义

- [ ] 脚本已部署到目标项目的 `scripts/`（或已存在）
- [ ] 已检测日志源并执行脚本（或返回 NO_LOG_SOURCES）
- [ ] 错误已分为 4 类；已识别真实缺陷
- [ ] 已评估日志质量（6 个维度 + 10 项格式检查清单）
- [ ] 已将真实缺陷的堆栈跟踪映射到源文件
- [ ] 已在聊天中输出报告，其中包含信号表和机器可读块

## 参考文件
- **错误分类法：** `references/error_taxonomy.md`
- **输出格式：** `references/log_analysis_output_format.md`
- **分析脚本：** `references/scripts/analyze_test_logs.mjs`

---
**版本：** 1.0.0
**最后更新：** 2026-03-13