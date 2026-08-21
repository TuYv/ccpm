---
name: idea-pipeline
description: Execution-gap audit - cross-references the startup idea backlog against shipped skills, prototypes, and cross-repo PRs, surfacing the top 3 ideas to build next by narrative and operator fit.
metadata:
  category: productivity
  var: ""
  tags:
    - meta
    - creative
---
> **${var}** — 可选的主题筛选器（例如 "crypto"、"AI agents"、"consumer"）。如果为空，则扫描所有创意。`pick:<id|name>` 值（来自“接下来构建哪个？”强制回复——例如 `pick:2` 或 `pick:Onchain reputation`）则会将该创意标记为待办列表中已选定构建的创意，并直接结束，跳过审查——参见步骤 0。

今天是 ${today}。开始前请阅读 `memory/MEMORY.md`。如果 `soul/SOUL.md` + `soul/STYLE.md` 存在且包含内容，请阅读它们，以此作为“操作者契合度”评分的依据；否则，仅根据创意的一般可构建性和时机进行评分。

## 此技能的用途

`idea-validator` 负责评估创意，但没有任何机制跟踪执行情况。数十个创意会在待办列表中不断积累——有些已经验证，大多数尚未筛选——却完全看不出哪些已付诸行动，哪些正在搁置腐烂。此技能提供了这一视图：管道规模、执行率，以及当前最接近可构建状态的 3 个创意。

## 步骤

### 0. 强制回复拦截 — `pick:<idea>`（最先运行，先于其他任何操作）

在执行任何其他工作之前，检查 `${var}`。如果它**以 `pick:` 开头**，则本次运行表示操作者正在回答“接下来构建哪个创意？”的强制回复——**不要**运行常规审查。处理后结束：

1. 移除前缀：`sel="${var#pick:}"`，然后去除首尾空白。剩余内容可能包含冒号或空格——请保留它们。
2. 如果 `sel` 为空，发送一条普通的再次询问（不使用强制回复），然后结束：`./notify "Which idea should I mark as next to build? Reply with its name or backlog number."`
3. 读取共享待办列表 `memory/topics/startup-ideas.md`。如果该文件不存在或没有创意行，则执行 `./notify "No idea backlog yet — nothing to mark. Run idea-forge generate to fill it first."`，然后结束。
4. 将 `sel` 解析为表格中唯一的一行创意（列为 `| date | name | one-liner | fit | T+F+E |`）：
   - **按名称（首选）：** 对 `name` 单元格进行不区分大小写的精确匹配；若无精确匹配，则进行模糊匹配——选择名称与 `sel` 共享最多重要词语的行，或选择 `sel` 是名称子字符串（或名称是 `sel` 子字符串）的行。必须有一个明确的最佳匹配。
   - **按编号：** 如果 `sel` 是一个单独的整数 N，且没有名称匹配，则取第 N 个数据行（从 1 开始，按文件中的顺序）。
   - 如果没有任何匹配，或有两行并列且没有明确的优胜者，则发送一条普通的再次询问，列出 3–5 个候选名称，然后结束：`./notify "Couldn't find an idea matching \"<sel>\". Reply with the exact name or backlog number. Candidates: <name1>, <name2>, <name3>."`
5. **将其标记为已选定构建**——使用共享的标记约定（与 idea-forge 中相同）：在该行的 `name` 单元格末尾追加 ` ✓ selected ${today}`，并保持表格竖线完整无损。如果该单元格已经带有 `✓ selected` 标记，则保持不变（幂等）——它已经进入队列。
6. 使用简短的 `./notify` 进行确认（保持内容简洁——不得包含 `test`/`trace`/`ping`/`debug` 子字符串）：`./notify "Marked \"<idea name>\" as next to build — flagged in the backlog. Run /feature or /deploy-prototype on it when you're ready."` 不要自动调度任何技能——标记为已选定才是安全的操作。
7. 在 `memory/logs/${today}.md` 的 `### idea-pipeline` 标题下记录：`- IDEA_PIPELINE_PICK: marked "<idea name>" as chosen-to-build (from a pick: reply)`。
8. **结束本次运行。** 不要继续执行步骤 1，也不要运行审查。

### 1. 加载创意积压列表

读取 `memory/topics/startup-ideas.md`。如果该文件不存在，记录 `IDEA_PIPELINE_SKIP: no backlog at memory/topics/startup-ideas.md` 并停止——没有任何内容需要审查。

解析创意表格：提取每个创意的名称、单行简介、类别/垂直领域和添加日期。总数 = N_total。

