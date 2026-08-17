---
name: daily-journal
description: A passive daily work journal that Claude keeps FOR you so you never have to write it yourself. Append short entries after meaningful work (what was done, what you focused on, artifacts touched) to 01-daily/journal/YYYY-MM-DD.md. Run a guided reflection at night or in the morning. Use when you run /daily-journal, say "log this to my journal", "add to today's journal", "reflect on today/yesterday", or when finishing a meaningful chunk of work in any session.
---
# 每日日志

## 目的
以**自动、被动**的方式记录你的工作日，让你无需亲自撰写。Claude 会在工作完成时随手记录；之后你可以选择进行复盘。这与 `/daily-checkin` 不同（后者是由你提供输入的手动复盘），在这里，**Claude 是作者**，日志会在后台持续积累。

两种模式：
1. **`log`**（默认，通常隐式调用）——向今天的日志追加一条简短记录。
2. **`reflect`**——读取当天的日志（以及最近几天的日志），并与你一起进行引导式复盘。

## 存储
- 每天一个文件：`01-daily/journal/YYYY-MM-DD.md`（使用 `date +%F` 获取今天的日期；绝不猜测）。
- 在当天首次记录时，使用下方模板创建文件。
- 只能追加，绝不改写之前的记录。最新记录放在 Log 部分的底部。

## 何时记录（行为触发器——适用于任何会话，而不仅限于被调用时）
完成一个**有意义的**工作单元后，追加一条记录。有意义 = 对未来的你有价值，或者能体现当天时间花在了哪里。例如：
- 发布或提交了某项内容，发布了笔记、简报或幻灯片，创建或移动了跟踪系统中的议题（Linear/Jira/GitHub）。
- 做出了决定、改变了方向，或遇到了值得注意的阻碍。
- 产出了可交付文件（规范、计划、分析、报告）。
- 完成了一次实质性的研究或综合整理，并产出了成果。

**不要记录：**琐碎的阅读、单行查询、任务中途的草稿工作、对本日志本身的写入，或你要求排除的任何内容。拿不准时，写一条简洁的记录总比什么都不写好。不要为了宣布正在记录而打断工作流程，只需追加记录并继续。

## 记录格式
追加到 `## Log` 部分下：

```
### HH:MM — <short title of what got done>
- **Focus:** <the thread/project this served, e.g. a product line, a squad, the blog>
- **Did:** <1-3 bullets, concrete, past tense>
- **Artifacts:** <files/PRs/links touched, or "—">
- **Signal:** <optional: decision made, blocker hit, mood/energy if you mentioned it, or omit>
```

保持简洁。时间使用本地 24 小时制（`date +%H:%M`）。遵循 memory/CLAUDE.md 中的约定：不使用长破折号，遵守你的产品命名规则，不要自行编写后续步骤（只记录实际发生的事情，或你明确说过的内容）。

## 每日文件模板（当天首次记录时）
```markdown
---
date: YYYY-MM-DD
type: journal
---

# Journal — YYYY-MM-DD (Weekday)

> Auto-kept by Claude. Reflection appended below when you run it.

## Focus of the day
_Inferred from entries; leave blank until there's signal._

## Log

## Reflection
_Empty until you run `/daily-journal reflect`._
```

## 模式：reflect
通过 `/daily-journal reflect [today|yesterday|YYYY-MM-DD]`（默认为今天）触发；当你说“复盘今天/昨天”或“我们来写日志吧”时也会触发。

1. 读取目标日期的日志文件。如果文件不存在，或 Log 内容太少，应如实说明，并在继续之前询问是否要根据其他信号（`01-daily/briefs/` 中当天的简报、最近的提交、思维倾倒记录）进行还原，但**不得编造**。
2. 读取之前 2 至 3 天的日志文件，以了解连续性信息（反复出现的工作线索、延续下来的阻碍）。
3. 用几行内容向你概述当天情况：主要关注点、已交付的成果、停滞的事项。然后根据日志内容提出 2 至 4 个轻量的复盘问题（例如，“评估工作占用了整个下午，它有取得进展吗？”而不是泛泛的提示）。保持对话自然、轻松无负担；这应当是一件晚上或早晨花 2 分钟就能完成的事。
4. 将你的回答和简短总结写入当天文件的 `## Reflection` 部分。如果 `## Focus of the day` 仍为空，也将其补充完整。
5. 如果复盘揭示了持久有效的信息（某项决定、优先级变化、经验教训），还应按照 Brain-First 协议写入或更新相关的 `05-knowledge/` 笔记或记忆；日志只是短暂的每日上下文，并非持久存储。

## 每周汇总（可选）
如果你要求进行“本周回顾”或每周反思，请读取最近 7 个日志文件，并将主题汇总到 `01-daily/weekly/` 中（沿用其中现有的命名方式）。不要自动执行此操作。

## 约束
- 单文件原则：一天的所有内容都存放在当天的同一个日志文件中。切勿拆分为每条记录一个文件。
- 隐私：个人/1:1 内容仅保留在日志中；绝不泄露到面向团队的简报中。
- 绝不将日志发布到任何外部位置。
- 这是你的私人日志。请直白、诚实地记录；如果当天毫无进展，就如实说明。