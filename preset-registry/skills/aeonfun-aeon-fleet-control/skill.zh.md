---
name: fleet-control
description: Operate managed Aeon instances from memory/instances.json - health-check, dispatch, and status snapshots (control), plus a fleet scorecard of runs, tokens, cost, and reliability (scorecard).
metadata:
  title: Fleet Control
  category: core
  var: ""
  tags:
    - dev
    - meta
    - fleet
    - report
    - cost
  requires:
    - GH_READ_PAT?
  cron: "0 9,15 * * *"
---
<!-- autoresearch: 变体 B — 更鲜明的输出：结论行 + 与上次相比的变化 + 单实例操作列 + 仅在状态变化时通知 -->

> **${var}** — 命令/视图选择器。为空（或无法识别）→ **健康检查**（默认控制视图）。`status` → 完整的**状态模式**（控制视图）。`dispatch <instance|*> <skill> [var=<value>]` → **调度模式**：在一个子实例或所有健康/降级的子实例上触发 Skill（控制视图）。`scorecard` → **评分卡模式**：包含全实例群运行次数、令牌数、成本和可靠性评分卡，以及逐日变化和告警（评分卡视图）。

今天是 ${today}。管理在 `memory/instances.json` 中注册的 Aeon 实例群。**控制视图**（健康检查/状态/调度）**可直接用于决策**：每次运行都先给出结论，然后列出与上次检查相比的变化，接着逐个实例给出后续具体操作。**评分卡视图**发布每日全实例群成本和可靠性评分卡。

实例群**在运行时发现，绝不硬编码**：它由此仓库（“自身”）以及 `memory/instances.json` 中每个未归档的条目组成（该注册表由 `fleet-control` 和 `spawn-instance` 维护）。没有托管实例时，评分卡只涵盖自身这一个仓库——仍然有用。

## 共享前置步骤（每次运行）

1. **读取记忆** — 读取 `memory/MEMORY.md` 以获取高层上下文，并扫描 `memory/logs/` 中最近约 3 天的内容以了解近期活动；不要重复报告已记录在其中的信号。

2. **语气** — 如果 `soul/SOUL.md` 和 `soul/STYLE.md` 存在且已填充内容，请读取它们，并在每条通知中匹配操作者的表达风格。如果它们是空模板或不存在，则使用清晰、直接、中性的语气——简短、小写、不说废话。

3. **解析 `${var}` → 模式**：
   - 为空/无法识别 → **健康检查模式**（控制视图；默认）
   - 恰好为 `status` → **状态模式**（控制视图）
   - 以 `dispatch ` 开头 → **调度模式**（控制视图）
   - 恰好为 `scorecard` → **评分卡模式**（评分卡视图）

4. **路由**：
   - **健康检查/状态/调度** → 运行下方的**控制视图预检**，然后运行对应的模式部分。这些模式会实时调用 `gh`。
   - **评分卡** → 完全跳过控制视图预检，直接转到**评分卡模式**；该模式会在运行期间通过 `node scripts/fleet-scorecard.mjs` 自行收集数据。

---

## 控制视图预检（仅限健康检查/状态/调度）

1. **验证 gh 身份认证** — `gh auth status` 必须成功。如果失败，将 `FLEET_NO_AUTH` 记录到 `memory/logs/${today}.md`，并通知 `Fleet Control: gh auth missing — check GITHUB_TOKEN secret.`。停止。

2. **检查速率限制** — `REMAINING=$(gh api rate_limit --jq '.resources.core.remaining')`。如果 `REMAINING < 50`，记录 `FLEET_RATE_LIMITED:remaining=${REMAINING}` 并发送一行警告，然后停止。

3. **加载注册表** — 读取 `memory/instances.json`。如果文件不存在，则写入 `{"instances": []}` 以完成初始化。如果 `.instances` 不存在或为 `[]`：
   - 将 `FLEET_EMPTY: no managed instances` 记录到 `memory/logs/${today}.md`。
   - **停止。不要发送通知。**

4. **加载先前状态** — 读取 `memory/state/fleet-control-state.json`（如果不存在，则创建目录和文件，文件内容为 `{"instances": {}, "last_full_summary_date": ""}`）。结构如下：
   ```json
   {
     "instances": {
       "<name>": { "health": "<status>", "last_checked": "<ISO>", "consecutive_unreachable": 0 }
     },
     "last_full_summary_date": "YYYY-MM-DD"
   }
   ```

