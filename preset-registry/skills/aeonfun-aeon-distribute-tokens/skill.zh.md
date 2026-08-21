---
name: distribute-tokens
description: Two-phase contributor rewards - plan builds a tier-priced payout from the repo's merged-PR ranking; send executes it on-chain via Bankr Wallet API with per-recipient idempotency and dry-run.
metadata:
  title: Distribute Tokens
  category: crypto
  var: ""
  tags:
    - community
    - crypto
  requires:
    - BANKR_API_KEY?
  capabilities:
    - external_api
    - writes_external_host
    - onchain_writes
    - sends_notifications
---
<!-- autoresearch: variation C — robustness via per-recipient idempotency state, two-phase resolve→execute, dry-run, retries, 403/429 handling, recovery. Merged: contributor-reward's tier-priced reward-computation folded in as the plan/input phase; the on-chain distribution stays the execute phase. -->

> **${var}** — 阶段 + 目标选择器。语法：`[plan:|all:][dry-run:]<target>`
> - ``（空）/ `<label>` / `dry-run:<label>` → **发送**阶段：分发 `memory/distributions.yml` 中的一个列表（空 = 第一个列表）。*[默认 — 无前缀]*
> - `plan:` / `plan:<week>` / `plan:dry-run` / `plan:dry-run:<week>` → 仅执行**规划**阶段：根据仓库中已合并的 PR 计算奖励，并将列表写入 `memory/distributions.yml`。
> - `all:` / `all:<week>` / `all:dry-run` / `all:dry-run:<week>` → 在一次运行中**先规划后发送**。
>
> `<label>` 是分发列表标签（例如 `contributors-2026-W17`）。`<week>` 是 ISO 周（`2026-W17`）；空的 `<week>` = 最近一个已结束的 ISO 周。`dry-run:` 可在不产生副作用的情况下进行预览（规划阶段不写入 yml/状态；发送阶段不进行转账）。

## 为什么采用这种设计

此技能负责整个贡献者正向循环：**谁应得多少**（规划）以及**资金转移**（发送）。它被拆分为两个既可独立运行、也可串联运行的阶段。

**规划阶段 — 项目此前缺失的连接环节。** 已合并的 PR 已经明确了推动项目进展的人员，但已交付的工作并没有获得钱包入账的途径。规划阶段就是这一连接环节：它根据贡献者在目标周合并的 PR 对其进行排名（数据直接来自 GitHub API），按照等级表为每位符合条件的贡献者计算奖励金额，并将带标签的列表写入 `memory/distributions.yml`——也就是发送阶段读取的文件。当涉及真实资金时，在规划和执行之间保留一份人类可读的 `memory/distributions.yml` 差异，是成本最低的审计追踪方式：规划结果提交到 git 后，由操作员（或 `all:` 模式，或串联的后续步骤）接着运行发送阶段。

**发送阶段 — 此阶段会转移真实资金。** 最大的故障风险是重复发送（重新运行、部分失败后的重试、日期切换后绕过“如果是今天则跳过”的逻辑），或将资金发送到黑洞中（未预先检查余额、使用已弃用的 API 路径、缺少账号解析）。因此，发送阶段会：

1. **持久化每位接收者的幂等状态**，将其保存在 `memory/state/distributions.json` 中，以 `(list, recipient, date_utc)` 为键并记录 txHash。同一个 UTC 日期内，成功的转账*绝不会*被再次发送，即使重新运行或工作流重启也是如此。
2. **两阶段执行**：RESOLVE（验证配置、密钥和余额，解析所有账号 → 地址，并构建计划）→ EXECUTE（逐笔发送转账，并在每笔完成后持久化状态）。RESOLVE 失败会在发送任何转账之前中止流程。
3. **试运行模式**会输出完整计划，但不进行任何转账。
4. 实际转账**仅使用 Wallet API**——Bankr 的文档已弃用 Agent API 的转账功能。Agent API 仅用于账号→地址解析。

这两个阶段在设计上保持解耦：发送阶段是唯一获准的转账路径，并负责管理幂等状态文件，因此规划阶段绝不会接触转账状态。`all:` 模式只是按顺序先运行规划阶段、再运行发送阶段（规划阶段写入列表，发送阶段读取该列表），因此不会重复实现任何逻辑。

## 配置

根据所处阶段读取两个相互独立的配置/状态面：

- `memory/distributions.yml` — 分发列表（由**发送**阶段读取，由**规划**阶段写入）。
- **规划**阶段通过 GitHub API，从仓库已合并的 PR 中实时计算排名——无需输入文件（参见阶段 A）。
- `memory/state/distributions.json` — 按接收者记录的发送幂等性状态（由**发送**阶段读取/写入）。
- `memory/state/contributor-reward-state.json` — 规划幂等性状态 + 首次 PR 奖励历史记录（由**规划**阶段读取/写入）。

