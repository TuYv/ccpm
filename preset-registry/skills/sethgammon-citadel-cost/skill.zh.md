---
name: cost
license: MIT
description: >-
  Deep cost exploration and transparency. Shows real token usage, session costs,
  campaign spend, burn rates, and model breakdown. Reads Claude Code's native
  session data for exact numbers. Complements /dashboard with focused cost views.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - cost
  - costs
  - cost breakdown
  - campaign cost
  - token usage
  - burn rate
  - model breakdown
last-updated: 2026-03-30
---
# /cost -- 会话与活动成本浏览器

## 何时使用

- `/cost` -- 当前会话成本与消耗速率
- `/cost today` -- 今日总支出
- `/cost week` -- 本周支出
- `/cost campaign {slug}` -- 特定活动的总支出
- `/cost all` -- 全部历史成本摘要
- 当 /do 路由 "how much"、"what's the cost"、"spending"、"tokens"、"burn rate" 之类请求时

## 输入

从用户消息中解析的可选参数：
- `today` -- 筛选今天的会话
- `week` -- 筛选最近 7 天
- `campaign {slug}` -- 筛选特定活动
- `all` -- 显示全部历史数据
- 无参数 -- 显示当前会话

## 协议

### 第 1 步：读取真实数据

运行 session-tokens.js 脚本以获取真实的 token 数据：

```bash
node scripts/session-tokens.js              # current/latest session
node scripts/session-tokens.js --today      # today's sessions
node scripts/session-tokens.js --all        # all sessions (use for week/all/campaign)
```

同时读取：
- `.planning/telemetry/cost-tracker-state.json` 用于获取实时消耗速率
- `.planning/telemetry/session-costs.jsonl` 用于活动归因
- `scripts/pricing.json` 用于显示当前使用的定价

如果 `session-tokens.js` 不可用或运行失败，则回退到 session-costs.jsonl 数据，并在输出中明确标注 "(estimated)"。

### 第 2 步：按范围渲染

**当前会话（`/cost` 不带参数）：**

```
=== Session Cost Report ===
Session: {sessionId (first 8 chars)}
Started: {relative time} ({absolute time})
Duration: {minutes} min

Tokens:
  Input:          {N} tokens
  Output:         {N} tokens
  Cache creation: {N} tokens
  Cache read:     {N} tokens
  Total:          {N} tokens

Cost: ${total}
Burn rate: ${rate}/min
Messages: {N} ({N} main + {N} across {N} subagents)

Model breakdown:
  claude-opus-4-6:         {N} messages (${cost}, {pct}% of spend)
  claude-haiku-4-5:        {N} messages (${cost}, {pct}% of spend)

Cache efficiency: {pct}% of input tokens served from cache
  (Higher = more cost-efficient. Cache reads cost 10x less than fresh input.)

Pricing source: scripts/pricing.json (version {version})
```

**今天 / 本周 / 全部（`/cost today`、`/cost week`、`/cost all`）：**

```
=== Cost Report: {Today / This Week / All Time} ===

Summary:
  Sessions: {N}
  Total cost: ${total}
  Subagents spawned: {N}
  Total messages: {N}

Top 5 sessions by cost:
  ${cost}  {duration}min  {agents} agents  {msgs} msgs  {date}
  ${cost}  {duration}min  {agents} agents  {msgs} msgs  {date}
  ...

By campaign (from session-costs.jsonl):
  {slug}: ${cost} across {N} sessions
  _unattached: ${cost} across {N} sessions

Average session: ${avg_cost} | ${avg_rate}/min | {avg_duration} min

For historical charts and billing-window views: npx ccusage
```

**活动（`/cost campaign {slug}`）：**

```
=== Campaign Cost: {slug} ===

Total: ${cost} across {N} sessions ({N} agents, {N} min)
Average session: ${avg}

Sessions:
  {date}: ${cost} ({duration} min, {agents} agents, {msgs} msgs)
  {date}: ${cost} ({duration} min, {agents} agents, {msgs} msgs)
  ...
```

### 第 3 步：补充上下文

在成本数据之后，根据数字情况添加以下某条上下文说明：

- 若消耗速率 > $2/min：“消耗速率偏高。考虑是否可将重度依赖 subagent 的工作
  重构为更小、更聚焦的会话。”
- 若缓存命中率 < 50%：“缓存命中率偏低。包含大量工具结果的长对话往往缓存效率更低。”
- 若没有真实数据：“成本数据为估算值。真实 token 数据需待会话结束、Claude Code 写入会话 JSONL 文件后才可获取。”
- 否则：无需额外上下文。

### 第 4 步：边缘情况

**若 scripts/session-tokens.js 不存在：**
回退到 session-costs.jsonl 数据。显示估算成本并加上 "(est)" 标记。

**若不存在任何会话数据：**
```
No session data found. Cost tracking requires Claude Code session files
at ~/.claude/projects/. These are created automatically by Claude Code.
```

**若 pricing.json 缺失或不可读：**
使用 session-tokens.js 中硬编码的定价。注意提示：“使用内置定价（未找到 pricing.json）。”

**若用户询问 Pro/Max 订阅费用：**
```
Note: Pro/Max subscribers pay a flat monthly fee, not per-token.
The token counts shown here represent your usage volume, not billing.
For rate limit awareness, token throughput matters more than dollar cost.
```

## 边缘情况

- **遥测目录缺失**：`.planning/telemetry/` 不存在 -- 输出：“未找到遥测数据。请先运行任意技能以生成会话数据，然后重新运行 /cost。”
- **遥测 JSON 格式错误**：某个 `session-*.json` 文件解析失败 -- 输出：“遥测文件已损坏。请删除 `.planning/telemetry/session-*.json` 并重新运行生成它的技能。”跳过损坏文件并继续处理其余部分。
- **MCP 成本 API 未返回数据**：Claude Code 未在跟踪此会话 -- 输出：“无法从 MCP 获取会话成本。请检查 Claude Code 是否在启用成本跟踪的情况下运行。仅显示遥测文件数据。”回退到 session-costs.jsonl。
- **所有会话文件均来自其他项目**：文件中的项目路径与当前工作目录不匹配 -- 警告：“找到的会话文件属于另一个项目。你可能处于错误的目录中。”并列出会话文件中发现的项目路径。

## 上下文关卡

**披露**：“正在读取遥测与会话数据。未修改任何文件。”
**可逆性**：绿色 -- 只读；不修改任何文件
**信任关卡**：
- 任意一项：完整成本报告、会话数据、活动归因。

## 质量关卡

- 有真实数据时始终显示真实数据，没有时显示估算数据
- 始终标注数据来源：(real) 还是 (est)
- 绝不声称 Citadel 带来了具体的金额节省 -- 只展示 hook 报告的原始事实
- 对于我方未复刻的功能（图表、账单窗口），建议使用 ccusage
- 成本四舍五入保留 2 位小数，token 数取整到最近的 K/M
- 当前会话视图的总输出必须能在一屏内显示完毕

## 退出协议

/cost 不产生 HANDOFF 块。它是一个只读的成本浏览工具。
显示报告后，等待用户的下一条命令。
