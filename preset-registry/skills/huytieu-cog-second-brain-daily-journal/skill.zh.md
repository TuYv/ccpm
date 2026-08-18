---
name: daily-journal
description: A passive daily work journal that Claude keeps FOR you so you never have to write it yourself. Append short entries after meaningful work (what was done, what you focused on, artifacts touched) to 01-daily/journal/YYYY-MM-DD.md. Run a guided reflection at night or in the morning. Use when you run /daily-journal, say "log this to my journal", "add to today's journal", "reflect on today/yesterday", or when finishing a meaningful chunk of work in any session.
---
# 每日日志

## 目的
**自动、被动地**记录你的工作日，这样你无需亲自撰写日志。Claude 会在工作发生时记录完成的事项；之后你可以选择运行一次回顾。这与 `/weekly-checkin` 不同（后者是由你提供输入的手动回顾），而这里是 **Claude 作为作者**，日志在后台持续累积。

两种模式：
1. **`log`**（默认，通常隐式调用）— 向当天的日志追加一条简短记录。
2. **`reflect`** — 阅读当天的日志（以及最近几天的日志），与你一起进行引导式回顾。

## 存储
- 每天一个文件：`01-daily/journal/YYYY-MM-DD.md`（使用 `date +%F` 获取当天日期；绝不要猜测）。
- 当天第一次记录时，根据下面的模板创建文件。
- 只追加，不要重写之前的记录。最新记录放在 Log 部分的底部。

## 记录时机（始终应用触发器的流程）
触发器本身位于 `CLAUDE.md` § Daily Journal（ALWAYS APPLY）中，因为 skill 正文是延迟加载的，无法自行触发。本节是该触发器运行时遵循的流程。

完成一个**有意义的**工作单元后，追加一条记录。有意义 = 对未来的你有帮助，或能体现这一天是如何度过的。例如：
- 发布/提交了某项成果，发布了笔记/简报/幻灯片，创建或移动了跟踪事项（Linear/Jira/GitHub）。
- 做出了决策，改变了方向，或遇到了值得注意的阻碍。
- 产出了交付文件（规格说明、计划、分析、报告）。
- 进行了一次实质性的研究/综合，并产出了成果。

**不要记录：**琐碎的阅读、单行查询、任务中途的草稿工作、这份日志本身的写入，或任何你要求排除的内容。如有疑问，简洁地记录一行总比不记录好。不要打断工作流程来宣布正在记录，只需追加后继续。

## 条目格式
追加到 `## Log` 部分下：

```text
### HH:MM — <short title of what got done>
- **Focus:** <the thread/project this served, e.g. a product line, a squad, the blog>
- **Did:** <1-3 bullets, concrete, past tense>
- **Artifacts:** <files/PRs/links touched, or "—">
- **Signal:** <optional: decision made, blocker hit, mood/energy if you mentioned it, or omit>
```

保持简洁。时间使用 24 小时制本地时间（`date +%H:%M`）。遵循 memory/CLAUDE.md 中的约定：不要使用 em dash，遵循你的产品命名规则，不要自行撰写后续步骤（只记录实际发生的事情，或你明确说过的内容）。

## 每日文件模板（当天第一次记录时）
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
由 `/daily-journal reflect [today|yesterday|YYYY-MM-DD]` 触发（默认为今天），或者当你说“回顾今天/昨天”或“我们来做日志吧”时触发。

1. 读取目标日期的日志文件。如果文件不存在或 Log 内容过少，说明这一点，并在继续之前提出可以根据其他信号进行重建（当天在 `01-daily/briefs/` 中的简报、最近的提交、脑暴记录）；但**不要捏造内容**。
2. 读取之前 2-3 天的日志，以保持连续性（反复出现的主题、延续下来的阻碍）。
3. 用几行话向你总结这一天：主要关注点、完成发布的内容、停滞的事项。然后根据日志内容提出 2-4 个轻量的回顾问题（例如：“评估工作占用了整个下午，它有进展吗？”而不是泛泛的问题）。保持对话自然、低负担；这是为了在晚上或早上用 2 分钟完成的回顾。
4. 将你的回答和简短总结写入当天文件的 `## Reflection` 部分。如果 `## Focus of the day` 仍为空，则填写该部分。
5. 如果回顾中发现了持久性事实（某项决策、优先级变化、经验教训），还要根据 Brain-First 协议写入/更新相关的 `05-knowledge/` 笔记或一条记忆；日志是短暂的每日上下文，不是持久化存储。

## 每周汇总（可选）
如果你要求进行“一周回顾”或进行每周反思，请读取最近 7 个日志文件，并将主题综合到 `01-daily/weekly/` 中（遵循其中现有的命名方式）。不要自动运行此操作。

## 防护措施
- 单文件原则：一天的所有内容都记录在同一个日志文件中。绝不要拆分成逐条记录的文件。
- 隐私：个人内容或 1:1 内容只能保留在日志中；绝不能泄露到面向团队的简报中。
- 绝不要将日志发布到任何外部位置。
- 这是你的私人日志。直白且诚实地记录；如果这一天停滞不前，就如实说明。