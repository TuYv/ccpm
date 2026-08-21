---
name: fork-fleet
description: Fork divergence monitor - tracks where the fleet's active forks diverge in CODE (unique commits, new/modified skills) and CONFIG (enable/var/model/schedule vs upstream), gated on real change.
metadata:
  category: core
  var: ""
  tags:
    - dev
    - meta
  cron: "0 10 * * 1"
---
> **${var}** — 分歧范围选择器；以空格分隔的标记，顺序无关，均为可选：
> - **范围**（`code` | `config` | `both`，默认为 `both`）— 要运行的分歧维度。
> - **`repo=owner/name`** — 覆盖要扫描其复刻仓库的父仓库（否则自动解析）。
> - **`fork=owner/name`** — 深入分析单个复刻仓库（强制使用 `code` 范围；配置计算需要一个仓库群）。
>
> 留空 ⇒ 对自动解析的父仓库运行**两个**维度。示例：``（两个维度，所有复刻仓库）· `code` · `config` · `config repo=octo/aeon` · `fork=alice/aeon`。

今天是 ${today}。这是仓库群的**分歧监视器**。它回答了热门度/活跃度技能无法回答的两个问题：
1. **代码分歧** — 哪些活跃的复刻仓库正在开展真正的工作（独有提交、新增/修改的技能），值得将其拉回上游？
2. **配置分歧** — 已配置的仓库群在哪些方面系统性地不同意上游的 `enabled` / `var` / `model` / `schedule` 默认值，从而让操作员可以修改仓库群已经投票否决的默认值？

`skill-gap` 按**热门内容**进行排名（按启用数量取前 15 名）。此技能的**代码**分支呈现**每个复刻仓库的独有工作**；其**配置**分支呈现**操作员在哪些方面不同意默认值**。如果已配置的 8 个复刻仓库中有 6 个启用了上游默认关闭的技能，那么上游发布的默认值就是错误的；如果 8 个中有 5 个禁用了上游默认开启的技能，那么该技能就是噪声。两者都是同类学习信号。

## 运行原则

- **结论优先，目录其次。** 操作员只需读一行，就能知道是否需要采取行动。
- **没有任何变化时保持静默。** 每周运行一次却遇上休眠或无分歧的仓库群，会形成一种只读一次便不再关注的习惯。干净运行不发送任何通知。
- **每个复刻仓库的比较只需一次调用，而非三次。** `/compare/{owner}:main...{fork_owner}:main` 在一次往返中返回领先/落后/独有提交/文件；递归 git 树则通过一次调用返回复刻仓库的完整文件列表。
- **实质内容 ≠ 噪声。** 一个新的 `skills/*/SKILL.md` 抵得上 `aeon.yml` 中 100 次 cron 时间编辑。应据此进行评分。在配置方面，未经修改的模板复刻仓库不算“投票”——将其排除在分歧计算之外。

---

## 共享设置（所有范围）

### S0. 引导启动并加载状态

```bash
mkdir -p memory/topics
[ -f memory/instances.json ] || echo '{}' > memory/instances.json
[ -f memory/topics/fork-fleet-state.json ] || echo '{"forks":{},"last_run":null}' > memory/topics/fork-fleet-state.json
[ -f memory/topics/fork-digest-state.json ] || echo '{"last_run":null}' > memory/topics/fork-digest-state.json
```

读取 `memory/MEMORY.md` 以获取高层上下文，并扫描 `memory/logs/` 中最近约 3 天的内容——移除所有已经报告过的内容，避免重复发送每周信号。

- 读取 `memory/instances.json` → 作为**托管实例**的仓库 `full_name` 集合（在报告中与自然形成的社区复刻仓库分开标记）。
- 读取 `memory/topics/fork-fleet-state.json` → 上次运行中按 `full_name` 索引的每个复刻仓库的 `{pushed_at, ahead_by, default_branch, new_skill_count}`。用于**代码**方面的变化增量。
- 读取 `memory/topics/fork-digest-state.json` → 上一次的配置分歧快照（模式见步骤 B8）。用于**配置**方面的逐周增量。

### S1. 解析作用域选择器

将 `${var}` 解析为以下标记：
- `SCOPE` = `code`、`config` 或 `both`（如果没有作用域关键字，则默认为 `both`）。
- `REPO_OVERRIDE` = `repo=owner/name` 标记的值（如果存在）。
- `SINGLE_FORK` = `fork=owner/name` 标记的值（如果存在）。**如果设置了 `SINGLE_FORK`，则强制设为 `SCOPE=code`**（单个复刻仓库的配置差异没有意义——配置计算需要一个包含 ≥2 个已配置复刻仓库的仓库群）。

### S2. 解析父仓库/目标仓库

按以下优先级解析 `PARENT_REPO`：
1. 如果提供了 `repo=` 标记，则使用 `REPO_OVERRIDE`。
2. 否则，从当前运行实例中自动解析：
   ```bash
   PARENT_REPO=$(gh api repos/$(gh repo view --json nameWithOwner -q .nameWithOwner) --jq '.parent.full_name // .full_name')
   ```