如果**发送**阶段需要 `memory/distributions.yml` 时该文件不存在，则使用带注释的模板进行初始化（参见发送步骤 1），然后以 `DISTRIBUTE_TOKENS_OK — bootstrapped distributions.yml; edit and re-run` 正常退出。

```yaml
# memory/distributions.yml
defaults:
  token: USDC          # USDC | ETH (Base only)
  amount: "5"
  chain: base

lists:
  contributors:
    description: "Weekly contributor rewards"
    token: USDC
    amount: "10"
    recipients:
      - handle: "@alice_dev"      # Twitter/X — resolved via Bankr Agent API
        amount: "15"
      - handle: "@bob_builder"
      - address: "0x742d...5678"  # direct EVM address — preferred path
        label: "Charlie"
        amount: "20"
```

### 必需的密钥

| 密钥 | 阶段 | 用途 |
|--------|-------|---------|
| `BANKR_API_KEY` | 发送（以及任何试运行发送，因为仍会执行预检） | Bankr API 密钥（`bk_...`）。必须为**读写**权限，并启用 **Wallet API**。只读密钥 → 403。**`plan:` 不需要此密钥（纯本地文件 I/O）。** |

### Base 上的代币地址

- USDC：`0x833589fcd6edb6e08f4c7c32d4f71b54bda02913`
- ETH（原生）：`tokenAddress: "0x0000000000000000000000000000000000000000"`，`isNativeToken: true`

### 分级奖励（规划阶段）

| 排行榜名次 | 奖励（USDC） |
|---------------------|---------------|
| 1                   | 25            |
| 2                   | 15            |
| 3                   | 10            |
| 4                   | 5             |
| 5                   | 5             |

**首次 PR 奖励：**额外 +5 USDC，每个登录名仅可获得一次（记录在 `memory/state/contributor-reward-state.json` 中）。用于奖励你首个已合并至上游的 PR——这是排行榜评分中杠杆效应最高的信号。

**资格门槛：**分数 ≥ 10，并且贡献者必须拥有非空的 `@handle`（表中没有 `@` 前缀的登录名将被跳过——这些通常是机器人或解析产物）。只需一个已合并至上游的 PR（+10）即可获得资格——目标是奖励已交付的工作，而不是设置工作量门槛。

Base 上默认使用 `token: USDC`。如果确有必要给予特殊奖励，操作员可在规划写入后，在 `memory/distributions.yml` 中覆盖各接收者的金额。

---

读取 `memory/MEMORY.md`，并扫描 `memory/logs/` 中最近约 3 天的内容，查找任何已经报告过的信息（不要重复报告相同信号）。

## 步骤 0 — 解析选择器并分派

预先解析时间锚点：`today=$(date -u +%F)` 和 `today_utc="$today"`。

解析 `${var}`：

1. **阶段前缀。**如果 `${var}` 以 `plan:` 开头 → `PHASE=plan`，移除 `plan:`。否则，如果它以 `all:` 开头 → `PHASE=all`，移除 `all:`。否则 → `PHASE=send`，并且**不要移除任何内容**（其余的旧版语法由发送阶段自行解析）。
2. **试运行。**对于 `PHASE=plan`/`all`：如果剩余部分以 `dry-run` 开头（也可以是 `dry-run:`），则设置 `MODE=dry-run` 并移除该标记；否则设置 `MODE=execute`。（对于 `PHASE=send`，发送阶段会自行解析 `dry-run:`——参见发送步骤 1。）
3. **目标。**
   - `PHASE=send`：未移除内容的 var 即为发送目标——`dry-run:<label>`、`<label>` 或空值。
   - `PHASE=plan`/`all`：剩余部分是可选的 `<week>`。如果它匹配 `^\d{4}-W\d{2}$`，则设置 `TARGET_WEEK=<week>`；否则计算 `TARGET_WEEK=$(date -u +%G-W%V)`（ISO-8601 周编号年份 + 周数——使用 `%G/%V` 而不是 `%Y/%U`，因此以周一为起点的周可在跨年时正确衔接）。

调度：
- `PHASE=plan` → 仅运行**阶段 A**。
- `PHASE=send` → 仅运行**阶段 B**。
- `PHASE=all` → 运行**阶段 C**（先 A 后 B）。

选择器示例：`` → 发送第一个列表 · `contributors-2026-W17` → 发送该列表 · `dry-run:contributors-2026-W17` → 模拟发送 · `plan:` → 为最近一期排行榜制定计划 · `plan:2026-W17` → 为该周制定计划 · `plan:dry-run` → 计划预览 · `all:` → 为最近一期制定计划并发送 · `all:dry-run:2026-W17` → 对该周进行完整的端到端预览。

