---
name: comprehensive-analysis
description: Deep-dive 7-day analysis across all data sources for weekly reviews, board prep, and strategic planning
roles: [product-manager, engineering-lead, founder]
integrations: [github, linear, slack, posthog]
---
# COG 综合分析技能

## 何时调用
- 用户希望进行每周复盘或准备回顾会议
- 用户提到“每周分析”“综合复盘”“董事会准备”“深入分析”
- 用户需要分析较长时间段（7 天以上）的情况
- 用户希望全面了解团队/产品的健康状况

## Agent 模式识别

**检查 `00-inbox/MY-PROFILE.md` frontmatter 中的 `agent_mode`：**
- 如果是 `agent_mode: team` — 使用下文完整的并行 Agent 执行策略（5 个 Agent）。此技能可从团队模式中获得显著收益。
- 如果是 `agent_mode: solo` — 运行精简版本：依次收集 GitHub 和 Linear 数据，跳过 PostHog 深度分析，并生成一份综合报告，而不是 3 份文档。

## 目的
针对所有数据源生成深入分析，用于每周复盘、董事会准备、战略规划，或任何需要掌握全貌的场景。与团队简报（针对速度和每日相关性进行优化）不同，此技能会有意拉取更多数据，并投入更多时间进行综合分析。

**适用于以下场景：**
- 每周团队复盘/回顾会议准备
- 董事会会议或管理层进展汇报准备
- 战略规划会议
- 跨所有数据源调查特定问题
- 月度/季度健康检查

**不要每天使用此技能** — 它需要 8-12 分钟，并会拉取大量数据。日常情报请使用 `/daily-brief`。

## 命令：`/comprehensive-analysis`

## 表达风格与语气

与每日简报相同 — 直接、有主见，像队友一样交流。但内容更有深度，也更细致周全。你的写作对象是一位需要做决策的产品负责人，而不仅仅是希望了解最新情况的人。

---

## 执行策略

### 阶段 1：深度数据收集（约 3-5 分钟）

**使用 Task 工具并设置 `run_in_background: true`，并行启动所有 Agent。**

#### Agent 1：“github-deep-analyst”（subagent_type: general-purpose）
```
Deep GitHub analysis for [CUSTOMIZE: your-org/your-repo].
Analysis period: last 7 days (from [7_DAYS_AGO] to [TODAY]).

Collect:
1. ALL PRs merged in the last 7 days:
   gh pr list --repo [CUSTOMIZE: your-org/your-repo] --state merged --search "merged:>=[7_DAYS_AGO]" --json number,title,author,mergedAt,labels,additions,deletions --limit 100

2. ALL open PRs with full detail:
   gh pr list --repo [CUSTOMIZE: your-org/your-repo] --state open --json number,title,author,createdAt,reviewDecision,labels,updatedAt,additions,deletions --limit 100

3. Contributor activity breakdown:
   For each contributor, count: PRs merged, PRs opened, commits, review comments given.
   gh api repos/[CUSTOMIZE: your-org/your-repo]/stats/contributors

4. Code frequency (additions/deletions per week):
   gh api repos/[CUSTOMIZE: your-org/your-repo]/stats/code_frequency

5. Commit activity by day:
   gh api repos/[CUSTOMIZE: your-org/your-repo]/stats/commit_activity

6. ALL PR review comments from the last 7 days:
   gh api repos/[CUSTOMIZE: your-org/your-repo]/pulls/comments --paginate --jq '[.[] | select(.created_at >= "[7_DAYS_AGO]")]'

DEEP ANALYSIS:
A) **Contributor Velocity Matrix**: For each contributor — PRs merged, lines changed, review comments given/received. Who's shipping? Who's reviewing? Who's doing both?
B) **Code Churn**: Are we rewriting the same files repeatedly? Flag files with >3 PRs touching them in one week.
C) **PR Lifecycle**: Average time from PR open → first review → merge. Where's the bottleneck?
D) **Review Quality**: Are reviews substantive (comments with suggestions) or rubber stamps (approved with no comments)?
E) **Week-over-Week Trends**: Compare this week's velocity to last week. Accelerating or decelerating?
F) **Technical Debt Signals**: Large PRs with no tests, PRs that touch >10 files, dependency-only PRs.

Return structured data AND insights.
```