3. 否则，回退到 `memory/watched-repos.md` 中第一条非注释、非空的行。

如果均无法解析，则将状态 `FORK_DIVERGENCE_NO_TARGET` 写入 `memory/logs/${today}.md` 并停止（不发送通知）。

```bash
PARENT_NAME="${PARENT_REPO##*/}"
PARENT_OWNER="${PARENT_REPO%%/*}"
PARENT_DEFAULT_BRANCH=$(gh api "repos/${PARENT_REPO}" --jq '.default_branch')
```

### S3. 列出并分类复刻仓库（单次调用，两个分支共享）

执行一次分页列表查询——包含 `default_branch`、`archived`、`disabled`、`pushed_at`、星标数和描述：

```bash
gh api "repos/${PARENT_REPO}/forks" --paginate \
  --jq '[.[] | {full_name, owner: .owner.login, default_branch, pushed_at, pushed_at_epoch: (.pushed_at | fromdateiso8601), stargazers_count, open_issues_count, archived, disabled, description}]'
```

跳过 `archived=true` 或 `disabled=true` 的仓库。保留其余仓库作为复刻仓库总体（`N_TOTAL`）。按活跃时间窗口进行分类：

- **活跃** = `pushed_at` 在过去 30 天内。
- **陈旧** = 30–365 天。
- **休眠** = >365 天，或创建后从未推送。

**活跃**集合（过去 30 天内有推送）是两个分支共享的工作集——这与配置分支原有的 30 天截止条件完全一致。

- **如果设置了 `SINGLE_FORK`：**筛选出该单个复刻仓库，将其视为活跃，并跳过分类计算。
- **如果活跃复刻仓库为零**（且未设置 `SINGLE_FORK`）：两个分支都短路。如果代码侧也没有状态变化（没有新的复刻仓库，且相较于之前的 `fork-fleet-state.json`，没有任何仓库在活跃↔陈旧之间切换），则将状态 `FORK_DIVERGENCE_QUIET` 写入日志，更新状态文件中的 `last_run`，**不发送通知**，然后停止。

每次运行最多对 **50 个**活跃复刻仓库进行深度处理——如果超过此数量，则按 `pushed_at_epoch` 降序排列并截取（记录 `truncated_at=50`）。

现在进行分派：如果 `SCOPE ∈ {code, both}`，则运行**分支 A**；如果 `SCOPE ∈ {config, both}`，则运行**分支 B**。

---

## 分支 A——代码差异（当 `SCOPE ∈ {code, both}` 时运行）

### A1. 逐个比较复刻仓库（每个仓库调用一次）

对于每个活跃复刻仓库，使用该复刻仓库自身的 `default_branch` 和 `full_name` 调用跨仓库比较（可适应任何仓库重命名导致的变化）：

```bash
gh api "repos/${PARENT_REPO}/compare/${PARENT_OWNER}:${PARENT_DEFAULT_BRANCH}...${FORK_OWNER}:${FORK_DEFAULT_BRANCH}" \
  --jq '{ahead_by, behind_by, status, files: [.files[]? | {filename, status, additions, deletions}], commits: [.commits[]? | {sha: .sha[0:7], msg: .commit.message | split("\n")[0], author: .commit.author.name, date: .commit.author.date}]}'
```

遇到 `404`（分支缺失 / fork 已清空）：将该 fork 标记为 `UNREADABLE`，然后继续。
遇到 `429`：休眠 60 秒，重试一次。遇到 `5xx`：休眠 10 秒，重试一次。如果持续失败：将该 fork 标记为 `API_FAIL`。

跨仓库比较可一次性返回 fork 的唯一提交（`commits`）和变更文件（最多 300 个）——无需单独调用 `/commits`。

### A2. 对每个 fork 的分歧信号进行分类

根据 `files` 数组，为每个 fork 添加标签：
- **新技能**：`skills/*/SKILL.md` 下 `status=added` 的文件
- **已修改技能**：`skills/*/SKILL.md` 下 `status=modified` 的文件
- **自定义调度**：对 `aeon.yml` 的任何更改
- **已修改仪表盘**：`apps/dashboard/` 下的任何更改
- **自定义通知**：对 `notify` 或 `notify-jsonrender` 的更改
- **新内容**：`output/articles/` 或 `memory/topics/` 下新增的内容
- **配置更改**：对 `CLAUDE.md`、`.github/`、`bin/` 或根目录 `scripts/` 的更改
- **工作流更改**：`.github/workflows/` 下的更改

### A3. 为每个 fork 评分（按实质性加权）

```
score =  10 × (new skill files)
       +  4 × (modified skill files)
       +  2 × min(unique_commits, 15)
       +  3 × (new content files, capped at 5)
       +  2 × (workflow/config files, capped at 3)
       +  1 × (custom-schedule flag)
       +  1 × stargazers
```