### 2. 加载筛选结果

读取 `memory/topics/startup-ideas-screened.md`（如果缺失则创建——仅包含空表头）。

提取已筛选的创意。N_screened = 行数。

从已筛选的创意中，标记 `viability >= 9`（高潜力）的创意。这些是优先推进的项目。

### 3. 检查执行情况——已经构建了什么

**扫描 skills 目录：**
```bash
ls skills/
```
收集 skill 目录名称列表。这些是智能体领域中“已执行的创意”。

**扫描操作者及其机器人账号在各代码仓库中的 PR。** 如果存在，读取 `memory/topics/git-identities.md`（操作者定义的待扫描 GitHub 用户名列表）。如果未配置列表，则回退使用工作流的 `GITHUB_ACTOR`。

```bash
gh pr list --author ${USERNAME} --state merged --limit 30 --json title,url,mergedAt
```

**扫描已部署的原型：** 如果 `memory/topics/prototypes.md` 或 `memory/topics/vercel.md` 存在，则读取相应文件。将任何标记为原型/MVP 的项目视为已交付的创意。

**扫描近期构建：** 读取 `memory/logs/` 中最近 14 天的内容，并收集所有 `BUILD_SKILL_OK`、`CREATE_SKILL_OK` 或 `DEPLOY_PROTOTYPE_OK` 条目。

### 4. 交叉核对：创意与执行情况

对于完整积压列表中的每个创意：
- 检查是否有任何 skill 名称或 PR 标题包含该创意名称/单行简介中的关键词（模糊关键词匹配——至少有 2 个重要单词重合，或者明确体现了核心概念）
- 分类为：`executed`（找到明确匹配项）或 `unexecuted`

N_executed = 有明确匹配项的创意数量。
N_gap = N_total − N_executed。

### 5. 加载叙事背景

如果存在，读取 `memory/topics/market-context.md`，获取当前叙事关键词（热门代币、技术主题、监管信号）。

读取最近 3 天的日志，查找任何叙事信号。

汇总一份包含 8–12 个活跃叙事关键词的列表（例如“智能体支付”“RWA”“预测市场”“隐私币”）。如果不存在市场背景来源，则从最近的 `digest`、`hacker-news` 或 `github-trending` 输出中推导关键词。

### 5b. 加载构建者生态信号

如果 `memory/topics/ecosystem.md` 存在，则读取该文件（由 `builder-map` 写入）。这是第二路信息流——“谁正在采用受关注的技术栈”会成为创意素材。

提取以下两项：

- **服务不足的类别**——生态图谱中只有 0 或 1 个已知构建者的构建者类别。例如：没有任何条目的“social-sim”意味着存在开发模拟原型的机会。
- **相邻垂直领域**——存在活跃构建者的非显而易见垂直领域。已经实现跨界的垂直领域能够表明该技术栈适合向哪些方向扩展。

汇总：
- `underserved_categories`——包含 2–5 个构建者覆盖较少的类别
- `adjacent_verticals`——包含 2–4 个存在活跃构建者的非显而易见垂直领域

如果 `memory/topics/ecosystem.md` 尚不存在，请跳过此步骤，并在第 10 步中记录 `idea_pipeline: ecosystem_feed=unavailable`。不要阻塞本次运行。

### 6. 为尚未执行的想法计算“本周构建”评分

对于每个 UNEXECUTED 想法，计算优先级评分：

```
priority = narrative_fit + operator_fit_estimated + recency_bonus + ecosystem_gap_bonus

narrative_fit:          0–4 (count of active narrative keywords that appear in idea name/one-liner/category; cap at 4)
operator_fit_estimated: 0–2 — read `soul/SOUL.md` if present; +2 if the idea matches the operator's stated themes, +1 if it's solo-buildable AND adjacent to current work, 0 otherwise. If no soul file, score 0 here and let other factors decide.
recency_bonus:          2 if added in last 14 days; 1 if last 30 days; 0 otherwise
ecosystem_gap_bonus:    3 if idea's category matches an `underserved_category` from step 5b; 2 if it matches an `adjacent_vertical`; 0 otherwise
```

评分相同时的优先顺序：填补服务不足类别空白的想法 > 命中热门叙事的想法。生态系统信号是结构性的（技术栈的发展方向）；叙事则会轮换。

如果 `${var}` 已设置，还需进一步筛选，仅保留类别/文本与 `${var}` 匹配的想法。