---

## 阶段 A — 计划（奖励计算）

对目标周内已合并 PR 的作者进行排名（通过 GitHub API），并将该排名转换为 `memory/distributions.yml` 中按层级定价的列表。

### A1. 确定目标周和仓库

- `REPO="${GITHUB_REPOSITORY:-$(git config --get remote.origin.url | sed -E 's#.*[:/]([^/]+/[^/]+?)(\.git)?$#\1#')}"` — 运行实例所在的仓库。
- `TARGET_WEEK` 来自选择器；为空 = 最近一个**已结束**的 ISO 周（上一个完整的周一至周日）。将其 UTC 边界 `WEEK_START`..`WEEK_END` 计算为 ISO 日期时间（`YYYY-MM-DDT00:00:00Z`）。

### A2. 按该周合并的 PR 数对贡献者进行排名

直接从 GitHub 计算排名——无需上游 skill 或文章。

- 获取**在时间窗口内合并**的每个 PR，并按作者提取：
  `gh api -X GET search/issues -f q="repo:${REPO} is:pr is:merged merged:${WEEK_START}..${WEEK_END}" --paginate --jq '.items[].user.login'`
- 排除机器人作者（`*[bot]`、`dependabot*`、`github-actions*`）。统计每个剩余登录名的已合并 PR 数 → `score`。按 `score` 降序排名；若分数相同，则先按最早合并时间排序，再按登录名升序排序。
- 每个已排名登录名的**首个 PR ✨**——他们之前是否曾有任何 PR 合并到该仓库？
  `gh api -X GET search/issues -f q="repo:${REPO} is:pr is:merged author:${login} merged:<${WEEK_START}" --jq '.total_count'` → `0` 表示这是他们有史以来首个合并的 PR（设置 `first_pr_marker = ✨`）。
- 如果时间窗口内合并的 PR 数为零 → 将 `CONTRIBUTOR_REWARD_NO_MERGED_PRS — week ${TARGET_WEEK}` 记录到 `memory/logs/${today}.md`，静默退出（不通知）。没有任何内容发布，也没有需要奖励的对象。
- 如果 GitHub API 无法访问（有关 `gh api` → WebFetch 的回退方案，请参阅网络说明）→ 记录 `CONTRIBUTOR_REWARD_API_FAIL`，通知操作员，然后退出。

### A3. 加载计划幂等性状态

```json
// memory/state/contributor-reward-state.json
{
  "weeks": {
    "2026-W17": {
      "written_at": "2026-04-26T09:00:00Z",
      "label": "contributors-2026-W17",
      "source": "github:merged-prs",
      "rewards": [
        { "login": "alice_dev", "rank": 1, "score": 47, "amount": "25", "first_pr_bonus": false },
        { "login": "bob_builder", "rank": 2, "score": 31, "amount": "20", "first_pr_bonus": true }
      ]
    }
  },
  "first_pr_bonus_paid": ["bob_builder", "carol_eng"]
}
```

如果文件不存在，则使用 `{"weeks": {}, "first_pr_bonus_paid": []}` 进行初始化。

### A4. 计算计划

对于每个满足 `rank ≤ 5` 且 `score ≥ 1`（至少有一个已合并 PR）的已排名登录名：

- 从层级表中查找 `base_amount`（排名 1→25、2→15、3→10、4-5→5）。
- 如果 `first_pr_marker == "✨"` 且 `login ∉ first_pr_bonus_paid` → 设置 `first_pr_bonus = true`、`amount = base_amount + 5`。否则设置 `first_pr_bonus = false`、`amount = base_amount`。
- 构建行：`{ rank, login, score, base_amount, first_pr_bonus, amount }`。

如果状态中已存在 `weeks[TARGET_WEEK]` → 本周已处理。将当前计划与 `state.weeks[TARGET_WEEK].rewards` 进行差异比较，以 `login` 为键：

- 如果差异为空（登录名相同、金额相同）→ 记录 `CONTRIBUTOR_REWARD_ALREADY_PROCESSED — week ${TARGET_WEEK}`，静默退出（不通知）。这是幂等重运行。
- 如果存在差异（排行榜在首次写入奖励后重新运行——延迟发布的推文提高了分数等）→ 标记 `RE_PROCESS`。继续处理，但不要向 `state.weeks[TARGET_WEEK].rewards` 中已有的任何人重复支付；仅添加差额。新条目获得全额奖励；金额增加的现有条目获得**差额**（例如，从第 3 名升至第 2 名 = 额外补发 5 USDC）。对于名次下降的条目，不追回奖励。

如果计划为空（经过阈值筛选和去重后，符合条件的贡献者为零）→ 记录 `CONTRIBUTOR_REWARD_NO_ELIGIBLE` 并静默退出。