按分数降序排列活跃 fork。将至少有 1 个新技能文件的 fork 标记为 **PROMOTE** 候选；有至少 3 个唯一提交或至少 1 个已修改技能的标记为 **REVIEW**；其余标记为 **NOTE**。

### A4. 深入读取排名靠前的上游候选

对于每个 PROMOTE fork（最多 5 个），从该 fork 的默认分支获取每个唯一技能的 SKILL.md：

```bash
gh api "repos/${FORK_FULL_NAME}/contents/${SKILL_PATH}?ref=${FORK_DEFAULT_BRANCH}" --jq '.content' | base64 -d
```

失败时，回退到文件树列表，并注明“无法读取内容”。将每个唯一技能概括为 1–2 句话，说明其用途。**不要**深入读取 REVIEW 或 NOTE fork（确保输出保持可操作性）。

### A5. 计算周环比变化（代码）

将当前活跃 fork 集合与之前的 `fork-fleet-state.json` 进行比较：
- **NEW_FORK**：之前的状态中不存在该 full_name
- **NEW_ACTIVE**：之前为陈旧/休眠状态，现在为活跃状态
- **WENT_STALE**：之前为活跃状态，现在为陈旧/休眠状态
- **NEW_SKILLS**：在两个快照中均为活跃状态，且 `new_skill_count` 增加
- **GONE**：自上次运行以来已归档 / 删除

### A6. 选择代码结论

一行。优先级顺序：
1. `NEW UPSTREAM CANDIDATE: {fork}` — 如果至少有 1 个 PROMOTE fork 包含至少 1 个先前状态中不存在的新技能
2. `ACTIVE FLEET: {N} forks building` — 如果 PROMOTE 和 REVIEW 合计至少有 3 个
3. `FLEET STIRRING: {N} new active` — 如果至少有 2 个 NEW_FORK 或 NEW_ACTIVE
4. `HOLDING PATTERN: {N} active, no new work` — 存在活跃 fork，但没有任何 fork 达到 REVIEW 标准
5. `DORMANT: no active forks` — 不应触发通知（S3 会将其拦截）；包含此项是为了仅记录日志的路径

### A7. 构建代码分歧文章部分

组装以下区块（它会成为最终部分中合并文章的**第 1 部分**）：

```markdown
## What changed this week
- **New forks**: [list or "none"]
- **Went active**: [list or "none"]
- **New skills landed**: [fork → skill names, or "none"]
- **Went stale**: [list or "none"]
- **Archived/deleted**: [list or "none"]
(Omit the entire section if every bucket is empty.)

## PROMOTE — upstream contribution candidates

### {fork_full_name} — score N [MANAGED | COMMUNITY]
**Activity:** last pushed YYYY-MM-DD · stars N · +N/-M commits vs upstream
**Unique skills:**
- `skills/foo/SKILL.md` — {one-line synthesis of what it does, from deep-read}
- `skills/bar/SKILL.md` — {synthesis}

**Why promote:** {1–2 sentence take — what this skill does that upstream lacks, and whether it's generalizable}
**Suggested action:** Open a PR cherry-picking `skills/foo/` (or reach out to {owner} to upstream themselves).

(Repeat for each PROMOTE fork, capped at 5. If PROMOTE is empty: "No upstream candidates this week.")

## REVIEW — worth a look

| Fork | Score | Ahead | New/Modified | Notable |
|------|-------|-------|--------------|---------|
| owner/repo | N | +N/-M | 0/2 | dashboard rewrite, custom notify |

(Omit if empty.)

## NOTE — low divergence

Terse one-liner per fork: `owner/repo (+N/-M, schedule tweak only)`. Collapse into a count if >5 entries. Omit if empty.

## Fleet vs community

| Category | Count |
|----------|-------|
| Managed instances | N |
| Community forks | N |
| Stale (30-365d) | N |
| Dormant (>365d) | N |

## Code source status
`forks_list=ok|fail · compare_ok=N/M · deep_read=N/M · rate_limit_retries=N · unreadable=N`
```

如果 PROMOTE 中有 >5 个分支，则仅保留评分最高的 5 个；其余列入 REVIEW。

### A8. 更新代码状态

写入 `memory/topics/fork-fleet-state.json`：

```json
{
  "last_run": "${today}",
  "last_status": "FORK_FLEET_OK",
  "parent_repo": "owner/repo",
  "forks": {
    "owner/repo": {
      "pushed_at": "YYYY-MM-DD...",
      "default_branch": "main",
      "ahead_by": N,
      "behind_by": N,
      "new_skill_count": N,
      "score": N,
      "tier": "PROMOTE|REVIEW|NOTE|UNREADABLE|API_FAIL",
      "unique_skills": ["skills/foo/SKILL.md", "..."]
    }
  }
}
```

### A9. 设置代码分支状态

