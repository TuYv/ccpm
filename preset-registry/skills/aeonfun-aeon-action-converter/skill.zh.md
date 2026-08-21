---
name: action-converter
description: 5 concrete real-life actions, leverage-scored against open loops with specificity and anti-fluff gates
metadata:
  title: Action Converter
  category: basics
  var: ""
  tags:
    - meta
---
<!-- autoresearch: 变体 B — 通过具体性门槛、杠杆评分、禁用短语检查、开放循环锚定、空状态分类获得更精准的输出 -->

> **${var}** — 可选的重点领域（例如 `health`、`networking`、`learning`、`shipping`、`crypto`、`repo`）。如果为空，则涵盖所有领域。将其视为平局时的决胜因素，而非硬性筛选条件。

读取 `memory/MEMORY.md`，了解已声明的目标、"Next Priorities"、已跟踪事项和当前主题。
读取 `memory/logs/` 中最近 7 天的内容，了解近期活动、模式，以及已经建议或完成的事项。
读取 `memory/topics/`（其中的每个文件），了解活跃的工作线索。
读取 `memory/cron-state.json`，了解失败或卡住的技能。
读取 `memory/watched-repos.md`，了解正在关注的仓库。
读取 `output/articles/`（最近 7 天，仅查看文件名——浏览最近的 2 个文件以了解主题）。
如果 `soul/SOUL.md` 存在，则读取它以了解身份、语气和重点领域。
运行 `gh pr list --state open --limit 20 --json number,title,createdAt,isDraft,reviewDecision,headRefName 2>/dev/null` 以获取开放的 PR（用于锚定 "ship" / "review" / "merge" 循环）。

**优雅引导** — 在冷启动时，上述读取目标都可能缺失。对于每个来源，如果文件/目录缺失或为空（包括 `memory/topics/*.md`、`memory/cron-state.json`，以及 `gh pr list` 返回空结果或出错），则跳过它，并在本次运行的工作笔记中记录 `BOOTSTRAP: <resource> not yet populated`。使用现有的任何信号继续执行——该技能必须优雅降级，绝不能失败。如果所有来源均为空，则转入下方的 `ACTION_CONVERTER_NO_CONTEXT` 模式。

## 步骤

### 1. 检测模式

根据上下文量决定本次运行将采用哪种退出模式：

- **ACTION_CONVERTER_NO_CONTEXT** — 如果 `memory/logs/` 中有 0 条记录，并且 `memory/MEMORY.md` 是未经修改的模板（同时匹配 "*Last consolidated: never*" 和 "Configure notification channels"）。通知操作员并停止——不要凭空编造行动。
- **ACTION_CONVERTER_BOOTSTRAP** — 如果 `memory/logs/` 在最近 14 天内涵盖的不同日期少于 3 个，或者 `memory/MEMORY.md` 的 "Next Priorities" 仍包含模板条目（"Configure notification channels"、"Run first digest"）。将行动池切换为完成设置的行动：在 `aeon.yml` 中启用具体技能、配置缺失的通知密钥、运行首次摘要、为第一个跟踪线索填充 `memory/topics/` 等。这些仍然必须是真实、明确、可完成的行动——而不是泛泛的上手建议。
- **ACTION_CONVERTER_OK** — 其他情况。使用下方完整的杠杆评分循环管线。

### 2. 提取开放循环

根据上述所有来源，构建一个去重后的具名开放循环列表。循环是一个具体的进行中事项，而非某个领域。每个循环至少包含：`id`（短 slug）、`text`（一个短语）、`source`（来源）、`age_days`、`urgency_signal`（deadline / blocker / stalled / fresh）。