#### 代理 2：“slack-deep-monitor”（subagent_type: general-purpose）
*仅当 Slack MCP 可用时才启动*
```
Deep Slack analysis for last 7 days across key channels.
Analysis period: [7_DAYS_AGO] to [TODAY].

Instructions:
1. Use ToolSearch to load Slack tools
2. Read messages from [CUSTOMIZE: your-team-channel] for the full 7-day window
3. If you have access, also check: [CUSTOMIZE: additional-channels] (e.g., #general, #engineering, #product)

For EACH significant thread (>3 replies or involving decisions):
- Full topic summary
- Key participants
- Decision reached (or explicitly: "no decision reached")
- Action items with owners
- Sentiment (positive/negative/neutral/heated)
- Links to external resources shared

DEEP ANALYSIS:
A) **Communication Patterns**: Who's driving discussions? Who's mostly silent? Any asymmetry?
B) **Decision Velocity**: How many decisions were made vs. how many discussions ended without resolution?
C) **Topic Clustering**: Group discussions by theme (product, engineering, bugs, strategy, etc.)
D) **Unresolved Threads**: List all discussions that need follow-up — no decision, open question, blocked waiting for someone
E) **Sentiment Map**: Overall team mood. Are discussions constructive or frustrated?
F) **External Intel**: All links shared (articles, competitor news, tools) — categorize by relevance

Return structured data AND insights.
```

#### 代理 3：“linear-deep-tracker”（subagent_type: general-purpose）
*仅当 Linear MCP 可用时才启动*
```
Deep Linear analysis for last 7 days.
Analysis period: [7_DAYS_AGO] to [TODAY].

Instructions:
1. Use ToolSearch to load ALL Linear tools
2. Collect comprehensive data:

   a) All issues updated in last 7 days (mcp__claude_ai_Linear__list_issues)
   b) All issues created in last 7 days
   c) All issues completed in last 7 days
   d) All blocked issues (any date)
   e) Full initiative list with projects (mcp__claude_ai_Linear__list_initiatives)
   f) Detailed status for each initiative (mcp__claude_ai_Linear__get_initiative)
   g) All active cycles (mcp__claude_ai_Linear__list_cycles)
   h) All milestones for active projects (mcp__claude_ai_Linear__list_milestones)
   i) All projects with progress (mcp__claude_ai_Linear__list_projects)
   j) Recent status updates (mcp__claude_ai_Linear__get_status_updates) for each initiative

DEEP ANALYSIS:
A) **Initiative Trajectory**: For each initiative, model whether current velocity will hit the target date. Use issues_completed_per_week vs. issues_remaining / weeks_remaining.
B) **Cycle History**: Compare current cycle progress to previous cycles. Are we improving?
C) **Scope Creep Quantified**: How many issues were added mid-cycle vs. planned at start?
D) **Priority Drift**: Issues that changed priority during the week. Why?
E) **Assignee Load Balance**: Distribution of issues across team members. Overloaded? Underutilized?
F) **Stale In-Progress**: Issues marked "In Progress" for >5 days with no status change.
G) **Dependency Map**: Issues that block other issues. What's the critical path?
H) **Label/Project Distribution**: Where is effort being spent? Does it align with initiative priorities?

Return structured data AND insights.
```

#### 智能体 4："posthog-deep-analyst"（subagent_type: general-purpose）
*仅当 PostHog MCP 可用时才启动*

> **警告：PostHog 可能返回非常大的数据载荷。** 此智能体有意执行高负载分析——这正是此技能比每日简报耗时更长的原因。请谨慎限定查询范围。