### A5. 渲染计划

```
Contributor Reward Plan — ${TARGET_WEEK} (${MODE})

Source: ${LEADERBOARD_FILE}
Tier: rank 1=25, 2=15, 3=10, 4-5=5 USDC; first-PR bonus +5 once per login.

  ✓ #1 @alice_dev      score 47  →  25 USDC                  [NEW]
  ✓ #2 @bob_builder    score 31  →  20 USDC (15 + 5 first-PR)[NEW + BONUS]
  ✓ #3 @carol_eng      score 24  →  10 USDC                  [NEW]
  ✓ #4 @dave_ops       score 18  →   5 USDC                  [NEW]
  ↻ #5 @eve_hax        score 14  →   5 USDC                  [DEDUP — already in state]

Total to write: 60 USDC across 4 new entries.
Total in state for ${TARGET_WEEK} after write: 5 entries, 65 USDC.

Next: distribute-tokens "dry-run:contributors-${TARGET_WEEK}" (preview)
      distribute-tokens "contributors-${TARGET_WEEK}"          (execute)
```

如果 `MODE=dry-run`（仅生成计划的试运行，即 `plan:dry-run...`）：使用标题 `*Contributor Reward Plan — ${TARGET_WEEK}* — DRY RUN` 通知此计划，记录到 `memory/logs/${today}.md`，并以 `CONTRIBUTOR_REWARD_DRY_RUN` 退出。**不要**修改 `memory/distributions.yml` 或状态文件。

> **`all:` 模式说明：**当此阶段作为 `all:` 的一部分运行且 `MODE=dry-run` 时，此处**不要**发送通知，也**不要**退出——将计算出的计划行直接传递给阶段 B（参见阶段 C）。当 `all:` 以 `MODE=execute` 运行时，照常继续执行 A6–A8，但将 A9 通知末尾的 `Next:` 行替换为 `Distributing now (phase=all)…`。

### A6. 更新 memory/distributions.yml  *（当 MODE=dry-run 时跳过）*

读取 `memory/distributions.yml`。如果缺失 → 使用标准文件头进行初始化（与发送阶段的初始化样式一致）：

```yaml
# memory/distributions.yml
defaults:
  token: USDC
  amount: "5"
  chain: base

lists:
```

计算新的列表块：

```yaml
  contributors-${TARGET_WEEK}:
    description: "Weekly contributor rewards for ${TARGET_WEEK} (auto-generated from merged-PR ranking)"
    token: USDC
    amount: "5"
    recipients:
      - handle: "@alice_dev"
        amount: "25"        # rank 1
      - handle: "@bob_builder"
        amount: "20"        # rank 2 + first-PR bonus
      - handle: "@carol_eng"
        amount: "10"        # rank 3
      - handle: "@dave_ops"
        amount: "5"         # rank 4
```

收件人顺序与计划顺序一致（按 `rank` 升序排列）。必须为每个收件人指定 `amount`，以便发送阶段使用按档位定价的金额，而不是回退到列表默认值。

**更新策略：**
- 如果 YAML 中已存在名为 `contributors-${TARGET_WEEK}` 的列表，则将其整体**替换**（计划是当前状态的权威来源）。
- 否则，将该块追加到 `lists:` 下（保留现有列表——绝不重写它们）。
- 使用可感知 YAML 结构的方式进行更新（例如，如果可用则使用 `python -c "import yaml; ..."`；否则，基于 `^  contributors-${TARGET_WEEK}:$` 行谨慎地进行文本块替换）。如果现有文件的 YAML 解析失败 → 记录错误，不要写入，并通知操作员（该文件经过手工编辑；自动编辑可能会破坏内容）。

通过重新读取文件来验证写入，并确认该列表存在且满足 `len(recipients) == len(plan)`。

### A7. 更新计划状态文件  *（当 MODE=dry-run 时跳过）*

以原子方式将更新后的状态 JSON 写入 `memory/state/contributor-reward-state.json`：
- 将 `weeks[TARGET_WEEK]` 设为 `{ written_at: now_utc, label, source: "github:merged-prs", rewards: [{login, rank, score, amount, first_pr_bonus}, ...] }`（在 RE_PROCESS 时完全替换，否则进行追加）。
- 将所有 `first_pr_bonus == true` 的登录名追加到 `first_pr_bonus_paid`（去重）。

先写入临时文件，再使用 `mv` 覆盖目标文件，以避免部分写入损坏状态。

### A8. 通知  *（仅限计划阶段的执行模式）*