---

## 健康检查模式（默认 — 控制视图）

对于每个已注册实例，在逐实例处理时跳过带有 `archived: true` 的行（单独统计它们）。使用 `&` + `wait` 并行执行每个实例的三个调用，并将各自的结果写入 `/tmp/fleet/${SAFE}.{repo,runs,cron}.json`：

a. **仓库元数据**：
   ```bash
   gh api "repos/${REPO}" \
     --jq '{full_name, pushed_at, archived, default_branch, open_issues_count}' \
     > "/tmp/fleet/${SAFE}.repo.json" 2>"/tmp/fleet/${SAFE}.repo.err" &
   ```

b. **过去 24 小时内的工作流运行记录**（精确时间窗口，而非“最近 5 次”）：
   ```bash
   SINCE=$(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%SZ)
   gh api "repos/${REPO}/actions/runs?created=>${SINCE}&per_page=100&exclude_pull_requests=true" \
     --jq '{total_count, runs:[.workflow_runs[]|{name,status,conclusion,created_at,html_url}]}' \
     > "/tmp/fleet/${SAFE}.runs.json" 2>"/tmp/fleet/${SAFE}.runs.err" &
   ```

c. **来自子实例的 Cron 状态**：
   ```bash
   gh api "repos/${REPO}/contents/memory/cron-state.json" --jq '.content' 2>"/tmp/fleet/${SAFE}.cron.err" \
     | base64 -d > "/tmp/fleet/${SAFE}.cron.json" &
   ```

为一个实例启动全部三个调用后执行 `wait`（如果你确信自己的并行处理没有问题，也可以跨所有实例进行批处理 — 将并发调用数保持在 ≤16，以免超出速率限制）。

使用精确阈值对**每个实例进行分类**：
- **unreachable** — 仓库元数据调用返回非零状态（404/403 等）
- **archived** — 仓库元数据返回 `archived: true`
- **pending_secrets** — 在 24 小时时间窗口内 `runs.total_count == 0`，并且仓库的 `pushed_at` 距今 ≥ 7 天（创建不足 7 天的新实例保持未分类，但仍进行跟踪）
- **stale** — `runs.total_count == 0`，并且 `pushed_at` 距今 > 7 天，且不为 `archived`
- **degraded** — ≥1 个 Cron 状态技能的 `consecutive_failures ≥ 3`，或者（24 小时内的 failure_count / total_count）≥ 0.5 且 total_count ≥ 2
- **warning** — 24 小时内 failure_count ≥ 1，但比率 < 0.5
- **healthy** — 过去 24 小时内有运行记录，所有 conclusion 均为 `success`、`in_progress` 或 `queued`，且没有处于 degraded 状态的 Cron 状态技能

为每个实例计算一个 **next_action**（一个简短的祈使短语）：
- `pending_secrets` → `add ANTHROPIC_API_KEY at https://github.com/${REPO}/settings/secrets/actions`
- `degraded` → `investigate <skill_name> (<consecutive_failures>× in a row, last_error: <signature, ≤60 chars>)`
- `warning` → `monitor — <N>/<Total> runs failed in 24h`
- `stale` → `confirm intent: no runs in 24h, last push <relative_date>; archive or re-enable` — 如果它*应该*正在运行，则将 `aeon-doctor` 分派到该实例（分派模式），检查是否存在静默配置错误（未加引号的 `schedule:` / 重复键 / 损坏的条目），然后再认定它已被弃用
- `unreachable` → `verify access: <reason from repo.err>`
- `healthy` → `none`
- `archived` → `none (archived)`

**计算增量**，与先前状态对比（逐实例比较 `prior.health` 与 `current.health`）：
- **新增（NEW）** — 实例不在先前状态中
- **降级（DEGRADED）** — 之前为健康/警告状态，现在为降级/不可达/陈旧/等待密钥状态
- **已恢复（RECOVERED）** — 之前为降级/不可达/陈旧/等待密钥状态，现在为健康/警告状态
- **已移除（DROPPED）** — 之前存在于状态中，但已不在注册表中
- （无变化 → 不生成增量行）

**更新注册表** — 将每个实例的 `health`、`last_checked`（ISO UTC）和 `next_action` 写回 `memory/instances.json`。保留所有其他字段（`purpose`、`parent`、`created`、`skills_enabled` 等）。