```
Deep PostHog analysis for last 7 days.
Project ID: [CUSTOMIZE: your-posthog-project-id].
Analysis period: [7_DAYS_AGO] to [TODAY].

Instructions:
1. Use ToolSearch to load PostHog tools (search "+posthog")
2. Run these analyses:

   === CORE METRICS (7-day window) ===

   a) Daily visitors, sign-ups, and core events — broken out by day:
      Use mcp__posthog__query-run with HogQL:
      SELECT toDate(timestamp) as day, count(DISTINCT person_id) as unique_users, count() as events
      FROM events WHERE event = '$pageview' AND timestamp >= '[7_DAYS_AGO]'
      GROUP BY day ORDER BY day

   b) Same for sign-ups and core value events (separate queries)

   c) Week-over-week comparison:
      Compare [7_DAYS_AGO to TODAY] vs [14_DAYS_AGO to 7_DAYS_AGO]

   === FUNNEL ANALYSIS ===

   d) Key funnel (sign-up → first core action → repeat):
      Use mcp__posthog__insight-query or HogQL to build a funnel:
      - Step 1: user_signed_up
      - Step 2: [CUSTOMIZE: your_core_event] (first time)
      - Step 3: [CUSTOMIZE: your_core_event] (second time, >24h later)
      Compare this week's funnel to last week's.

   === FEATURE ADOPTION ===

   e) Feature usage matrix:
      SELECT event, count() as uses, count(DISTINCT person_id) as unique_users
      FROM events WHERE timestamp >= '[7_DAYS_AGO]' AND event NOT LIKE '$%'
      GROUP BY event ORDER BY unique_users DESC LIMIT 25

   f) New vs returning user behavior:
      Compare event types for users whose first_seen is within last 7 days vs. older users.

   === ERROR ANALYSIS ===

   g) Error trends:
      Use mcp__posthog__list-errors for the period. Group by error type.

   h) Error-to-deploy correlation:
      For each error spike, check the timestamp against known deploy times (from GitHub merged PR data).

DEEP ANALYSIS:
A) **Growth Trajectory**: At current rate, where will key metrics be in 30/60/90 days?
B) **Funnel Health**: Where do users drop off? Has it improved or degraded vs last week?
C) **Feature Value Matrix**: Which features correlate with retention? (users who use feature X come back more)
D) **New User Experience**: First-session behavior patterns. What do new users do? Where do they get stuck?
E) **Error Impact**: Which errors affect the most users? Which are increasing fastest?
F) **Engagement Segments**: Power users vs casual vs churned. How big is each segment?

Return structured data AND insights with trends.
```

#### 智能体 5："meeting-deep-reviewer"（subagent_type: general-purpose）
```
Review ALL meeting notes from the last 7 days.
Analysis period: [7_DAYS_AGO] to [TODAY].

Instructions:
1. Glob for ALL meeting files in [CUSTOMIZE: path/to/meetings/] from the last 7 days
2. Also check [CUSTOMIZE: path/to/checkins/] for daily checkins
3. Read all found files

For EACH meeting, extract the same items as the daily brief agent.

DEEP ANALYSIS:
A) **Action Item Completion Rate**: Of all action items assigned in meetings this week, how many have corresponding GitHub/Linear activity?
B) **Decision Log**: Comprehensive list of every decision made this week, with context and who made it.
C) **Priority Shifts**: Did priorities change during the week? Track what was said Monday vs. Friday.
D) **Commitment Tracking**: Did people do what they said they'd do? (Cross-reference with GitHub/Linear data)
E) **Meeting Effectiveness**: Are meetings producing decisions and action items, or just discussion?

Return structured data AND insights.
```

### 阶段 2：深度综合分析（约 2-3 分钟）

所有代理完成任务后，编排器会执行深入的交叉参照分析：

