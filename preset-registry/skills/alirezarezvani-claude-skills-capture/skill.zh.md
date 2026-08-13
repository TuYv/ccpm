---
name: capture
description: "Captures and organizes chaotic brain dumps into a structured, actionable system with zero information loss. Use this skill whenever the user says 'capture this', 'brain dump', 'let me dump some ideas', 'I've got a bunch of thoughts', 'here's everything on my mind', 'idea dump', 'let me get this out of my head', 'I need to organize my thoughts', 'here's what I'm thinking', or any variation where someone is unloading a messy stream of ideas, tasks, thoughts, and plans wanting them turned into something coherent. Also trigger when the user pastes or dictates a long, unstructured block of mixed ideas — even without the exact phrase — the intent is the same. Fast-to-action by design: no upfront intake. Output is four sections (Projects/Ideas, Tasks, Connections, How I Can Help) ending with a directive question. Asks at most one mid-organization clarifying question when a single item is genuinely ambiguous between task and project."
license: MIT
metadata:
  source_spec: "megaprompts/05-capture-megaprompt.md"
  build_pattern: "Path B (direct conversion)"
  version: 1.0.0
---
# Capture——思绪倾倒整理器

一项可快速付诸行动的技能，能将由各种想法、任务和点子混杂而成的非结构化信息流，转化为一个清晰、包含四个部分且可执行的系统，同时确保信息零损失。

## 调用触发条件

**明确表述**（以下任意一种）：
- “思绪倾倒”
- “记录一下这个”
- “让我把一些点子都倒出来”
- “我有一大堆想法”
- “这些就是我脑子里的所有事情”
- “点子倾倒”
- “让我先把这些东西都从脑子里倒出来”
- “我需要整理一下思绪”
- “这是我现在的想法”

**隐含信号**（没有明确表述，但意图非常明显）：
- 用户粘贴或口述了一大段非结构化内容，其中混杂着想法、任务和计划
- 一条消息中包含多个互不相关的想法，且没有任何组织框架
- 一大段类似项目符号列表的文本，涵盖 3 个以上互不相关的主题

当你检测到隐含触发条件时，运行该技能。不要先问“你想让我整理一下吗？”——这段倾倒本身**就是**请求。

## 操作原则（五项始终全部适用）

1. **捕获所有内容。** 信息零损失。再琐碎的事项也要纳入；之后由用户自行删减。绝不要因为某项内容“看起来不重要”就悄悄将其丢弃。
2. **保留原有语气。** 如果用户说“用 AI 搞个超疯狂的东西”，不要改述为“探索由 AI 驱动的创新解决方案”。保留原有的感染力和随意语域。具体的反面示例参见 `references/voice_preservation.md`。
3. **让输出复杂度与输入相匹配。** 一份包含 5 个任务的倾倒内容，**不应**被强行塞进 4 个复杂详尽的部分。参见 `references/complexity_matching.md` 以及下方的“压缩输出模式”。
4. **如实说明歧义。** 如果你不确定某项内容是什么意思，就将其标注出来。不要暗自猜测。
5. **未经批准，不采取行动。** 唯一可以立即执行的操作就是整理本身。第 4 部分中的每一项提议都必须等待用户明确选择。

## 整理过程中的追问式澄清

Capture 的设计目标是快速付诸行动。**无需事先收集信息。** 倾倒内容已经足够——立即开始整理。

追问规则表现为整理过程中提出的**一个澄清问题**，并且**仅当**倾倒内容中的某一项确实可能同时被归为*任务*或*项目*，而错误分类会对输出产生实质影响时才提问：

> **快速确认一下——你倾倒的内容中有一项可以归入任一类别。[X] 是一次性任务，还是一个包含多个步骤的项目？**
>
> *我为什么要问：* 如果我对临界项判断错误，要么会把一个项目埋没成任务，要么会把一个无需复杂结构的任务膨胀成项目。每次倾倒只问一个问题可以避免这种情况。

**停止条件：** 每次倾倒最多提出 1 个澄清问题。得到回答后（或者无需澄清时），输出四个部分（或压缩后的部分）。