**更新状态文件** — 将当前逐实例健康状态快照写入 `memory/state/fleet-control-state.json`。**仅当本次运行发送通知时**，才将 `last_full_summary_date` 更新为今天。对于不可达实例，递增 `consecutive_unreachable`；否则重置为 0。

**记录日志**到 `memory/logs/${today}.md`（位于合并后的标题下 — 参见**日志**部分）：
```
### fleet-control
- Mode: health check
- Verdict: [FLEET_OK | NEEDS_ATTENTION:N]
- Sizes: total=N, healthy=N, warning=N, degraded=N, stale=N, pending=N, unreachable=N, archived=N
- Deltas: [list NEW/DEGRADED/RECOVERED/DROPPED, or "none"]
- Sources: gh=ok, rate_remaining=N
```

**通知门控** — 如果满足以下**任一**条件，则发送通知：
- `len(deltas) > 0`
- 今天 != 先前的 `last_full_summary_date`（UTC 当天首次检查 → 每日汇总）
- 当前存在任何处于 `degraded` 或 `unreachable` 状态的实例

否则跳过通知（当天中途没有任何变化时静默执行空操作 — 不应训练操作员忽略通知）。

**通知正文**（发送时）：
```
*Fleet Control — ${today}*
Verdict: <FLEET_OK | NEEDS_ATTENTION:N>

[If deltas exist]:
What changed:
- NEW: <name> (<repo>) — <health>
- DEGRADED: <name> — was <prior>, now <current>: <reason>
- RECOVERED: <name> — was <prior>, now <current>
- DROPPED: <name> — no longer in registry

Fleet (N total):
- <name> [<HEALTH>]: <repo> — <next_action>
- ...

[If first-of-day rollup]:
Counts: healthy <H> · warning <W> · degraded <D> · stale <S> · pending <P> · unreachable <U> · archived <A>

Sources: gh=ok · rate_remaining=N
```

逐实例列表最多显示 12 行；如果超过此数量，则追加 `...and N more — see memory/instances.json`。计数中始终包含已归档实例；逐实例部分中绝不列出已归档行。

---

## 分发模式（控制视图）

解析变量：`dispatch <instance|*> <skill> [var=<value>]`。

**解析目标**：
- 如果 `<instance>` 为 `*`，则目标为注册表中**当前**健康状态为 `healthy`、`warning` 或 `degraded` 的每个条目（跳过不可达、陈旧、等待中和已归档的条目）。
- 否则，在注册表中按名称精确匹配。未找到 → 通知 `Fleet Dispatch: instance '<name>' not in registry` 并停止。

对于每个目标实例：

1. **验证子实例中存在技能**：
   ```bash
   gh api "repos/${REPO}/contents/skills/${SKILL}/SKILL.md" >/dev/null 2>&1 \
     || { OUTCOME="missing_skill"; continue; }
   ```

2. **检查子实例的 aeon.yml 中是否启用了技能**（尽力而为的警告，不会阻止执行 — workflow_dispatch 可以覆盖 `enabled: false`）：
   ```bash
   gh api "repos/${REPO}/contents/aeon.yml" --jq '.content' 2>/dev/null | base64 -d \
     | grep -E "^[[:space:]]*${SKILL}:.*enabled:[[:space:]]*true" >/dev/null \
     || NOT_ENABLED_WARN=1
   ```

3. **触发技能**：
   ```bash
   if [ -n "$DISPATCH_VAR" ]; then
     gh workflow run aeon.yml --repo "${REPO}" -f skill="${SKILL}" -f var="${DISPATCH_VAR}" \
       && OUTCOME="dispatched" || OUTCOME="api_failed:$?"
   else
     gh workflow run aeon.yml --repo "${REPO}" -f skill="${SKILL}" \
       && OUTCOME="dispatched" || OUTCOME="api_failed:$?"
   fi
   ```

收集每个目标的结果：`dispatched | missing_skill | api_failed:<code>`（可附带可选的 `not_enabled_warn` 标志）。

**日志**：
```
### fleet-control
- Mode: dispatch
- Command: dispatch <inst|*> <skill> [var=...]
- Targets: N
- Dispatched: N | missing_skill: N | api_failed: N
- Per-target: [<name>: <outcome>, ...]
```

**通知**（在分发模式下始终发送）：
```
*Fleet Dispatch*
Command: dispatch <inst|*> <skill>
Targets: <N> — Dispatched: <N>
Successful: <comma-sep names>
[If failures]:
Failed: <name>: <reason>, ...
[If not_enabled_warn]:
Warning: <name> has skill disabled in aeon.yml — dispatched anyway
```

