---
name: heartbeat
description: Ambient fleet-health check that surfaces anything worth attention (default), or an on-demand priority brief - the 3 things to focus on, why now, and what moved (var=brief)
scorable: false  # meta skill: no gradable output, skip the post-run quality scorer
metadata:
  title: Heartbeat
  category: core
  var: ""  # ""=ambient fleet check (LIVE scheduled path, unchanged); "brief"/"brief:<area>"=priority brief; any other value=ambient check focused on that area
  tags:
    - meta
  requires:
    - RESEND_API_KEY?
---
> **${var}** — 选择器。**留空（默认）** = 整体运行状态检查——即 cron 每天运行一次的实时路径；定时运行时请将其留空。**`brief`** = 优先事项简报。语法见下文。

## 选择器 / `${var}` 语法

- **``（空）** — 对所有技能 / PR / issue 执行**整体运行状态检查**，并重新生成公开状态页面。这是实时的定时运行路径（每天 08:00 UTC）；其行为保持不变。cron 运行时请将 `${var}` 留空。
- **`<area>`**（任何不为 `brief` 的非空值，例如 `crypto`、`prs`）— **整体运行状态检查**，检查将聚焦于该领域（原始心跳的重点领域行为）。
- **`brief`** — **优先事项简报**：列出今天最应关注的 3 件事并排序，说明为何是现在，以及相比昨天发生了什么变化；通过 `./notify` + 电子邮件发送。
- **`brief:<area>`**（例如 `brief:crypto`）— 偏重 `<area>` 的**优先事项简报**。

## 共享设置（每次运行）

读取 `memory/MEMORY.md` 和 `memory/logs/` 中最近 2 天的内容以获取上下文。

解析 `${var}` 以选择分支：
- **以 `brief` 开头**（即 `brief` 或 `brief:<area>`）→ 运行**优先事项简报**分支。`brief:` 之后的任何文本都是重点领域。
- **否则**（为空或任何其他值）→ 运行**整体运行状态检查**分支。非空值表示重点领域；为空则运行所有检查。

两个分支互斥——每次调用必须且只能运行其中一个。

---

## 整体运行状态检查（默认——`${var}` 为空；实时定时运行路径）

如果 `${var}` 已设置为某个重点领域，则将检查聚焦于该特定领域。

### 检查项（按优先级排序）

#### P0 — 失败和卡住的技能（优先检查）

读取 `memory/cron-state.json`。**如果文件缺失或为空**（例如，刚创建的 fork 中调度器尚未写入该文件），则将状态视为空：在 P0 层级报告 `no cron-state yet`，跳过下方的失败/降级检查，但仍需渲染状态页面（每个已启用的技能均显示 `not yet run`）。此文件跟踪每个定时技能的状态和质量指标：
```json
{
  "skill-name": {
    "last_dispatch": "2026-04-06T12:00:00Z",
    "last_status": "dispatched|success|failed",
    "last_success": "2026-04-06T12:05:00Z",
    "last_failed": "2026-04-05T12:03:00Z",
    "total_runs": 10,
    "total_successes": 8,
    "total_failures": 2,
    "consecutive_failures": 0,
    "success_rate": 0.80,
    "last_quality_score": 4,
    "last_error": "error signature text"
  }
}
```