1. **每日简报中的全部 23 种交叉参照模式**（参见 daily-brief.md）

2. **其他综合分析模式：**
   - **周环比速度趋势**：团队是在加速还是减速？为什么？
   - **计划轨迹建模**：按照当前进度，每项计划能否达成目标？需要做出哪些改变？
   - **团队产能评估**：根据本周的实际产出，下周切实可行的目标是什么？
   - **风险登记册**：将所有来源中的全部风险汇总到统一的风险登记册中，并包含严重程度/可能性/负责人
   - **战略一致性检查**：团队正在构建的内容是否与领导层在会议中讨论的方向一致？
   - **产品市场信号综合分析**：将 PostHog 数据 + Slack 用户反馈 + 会议中的客户讨论整合成连贯的产品信号

3. **生成三份输出文档：**

#### 输出 1：执行摘要（面向领导层）
- 最多 1 页
- 关键指标及趋势
- 计划健康状况仪表板
- 三大风险
- 三大成果
- 对下周重点工作的建议

#### 输出 2：团队报告（面向工程团队）
- 本周交付的内容（值得庆祝！）
- 速度和贡献者统计数据
- 评审健康状况（瓶颈、敷衍批准）
- 长期无进展的 PR 和受阻问题
- 技术债信号
- 从会议中提取的下周优先事项

#### 输出 3：产品报告（面向利益相关者）
- 用户指标及趋势
- 漏斗分析
- 功能采用情况
- 客户反馈综合分析（来自 Slack）
- 增长轨迹
- 产品风险与机会

4. **保存**全部三份文档至 `[CUSTOMIZE: path/to/briefs/]`：
   - `comprehensive-analysis-YYYY-MM-DD.md`（完整报告）
   - `executive-summary-YYYY-MM-DD.md`（领导层版本）
   - `product-report-YYYY-MM-DD.md`（利益相关者版本）

### 阶段 3：输出与分发（约 1-2 分钟）

1. 向用户展示执行摘要
2. 提议发布到 HackMD（模式与每日简报的阶段 3.7 相同）
3. 提议将重点内容发布到 Slack（模式与每日简报的阶段 4 相同）

---

## 元数据模板

```yaml
---
type: comprehensive-analysis
domain: shared
date: YYYY-MM-DD
analysis_period:
  start: YYYY-MM-DD
  end: YYYY-MM-DD
  days: 7
created: YYYY-MM-DD HH:MM
tags:
  - comprehensive-analysis
  - weekly-review
  - team-intelligence
data_sources:
  github: true
  slack: true/false
  linear: true/false
  posthog: true/false
  meetings: true/false
  braindumps: true/false
metrics:
  prs_merged: X
  prs_opened: X
  commits: X
  active_contributors: X
  issues_completed: X
  issues_created: X
  visitors: X
  visitors_wow_change_pct: X
  signups: X
  core_events: X
  new_errors: X
initiatives:
  - name: "[CUSTOMIZE: Initiative 1]"
    health: on_track / at_risk / off_track
    progress_pct: X
    trajectory: will_hit / at_risk / will_miss
    days_remaining: X
team_velocity:
  this_week: X  # PRs merged
  last_week: X
  trend: accelerating / stable / decelerating
risks:
  - severity: high/medium/low
    description: ""
    owner: ""
    source: ""
---
```

## 回退行为

与每日简报相同——每个数据源都是可选的。分析能力会平稳降级。

最低限度的实用配置是**仅使用 GitHub**——你仍然可以获得开发速度分析、PR 生命周期指标、贡献者统计和代码变动检测。

## 错误处理

与每日简报采用相同的安全规则，但有一项补充：

- **上下文溢出保护**：如果任何代理返回的数据似乎过大（估算超过 50k 个 token），则记录警告，并要求该代理进行更大幅度的摘要。此情况最有可能发生在 PostHog（大型仪表板数据转储）或 Jira（宽泛的 JQL 查询）中。