如果 N 个目标中有 0 个分发成功，判定行应为 `Fleet Dispatch: 0/${N} — see failures below`，记录的退出代码为 `FLEET_DISPATCH_FAILED:no_targets_succeeded`。

---

## 状态模式（控制视图）

生成全面的快照，但要确保易于浏览。

对于每个已注册的实例（详情块中跳过 `archived` 实例，但在摘要中计入），并行收集：
- 仓库元数据：`stargazers_count`、`pushed_at`、`open_issues_count`、`default_branch`
- 最近 10 次工作流运行：
  ```bash
  gh api "repos/${REPO}/actions/runs?per_page=10&exclude_pull_requests=true" \
    --jq '[.workflow_runs[]|{name,status,conclusion,created_at,html_url}]'
  ```
- 完整的 `cron-state.json`
- `aeon.yml`（解析已启用的技能）
- 最近 5 次提交（单行 `gh api repos/${REPO}/commits?per_page=5 --jq ...`）

计算相同的差异块，但与最近一篇 `output/articles/fleet-status-*.md` 进行比较（解析每个实例的健康状态行；如果不存在，则将该部分标记为“没有可供比较的先前状态”）。

写入 `output/articles/fleet-status-${today}.md`：
```markdown
# Fleet Status — ${today}

## Verdict
<one line: FLEET_OK | NEEDS_ATTENTION:N | DEGRADED:N — top issue first>

## Top Issue
<one paragraph: the single highest-priority instance and what it needs, OR "none">

## Fleet Health
| Instance | Repo | Health | Last Active | Skills | Open Action |
|----------|------|--------|-------------|--------|-------------|

## What Changed Since Last Status
<list of NEW/DEGRADED/RECOVERED/WENT_STALE/DROPPED instances since prior fleet-status article, or "no changes">

## Per-Instance Detail

### <name> — <repo>
- Purpose: <from registry>
- Health: <status>, last checked <ISO>
- Last 10 runs:
  | Skill | Status | Conclusion | When |
  |-------|--------|-----------|------|
- Skills enabled: <comma list>
- Recent commits:
  - <sha> <message>
- Action: <next_action>

## Counts
| Metric | Value |
|--------|-------|

## Sources
gh=ok · rate_remaining=N · registry=N instances · prior_status=<filename or "none">
```

**日志**：
```
### fleet-control
- Mode: status
- Article: output/articles/fleet-status-${today}.md
- Verdict: <line>
- Sizes: total=N, healthy=N, ...
```

**通知**（在状态模式下始终发送）：
```
*Fleet Status — ${today}*
<verdict>
Top issue: <one line, or "none">
Counts: healthy <H> · warning <W> · degraded <D> · stale <S> · pending <P> · unreachable <U>
Article: output/articles/fleet-status-${today}.md
```

---

## 评分卡模式（评分卡视图）

将每日**舰队评分卡**发布到 `memory/scorecard.md`，并向 `memory/scorecard-history.csv` 追加一行趋势数据。（当此技能通过 `var: scorecard` 调度时，每天 13:00 UTC 作为独立分派运行。）

### 0. 在运行期间收集数据

运行已提交的收集器——它会发现舰队成员（自身 + `memory/instances.json` 中未归档的实例），通过 GitHub API 获取每个仓库的工作流运行记录、技能数量和 `token-usage.csv`，计算定价与汇总数据，并写入表格。它从环境变量读取令牌（`GH_READ_PAT`——此技能的 `requires:` 中声明的只读 PAT，用于读取**私有**舰队成员——并回退使用 `GH_TOKEN`/`GITHUB_TOKEN`），因此**任何密钥都不会出现在命令行中**：

```bash
node scripts/fleet-scorecard.mjs   # → /tmp/fleet-scorecard/{scorecard-body.md,metrics.json}
```

确定性的数学计算位于脚本中（而非本次运行中）——**不要**重新计算或更改其数值。令牌无法读取的仓库只会从表格中缺失，而不会导致收集器崩溃。

### 输入（由步骤 0 生成——读取这些文件）