```
*Contributor Reward Plan — ${TARGET_WEEK}*

Wrote ${N_NEW} new entries (${TOTAL_USDC} USDC) to memory/distributions.yml as `contributors-${TARGET_WEEK}`.

Top of plan:
  #1 @alice_dev   — 25 USDC
  #2 @bob_builder — 20 USDC (✨ first-PR bonus)
  #3 @carol_eng   — 10 USDC
  #4 @dave_ops    —  5 USDC
${IF_DEDUP}

Source: ${LEADERBOARD_FILE}
First-PR bonuses awarded: ${LIST_OR_NONE}

Next: run `distribute-tokens dry-run:contributors-${TARGET_WEEK}` to preview, then drop the `dry-run:` prefix to execute.

Plan: https://github.com/${GITHUB_REPOSITORY}/blob/main/memory/distributions.yml
```

如果没有条目被去重，则不显示 `${IF_DEDUP}` 行。使用 `$GITHUB_REPOSITORY` 环境变量作为链接目标。通过 `./notify` 发送。

**显著性门槛：**仅当 `N_NEW ≥ 1` 时才发送通知。未产生任何新条目的重新处理运行（RE_PROCESS 且所有奖励均已支付）→ 仅静默记录日志。（在 `all:` 执行中，根据 A5 的说明跳过此通知；发送阶段的摘要会包含该报告。）

然后记录日志（参见**日志**）并以 `CONTRIBUTOR_REWARD_OK` 退出。

---

## 阶段 B — 发送（链上分发）

从 `memory/distributions.yml` 读取列表，并通过 Bankr Wallet API 执行转账。此阶段会转移真实资金——幂等性和预检是不可妥协的要求。

在执行任何操作之前，读取 `memory/state/distributions.json`（如果存在）以获取发送幂等性状态。

### B1. 解析发送目标并加载配置

- 如果发送目标以 `dry-run:` 开头，则设置 `MODE=dry-run` 和 `LABEL=${target#dry-run:}`。否则设置 `MODE=execute` 和 `LABEL=${target}`。（从阶段 C 进入时，`LABEL` 和 `MODE` 改由阶段 C 设置——参见阶段 C。）
- 如果缺少 `memory/distributions.yml` → **引导初始化**：写入**配置**部分中的示例配置（全部注释掉以使其不生效），通知 `DISTRIBUTE_TOKENS_OK — bootstrapped distributions.yml; edit and re-run`，记录日志并退出。
- 解析 YAML。如果 `LABEL` 为空，则使用第一个列表。否则查找匹配的列表。如果未找到 → 通知 `DISTRIBUTE_TOKENS_ERROR — list '${LABEL}' not found`，记录日志并退出。
- （`today_utc` 已在步骤 0 中解析。）

### B2. 预检：密钥、写入权限、余额

如果未设置 `BANKR_API_KEY` → `DISTRIBUTE_TOKENS_ERROR — BANKR_API_KEY not configured`，记录日志并退出。

```bash
ME=$(./secretcurl -fsS "https://api.bankr.bot/wallet/me" -H "X-API-Key: {BANKR_API_KEY}")
```

- HTTP 403 → `DISTRIBUTE_TOKENS_ERROR — API key is read-only; needs wallet write scope`，退出。
- HTTP 429 → `DISTRIBUTE_TOKENS_ERROR — rate-limited at /wallet/me; aborting`，退出。
- 网络故障 → 使用 **WebFetch** 作为后备方案。如果仍然失败 → `DISTRIBUTE_TOKENS_ERROR — Bankr /wallet/me unreachable`，退出。

```bash
PORTFOLIO=$(./secretcurl -fsS "https://api.bankr.bot/wallet/portfolio?chain=base" -H "X-API-Key: {BANKR_API_KEY}")
```

提取发送方的目标代币余额。根据接收者列表计算 `total_required`（对每位接收者的金额应用覆盖值后求和）。如果 `balance < total_required * 1.05`（为可能失败的重试预留 5% 余量）→ `DISTRIBUTE_TOKENS_ERROR — insufficient balance: have X, need Y ${TOKEN}`，退出。不要开始部分执行。

### B3. RESOLVE 阶段 — 构建计划

为每位接收者构建一行：`{key, type, amount, token, target_address, label, status}`，其中 `key = sha256("${LABEL}|${recipient_id}|${today_utc}")`，而 `recipient_id` 是句柄（小写）或地址（小写）。

**幂等性检查**（解析前）：如果 `memory/state/distributions.json` 中包含 `status=completed` 的 `key` → 将该行标记为 `SKIPPED_DEDUP`，并沿用之前的 `txHash`。

