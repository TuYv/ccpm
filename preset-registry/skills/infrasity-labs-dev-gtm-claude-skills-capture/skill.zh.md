---
name: capture
description: "Captures and organizes chaotic brain dumps into a structured, actionable system with zero information loss. Use this skill whenever the user says 'capture this', 'brain dump', 'let me dump some ideas', 'I've got a bunch of thoughts', 'here's everything on my mind', 'idea dump', 'let me get this out of my head', 'I need to organize my thoughts', 'here's what I'm thinking', or any variation where someone is unloading a messy stream of ideas, tasks, thoughts, and plans wanting them turned into something coherent. Also trigger when the user pastes or dictates a long, unstructured block of mixed ideas — even without the exact phrase — the intent is the same. Fast-to-action by design: no upfront intake. Output is four sections (Projects/Ideas, Tasks, Connections, How I Can Help) ending with a directive question. Asks at most one mid-organization clarifying question when a single item is genuinely ambiguous between task and project."
metadata:
---
# Capture — 思绪倾倒整理器

一个快速行动的技能，可将由各种想法、任务和点子混杂而成的非结构化思绪流，转化为一个清晰、包含四个部分且可付诸行动的系统，同时确保信息零损失。

## 调用触发条件

**明确表达**（以下任意一种）：
- “倾倒一下思绪”
- “记录一下这个”
- “让我把一些想法都倒出来”
- “我脑子里有一堆想法”
- “这些就是我脑子里想的所有事情”
- “倾倒一下点子”
- “让我把这些东西都从脑子里倒出来”
- “我需要整理一下思绪”
- “这些就是我现在的想法”

**隐含信号**（没有明确表达，但意图非常明显）：
- 用户粘贴或口述一大段由想法、任务和计划混杂而成的非结构化内容
- 一条消息中包含多个互不相关的想法，且没有组织性框架
- 一大段类似项目符号的文本，涉及 3 个以上互不相关的主题

当你检测到隐含触发条件时，运行此技能。不要先问“你想让我整理一下这些内容吗？”——倾倒内容本身**就是**请求。

## 操作原则（五项原则始终全部适用）

1. **捕捉所有内容。** 零损失。再琐碎的事项也要纳入；之后由用户自行删减。绝不能因为某项内容“看起来不重要”就悄悄将其丢弃。
2. **保留原本语气。** 如果用户说“用 AI 搞个疯狂的东西”，不要改写成“探索由 AI 驱动的创新解决方案”。保留原有的活力和随意表达方式。有关具体的反面模式，请参阅 `references/voice_preservation.md`。
3. **让输出复杂度与输入相匹配。** 对于只包含 5 个任务的思绪倾倒，不要强行套入 4 个复杂的部分。请参阅 `references/complexity_matching.md` 以及下文的压缩输出模式。
4. **坦诚面对歧义。** 如果你不确定某项内容是什么意思，就将其标记出来。不要默默猜测。
5. **未经批准，不采取行动。** 唯一可以立即执行的操作就是整理本身。第 4 部分中的每一项提议都必须等待用户明确选择后再执行。

## 整理过程中的 Grill-Me 澄清问题

Capture 的设计目标是快速行动。**不进行前置询问。** 用户倾倒的内容已经足够——立即开始整理。

Grill-Me 规则在此体现为**整理过程中的一个澄清问题**，并且**仅当**倾倒内容中的某一项确实无法判断属于*任务*还是*项目*，且错误分类会对输出产生实质性影响时才提出：

> **快速澄清——你倾倒的内容中有一项可能属于两种情况。[X] 是一次性任务，还是一个需要多个步骤的项目？**
>
> *我这样问的原因：* 如果我对临界事项判断错误，要么会把一个项目埋没成任务，要么会把一个本不需要复杂结构的任务膨胀成项目。每次思绪倾倒只问一个问题，可以防止这种情况。

**停止条件：** 每次思绪倾倒最多提出 1 个澄清问题。得到回答后（或者不需要澄清时），输出四个部分（或压缩后的部分）。

如果倾倒内容没有歧义，则完全跳过澄清问题。

**反面模式（不要这样做）：** 一开始就提出 3 个澄清问题。这会破坏让 Capture 发挥作用的“倾倒后立即整理”流程。

## 第 1 部分：项目与想法