| 状态 | 含义 |
|--------|---------|
| `FORK_FLEET_OK` | 存在活跃分支，并且（PROMOTE/REVIEW 非空或 delta 非空）→ 产生通知信号 |
| `FORK_FLEET_NO_CHANGE` | 存在活跃分支，但没有任何分支达到 REVIEW，且 delta 为空 → 仅记录日志 |
| `FORK_FLEET_QUIET` | 活跃分支为零且状态无变化 → 仅记录日志 |
| `FORK_FLEET_API_FAIL` | 分支列表获取失败，或 >50% 的比较失败 → 错误信号 |

---

## 分支 B — 配置差异（当 `SCOPE ∈ {config, both}` 时运行）

### B1. 获取上游默认配置快照

读取此运行实例的本地 `aeon.yml` 一次。构建以下内容（这些是基线——绝不修改）：

- `UPSTREAM_DEFAULTS`：字典 `{skill_name -> {enabled: bool, model: str|null, var: str, schedule: str|null}}`，包含 `skills:` 下的每个技能条目。
- `UPSTREAM_SKILLS`：来自 `skills/` 的技能目录名称集合（使用 `ls skills/`）。
- `UPSTREAM_TAGS`：字典 `{skill_name -> [tags]}`，从每个 `skills/<name>/SKILL.md` 的 frontmatter 中解析（尽力而为；缺少 frontmatter → `[]`）。

### B2. 逐分支枚举（每个分支调用一次 tree 并获取一次 yml）

对共享步骤 S3 中的**活跃分支集合**进行操作（该集合已筛选为过去 30 天内有推送的分支——这是配置分支原本的截止条件）。对于每个活跃分支，执行**一次**递归 git-tree 调用以枚举文件（比逐路径获取内容成本更低）：

```bash
gh api "repos/${FORK_FULL}/git/trees/HEAD?recursive=1" --jq '[.tree[] | select(.type == "blob") | .path]'
```

然后，仅当 tree 包含 `aeon.yml` 时，获取该分支的 `aeon.yml`：

```bash
gh api "repos/${FORK_FULL}/contents/aeon.yml?ref=${FORK_DEFAULT_BRANCH}" --jq '.content' | base64 -d
```

错误处理：
- 404 / 409（空仓库）：标记 `status: "no_tree"`，跳过 aeon.yml 提取，然后继续。
- 403 且 `X-RateLimit-Remaining: 0`：休眠 60 秒，然后重试一次。如果仍然失败，则标记 `status: "rate_limited"` 并继续。
- tree 包含 aeon.yml，但 contents 调用返回 404：标记 `status: "yml_unreadable"` 并继续。
- aeon.yml 存在，但 YAML 解析失败：标记 `status: "yml_invalid"` 并继续。

对于每个可读取的 `aeon.yml`，提取各技能的 `{enabled, model, var, schedule}`。将缺失的键视为继承上游默认值（**不要**将其计为覆盖项）。

检测**仅分支存在的技能**：分支 tree 中匹配 `skills/<name>/SKILL.md` 的目录名称，其中 `<name>` 不在 `UPSTREAM_SKILLS` 中。为每个此类技能记录 `{fork_full_name, skill_name, path}`。

### B3. 对每个复刻仓库进行分级

计算相对于 `UPSTREAM_DEFAULTS` 的差异信号向量：
- `enabled_diff`：复刻仓库的 `enabled` 与上游不同的技能数量
- `var_overrides`：具有非空 `var:`，且上游对应值为空（或为不同非空值）的技能数量
- `model_overrides`：`model:` 与上游不同的技能数量
- `schedule_overrides`：`schedule:` 与上游不同的技能数量
- `fork_only_skill_count`：步骤 B2 中统计的数量

对复刻仓库进行分级：
- **CONFIGURED**：任意信号 ≥1（该复刻仓库主动产生了差异）
- **TEMPLATE**：aeon.yml 可读取，但所有信号均为 0——不计入差异计算
- **UNREADABLE**：no_tree / 无 aeon.yml / yml_unreadable / yml_invalid / rate_limited——在来源状态页脚中跟踪

令 `N_CONFIGURED` = 分级为 CONFIGURED 的复刻仓库数量。**如果 `N_CONFIGURED < 2`：**配置分支无法产生有意义的差异计算。将配置状态设置为 `FORK_SKILL_DIGEST_TEMPLATE_FLEET`，记录活跃/模板/不可读数量，输出一个简略的第 2 部分并注明转化率，并且**不**产生任何配置通知信号。跳过步骤 B4–B6。

### B4. 聚合差异（核心配置分析）

对于 `UPSTREAM_SKILLS` 中的每个技能名称，计算四个维度：