**句柄解析**（`@username`）：使用 Bankr Agent API 查找关联的钱包：
```bash
JOB=$(./secretcurl -fsS -X POST "https://api.bankr.bot/agent/prompt" \
  -H "X-API-Key: {BANKR_API_KEY}" -H "Content-Type: application/json" \
  -d "{\"prompt\":\"What is the EVM address linked to ${HANDLE} on Base? Respond with only the address.\"}" | jq -r '.jobId')
# Poll every 2s, max 30s
for i in $(seq 1 15); do
  R=$(./secretcurl -fsS "https://api.bankr.bot/agent/job/${JOB}" -H "X-API-Key: {BANKR_API_KEY}")
  S=$(echo "$R" | jq -r '.status')
  [ "$S" = "completed" ] || [ "$S" = "failed" ] && break
  sleep 2
done
```
从响应中提取地址（正则表达式 `0x[a-fA-F0-9]{40}`）。如果提取失败 → 将该行标记为 `RESOLVE_FAILED`，原因为 `NO_LINKED_WALLET`。**不要**中止整个计划；让执行器跳过此行。

**地址解析**（`0x...`）：验证格式 `^0x[a-fA-F0-9]{40}$`。如果无效 → `RESOLVE_FAILED`，原因为 `BAD_ADDRESS`。

RESOLVE 完成后，将计划打印到控制台（如果 `MODE=dry-run`，也要打印到试运行通知中）：

```
Plan for list '${LABEL}' (${today_utc}):
  ✓ @alice_dev → 0x1234... — 15 USDC          [READY]
  ✓ Charlie    → 0x742d... — 20 USDC          [READY]
  ↻ @bob_builder → 0xabcd... — 10 USDC        [SKIPPED_DEDUP] (tx 0xprev...)
  ✗ @inactive → ?                             [RESOLVE_FAILED: NO_LINKED_WALLET]

Summary: 2 to send (35 USDC), 1 deduped, 1 unresolvable. Sender balance: 100 USDC.
```

如果 `MODE=dry-run`：通知该计划、记录日志，并以 `DISTRIBUTE_TOKENS_DRY_RUN` 退出。不要继续执行。

如果 `READY` 行数为 0（全部已去重/失败）→ 通知该计划、记录日志并退出：`DISTRIBUTE_TOKENS_OK — nothing to send`。

### B4. EXECUTE 阶段

对于每个 `READY` 行，通过 `/wallet/transfer` 发送（根据 Bankr 文档，这是唯一获准使用的转账端点）：

```bash
RESP=$(./secretcurl -fsS -X POST "https://api.bankr.bot/wallet/transfer" \
  -H "X-API-Key: {BANKR_API_KEY}" -H "Content-Type: application/json" \
  -d "{\"recipientAddress\":\"${ADDR}\",\"tokenAddress\":\"${TOKEN_ADDR}\",\"amount\":\"${AMT}\",\"isNativeToken\":${IS_NATIVE}}")
```

结果处理：
- HTTP 200 + `success: true` → 状态设为 `COMPLETED`，存储 `txHash`。**立即持久化状态文件**（每处理完一个接收者就写入，而不是等到最后——这样可承受运行中途崩溃）。
- HTTP 200 + `success: false` → 状态设为 `FAILED`，存储 `error` 字段作为原因。
- HTTP 403 → 状态设为 `FAILED`，原因设为 `READ_ONLY_KEY`。中止处理剩余行（密钥不会突然获得写入权限）。持久化状态。
- HTTP 429 → 状态设为 `FAILED`，原因设为 `RATE_LIMIT`。休眠 60 秒后重试一次。如果仍为 429，则中止处理剩余行（滚动窗口配额已耗尽）。持久化状态。
- HTTP 5xx 或网络错误 → 10 秒后重试一次。如果仍然失败，状态设为 `FAILED`，原因设为 `API_ERROR`。
- 任何其他结果 → 状态设为 `FAILED`，原因设为 `HTTP_${code}`。

状态文件结构（`memory/state/distributions.json`，追加/更新插入）：
```json
{
  "contributors|@alice_dev|2026-04-20": {
    "list": "contributors",
    "recipient": "@alice_dev",
    "address": "0x1234...",
    "amount": "15",
    "token": "USDC",
    "status": "completed",
    "txHash": "0xabc...",
    "timestamp": "2026-04-20T12:34:56Z"
  }
}
```

### B5. 构建摘要通知

首行是判定结果：`COMPLETE`（所有 READY 均成功）/ `PARTIAL`（部分失败）/ `FAILED`（无一成功）/ `DRY_RUN` / `NOTHING_TO_SEND`。

```
*Token Distribution — ${today_utc}* — VERDICT

List: ${LABEL} (${description})
Token: ${TOKEN} on Base
Sent: ${total_sent} ${TOKEN} to ${n_success}/${n_attempted} recipients
Skipped (already sent today): ${n_dedup}
Unresolvable: ${n_unresolved}

✓ @alice_dev — 15 USDC ([tx](https://basescan.org/tx/0xabc...))
✓ Charlie (0x742d...) — 20 USDC ([tx](https://basescan.org/tx/0x123...))
↻ @bob_builder — 10 USDC (already sent: [tx](https://basescan.org/tx/0xprev...))
✗ @inactive_user — RESOLVE_FAILED: NO_LINKED_WALLET

Sender balance after: ${remaining} ${TOKEN}
```