如果内容中自然存在关联，就将相关事项聚合成具有共同主题的项目。本部分还包括：
- 独立的创意火花
- 尚未成形的概念
- “如果……会怎样”的想法
- 内嵌的决定（`Decide: X or Y`）和开放式问题（`Q: ...`）——将它们保留在相关项目**之内**，不要提取为单独的顶层类别

**每个项目的格式：**

```
### {Project name in user's voice}

- {component / sub-idea}
- {component}
- Q: {open question this project needs answered}
- Decide: {decision this project requires}
```

项目名称应使用用户的原话。如果用户写的是“雪貂 AI 约会应用”，不要将其改名为“AI 驱动的宠物陪伴平台”。

## 第 2 节：任务

扁平、易于浏览、以行动为导向。包括：
- 明确的待办事项
- 以 `Decide: ...` 格式表述的决策
- 以 `Resolve: ...` 格式表述的待解决问题

如果某项任务属于第 1 节中的某个项目，请在末尾附加 `[Project: X]` 以建立关联——但不要重复该项目的上下文。

**格式：**

```
- {task in imperative voice}  [Project: X if related]
- Decide: {decision}  [Project: X if related]
- Resolve: {open question}
- ...
```

## 第 3 节：关联

这是该技能真正发挥价值的地方——也是**严禁捏造内容**的地方。

**工作流程：**

1. **盘点工作区**——使用 Glob 查找与转储内容关键词匹配的文件名模式，使用 Grep 查找内容匹配项，并读取顶层目录结构。使用 `scripts/workspace_inventory.py` 以确定性方式完成此操作。
2. **将转储内容中的条目与现有内容匹配**——查找与转储条目相关的文件／文件夹、文档中已有的思考，以及存在重叠的进行中项目。
3. **呈现转储内容内部的依赖关系**——找出相互影响的条目、主题和顺序上的影响。
4. **如实说明无法访问的情况**——如果你无法检查工作区（没有可用的文件系统、MCP 未连接），请明确说明。不要编造听起来合理的关联。

**硬性规则：**绝对不要捏造关联。只呈现通过 Glob/Grep/Read 实际发现的关联。如果不存在真实关联：

> **关联：**未发现任何关联——工作区盘点结果为空。

如果无法访问工作区：

> **关联：**当前无法访问任何工作区。如果你正在通过 Claude Code 运行此功能，或者已附加包含文件的项目，我可以补充这部分内容。可以告诉我这些工作位于何处吗？

有关不同上下文中检测策略的完整目录，请参阅 `references/workspace_detection.md`。

## 第 4 节：我能如何提供帮助

**提供具体方案，而非抽象的可能性。**每项方案都应明确说明将产出什么，以及产出内容将放在哪里。

| ✅ 正确模式 | ❌ 反模式 |
|---|---|
| “我可以研究 Consensus MCP 的集成模式，并为你提供 3 个选项。输出：`docs/consensus-options.md`。” | “你可能需要研究一下集成方案。” |
| “我可以起草一份单页的第三季度发布计划。输出：先在聊天中回复；如果你希望归档，再保存至 `docs/q3-launch.md`。” | “也许可以考虑一下第三季度规划。” |
| “我可以参照 `src/users/` 中的现有模式搭建新的身份验证模块。输出：`src/auth/` 中的 4 个文件。” | “我们可以探索一下身份验证方案。” |

以这个指令式问题结尾：

> **你希望我处理其中哪一项？**

## 压缩输出模式

当转储内容包含 **5 个或更少的条目**，且这些条目**互不相关**（无法自然归类）时，舍弃四节格式并使用压缩格式：

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
| Claude Code CLI | 使用 Glob 查找与倾倒内容关键词匹配的文件；使用 Grep 查找内容匹配项；读取顶层结构。使用 `scripts/workspace_inventory.py`。 |
| 带项目的 Claude.ai | 检查项目知识文件是否存在主题重叠。列出文件标题；显示关键词匹配项。 |
| 已连接的工具（Notion、Drive 等） | 如果 MCP 可用，则通过 MCP 搜索。请参阅下方的 **Notion MCP** 部分。 |
| 无法访问工作区 | 明确说明限制；询问用户的环境设置；切勿捏造。 |

## Notion MCP（可选）

此 Skill 会在 Notion MCP 连接器可用时与其集成。将整理好的各部分发送到聊天后，尝试运行 `notion-query-data-sources`。如果它返回结果，则表示 Notion 已连接——运行下方的保存流程。如果失败或不可用，则静默跳过并附加提醒。

### 保存流程（如果 Notion 已连接）

