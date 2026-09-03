---
name: datadog-cli
description: Datadog CLI for searching logs, querying metrics, tracing requests, and managing dashboards. Use this when debugging production issues or working with Datadog observability.
---
# Datadog CLI

一个供 AI 智能体使用 Datadog 日志和指标进行调试与分诊的命令行工具。

## 必读内容

**在使用任何命令之前，你必须先阅读相关的参考文档：**
- [日志命令](references/logs-commands.md)
- [指标](references/metrics.md)
- [查询语法](references/query-syntax.md)
- [工作流](references/workflows.md)
- [仪表盘](references/dashboards.md)

## 设置

### 环境变量（必需）

```bash
export DD_API_KEY="your-api-key"
export DD_APP_KEY="your-app-key"
```

从以下地址获取密钥：https://app.datadoghq.com/organization-settings/api-keys

### 运行 CLI

```bash
npx @leoflores/datadog-cli <command>
```

对于非美国区域的 Datadog 站点，请使用 `--site` 标志：
```bash
npx @leoflores/datadog-cli logs search --query "*" --site datadoghq.eu
```

## 命令概览

| 命令 | 描述 |
|---------|-------------|
| `logs search` | 使用筛选条件搜索日志 |
| `logs tail` | 实时流式传输日志 |
| `logs trace` | 查找分布式链路追踪的日志 |
| `logs context` | 获取某个时间点之前/之后的日志 |
| `logs patterns` | 将相似的日志消息分组 |
| `logs compare` | 比较不同时间段之间的日志数量 |
| `logs multi` | 并行运行多个查询 |
| `logs agg` | 按维度（facet）聚合日志 |
| `metrics query` | 查询时间序列指标 |
| `errors` | 按服务/类型快速汇总错误 |
| `services` | 列出有日志活动的服务 |
| `dashboards` | 管理仪表盘（增删改查） |
| `dashboard-lists` | 管理仪表盘列表 |


## 快速示例

### 搜索错误
```bash
npx @leoflores/datadog-cli logs search --query "status:error" --from 1h --pretty
```

### 实时追踪日志
```bash
npx @leoflores/datadog-cli logs tail --query "service:api status:error" --pretty
```

### 错误摘要
```bash
npx @leoflores/datadog-cli errors --from 1h --pretty
```

### 链路追踪关联
```bash
npx @leoflores/datadog-cli logs trace --id "abc123def456" --pretty
```

### 查询指标
```bash
npx @leoflores/datadog-cli metrics query --query "avg:system.cpu.user{*}" --from 1h --pretty
```

### 比较时间段
```bash
npx @leoflores/datadog-cli logs compare --query "status:error" --period 1h --pretty
```

## 全局标志

| 标志 | 描述 |
|------|-------------|
| `--pretty` | 带颜色的人类可读输出 |
| `--output <file>` | 将结果导出为 JSON 文件 |
| `--site <site>` | Datadog 站点（例如 `datadoghq.eu`） |

## 时间格式

- **相对时间**：`30m`、`1h`、`6h`、`24h`、`7d`
- **ISO 8601**：`2024-01-15T10:30:00Z`

## 事件分诊工作流

```bash
# 1. Quick error overview
npx @leoflores/datadog-cli errors --from 1h --pretty

# 2. Is this new? Compare to previous period
npx @leoflores/datadog-cli logs compare --query "status:error" --period 1h --pretty

# 3. Find error patterns
npx @leoflores/datadog-cli logs patterns --query "status:error" --from 1h --pretty

# 4. Narrow down by service
npx @leoflores/datadog-cli logs search --query "status:error service:api" --from 1h --pretty

# 5. Get context around a timestamp
npx @leoflores/datadog-cli logs context --timestamp "2024-01-15T10:30:00Z" --service api --pretty

# 6. Follow the distributed trace
npx @leoflores/datadog-cli logs trace --id "TRACE_ID" --pretty
```

更多调试工作流请参见 [workflows.md](references/workflows.md)。