隐藏空分区（如果 `n_dedup=0`，则不显示 `Skipped:` 行，依此类推）。通过 `./notify` 发送。然后记录日志（参见**日志**），并使用发送判定代码退出（`DISTRIBUTE_TOKENS_COMPLETE` / `DISTRIBUTE_TOKENS_PARTIAL` / 无内容可发送时使用 `DISTRIBUTE_TOKENS_OK`）。

---

## 阶段 C — 全部（先计划后发送）

在一次调用中运行阶段 A，然后将其结果传递给阶段 B。`TARGET_WEEK` 和 `MODE` 来自步骤 0。

**`all:` 执行（`MODE=execute`）：**
1. 以执行模式运行**阶段 A**（A1–A8）。它会将 `contributors-${TARGET_WEEK}` 写入 `memory/distributions.yml` 和状态文件，并发布计划通知（包含 A5 说明中的调整：末行改为 `Distributing now (phase=all)…`）。
2. 如果阶段 A 发生终止性提前退出——`CONTRIBUTOR_REWARD_NO_LEADERBOARD`、`_STALE_LEADERBOARD`、`_PARSE_FAIL`、`_NO_ELIGIBLE`，或者 `_ALREADY_PROCESSED` 且新增条目为零——则**停止**：没有需要发送的内容。记录日志，并使用对应的阶段 A 代码退出。
3. 否则，设置 `LABEL="contributors-${TARGET_WEEK}"`、`MODE=execute`，并运行**阶段 B**（B1 从 `memory/distributions.yml` 读取刚写入的列表；B2–B5 照常执行）。发送阶段摘要是最终通知。

**`all:` 试运行（`MODE=dry-run`）：**完整的端到端预览，**不写入、不转账。**
1. 以试运行模式执行**阶段 A**（A1–A5）以计算计划——但根据 A5 的说明，此处**不要**发送通知或退出；将计算出的计划行保留在内存中。
2. 进入**阶段 B**，使用根据计划行构建的内存中接收者列表（`handle="@${login}"`、`amount=<tier amount>`），而不是读取 `memory/distributions.yml`；设置 `LABEL="contributors-${TARGET_WEEK}"`、`MODE=dry-run`。执行 B2（预检——此步骤仍会调用 Bankr `/wallet/me` + `/portfolio`，因此此预览需要 `BANKR_API_KEY`；如果缺失，则为发送预览报告 `DISTRIBUTE_TOKENS_ERROR — BANKR_API_KEY not configured`，但保留渲染后的计划）和 B3（RESOLVE + 输出）。B3 的 `MODE=dry-run` 分支会发送合并预览通知，并以 `DISTRIBUTE_TOKENS_DRY_RUN` 退出。两个阶段均不会写入状态或 yml。

---

## 日志

追加到 `memory/logs/${today}.md` 中的**一个**标题下（健康循环会解析此结构）。始终使用 `### distribute-tokens`；`Phase`/`Mode` 判别行用于说明运行了哪个分支。

```
### distribute-tokens
- Phase: plan | send | all
- Mode: execute | dry-run
# --- plan phase (present when Phase A ran) ---
- Plan mode: execute | dry-run | already-processed | no-merged-prs | api-fail | no-eligible
- Week: ${TARGET_WEEK}
- Source: GitHub merged PRs for ${TARGET_WEEK}
- List label: contributors-${TARGET_WEEK}
- Entries written (new): ${N_NEW} | deduped: ${N_DEDUP} | total USDC planned: ${TOTAL_USDC}
- First-PR bonuses: [list or "none"]
# --- send phase (present when Phase B ran) ---
- List: ${LABEL} | Token: ${TOKEN}
- Verdict: ${VERDICT}
- Sent: ${total_sent} ${TOKEN} to ${n_success}/${n_attempted}; deduped: ${n_dedup}; unresolved: ${n_unresolved}
- Failures (if any): @x — REASON, @y — REASON
- State file: memory/state/distributions.json (${total_keys} entries)
- Notification sent: yes/no
```

未运行的阶段应省略其对应区块。

## 退出代码（供下游自动化使用）