- `/tmp/fleet-scorecard/scorecard-body.md`——计算得出的 Markdown 表格（舰队总计、各仓库数据、成本最高的技能、可靠性最低的技能）。这是权威数据——**不要重新计算或更改它们。**
- `/tmp/fleet-scorecard/metrics.json`——今天的关键总计：`total_runs, total_failures, generations, prompt_tokens, cached_tokens, completion_tokens, total_tokens, est_cost_usd, cache_discount_usd`。

如果 `/tmp/fleet-scorecard/scorecard-body.md` 缺失或为空，则表示收集器失败或解析出的舰队为空——向 `/tmp/skill-result.txt` 写入一行说明并停止（不要覆盖现有评分卡，也不要发送通知）。

### 步骤

#### 1. 加载今天的指标和昨天的基线

- 读取 `/tmp/fleet-scorecard/metrics.json`（今天）。
- 如果 `memory/scorecard-history.csv` 存在，则读取其**最后一行**（上一次运行的指标）以计算差值。如果文件尚不存在，则这是首次运行——差值为“—”。

#### 2. 计算与前一天相比的差值

对于 `total_runs`、`total_failures`、`generations`、`total_tokens`、`est_cost_usd`、`cache_discount_usd`，计算 `today − previous`。格式化为带正负号的形式（例如 `+312 runs`、`+$148`、`+5 failures`）。这些是累计的全时段数据，因此差值显示过去约 24 小时的活动。

#### 3. 构建警报区块

扫描 `scorecard-body.md` 中计算得出的表格，并标记：
- **“Least reliable skills (last 14d)”**中**失败率 ≥ 25%** 的任何技能（指出其名称、仓库和失败率）。该表格已采用 14 天时间窗口，因此早已解决的事件不会触发误报——其中列出的任何问题都是值得重点指出的*当前*问题。
- 任何**成本激增**：如果历史记录至少有 7 行，且 `est_cost_usd` 的差值大于历史每日差值中位数的 1.5 倍；否则只需注明当天的成本增幅。
- 如果 `total_failures` 自昨天以来增加了**超过 10**，则将其标记出来。
- 如果没有问题，则写入 `✅ No anomalies — fleet healthy.`

#### 4. 编写 `memory/scorecard.md`

结构（覆盖该文件）：

```
# 🛰️ Aeon Fleet Scorecard — as of ${today}

_Auto-generated daily by skills/fleet-control (scorecard view). Tokens reported OpenRouter-style (cached_tokens ⊆ prompt_tokens)._

## Since last update (~24h)
| Metric | Δ |
|---|---:|
| Runs | <signed> |
| Failures | <signed> |
| Generations | <signed> |
| Total tokens | <signed, humanized> |
| Est. cost | <signed $> |
| Cache discount | <signed $> |

## Alerts
<the alerts block from step 3>

<PASTE the full contents of /tmp/fleet-scorecard/scorecard-body.md verbatim here>

---
_Sources: GitHub Actions run history + each repo's `memory/token-usage.csv`. Fleet resolved from memory/instances.json + self. Cost = Anthropic list price (estimate)._
```

#### 5. 追加趋势行

向 `memory/scorecard-history.csv` 追加一行（如果文件不存在，则创建文件并添加表头）：

```
date,total_runs,total_failures,generations,prompt_tokens,cached_tokens,completion_tokens,total_tokens,est_cost_usd,cache_discount_usd
```

日期使用 `${today}`，各项值直接取自 `metrics.json`。**只追加，绝不重写**之前的行。

#### 6. 通知

将简洁的每日动态写入 `/tmp/scorecard-notify.md`，并使用 `./notify -f /tmp/scorecard-notify.md` 发送。内容为一个简短段落——包括今天的总计（运行次数、预估成本、总令牌数）、主要增量以及所有告警。示例形式：*"fleet at 12.5k runs, ~$7.8k notional. +312 runs / +$148 since yesterday. cost-report still failing (88% fail). caching saved ~$43k."* 同时将此文本复制到 `/tmp/skill-result.txt`，以便框架捕获。

#### 7. 记忆日志

将记分卡条目追加到 `memory/logs/${today}.md` 中统一的 `### fleet-control` 标题下（参见 **日志**部分），并记录主要数字（以便 self-improve/reflect 等未来技能看到）。

### 记分卡说明
- 数字只能来自收集器的输出文件（`/tmp/fleet-scorecard/*`）——绝不要自行编造或估算数字。
- 记分卡是累计/全时段的；增量数据使每日运行具有实际价值。
- GitHub Actions 会将运行记录保留约 90 天，因此运行历史是一个滚动窗口；令牌 CSV 是提交到各仓库中的持久记录。