如果倾倒内容含义明确，则完全跳过澄清问题。

**反面模式（不要这样做）：** 一开始就提出 3 个澄清问题。这会破坏让 Capture 发挥作用的“倾倒后立即整理”流程。

## 第 1 部分：项目与点子

如果内容之间存在自然关联，则将相关事项聚类为主题项目。本部分还包括：
- 独立的创意火花
- 尚未成形的概念
- “如果……会怎样”的想法
- 内嵌的决策（`Decide: X or Y`）和待解决的问题（`Q: ...`）——将其保留在相关项目**内部**，不要提取成单独的顶层类别

**每个项目的格式：**

```
### {Project name in user's voice}

- {component / sub-idea}
- {component}
- Q: {open question this project needs answered}
- Decide: {decision this project requires}
```

使用用户原本的措辞作为项目名称。如果用户写的是“雪貂 AI 约会应用”，请勿将其重命名为“AI 驱动的宠物陪伴平台”。

## 第 2 节：任务

扁平化、便于浏览、以行动为导向。包括：
- 明确的待办事项
- 以 `Decide: ...` 形式表述的决策
- 以 `Resolve: ...` 形式表述的开放性问题

如果某项任务属于第 1 节中的某个项目，请附加 `[Project: X]` 来建立关联——但不要重复项目的上下文。

**格式：**

```
- {task in imperative voice}  [Project: X if related]
- Decide: {decision}  [Project: X if related]
- Resolve: {open question}
- ...
```

## 第 3 节：关联

这是该 Skill 真正发挥价值的地方——也是**严禁捏造内容**的地方。

**工作流程：**

1. **盘点工作区**——使用 Glob 查找与倾倒内容中的关键词匹配的文件名模式，使用 Grep 查找内容匹配项，并读取顶层目录结构。使用 `scripts/workspace_inventory.py` 以确定性的方式完成此操作。
2. **将倾倒的条目与现有内容匹配**——查找与倾倒条目相关的文件或文件夹、文档中已有的思考，以及存在重叠内容的进行中项目。
3. **呈现倾倒内容内部的依赖关系**——找出相互影响的条目、主题以及顺序上的影响。
4. **如实说明无法访问的情况**——如果你无法检查工作区（没有可用的文件系统、MCP 未连接），请明确说明。请勿编造听起来合理的关联。

**硬性规则：**绝不捏造关联。只呈现通过 Glob/Grep/Read 实际发现的关联。如果不存在真实关联：

> **关联：**未发现关联——工作区盘点结果无异常。

如果工作区无法访问：

> **关联：**无法从这里访问任何工作区。如果你正在通过 Claude Code 运行此 Skill，或有一个附带文件的项目，我可以补充这一部分。愿意告诉我这些工作位于何处吗？

有关各类上下文对应的检测策略目录，请参阅 `references/workspace_detection.md`。

## 第 4 节：我可以如何提供帮助

**提供具体的帮助，而不是抽象的可能性。**每项提议都要明确说明将产出什么，以及产出内容将放在哪里。

| ✅ 正确模式 | ❌ 反面模式 |
|---|---|
| “我可以研究 Consensus MCP 集成模式，并为你提供 3 个选项。输出：`docs/consensus-options.md`。” | “你可能需要研究一下集成方案。” |
| “我可以起草一份单页版 Q3 发布计划。输出：先在聊天中回复；如果你希望归档，再写入 `docs/q3-launch.md`。” | “或许可以考虑一下 Q3 规划。” |
| “我可以参照 `src/users/` 中的现有模式搭建新的身份验证模块。输出：在 `src/auth/` 中创建 4 个文件。” | “我们可以探索一下身份验证方案。” |

最后以下述指令式问题结尾：

> **其中哪一项应该由我来处理？**

## 压缩输出模式

当倾倒内容包含的条目**不超过 5 项**，且这些条目**彼此无关**（无法自然归类）时，不使用四节格式，改用压缩格式：