**启用状态差异：**
- `forks_enabled_count`：此技能为 `enabled: true` 的 CONFIGURED 复刻仓库数量
- `forks_disabled_count`：此技能为 `enabled: false`（显式设置，而非继承）的 CONFIGURED 复刻仓库数量
- `upstream_enabled`：来自 UPSTREAM_DEFAULTS 的布尔值
- `divergence_pct`：
  - 如果上游为 `enabled: false`：`forks_enabled_count / N_CONFIGURED`（有多少复刻仓库通过启用该技能表示不同意见）
  - 如果上游为 `enabled: true`：`forks_disabled_count / N_CONFIGURED`（有多少复刻仓库通过禁用该技能表示不同意见）
- `direction`：`"ENABLE_UPWARD"`（上游关闭，复刻仓库启用）或 `"DISABLE_DOWNWARD"`（上游启用，复刻仓库关闭）

**变量差异：**
- `var_override_count`：`var:` 与上游不同的 CONFIGURED 复刻仓库数量
- `top_var_value`：最常见的非空复刻仓库值（附带数量）——仅当 ≥2 个复刻仓库使用相同值时

**模型差异：**
- `model_override_count`：具有非空且与上游不同的模型的复刻仓库数量
- `top_model_value`：最常见的复刻仓库模型（附带数量）——仅当 ≥2 个复刻仓库使用相同模型时（表示整个仓库群对更便宜/不同的模型形成了共识）

**调度差异：**
- `schedule_override_count`：调度与上游不同的复刻仓库数量
- `top_schedule_value`：最常见的复刻仓库调度（附带数量）——仅当 ≥2 个复刻仓库使用相同调度时

### B5. 对存在差异的技能进行分类

将每个技能归入**至多一个**类别（按以下顺序，第一个匹配项优先）：

- **DEFAULT_FLIP_ENABLE**：`direction == "ENABLE_UPWARD"` 且 `divergence_pct >= 0.50`，并且技能不是 `workflow_dispatch`，也没有 `meta`/`dev` 标签。建议：将上游默认值改为 `enabled: true`。
- **DEFAULT_FLIP_DISABLE**：`direction == "DISABLE_DOWNWARD"` 且 `divergence_pct >= 0.50`。建议：将上游默认值改为 `enabled: false`（整个仓库群正通过投票将其视为噪声）。
- **MODEL_CONSENSUS**：`top_model_value` 非空，且其数量 `>= max(2, ceil(N_CONFIGURED * 0.40))`。建议：将上游模型改为与仓库群使用的模型一致。
- **VAR_HOTSPOT**：`var_override_count >= max(2, ceil(N_CONFIGURED * 0.30))` 且 `top_var_value` 非空。建议：在上游文档中突出说明常用变量值，或将其设为默认值。
- **EMERGING**：`direction == "ENABLE_UPWARD"` 且 `0.25 <= divergence_pct < 0.50`，并且尚未归入默认值翻转类别。将其列入观察名单——仓库群倾向正在形成，但尚未达到多数。
- （其他情况：不分类；如果存在任何非零信号，则仅出现在附录的差异表中）

全零差异的 Skills 将被省略。

### B6. 各 fork 的自定义指纹

对于每个 CONFIGURED fork：
- `total_overrides`：`enabled_diff + var_overrides + model_overrides + schedule_overrides + fork_only_skill_count`
- `category_lean`：字典 `{tag -> count_of_enabled_skills_with_that_tag}`（对于 fork 启用的上游 Skills，使用 UPSTREAM_TAGS；fork 独有的 Skills 计入标签 `"fork-only"`）
- `dominant_category`：计数最多的标签；如果没有任何标签占已启用总数的 40% 以上，则为 `"mixed"`

按 `total_overrides` 降序排列各 fork。前 5 名 = “自定义程度最高的 fork”——展示其主导类别和一句话总结（例如：`"owner/aeon — content-heavy: 14 article/digest skills enabled, 3 model overrides to claude-sonnet-5"`）。该指纹**仅用于描述**——绝不建议对单个 fork 进行更改。

### B7. 配置周环比变化

读取先前的 `memory/topics/fork-digest-state.json` 快照（schema 见 B8）。如果该文件存在且 `last_run` 在过去 14 天内，则计算：
- **NEW_FLIP**：当前位于 DEFAULT_FLIP_* 中、但上次运行时不在其中的 Skills
- **STRENGTHENED**：从 EMERGING 转为 DEFAULT_FLIP_ENABLE 的 Skills
- **FADED**：自上次运行以来离开 flip bucket 的 Skills
- **NEW_FORK_ONLY**：上次运行时不存在的 fork 独有 Skills
- **NEW_HEAVY_CUSTOMIZER**：当前进入指纹前 5 名、但之前不在其中的 fork

如果文件缺失或已过期（>14 天），则将所有变化设为 `"first divergence snapshot"`。

### B8. 选取配置结论并持久化快照