---

## 日志

所有模式都追加到 `memory/logs/${today}.md` 中**同一个** `### fleet-control` 标题下，并使用 `- Mode:` 区分行（健康循环会解析此结构）。使用上述各模式章节中给出的对应模式块。对于**记分卡模式**，使用：
```
### fleet-control
- Mode: scorecard
- Scorecard: memory/scorecard.md updated — <total_runs> runs, ~$<est_cost_usd> notional, <total_tokens humanized>
- Deltas: <+runs> / <+$cost> since yesterday
- Alerts: <alert summary or "none">
```

## 退出分类

每次运行都只向记忆中记录以下一项：
- `FLEET_CONTROL_OK` — 健康检查/状态/分发/记分卡正常完成
- `FLEET_EMPTY` — 注册表中没有实例（静默停止；控制视图）
- `FLEET_NO_AUTH` — 缺少 gh 身份验证（控制视图）
- `FLEET_RATE_LIMITED:remaining=N` — 为保留配额而放弃（控制视图）
- `FLEET_DISPATCH_OK:N/M` — 已分发 N 个目标，共 M 个
- `FLEET_DISPATCH_FAILED:<reason>` — 分发操作未产生任何分发
- `FLEET_SCORECARD_EMPTY` — 收集器未生成数据（机群为空/所有仓库均不可读）；跳过记分卡，不覆盖文件，也不发送通知

## 网络说明

**控制视图（健康状态 / 状态 / 调度）：** 始终使用 `gh api`，而不是原始 curl（它会在内部处理身份验证，因此命令行中不会出现 `$SECRET`，从而避免被 Bash 权限层拒绝）。所有跨仓库调用都通过 `gh api` 或 `gh workflow run` 进行。除了 `gh` 内部执行的操作外，不需要出站 HTTP。

**评分卡视图：** 通过执行 `node scripts/fleet-scorecard.mjs`（步骤 0）在运行期间收集数据；该脚本会从 GitHub API 获取工作流运行记录和令牌使用情况，并计算表格，将其写入 `/tmp/fleet-scorecard/`。如果设置了 `GH_READ_PAT`，收集器将使用它进行身份验证（这是一个具有跨仓库作用域的只读 PAT，在此技能的 `requires:` 中声明并注入运行），以便读取**私有**托管实例；如果未设置，则使用本次运行的 `GH_TOKEN`（即 `GH_GLOBAL`）读取相同的私有成员，这是标准的单密钥配置。它在内部从 `process.env` 读取令牌，因此机密永远不会出现在命令行中。对于令牌无法读取的仓库，只会将其从表格中排除，而不会导致收集器崩溃。

## 必需的环境变量

`GH_READ_PAT`（可选，只读）— 在 `requires:` 中声明，并由 `scripts/fleet-scorecard.mjs`（评分卡视图）从 `process.env` 读取，用于访问私有托管实例；未设置时，会回退到 `GH_GLOBAL`/`GH_TOKEN`/`GITHUB_TOKEN`（本次运行的仓库范围令牌，它同样可以读取私有成员），并读取 `GITHUB_REPOSITORY` 以解析 "self"。控制视图依赖工作流提供的 `GITHUB_TOKEN` 来执行实时 `gh` 调用。

## 约束

- 切勿自动从 `memory/instances.json` 中删除实例——只能更新字段。即使是 `unreachable` 实例，也要保留在注册表中，直到操作员手动将其移除。
- 保留此技能未明确写入的所有注册表字段（purpose、parent、created、skills_enabled 等）。
- 切勿将机密写入日志或通知。
- 将通知长度限制在约 30 行；必要时使用 `...and N more` 截断逐实例列表。
- 当日间没有任何变化时，健康检查应保持静默——每日汇总路径会处理周期性的“是否一切正常？”问题，避免产生垃圾通知。
- 当收集器输出缺失或为空时，评分卡模式绝不能覆盖 `memory/scorecard.md`；对于 `memory/scorecard-history.csv` 中的既有行，只能追加，绝不能重写。
- 如无充分理由，请勿更改此技能的标签、变量语义或计划任务。

编写完整且可运行的代码。不得包含 TODO 或占位符。

## 输出

完成任何任务后，以 `## Summary` 结尾，列出所做的工作、创建/修改的文件，以及需要采取的任何后续操作。