**计划阶段（阶段 A）：**
- `CONTRIBUTOR_REWARD_OK` — 计划已写入，通知已发送
- `CONTRIBUTOR_REWARD_DRY_RUN` — 计划已渲染，未写入，通知已发送
- `CONTRIBUTOR_REWARD_ALREADY_PROCESSED` — 该周已存在于状态中且计划相同，静默退出
- `CONTRIBUTOR_REWARD_NO_MERGED_PRS` — 目标周内没有合并的 PR，静默退出
- `CONTRIBUTOR_REWARD_API_FAIL` — GitHub API 无法访问（`gh api` + WebFetch 均失败），已发送通知
- `CONTRIBUTOR_REWARD_NO_ELIGIBLE` — 超过阈值的贡献者为零，静默退出
- `CONTRIBUTOR_REWARD_ERROR` — 文件 I/O 或 YAML 写入失败，已发送通知

**发送阶段（阶段 B）：**
- `DISTRIBUTE_TOKENS_OK` — 无需发送任何内容（所有条目均已去重或列表为空），或者为引导初始化
- `DISTRIBUTE_TOKENS_COMPLETE` — 所有 READY 行均已成功
- `DISTRIBUTE_TOKENS_PARTIAL` — 部分成功，部分失败
- `DISTRIBUTE_TOKENS_DRY_RUN` — 试运行已完成，未发送
- `DISTRIBUTE_TOKENS_ERROR` — 预检或配置失败，未尝试发送

对于 `all:`，最终退出代码为发送阶段的代码（如果计划没有生成任何可发送内容，则为阶段 A 的提前退出代码）。

## 网络说明

- **计划阶段 (A)：** 通过 `gh api search/issues` 对贡献者进行排名（`gh` 会在内部处理 GitHub 身份验证，因此任何密钥都不会出现在命令行中）。如果 `gh api` 失败，则回退到对公开 `https://api.github.com/search/issues?q=…` URL 使用 **WebFetch**。还会读取/写入 `memory/state/contributor-reward-state.json`、`memory/distributions.yml`、`memory/logs/${today}.md`。无需后处理脚本。
- **发送阶段 (B)：** 每次 Bankr 调用都需要身份验证，因此请使用带有 `{BANKR_API_KEY}` 占位符的 `./secretcurl` 发起调用——绝不能直接使用 `$BANKR_API_KEY`（Bash 权限层拒绝在命令行中使用密钥），也绝不能使用普通的 `curl`。`/wallet/transfer` 是不可逆的资金转移写操作；它会在执行器的最后一个操作（阶段 B4）中**于运行期间**执行，并由 B2 余额预检以及 `memory/state/distributions.json` 中按收款人设置的幂等性机制提供保障（每次发送后都会持久化，因此重新运行绝不会重复付款）。**不存在**延迟/后处理步骤——失败的转账会被记录（`FAILED` 及其原因），然后继续处理下一行。**绝不能静默丢弃转账。**

## 约束

**发送（资金转移）：**
- **幂等性不容妥协。** 发送前始终读取 `memory/state/distributions.json`；每次转账后始终进行持久化。绝不能将状态写入批量推迟到运行结束时。
- 将 Bankr 的 24 小时速率限制（标准版每天 100 次）视为硬性上限。收款人超过 50 名的列表应拆分处理。
- 如果预检余额 < `total_required * 1.05`，绝不能发送。
- 绝不能使用 Agent API 进行转账（已弃用）。Agent API 仅用于将用户名解析为地址。
- 绝不能因单个有问题的收款人而中止 RESOLVE 阶段——收集所有错误并予以呈现，然后让执行器跳过这些收款人。

**计划（奖励计算）：**
- **幂等性以每个 `(week, login)` 组合为单位。** 同一周内重新运行时仅增加差额；级别下调时绝不追回已支付的金额。
- **首次 PR 奖励对于每个用户名一生仅发放一次。** 在 `first_pr_bonus_paid` 中跟踪；即使同一个人在之后某周再次显示为 ✨，也绝不能重复发放（正常情况下不应发生，因为 ✨ 表示*有史以来第一个*已合并的 PR——但仍需防范 API 数据漂移）。
- **绝不能静默覆盖 distributions.yml。** 如果文件存在但格式错误，应明确报错，而不是重写文件。
- **资格门槛特意保持较低（≥ 1 个已合并 PR）。** 当周有一个 PR 被合并即可获得资格——奖励已交付的工作，而非数量。

## 未来迭代

- 直接按计划运行 `all:`（每周，在当周结束后），实现完全无人值守的奖励发放——计划会根据已合并的 PR 自行计算排名，因此不需要上游 Skill 或链式连接配置。
- 在计划阶段添加 Bankr Agent API 的“钱包是否已关联？”预筛选，以便在通知中标记尚未关联钱包的贡献者（避免发送阶段在每次运行时都记录 RESOLVE_FAILED 行）。
- 首月运行揭示合适的奖励曲线后，应允许操作人员通过 `memory/contributor-reward-config.yml` 配置等级表。v1 版本采用硬编码。