在交付 4 个部分（或压缩版）输出后，且用户尚未选择第 4 节中的某个提议时运行此流程——这是并行的后台操作，并非门禁步骤。

1. 使用主要项目和任务中的关键词调用 `notion-search`，以检测工作区中现有的匹配页面
2. 对于第 1 节中的每个**项目/想法**：检查是否已存在匹配的项目页面
   - 如果存在：向用户显示匹配项（“找到现有页面：[title]——要我链接或更新它吗？”）——未经批准，请勿自动更新
   - 如果不存在：提议使用 `notion-create-pages` 在 Projects 数据库中创建
3. 对于第 2 节中的每个**任务**：调用 `notion-query-database-view`，检查任务数据库是否存在
   - 如果存在：提议通过 `notion-create-pages` 将任务添加到该数据库
   - 如果不存在：提议通过 `notion-create-database` 创建 Tasks 数据库并添加任务
4. 所有 Notion 操作都只是**提议，而非自动执行**——在第 4 节末尾提供一项统一的提议：

> **保存到 Notion？** 我从你的倾倒内容中发现了 [N] 个项目和 [N] 个任务。我可以将它们添加到你的 Notion 工作区——其中 [X] 个匹配现有页面，[Y] 个为新条目。回复“保存到 Notion”即可继续，或者选择第 4 节中的其他提议。

5. 获得批准后：对获准的条目执行 `notion-create-pages`，并通过页面链接进行确认

### 后备方案（如果 Notion 未连接）

> 💡 **Notion 未连接**——整理后的思维倾倒内容只会输出到聊天中。连接 Notion MCP 连接器，即可自动将项目和任务保存到你的工作区。设置：[notion-mcp-server](https://github.com/makenotion/notion-mcp-server)

## 批准门禁

交付四个部分（或压缩版）后：

- **等待用户明确选择**，然后再执行其他操作。
- 如果用户说“go”但没有选择具体提议：遵照执行，但需要明确指出所有你无法百分之百确定的条目，以便用户更正。
- 整理本身是唯一自动执行的操作。第 4 节中的每个提议都需要获得许可。

## 错误处理

| 情况 | 行为 |
|---|---|
| 无法访问工作区 | 说明这一点；跳过第 3 节，或明确指出“无法访问工作区”并询问如何设置 |
| 内容转储非常短（3-5 项） | 使用精简输出；不要强行分成 4 个部分 |
| 各项内容高度模糊 | 在输出中标明，并最多提出 1 个澄清问题（也可以不提问，直接在交付内容中指出歧义） |
| 内容转储包含敏感信息 | 如果用户要求整理但不引用原文，应确认已注意到敏感信息，但不要逐字复述 |
| 内容转储中的条目相互冲突 | 在第 1 节或第 3 节中明确指出冲突（`Conflict: X says A, Y says B`） |
| 用户在批准前说“开始” | 遵从指示，但要明确说明你不确定的条目 |

## 工具

| 脚本 | 作用 |
|---|---|
| `scripts/workspace_inventory.py` | 用于第 3 节的 Glob+Grep 辅助工具。`python workspace_inventory.py --root . --keywords "k1,k2"` 会按关键字返回匹配项及文件夹结构。 |
| `scripts/dump_classifier.py` | 使用正则表达式将内容转储中的每一行分类为 `task` / `decision` / `question` / `idea` / `project-component`。这是一种启发式判断——应结合实际判断进行调整。 |
| `scripts/complexity_estimator.py` | 统计条目数量、检测聚类信号，并建议使用 `format=full` 或 `format=compressed`。 |

## 参考资料

- `references/workspace_detection.md` — 针对不同上下文的检测方法（CLI / Web / MCP / 无法访问）
- `references/voice_preservation.md` — 企业化表达的反面模式及具体示例
- `references/complexity_matching.md` — 精简输出与完整输出的选择，以及完整示例

## 应避免的反面模式

- 捏造未经 Glob/Grep 实际验证的工作区连接
- 丢弃被认为“微不足道”的条目——记录所有内容，让用户自行删减
- 将用户的随意表达改写成企业化语言
- 输入内容较少时强行采用 4 部分结构（5 个简单任务不需要这种结构）
- 未经批准就立即执行第 4 节中提出的事项
- 将决定/问题拆分为单独的顶级类别，而不是将其归入相关项目
- 在第 4 节中提出含糊的建议（“你或许可以考虑……”）
- 一开始就提出 3 个以上的澄清问题（会妨碍快速行动）