按降序排列。选取前 3 个。对于每个入选想法，如果 `ecosystem_gap_bonus > 0`，请在第 7 步的 `Why now:` 行中明确指出生态系统信号（例如“该技术栈中尚无构建者涉足此类别”或“相邻垂直领域采用曲线”）。

### 7. 格式化并写入报告

写入 `output/articles/idea-pipeline-${today}.md`：

```markdown
# Idea Pipeline — ${today}

**Total ideas:** N_total | **Screened:** N_screened | **Executed:** N_executed | **Gap:** N_gap

## Build This Week

### 1. [Idea Name]
**One-liner:** [one-liner from backlog]
**Why now:** [1–2 sentences connecting to active narratives or ecosystem signal]
**Operator fit:** [why this fits the operator's stack/worldview — derived from soul/SOUL.md if present, otherwise the idea's general buildability]
**Execution path:** [one sentence on fastest way to build — skill, prototype, or external PR]

### 2. [Idea Name]
...

### 3. [Idea Name]
...

## Execution Log
Ideas already shipped (skill/prototype/PR match found):
- [executed idea] → [matching skill name or PR URL]
- ...

## High-Potential Unscreened
Top 3 ideas not yet screened by idea-validator that look most promising by keyword signal alone:
- [idea] — [one-liner]
- ...

---
*Source: memory/topics/startup-ideas.md | Generated by idea-pipeline*
```

### 8. 决定是否通知

始终发送通知。

### 9. 格式化并发送通知

写入 `.pending-notify-temp/idea-pipeline-${today}.md`（如有需要则创建目录），然后执行：

```bash
mkdir -p .pending-notify-temp
./notify -f .pending-notify-temp/idea-pipeline-${today}.md
```

**通知格式** — 如果 soul 文件中已填充内容，则匹配操作者的表达风格；否则使用直接、中性的语气：

```
idea pipeline — ${today}

${N_total} ideas. ${N_screened} screened. ${N_executed} executed. ${N_gap} waiting.

build this week:

1. [Idea Name] — [one-liner]
   why now: [1 sentence on timing/narrative fit]
   path: [skill / prototype / external-PR in ~N days]

2. [Idea Name] — [one-liner]
   why now: [1 sentence]
   path: [...]

3. [Idea Name] — [one-liner]
   why now: [1 sentence]
   path: [...]
```

保持在 3000 个字符以内。

### 9b. 提供“接下来构建哪个？”后续提示（强制回复）

如果在“本周构建”下提出了**至少一个**想法，则为操作员提供一种一键选择要构建哪个想法的方式——在摘要之后通过**单独的** `./notify` 发送（摘要和强制回复提示不能共用一条 Telegram 消息）。如果本次运行没有提出任何候选项，则完全跳过此提示。

去重以确保每天最多一次：扫描 `memory/logs/` 过去约 2 天的内容，查找 `FORCE_REPLY_OFFERED: idea-pipeline::pick`；如果存在，则跳过此提示。否则发送：

```bash
./notify "Which of these should I mark as next to build? Reply with the idea's number or name." \
  --force-reply --placeholder "idea # or name" \
  --context "idea-pipeline::pick"
```

然后在步骤 10 中记录 `FORCE_REPLY_OFFERED: idea-pipeline::pick` 标记。`pick:` 回复会路由回此技能，并由步骤 0 处理。

### 10. 记录到记忆

追加到 `memory/logs/${today}.md`：

```markdown
### idea-pipeline
- **Total ideas:** N_total
- **Screened:** N_screened (by idea-validator)
- **Executed:** N_executed (skill/prototype/PR match)
- **Gap:** N_gap unexecuted ideas
- **Top pick:** [idea name] — [priority score]
- **Ecosystem feed:** [available / unavailable] — [N underserved categories, M adjacent verticals] (from builder-map ecosystem.md, last run [date])
- **Filter:** [var value or "none"]
- **Notification:** sent
- **Force-reply offer:** [offered / skipped — already offered in last 2 days / skipped — no picks]
- FORCE_REPLY_OFFERED: idea-pipeline::pick   ← include this exact line ONLY when the offer was actually sent (it's the once/day dedup marker)
- IDEA_PIPELINE_OK
```

## 必需的环境变量

无。使用本地文件读取和 `gh` CLI（在工作流中通过 GITHUB_TOKEN 完成身份验证）。

## 网络说明

主逻辑中不进行外部网络调用。`gh pr list` 使用 `gh` CLI，由其在内部处理身份验证（无需使用 curl + token 模式）。不需要 WebSearch——如果 `market-context` 技能已填充 `memory/topics/market-context.md`，叙述性上下文将从该文件获取。