配置结论行，优先采用最有力的单一论断：
1. 存在任何 `DEFAULT_FLIP_ENABLE`：`"${N} forks enable ${skill} (upstream defaults off) — flip the default"`
2. 否则，存在任何 `DEFAULT_FLIP_DISABLE`：`"${N} forks disable ${skill} (upstream defaults on) — fleet is voting it as noise"`
3. 否则，存在任何 `MODEL_CONSENSUS`：`"${N} forks override ${skill} → ${model} — match upstream"`
4. 否则，存在来自变化数据的任何 `NEW_FORK_ONLY`：`"${fork_owner} shipped ${skill} — not in upstream"`
5. 否则，存在任何 `EMERGING`：`"${skill} adoption building (${pct}% of configured) — watchlist"`
6. 否则：`"${N_CONFIGURED} configured forks; no divergence pattern crossed flip threshold"`

持久化 `memory/topics/fork-digest-state.json`（每次运行时覆盖——该 JSON 是变化数据契约；**不要**解析上周的文章）：

```json
{
  "last_run": "${today}",
  "target_repo": "${PARENT_REPO}",
  "n_active": N_ACTIVE,
  "n_configured": N_CONFIGURED,
  "n_template": N_TEMPLATE,
  "n_unreadable": N_UNREADABLE,
  "buckets": {
    "DEFAULT_FLIP_ENABLE": [{"skill": "name", "forks": N, "pct": 0.NN}],
    "DEFAULT_FLIP_DISABLE": [{"skill": "name", "forks": N, "pct": 0.NN}],
    "MODEL_CONSENSUS": [{"skill": "name", "model": "value", "forks": N}],
    "VAR_HOTSPOT": [{"skill": "name", "var": "value", "forks": N}],
    "EMERGING": [{"skill": "name", "pct": 0.NN}]
  },
  "fork_only_skills": [{"fork": "owner/repo", "skill": "name"}],
  "fingerprints": [{"fork": "owner/repo", "total_overrides": N, "dominant_category": "tag"}]
}
```

### B9. 构建配置差异文章部分

组装此区块（它将成为合并后文章的**第 2 部分**）：

```markdown
*Scanned ${N_ACTIVE} active forks of ${PARENT_REPO} (pushed in last 30 days). ${N_CONFIGURED} are configured (aeon.yml diverges from upstream defaults). Divergence scored against the configured ${N_CONFIGURED}.*

## Default-flip candidates

### Enable upward (upstream off → fleet enables)
| Skill | Forks enabled | % of configured | Δ vs last week |
|-------|---------------|-----------------|----------------|
| name  | N             | XX%             | NEW / STRENGTHENED / — |

(Only DEFAULT_FLIP_ENABLE. If empty: "No skills crossed the 50% enable-upward threshold this week.")

### Disable downward (upstream on → fleet disables)
| Skill | Forks disabled | % of configured | Δ vs last week |
|-------|----------------|-----------------|----------------|
| name  | N              | XX%             | NEW / — |

(Only DEFAULT_FLIP_DISABLE. If empty: "No skills crossed the 50% disable-downward threshold.")

## Fleet consensus on alternative settings

### Model overrides
${MODEL_CONSENSUS entries: "skill X — N forks → claude-sonnet-5 (40% of configured)" OR "none this week"}

### Var hotspots
${VAR_HOTSPOT entries: "skill X — N forks set var to '${value}'" OR "none this week"}

### Schedule overrides
${skills where ≥2 forks share an alternative schedule, with the schedule string OR "none this week"}

## Watchlist (emerging — 25–49% adoption)
${EMERGING skills with adoption % OR "none this week"}

## Heaviest customizers (top 5)

| Fork | Total overrides | Dominant category | Notes |
|------|-----------------|-------------------|-------|
| owner/repo | N | content / dev / meta / fork-only / mixed | one-line synthesis |

## Fork-only skills

${list of {fork, skill_name} pairs OR "none this week"}

(These skills exist as `skills/<name>/SKILL.md` in a fork but not in upstream — fork experiments worth reviewing for upstreaming.)

## Config week-over-week

${"First divergence snapshot — no comparison" OR list of NEW_FLIP / STRENGTHENED / FADED / NEW_FORK_ONLY / NEW_HEAVY_CUSTOMIZER}

## Fleet composition (config tiers)

| Tier | Count | % |
|------|-------|---|
| Configured | N_CONFIGURED | XX% |
| Template (untouched aeon.yml) | N_TEMPLATE | XX% |
| Unreadable | N_UNREADABLE | XX% |
| **Total active** | N_ACTIVE | 100% |

## Config source status
- Trees fetched: N_TREES_OK / N_ACTIVE
- aeon.yml readable: (N_CONFIGURED + N_TEMPLATE) / N_ACTIVE
- YAML parse failures: N_YML_INVALID
- Rate-limited: N_RATE_LIMITED
- Fork-only skills inspected: N_FORK_ONLY_FILES

## Appendix — full divergence table

(Every skill with ≥1 non-zero divergence signal, sorted by total override count desc. Columns: skill, enable_diff, var_overrides, model_overrides, schedule_overrides. Cap at 30 rows; if more, append "+ N more skills with low-signal divergence".)
```