```
## What I heard

- {item}
- {item}
- {item}
- ...

## How I can help

- {concrete offer with what + where}
- {concrete offer with what + where}

Which should I tackle?
```

触发条件是 `complexity_estimator.py` 的建议，或者在不存在聚类时由你自行判断。有关每种格式适用场景的完整示例，请参阅 `references/complexity_matching.md`。

## 工作区检测策略

| 上下文 | 检测方法 |
|---|---|
| Claude Code CLI | 使用 Glob 查找匹配信息转储关键词的文件；使用 Grep 查找内容匹配项；读取顶层结构。使用 `scripts/workspace_inventory.py`。 |
| 带项目的 Claude.ai | 检查项目知识文件是否存在主题重叠。列出文件标题；呈现关键词匹配项。 |
| 已连接的工具（Notion、Drive 等） | 如果 MCP 可用，则通过 MCP 搜索。 |
| 没有可访问的工作区 | 明确说明该限制；询问用户的环境设置；绝对不要捏造。 |

## 审批关卡

交付四个部分（或压缩后的内容）之后：

- **等待用户明确选择**，然后才能执行任何其他操作。
- 如果用户在未选择具体提议的情况下说“开始”：照做，但要明确指出所有你未能 100% 确定的事项，以便用户更正。
- 整理本身是唯一可以自动执行的操作。第 4 部分中的每项提议都需要获得许可。

## 错误处理

| 情况 | 行为 |
|---|---|
| 工作区无法访问 | 说明这一点；跳过第 3 部分，或呈现“没有可访问的工作区”并询问环境设置 |
| 信息转储非常短（3～5 项） | 使用压缩输出；不要强行划分为 4 个部分 |
| 各事项高度含糊 | 在输出中标记，最多提出 1 个澄清问题（或者不提澄清问题，直接在交付内容中指出歧义） |
| 信息转储包含敏感信息 | 如果用户要求整理但不引用原文，则予以确认，但不要逐字复述 |
| 信息转储中的事项相互冲突 | 在第 1 或第 3 部分中明确呈现冲突（`Conflict: X says A, Y says B`） |
| 用户在审批前说“开始” | 照做，但要明确指出你不确定的事项 |

## 工具

| 脚本 | 作用 |
|---|---|
| `scripts/workspace_inventory.py` | 用于第 3 部分的 Glob+Grep 辅助工具。`python workspace_inventory.py --root . --keywords "k1,k2"` 会按关键词返回匹配项和文件夹结构。 |
| `scripts/dump_classifier.py` | 使用正则表达式将信息转储的每一行分类为 `task` / `decision` / `question` / `idea` / `project-component`。这是启发式结果，应根据判断进行调整。 |
| `scripts/complexity_estimator.py` | 统计事项数量、检测聚类信号，并建议使用 `format=full` 或 `format=compressed`。 |

## 参考资料

- `references/workspace_detection.md` — 针对不同上下文的检测策略（CLI / web / MCP / 无法访问）
- `references/voice_preservation.md` — 企业化措辞的反面模式及具体示例
- `references/complexity_matching.md` — 压缩输出与完整输出，以及完整示例

## 必须拒绝的反面模式

- 捏造未经实际 Glob/Grep 验证的工作区连接
- 丢弃被认为“无关紧要”的事项——捕获所有内容，让用户自行删减
- 将用户的随意表达改写成企业化语言
- 输入较少时强行使用 4 部分结构（5 个简单任务并不需要）
- 未经批准便立即执行第 4 部分中的提议
- 将决策或问题拆分为独立的顶级类别，而不是将其嵌入相关项目中
- 第 4 部分中的提议含糊不清（“你可能需要考虑……”）
- 一开始就提出 3 个以上的澄清问题（有碍快速行动）

---

**版本：** 1.0.0
**源规范：** [`megaprompts/05-capture-megaprompt.md`](../../../../megaprompts/05-capture-megaprompt.md)
**构建模式：** 路径 B（直接转换）。如果规范与实现之间出现偏差，请使用 `/cs:grill-with-docs` 重新审查。