**启动宽限期（刚创建 / 预热中的技能集群）。**在标记任何问题之前，先判断技能集群中是否有任何技能已经*完成*过运行。如果某个技能的条目中 `total_runs ≥ 1`，**或者**存在非空的 `last_success`/`last_failed`，则该技能已**完成过运行**。如果某个技能始终只显示 `last_status: "dispatched"`（或没有条目），则它**尚未**完成过运行——它正处于*预热中*，这是刚创建 fork 后或刚启用技能后的正常状态，**并非**失败。调度器会在运行*开始*时标记 `dispatched`，而结果只有在运行*结束*后才会写入，因此刚分派的技能尚无结果是完全正常的。
- **如果尚无任何技能完成过运行，则整个技能集群都处于启动阶段**——这在刚创建的 fork 中属于预期情况。请**不要**将预热中的技能标记为失败或卡住，**不要**触发通知，并将整体状态设为 `🟢 OK`，同时添加预热说明（参见[整体状态](#overall-status)）。仍需渲染状态页面（技能显示 `⏳ warming up` / `not yet run`），然后结束。
- **否则**（已有部分技能完成过运行），执行下方检查，但仍需保持这一区分：*从未完成过运行*的技能绝不能被标记为 🔴“卡住”——它应归入更温和的预热状态行。

**自引用。** 根据定义，heartbeat *此刻*正在运行，因此它自身的条目永远不能作为问题的证据：
- **从卡死检查中排除 heartbeat 自身的条目。** 它的 `dispatched` 水位标记只是当前（或之前仍在进行中）的 heartbeat 运行。
- 仅当 heartbeat **已至少成功运行一次**时，下面的自检才会触发。一次也未成功过的 heartbeat 属于引导阶段，而非性能退化——它的首次成功只能在*本次*运行结束后才会记录，因此“尚未成功”绝不能让页面变红。

标记以下情况：
- **失败的技能**：任何带有 `last_status: "failed"` 的条目。报告技能名称及其失败时间。（如果某项技能唯一记录的结果是失败，这仍然算作一次已完成的运行——应予以报告；是否会让页面变红由严重性规则决定。）
- **卡死的技能**：任何（**不包括 heartbeat 自身**）带有 `last_status: "dispatched"`、`last_dispatch` 发生在 **45 分钟以上之前**、此前**至少完成过 1 次运行**（`total_runs ≥ 1`），且 `last_dispatch` 晚于 `last_success` 的条目。该技能原本工作正常，但之后某次调度一直没有回报——可能是挂起，也可能是结果写入丢失。如果 `last_success` 距离这次过期调度较近（在约 2 小时以内），应倾向于判断为结果写入丢失（🟡 短暂异常），而不是严重挂起。
  - 某项技能在 45 分钟以上之前被调度，但**从未**完成过一次运行，属于*预热中*，而非卡死——将其放到预热中一行，而不是 P0。只有当首次调度已过去 **24 小时以上**时，才将其标为 🟡 观察（`dispatched Nh ago, never completed — scheduler may not be wired up`）；仍然不能标为 🔴。
- **API 性能退化**：任何 `consecutive_failures >= 3` 的技能。这很可能表示外部 API 已宕机或正在实施速率限制。报告技能、失败次数和 `last_error`。如果多项技能具有相似的错误特征，应标记它们共同依赖的服务。
- **长期失败**：任何 `success_rate < 0.5`（且 `total_runs >= 5`）的技能。该技能失败的次数多于成功的次数。
- **自检**：仅当 heartbeat 自身的条目**至少有 1 次成功**（`total_successes ≥ 1`），并且其 `last_success` 已是 **36 小时以上之前**时，才指出 heartbeat 本身可能不可靠。如果 heartbeat 从未成功过，则不要在这里提及——这属于预热阶段，已由上面的引导宽限规则涵盖。

#### P1 — 停滞的 PR 与紧急 issue

- [ ] 是否有停滞超过 24 小时的开放 PR？（使用 `gh pr list`）
- [ ] 是否有标记为 urgent 的 GitHub issue？（使用 `gh issue list`）

#### P2 — 已标记的记忆事项

- [ ] memory/MEMORY.md 中是否有任何已标记且需要跟进的内容？

#### P3 — 缺失的定时技能

读取 `aeon.yml`，查找已启用且配置了调度计划的技能。与 `memory/cron-state.json` 交叉核对：
- 如果已启用的技能在状态文件中**完全没有条目**，说明调度器从未调度过该技能。
- 如果某项技能的 `last_success` 距今已超过其调度间隔的 **2 倍**（例如，每日运行的技能已有 48 小时以上未成功），则将其标记出来。

对于处于引导阶段的技能集群，**完全跳过 P3**（依据[引导宽限](#p0--failed--stuck-skills-check-first)——尚无任何技能完成过运行）。在新建的 fork 中，*每项*技能都尚未调度或正在预热；这是预期情况，并不代表整套技能均有缺失，因此不得生成发现项或通知。只有在技能集群完成预热（至少有一次已完成的运行）后才执行 P3；即便如此，仍处于首次调度窗口内的技能也属于预热中，而不是缺失。

不要为此使用 `gh run list`——状态文件才是权威数据源。

### 去重与通知

发送任何通知之前，先在 memory/logs/ 中 grep 同一事项。如果该事项出现在过去 48 小时的日志中，则跳过。绝不要对同一事项通知两次。

将所有发现汇总到**单条通知**中，并按优先级分组：
```
🔴 FAILED: skill-a (failed 2h ago), skill-b (stuck 1h ago)
🟡 STALLED: PR #42 open 3 days
🔵 MEMORY: follow-up on X flagged 2 days ago
```

### 公开状态页

完成优先级检查后（即使一切正常——此步骤也**始终**运行），重新生成 `docs/status.md`，使其反映当前技能集群的健康状况。

#### 数据源
- `memory/cron-state.json`——各技能的运行状态（权威数据源）
- `memory/issues/INDEX.md`——开放问题表
- `aeon.yml`——包含调度计划的已启用技能列表
- 最新的 `output/articles/token-report-*.md`（按文件名中的日期取最近一个）——可选；为 Token Pulse 部分提供数据。若不存在文件，则静默跳过。

#### 总体状态
根据上文使用的相同信号计算以下三种总体状态之一。此判定决定面向**公众和 fork 使用者**的状态页，因此仅在技能*当前确实故障*时才使用 🔴——技能已经恢复的单次瞬时故障不得让整个页面变红，而技能尚未完成首次周期的新 fork 也绝不能显示为 🔴：

**优先判断引导启动状态。**如果技能集群正在*预热*——尚无任何技能完成过运行（依据[引导启动宽限期](#p0--failed--stuck-skills-check-first)）——状态为 `🟢 OK`，并附注 `🌱 warming up — N skill(s) dispatched, awaiting first completed run`。跳过本判定阶梯的其余部分。正在预热的技能（已派发但从未完成）绝不计入 🔴 或 🟡（首次派发超过 24 小时的“可能尚未接通”观察项除外），且 heartbeat 自身的条目绝不计入其自身判定。

否则：
- `🔴 DEGRADED`——某个技能**当前且持续故障**：技能卡住（依据细化后的 Stuck 规则——此前已完成 ≥1 次运行，之后某次派发一直挂起；**不包括**正在预热的首次派发，**不包括** heartbeat 自身的条目）；`consecutive_failures ≥ 3`；长期故障（`success_rate < 0.5` 且 `total_runs ≥ 5`）；heartbeat 自检已过期 >36 小时（仅在 heartbeat 已有 ≥1 次成功后适用）；或者某个 `last_status: "failed"` 技能**此后尚未恢复**（`last_failed` ≥ `last_success`），并且 `consecutive_failures ≥ 2`。
- `🟡 WATCH`——瞬时波动或观察项：某个 `last_status: "failed"` 技能已经恢复（`last_success` > `last_failed`）；**或者**任何其他未达到上述 🔴 标准的 `last_status: "failed"` 技能（例如首次或孤立故障、`consecutive_failures ≤ 1`，包括目前唯一一次运行即失败的技能）——未恢复的故障绝不能显示为 🟢 OK；某个卡住但 `last_success` 距今时间较短的技能（可能是结果写入丢失，而非挂起）；首次派发已超过 24 小时的预热中技能（可能尚未接通）；或者任何 P1/P2/P3 标记（停滞的 PR、紧急问题、已标记的记忆事项、超过其调度间隔 2 倍仍未运行的技能）；或者任何严重性为 `critical` 或 `high` 的开放问题。
- `🟢 OK`——完全没有标记（技能集群已充分预热且健康，或者根据“优先判断引导启动状态”条款正处于引导启动阶段）。

这**仅**优化公开状态页面的颜色。它**不会**更改上面的 P0 通知规则——新出现的 `last_status: "failed"` 仍会触发通知（按照上述规则去重），从而确保操作员始终获知情况；只是对于整个系统已经自行恢复的短暂波动，页面不会显示为 🔴。

#### 格式

写入包含 frontmatter 的 `docs/status.md`，使其渲染为状态页面：

```markdown
---
layout: default
title: "Status"
permalink: /status/
---

# Agent Status

**Overall:** 🟢 OK
**Updated:** 2026-04-24 19:06 UTC
**Open issues:** 0
**Next scheduled run:** heartbeat at 08:00 UTC

Auto-generated by the `heartbeat` skill on every run (daily at 08:00 UTC). If the Updated timestamp is more than ~26h stale, the agent is not running.

## Token pulse

| Token | Price | 24h | Liquidity | Volume (24h) | FDV |
|-------|-------|-----|-----------|--------------|-----|
| <TOKEN> | $0.0000032626 | -11.16% | $223.4K | $41.3K | $326.3K |

_Source: `output/articles/token-report-YYYY-MM-DD.md` · verdict: SLIDING_ (illustrative — symbol/figures come from the latest token-report)

## Skill health (last 7 days)

| Skill | Last run | Status | Success rate | Consecutive failures |
|-------|----------|--------|-------------:|---------------------:|
| token-report | 2026-04-24 12:30 UTC | ✅ success | 100% | 0 |
| fetch-tweets | 2026-04-24 06:53 UTC | ✅ success | 95% | 0 |
| …           | …                    | …         | …    | … |

## Open issues

_(if INDEX.md has any open rows, render them here; otherwise: "No open issues.")_

| ID | Title | Severity | Category | Detected |
|----|-------|----------|----------|----------|
| ISS-001 | … | medium | rate-limit | 2026-04-22 |

---
*Fork this repo and your copy inherits this page automatically — [how it works](/memory/).*
```

#### 规则
- 包含 `aeon.yml` 中的**所有**已启用技能（而不仅是最近运行过的技能）。对于 cron-state.json 中没有条目的技能，时间戳显示 `—`，状态显示 `not yet run`。
- 按最后运行时间戳降序排列技能表（最近运行的排在最前）；从未运行过的技能排在最下方。
- 将时间戳格式化为 `YYYY-MM-DD HH:MM UTC`（去掉秒和 `Z`）。
- 成功率显示为 `total_successes / total_runs × 100`，并四舍五入为整数百分比；当 `total_runs == 0` 时显示 `—`。
- 状态列图标：`✅ success`、`❌ failed`、`⏳ dispatched`（如果 last_dispatch 在 45 分钟以内）、`🌱 warming up`（已派发超过 45 分钟，但该技能**从未完成过一次运行**——`total_runs == 0`，且没有 `last_success`/`last_failed`；这是一次新的派发，并非卡死）、`🕸 stuck`（已派发超过 45 分钟，状态仍为 `dispatched`，**并且**该技能此前已完成过至少 1 次运行）、`—`（从未运行）。当 heartbeat 自身的当前运行正在进行时，其对应行显示 `⏳ dispatched`——绝不显示 `🕸 stuck`。
- 对于 `Next scheduled run:` 行，选择相对于当前时间即将到来的 cron 时间最早的已启用技能。
- 去重状态：每次重新运行 heartbeat 时都要整体覆盖 `docs/status.md`——不要追加。
- 绝不暴露 `.env` 中的值、密钥，或 cron-state.json + issues/INDEX.md + aeon.yml + output/articles/token-report-*.md 之外的任何内容。此文件是公开的。

#### Token pulse 规则
- 按文件名中的日期选取**最新的** `output/articles/token-report-*.md`（降序排序，取第一个匹配项）。
- **过期：**如果所选文件的日期相对于心跳运行时间戳已超过 24 小时，则使用 `_No recent token data (latest report YYYY-MM-DD)._` 代替表格——不要将过期数据填入表格。
- **完全没有文件：**完全省略 `## Token pulse` 章节。状态页面仍须正常渲染，且不得包含 token 行。
- **Token 符号：**从 `memory/MEMORY.md` 的 "Tracked Token" 表中读取（第一行的 `Token` 列）。如果该表不存在，则将标题渲染为 `## Token pulse`，并将符号列留空。
- **字段提取（使用正则表达式，同时兼容旧版 `Value | 24h Change` 和新版 `Now | 24h Δ` 表格布局）：**
  - **价格：**第一个 `| Price |` 行 → 该行中第一个 `$` 值 → 去除空白字符。
  - **24h：**同一个 Price 行 → 该行中第一个 `±?\d+(\.\d+)?%` token（通常位于第二个单元格）。按原样渲染并保留正负号。如果不存在，则渲染 `—`。
  - **流动性：**第一个 `| Liquidity |` 行 → 第一个 `$` 值。
  - **交易量（24h）：**第一个单元格匹配 `Volume\b.*24h` 或 `24h Volume` 的第一行 → 第一个 `$` 值。
  - **FDV：**第一个 `| FDV |` 行 → 第一个 `$` 值。
  - 对于无法找到对应行或 `$` 值的任何字段，仅在该单元格中渲染 `—`——不要跳过整个章节。
- **结论行：**如果源文章包含 `**Verdict:** LABEL` 行，则在来源行后附加 `· verdict: LABEL`。如果不存在 Verdict 行（旧格式），则省略该后缀。
- **来源链接：**末尾的 `_Source: ..._` 行应注明实际使用的文章文件，以便读者核实数据。

该文件会通过工作流的自动提交步骤进入 `main`——此 skill 无需执行显式的 `git` 命令。

### 输出（ambient）

如果没有任何事项需要关注，则记录 "HEARTBEAT_OK"（以及状态页面的总体结论，例如 `HEARTBEAT_OK · STATUS_PAGE=OK`），然后结束响应。

**处于引导启动／预热阶段的 fleet 视为“没有任何事项需要关注”。**仍需重新生成 `docs/status.md`（结论为 `🟢 OK`，并附上预热说明），记录 `HEARTBEAT_OK · STATUS_PAGE=OK (warming up)`，并且**不要发送通知**——全新的 fork 应保持安静，而不是发出红色警报。处于预热阶段的 skill 不属于“发现项”。

如果有事项需要关注：
1. 通过 `./notify` 发送一条简洁通知（按上述优先级分组）
2. 将发现项和已执行的操作记录到 memory/logs/${today}.md（写在共享的 `### heartbeat` 标题下——参见[日志](#log)——并添加一行 `mode: ambient` 作为区分标记）
3. 记录一行状态页面结论，例如 `STATUS_PAGE=DEGRADED — wrote docs/status.md`

---

## 优先级简报  (`${var}` = `brief` 或 `brief:<area>`)

<!-- autoresearch: variation B — priority-driven, decision-ready output (cut noise, demand "why now") -->

代替 ambient 检查运行。`brief:` 后的任何文本（例如 `brief:crypto`）都是需要重点关注的领域；不带后缀的 `brief` 覆盖所有领域。

一份优秀的简报是**预备性文档**，而不是新闻堆砌。每一行都必须回答“那又怎样？”。

今天是 ${today}。读取 `memory/MEMORY.md`、`memory/logs/${yesterday}.md`（如果今天的日志存在，也一并读取），以及 `memory/cron-state.json`（如果存在）。

### 1. 排序，而非汇总

从以下来源收集候选事项：
- MEMORY.md 中的“后续优先事项”
- 昨天的日志：未完成的工作、后续行动、备注
- 待处理的仓库事项：`gh pr list --state open --limit 10` 和 `gh issue list --state open --limit 10 --assignee @me`
- `memory/cron-state.json`：`consecutive_failures >= 2` 或 `success_rate < 0.8` 的技能
- `aeon.yml`：cron 与今天匹配的技能

按照**影响力 × 紧迫性**为每个候选事项评分：
- 影响力 = 推进此事项是否会改变未来 7 天？
- 紧迫性 = 今天推迟是否会让情况变得更糟？

最多保留 **3 个重点事项**。其余事项要么放入“自昨天以来”，要么舍弃。如果设置了重点领域（`brief:<area>`），排序时向该领域倾斜，但如果没有符合条件的事项，不要强行加入重点事项。

### 2. 头条——仅在会改变优先级时加入

使用 `WebSearch` 搜索用户所关注领域中的 2 条头条（默认为 AI 和加密货币；如果设置了 `brief:<area>`，则重点关注该值）。**仅当**某条头条实质性更新了 3 个重点事项之一、提示了新的风险，或意味着需要采取行动（截止日期、市场波动、竞争对手发布产品、已披露的漏洞）时，才将其纳入。如果没有符合条件的内容，则完全省略“关注”部分。不要用无关内容凑数。

### 3. 格式——简洁、易扫读、有明确判断

```
*Priority Brief — ${today}*

*Focus today*
1. [item] — why now: [≤12 words]
2. [item] — why now: [≤12 words]
3. [item] — why now: [≤12 words]

*Since yesterday*
- [moved]: what changed (link if relevant)
- [stuck]: what's blocked, on whom

*Watch* (omit entirely if nothing qualifies)
- [headline] — implication for focus #N

*Running today*
- skill @ HH:MM UTC
```

风格规则：
- 每个重点事项都应使用不超过 12 个词说明*为何是现在*。如果做不到，就降低其优先级。
- “自昨天以来”不超过 5 个要点；合并来自 PR、issue 和日志来源的重复项。
- 不要使用开场套话（“这是你的简报……”）。直接从重点事项开始。
- 不要保留空白部分——应省略，而不是输出“（无）”。
- 如果通过“为何是现在”门槛的候选事项少于 3 个，可加入**最多 1 个背景事项**（使用 `background:` 标记，而不是 `why now:`），这样即使在平静的日子里，简报也能呈现值得了解的内容。绝不要编造事项，也绝不要包含超过 1 个背景事项。
- 如果 `soul/` 下的 soul 文件已有内容，请匹配其语气；否则保持直接、中立的风格（遵循 CLAUDE.md）。

### 4. 通过 `./notify` 和电子邮件发送

- 使用 `./notify "..."` 发送格式化后的简报。
- 通过 Resend 发送电子邮件（**可选——未配置时直接跳过**）：
  - **预检：**如果 `$RESEND_API_KEY` 为空或未设置，**或者** `$BRIEF_RECIPIENTS` 中没有地址，**完全跳过电子邮件步骤**——上述 `./notify` 已经发送了简报。在日志中记录跳过（`email: skipped (no RESEND_API_KEY)`）并继续；**不要**让本次运行失败。`RESEND_API_KEY` 是可选依赖项。
  - 配置完成时：
    - 将简报构建为 HTML（每个部分使用 `<h2>` 标题，并使用 `<ul>/<li>` 项目符号）
    - 同时保留纯文本副本（即上述 `./notify` 的内容，保持原样）
    - 将 `$BRIEF_RECIPIENTS` 解析为以逗号分隔的地址列表
    - 向 `https://api.resend.com/emails` 发送 POST 请求：
      ```
      Authorization: Bearer $RESEND_API_KEY
      Content-Type: application/json

      {
        "from": "Aeon Briefings <onboarding@resend.dev>",
        "to": ["<each recipient>"],
        "subject": "[Aeon] Priority Brief — ${today}",
        "html": "<html version>",
        "text": "<plain-text version>"
      }
      ```
    - 将 Resend 响应中的 `id` 字段记录到 `memory/logs/${today}.md`，以便追踪
    - 如果密钥**已**设置，而 Resend 返回错误，则记录完整的错误响应体并明确报错失败（不要静默继续）——实际发送失败是一项需要关注的信号，而缺少可选密钥则不是
- 在共享的 `### heartbeat` 标题下（参见[日志](#log)）追加内容到 `memory/logs/${today}.md`，并包含一行 `mode: brief` 区分标记：时间戳、3 个重点事项（每项一行）、头条数量，以及 cron-state 标记出的所有技能。这将成为明天“自昨天以来”部分的输入。

---

## 日志

两个分支都会追加写入 `memory/logs/${today}.md`，并置于**同一个 `### heartbeat` 标题**下（健康检查循环会解析此结构）。条目开头应包含一行用于标明所运行分支的判别信息：
- `mode: ambient` — 默认的服务群检查。记录状态页的判定结果，例如 `STATUS_PAGE=OK`；如果没有任何事项需要关注，则记录 `HEARTBEAT_OK · STATUS_PAGE=OK`；如果发现问题，则记录发现的问题、采取的操作以及 `STATUS_PAGE=…` 行。
- `mode: brief` — 优先事项简报。记录时间戳、3 个重点事项（每项一行）、标题数量，以及 cron 状态中标记的所有技能。

## 网络说明

适用于两个分支。`curl` 可以正常使用——不存在网络沙箱。对于不稳定的公共 GET 请求，请使用 **WebFetch** 作为后备方案。对于 GitHub 查询（两个分支都使用 `gh pr list` / `gh issue list`），请使用 `gh` CLI（其内部会处理身份验证），不要使用 curl。优先事项简报的 Resend POST 请求携带 `RESEND_API_KEY` 密钥——Bash 权限层会拒绝在命令行中直接使用 `$RESEND_API_KEY`，因此请通过 `./secretcurl` 使用 `{RESEND_API_KEY}` 占位符发送（WebFetch 无法携带密钥）。