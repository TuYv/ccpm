---
name: ops-investigate-alert
description: "Investigate a monitoring alert end-to-end. Pulls metrics, logs, traces, and recent code changes to identify root cause. Works with any monitoring MCP."
allowed_tools:
  - Read
  - Glob
  - Grep
  - Bash
---
# 调查告警

通过拉取指标、日志、链路追踪和相关服务代码来调查监控告警。症状进，根因假设出。

## 使用时机

- 监控告警已触发，你需要弄清原因
- 值班工程师需要一个结构化的调查起点
- 告警噪音较多，你想判断它是否需要处理还是误报

## 流程

### 1. 验证监控 MCP 可用性

检查哪些监控 MCP 服务器可用。寻找与监控平台（Datadog、Grafana、PagerDuty 等）相关的任何 `mcp__*` 工具。

**推荐：** Datadog MCP——提供最丰富的调查面（监控器、指标、日志、链路追踪、事件集于一个平台）。

如果**没有可用的监控 MCP**，则**停止**并给出：

> **错误：未找到监控 MCP 服务器。**
> 此技能需要监控 MCP 来查询告警数据。
> 建议：将 Datadog MCP 添加到你的 Claude Code MCP 设置中。

同时检查可选工具：
- **GitHub CLI（`gh`）**——用于读取相关服务代码和最近的部署
- **Kubernetes MCP**——用于检查 Pod 状态

记录哪些可用——并据此调整调查。

### 2. 解析输入

**如果输入是监控平台 URL：**
- 从 URL 中提取监控器/告警 ID
- 进入第 3 步

**如果输入是告警名称或描述：**
- 使用可用的监控 MCP 搜索监控器
- 如果有多个匹配项，列出它们并请用户确认是哪一个
- 如果仍未找到，请用户提供更多细节

### 3. 获取监控器详情

获取监控器的配置和当前状态：
- 监控器名称、类型和查询
- 当前状态（OK / Alert / Warn / No Data）
- 上次触发时间
- 受影响的服务和环境
- 告警消息和 runbook 链接（如有）

### 4. 查询指标

获取触发告警的指标：
- **时间窗口：** 从触发前 1 小时到现在（或解决后 1 小时）
- **关注点：** 异常、尖峰、骤降、平直线、阈值越线
- 与监控器阈值对比以理解严重程度

### 5. 分析日志

搜索受影响服务和环境的日志：
- **时间窗口：** 与第 4 步相同
- **关注点：** 错误、堆栈跟踪、超时、连接失败、异常模式
- **按严重程度过滤：** 先聚焦 ERROR 和 WARN 级别，如有需要再扩大范围

### 6. 检查链路追踪（如可用）

搜索分布式链路追踪：
- 按服务名称和时间窗口过滤
- **关注点：** 慢 span、错误 span、异常的延迟分布、失败的下游调用

### 7. 检查基础设施（如可用）

如果 Kubernetes MCP 或云 CLI 可用：
- Pod 状态、重启次数、OOM kill
- 告警时间附近的资源使用情况（CPU、内存）
- 最近的部署事件

如果不可用（VPN、权限等原因），记录下来并基于可用数据继续。

### 8. 检查最近的代码变更（如 `gh` 可用）

```bash
gh auth status
```

如果已认证：

1. 根据服务名称确定代码仓库
2. **检查最近的 release/tag**，了解当前部署了什么：
   ```bash
   gh api repos/<org>/<service>/tags --jq '.[0:3] | .[] | {name: .name, sha: .commit.sha}'
   ```
3. **对比最近两个 tag 之间的差异**，查看最新 release 变更了什么：
   ```bash
   gh api repos/<org>/<service>/compare/<prev-tag>...<latest-tag> --jq '.commits[] | {sha: .sha[:7], message: .commit.message, author: .commit.author.name}'
   ```
4. 根据错误类型查看相关代码：
   - HTTP 错误 → 路由处理器、中间件
   - 数据库错误 → 查询代码、连接池
   - 超时错误 → 外部调用客户端、超时配置
   - OOM → 内存密集型操作、无界集合

**绝不创建、推送或修改 tag。**

### 9. 呈现调查总结

```markdown
## Alert Investigation: <Alert Name>

**Status:** <OK / Alert / Warn / No Data>
**Service:** <service> | **Env:** <env>
**Triggered:** <timestamp> | **Duration:** <duration or "Ongoing">

### Metrics
<key observations — spike at X time, value Y vs threshold Z>

### Logs
<key log lines or patterns — N errors of type X, stack trace summary>

### Traces
<latency or error observations — if available>

### Infrastructure
<pod status, resource usage — if available>

### Recent Code Changes
<commits near trigger time, or "No recent changes" or "gh CLI not available">

### Root Cause Hypothesis
<best assessment based on available data — be explicit about confidence level>

### Recommended Next Steps
1. <most impactful action>
2. <secondary action>
3. <what to check if hypothesis is wrong>
```

如果数据无法得出结论，请明确说明，并建议需要手动检查的内容（例如通过 VPN 访问 k8s、直接查询数据库、与团队确认）。

## 交互风格

- 以数据为先，而非猜测——先展示指标/日志/链路追踪，再形成假设
- 明确表达置信度：“高置信度”、“很可能”、“无法得出结论”
- 如果某一步没有产出数据，直接说明并继续——不要臆测

## 规则

- 绝不跳过第 3-5 步（监控器、指标、日志）——它们是核心调查内容
- 第 6-8 步（链路追踪、基础设施、代码）为可选，视工具可用性而定
- 调查期间绝不创建、推送或修改 tag 或部署
- 即使结论不明确，也始终在最后呈现结构化总结

## 输出

在对话中内联呈现调查总结。除非用户要求保存，否则不进行文件输出。