### 配置分支状态

| 状态 | 含义 |
|--------|---------|
| `FORK_SKILL_DIGEST_OK` | ≥2 个已配置的分支，并且存在 ≥1 个翻转/共识/新增分支独有信号 → 产生一个通知信号 |
| `FORK_SKILL_DIGEST_QUIET` | ≥2 个已配置的分支，但没有信号达到阈值 → 仅记录日志 |
| `FORK_SKILL_DIGEST_TEMPLATE_FLEET` | 已配置的分支少于 2 个（大多使用模板）→ 仅记录日志 |
| `FORK_SKILL_DIGEST_NO_FORKS` | 活跃分支为零 → 仅记录日志 |

---

## 汇总报告（所有范围）

### R1. 编写合并文章

写入 `output/articles/fork-divergence-${today}.md`。先写标题部分，再写实际运行的部分：

```markdown
# Fork Divergence — ${today}

**Verdict:** {lead with the stronger of the two sub-verdicts — a code PROMOTE/NEW-UPSTREAM-CANDIDATE outranks a config flip only if it's a genuinely new skill; otherwise a DEFAULT_FLIP leads. Use judgment; one line.}

- **Code divergence:** {code verdict from A6, or "not run (scope=config)"}
- **Config divergence:** {config verdict from B8, or "not run (scope=code)"}

Fleet: N_TOTAL total forks · N_ACTIVE active · N_MANAGED managed instances · N_COMMUNITY community.

---

# Part 1 — Code divergence
{Branch A article part from A7; omit this whole part if SCOPE=config}

---

# Part 2 — Config divergence
{Branch B article part from B9; omit this whole part if SCOPE=code}

---
*Source: GitHub API — forks of ${PARENT_REPO}. Code divergence = per-fork unique commits/skills vs upstream. Config divergence = where configured forks' aeon.yml disagrees with upstream `enabled`/`var`/`model`/`schedule`; untouched templates are excluded from the config math. Companion to `skill-gap` (popularity).*
```

将文章总长度限制在约 700 行以内（两个部分都运行时，代码相关章节约占 500 行）。仅运行一个分支时，删除另一个 Part 标题和缺失的子结论行。

### R2. 通知——受条件控制

读取 `soul/`（如果存在）以匹配操作者的表达风格。当两个分支都未产生信号时，**完全跳过通知**，即：
- 代码状态 ∈ {`FORK_FLEET_NO_CHANGE`, `FORK_FLEET_QUIET`}（或代码分支未运行），**并且**
- 配置状态 ∈ {`FORK_SKILL_DIGEST_QUIET`, `FORK_SKILL_DIGEST_TEMPLATE_FLEET`, `FORK_SKILL_DIGEST_NO_FORKS`}（或配置分支未运行）。

如果任一分支遇到 `FORK_FLEET_API_FAIL`，发送一条**错误**通知（`--severity warn`），注明失败情况和来源状态。

否则，通过 `./notify` 发送一条合并消息（仅包含产生信号的分支对应的子区块；保持简洁）：

```
*Fork Divergence — ${today}*
{combined verdict line}

Fleet: N_ACTIVE active / N_TOTAL total. {1 sentence on shape — "mostly managed instances", "community picking up", "template-heavy", etc.}

{If code PROMOTE non-empty:}
Upstream candidate: {top PROMOTE fork}
{2 sentences: what they built, why it's worth merging back}

{If code delta has NEW_SKILLS:}
New skills landed this week:
- {fork} → `skills/foo/SKILL.md` — {synthesis}

{If DEFAULT_FLIP_ENABLE non-empty (top 3):}
Flip enable (upstream off → fleet on):
- {skill} — {N} forks ({pct}%)

{If DEFAULT_FLIP_DISABLE non-empty (top 3):}
Flip disable (upstream on → fleet off):
- {skill} — {N} forks ({pct}%)

{If MODEL_CONSENSUS non-empty (top 2):}
Model consensus:
- {skill} → {model} ({N} forks)

{If config delta NEW_FORK_ONLY non-empty:}
New fork-only skills: {comma-separated owner/skill, capped at 3}

Full report: https://github.com/${GITHUB_REPOSITORY}/blob/main/output/articles/fork-divergence-${today}.md
```

URL 使用 `$GITHUB_REPOSITORY`（文章位于当前运行实例的仓库中，而不是目标仓库中）。

### R3. 日志

在 **一个** 标题下追加到 `memory/logs/${today}.md`。包含一行用于指明本次运行范围的区分信息，然后仅包含已运行分支的子区块：