需要挖掘的来源：
- **开放的 PR** — `gh pr list` 返回的每个条目。循环文本：`PR #N: <title>`；如果创建时间超过 3 天或 review_decision 为 REQUEST_CHANGES，则紧急程度为 `stalled`。
- **MEMORY.md 的 "Next Priorities"** — 每个项目符号条目都转换为一个循环。跳过模板行。
- **`memory/topics/*.md`** — 对于每个主题文件，扫描看起来像进行中工作的标题或项目符号条目（TODO、WIP、"In progress"、"Tracking"、以问号结尾的内容、最近 30 天内的带日期事项）。
- **`memory/cron-state.json`** — 每个 `consecutive_failures > 0` 或 `last_status != success` 的技能都转换为一个循环：`fix <skill>`。如果 consecutive_failures ≥ 3，则紧急程度为 `blocker`。
- **近期日志（最近 7 天）** — 任何以 `?` 结尾、包含 "blocked"、"next:"、"todo"、"follow-up"、"unfinished" 的行，或提及被推迟决策的行。
- **近期文章（最近 7 天）** — 如果 `syndicate-article` 已启用，则每篇新文章都会开启一个分发/联合发布循环（"syndicate <slug>"）；如果可能存在流量，则还会开启一个反馈循环（"respond to comments on <slug>"）。
- **${var}** — 如果已设置，则添加一个合成循环 "advance ${var}"，从而确保至少有一个行动与所请求的重点领域相关。

按 `text` 中的相似性去重。将循环事项列表限制在 25 项以内。

### 3. 为循环事项评分

从三个维度对每个循环事项进行 1–5 分评分。总分 = 杠杆效应 × 紧迫性 × 具体程度。

| 维度 | 1 | 3 | 5 |
|---|---|---|---|
| **杠杆效应** | 个人日常事务 | 有用但影响范围有限 | 能解除他人的阻碍、产出可交付成果或产生复利效应 |
| **紧迫性** | 有则更好 | 本周 | 今天（截止日期 / 阻塞项 / 热门循环事项停滞超过 5 天） |
| **具体程度** | “思考 X” | 形式已知，但没有草稿 | 下一步是一个明确命名的行动 |

从候选池中移除所有得分 <8 的循环事项。如果设置了 `${var}`，则为涉及该领域的循环事项增加 0.5 分杠杆效应评分。

### 4. 将循环事项转化为行动

从排名最高的循环事项开始，将其转化为行动，直到获得 5 个不同的行动。每个行动都必须满足以下约束：

1. **具体性门槛** — 必须至少明确指出以下一项：文件路径、PR 编号、人员/账号、项目/仓库、工具/CLI 命令、URL、MEMORY.md 中跟踪的实体。泛泛的“联系人” / “回顾你的目标” / “探索机会”无法通过此门槛。
2. **禁用短语检查** — 拒绝任何 `action` 文本中包含以下内容的行动：`go for a walk`、`drink water`、`take a break`、`reflect`、`journal`、`meditate`、`brainstorm`、`review your`、`think about`、`consider`、`look into`、`explore opportunities`、`reach out to people`、`network with`、`clean up your inbox`、`organize your`、`plan tomorrow`、`do some reading`、`check social media`。这些都是凑数内容，而不是行动。
3. **时间估算** — 必须能在 ≤2 小时内完成；优先选择需要 30–60 分钟的行动。
4. **完成定义** — 一个可观察的检查项。“已创建 PR” / “已推送提交” / “已向 <handle> 发送消息” / “文档中包含 X 章节，且其中有 ≥3 项”。不能是“感觉更好”或“思路更清晰”。
5. **反模板（14 天新颖性检查）** — 对于每个候选行动，提取动词 + 核心名词。如果过去 14 天内的任何 `memory/logs/*.md` 中出现相同的动词+名词组合，则拒绝该行动。（不同动词+相同名词没问题——只有该二元组合会造成阻断。）
6. **在下方的 1–5 分质量量表中得分 ≥4**。任何得分 <4 的行动都应被移除，并用队列中的下一个循环事项替换。

质量 1–5 分：1 = 凑数内容，2 = 模糊，3 = 具体但杠杆效应低，4 = 具体 + 与真实循环事项相关，5 = 具体 + 杠杆效应高 + 今天就能明显推动项目进展。

如果循环事项列表耗尽后，仍不足 5 个符合要求的行动，则使用**下方类别池**补足，但只能使用通过上述所有门槛的类别特定候选项。类别仅作为后备方案，而不是检查清单：
- **构建** — 针对明确命名的文件/PR 进行发布、编写、创建、部署、修复、制作原型、重构
- **连接** — 就某个明确命名的主题私信/回复/引用某个*明确命名的*账号；在某个*明确命名的* PR/issue 下发表评论
- **学习** — 阅读一篇*明确命名的*论文/文档/仓库，并将包含 5 条要点的总结写入 `memory/topics/`
- **健康/精力** — 仅限与明确命名、新颖且未被禁用的行动相关时（很少使用；通常跳过）
- **资金** — 明确指出交易对手的具体营收/融资/交易步骤
- **观点表达** — 围绕某个*明确命名的*主张撰写一条*明确命名的*推文/cast/帖子
- **探索** — 与本周日志中某个明确命名的外部信号相关的横向行动

即使使用类别池仍无法凑足 5 个，也应减少输出数量（3 或 4 个），并在通知中标记 `ACTION_CONVERTER_THIN`——不要用低质量行动凑数。

### 5. 组织输出

构建一行**今日态势**：不超过 14 个词，概括 5 个行动的主导主题（“提交 2 个 PR、解除失败 skill 的阻塞、分发昨天的文章”——而不是“今天要高效工作”）。这将作为导语。

先按质量分数降序排列 5 个行动，再按紧迫性降序排列。

### 6. 通过 `./notify` 发送

使用以下确切格式（`./notify` 会按渠道渲染 Markdown——只需保持内容整洁）：

```
*5 Actions — ${today}*
Shape: <today's shape line>

1. <action — one imperative sentence, names a specific entity>
why: <≤18 words, what makes this leverage today, names a specific signal>
done: <one observable check>
loop: <loop id or "category:<name>" if filled from pool>

2. <action>
why: <…>
done: <…>
loop: <…>

3. <action>
why: <…>
done: <…>
loop: <…>

4. <action>
why: <…>
done: <…>
loop: <…>

5. <action>
why: <…>
done: <…>
loop: <…>

sources: memory=<lines> logs=<days> topics=<files> prs=<open> cron_failing=<n> mode=<OK|BOOTSTRAP|THIN>
```

通知规则：
- 删除任何无法避免含糊其辞地写出 `done:` 行的行动。
- 如果模式为 `ACTION_CONVERTER_NO_CONTEXT`，则完全跳过行动列表，并发送通知：`*Action Converter — no context yet*`，再加一行指引（“填充 memory/MEMORY.md，或运行一个 skill 为 memory/logs/ 生成初始内容”）。
- 如果模式为 `ACTION_CONVERTER_BOOTSTRAP`，则在态势行前加上 `Bootstrap mode: `，并从设置完成池中提取所有行动。

### 7. 记录到 `memory/logs/${today}.md`

追加：
```
### action-converter
- **Mode:** OK | BOOTSTRAP | THIN | NO_CONTEXT
- **Focus:** <var or "general">
- **Shape:** <today's shape line>
- **Actions:** N (quality avg <x.x>/5)
- **Loops anchored:** <list of loop ids surfaced>
- **Loops carried over:** <list of high-score loops not chosen, for tomorrow>
- **Notification sent:** yes
```

在日志中将循环延续到后续运行，是实现 14 天新颖性检查的基础，也能让下一次运行看到哪些事项已被推迟。

## 网络说明

`gh pr list` 可通过 `gh` CLI 在 GitHub Actions 运行中工作（其内部会处理身份验证，因此不会有令牌出现在命令行中）。如果 `gh` 不可用或返回空结果，则将开放 PR 循环源视为 `prs=0` 并继续——不要阻塞整个运行。

不需要出站 HTTP。所有输入均来自本地文件和 `gh`。无需新增环境变量。