```
### fork-fleet
- Scope: {both | code | config}  ·  Combined status: {FORK_DIVERGENCE_OK | NO_CHANGE | QUIET | NO_TARGET | API_FAIL}
- Verdict: {combined verdict line}
- Fleet: N_ACTIVE active / N_TOTAL total (N_MANAGED managed, N_COMMUNITY community)

[code]  (only if Branch A ran)
- Code status: {FORK_FLEET_OK | NO_CHANGE | QUIET | API_FAIL}
- PROMOTE: N forks (list), REVIEW: N, NOTE: N
- Code delta: {new_forks:N, new_active:N, new_skills:N, went_stale:N}
- Code source: forks_list=ok|fail · compare_ok=N/M · deep_read=N/M · unreadable=N

[config]  (only if Branch B ran)
- Config status: {FORK_SKILL_DIGEST_OK | QUIET | TEMPLATE_FLEET | NO_FORKS}
- Configured: N (XX% conversion) · Template: N · Unreadable: N
- DEFAULT_FLIP_ENABLE: N · DEFAULT_FLIP_DISABLE: N · MODEL_CONSENSUS: N · VAR_HOTSPOT: N · EMERGING: N
- Fork-only skills: N · Heaviest customizer: {fork} ({N} overrides)

- Article: output/articles/fork-divergence-${today}.md
- Notification sent: yes/no
```

## 退出状态分类（合并）

合并状态汇总各分支的状态（这些状态在上面的 A9 / B-status 中保持原样）：

| 合并状态 | 汇总条件 | 是否通知？ |
|-----------------|---------------|---------|
| `FORK_DIVERGENCE_OK` | code = `FORK_FLEET_OK` **或** config = `FORK_SKILL_DIGEST_OK` | 是 |
| `FORK_DIVERGENCE_NO_CHANGE` | 两个分支均已运行，但都未达到 OK（全部为 `NO_CHANGE`/`QUIET`/`TEMPLATE_FLEET`/`NO_FORKS`） | 否（仅记录日志） |
| `FORK_DIVERGENCE_QUIET` | 活跃 fork 数为零，且代码侧状态未发生变化（S3 短路） | 否（仅记录日志） |
| `FORK_DIVERGENCE_NO_TARGET` | 未解析到父仓库/目标仓库（S2） | 否（仅记录日志） |
| `FORK_DIVERGENCE_API_FAIL` | fork 列表获取失败，或某个分支超过 50% 的 compare/tree 请求失败 | 是（错误通知） |

## 约束

- **跨仓库比较**每个响应最多接受 300 个文件；如果某个 fork 超过此限制，请为其注明 `files_truncated=true` 并继续处理。
- 每次运行对活跃 fork 的深度处理上限为 **50 个**（S3）——按 `pushed_at_epoch` 降序排列并截断，同时记录 `truncated_at=50`。
- 切勿对 `archived=true` 的 fork 深度读取内容，也不要在 compare 的 `files` 列表中不存在 SKILL.md 路径时进行深度读取（成本最低的健全性检查）。
- **绝不要虚构 PROMOTE 候选项**——没有新增 skill 文件的 fork 最多只能归为 REVIEW。
- **配置计算需要分母：**当 `N_CONFIGURED < 2` 时，切勿发送配置信号——没有足够的已配置样本作为基数，差异百分比毫无意义。
- 标记为 `meta` 或 `dev` 的 skill 不计入 `DEFAULT_FLIP_ENABLE`（它们是运维工具——fork 采用率并非成功指标）。它们仍可出现在 MODEL_CONSENSUS、VAR_HOTSPOT 和附录中。
- `schedule: "workflow_dispatch"` 的 skill 不计入**任何一个** flip 分类（按设计即为按需运行——采用百分比会产生误导）。
- `heartbeat` 不计入 `DEFAULT_FLIP_DISABLE`（如果任何 fork 为保持安静而显式禁用它，那么所有继承上游 `enabled: true` 的 fork 都会人为抬高禁用计数）。
- 每个 fork 的指纹仅用于描述——只有聚合信号才能驱动建议。
- 静默运行是**正确行为**，并非失败。此 skill 是 `skill-gap`（流行度）的差异分析配套工具；请避免重复其核心指标——重点关注它未呈现的代码与配置**差异模式**。

## 网络说明

所有 GitHub 调用均使用 `gh api`，它会通过 `GITHUB_TOKEN` 自动进行身份验证——不使用 `curl`，命令行中不出现 `$SECRET`（因此 Bash 权限层不会拒绝任何内容），除默认的 `GITHUB_TOKEN` 外不使用其他密钥。重试策略：遇到 `429`/`5xx`（compare）时，按照步骤 A1 进行退避；遇到 `403` 且 `X-RateLimit-Remaining: 0`（tree/contents）时，休眠 60 秒并重试一次，之后将该复刻标记为 `rate_limited`，并使用不完整的复刻集合继续执行（判定和源状态页脚会显示这一缺口）。如果初始 `/forks` 列表请求在重试后仍失败，则组合状态 = `FORK_DIVERGENCE_API_FAIL`，并设置 `forks_list=fail`。