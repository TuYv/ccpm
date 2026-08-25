---
name: capture
description: "Captures and organizes chaotic brain dumps into a structured, actionable system with zero information loss. Use this skill whenever the user says 'capture this', 'brain dump', 'let me dump some ideas', 'I've got a bunch of thoughts', 'here's everything on my mind', 'idea dump', 'let me get this out of my head', 'I need to organize my thoughts', 'here's what I'm thinking', or any variation where someone is unloading a messy stream of ideas, tasks, thoughts, and plans wanting them turned into something coherent. Also trigger when the user pastes or dictates a long, unstructured block of mixed ideas — even without the exact phrase — the intent is the same. Fast-to-action by design: no upfront intake. Output is four sections (Projects/Ideas, Tasks, Connections, How I Can Help) ending with a directive question. Asks at most one mid-organization clarifying question when a single item is genuinely ambiguous between task and project."
license: MIT
metadata:
  source_spec: "megaprompts/05-capture-megaprompt.md"
  build_pattern: "Path B (direct conversion)"
  version: 1.0.0
---
# Capture — 脑暴整理器

一种快速执行的技能，用于将无结构的混合想法、任务和创意流，转换为一个清晰的四部分可执行系统，同时做到信息零丢失。

## 调用触发条件

**显式短语**（任意一个）：
- "brain dump"
- "capture this"
- "let me dump some ideas"
- "I've got a bunch of thoughts"
- "here's everything on my mind"
- "idea dump"
- "let me just get this out of my head"
- "I need to organize my thoughts"
- "here's what I'm thinking"

**隐式信号**（没有出现上述短语，但意图非常明确）：
- 用户粘贴或口述一大段由混合想法、任务和计划组成的无结构内容
- 一条消息中包含多个彼此无关的想法，且没有组织性铺垫
- 一大段类似项目符号的文字，涵盖 3 个或更多彼此无关的主题

检测到隐式触发条件时，运行此技能。不要先问“你想让我整理一下吗？”——这段倾倒式内容本身就是请求。

## 操作原则（五项始终全部适用）

1. **全部记录。** 零丢失。琐碎事项也要纳入；之后由用户自行删减。绝不要因为某项“看起来不重要”就悄悄丢弃。
2. **保留原有语气。** 如果用户说的是“build something crazy with AI”，不要改述成“Explore innovative AI-driven solutions.” 保留原有的活力和随意的语体。具体的反模式请参阅 `references/voice_preservation.md`。
3. **让输出复杂度匹配输入。** 5 个任务的倾倒内容不应被强行整理成 4 个复杂的部分。请参阅 `references/complexity_matching.md` 和下方的压缩输出模式。
4. **如实面对歧义。** 如果你不确定某项的含义，就明确标记出来。不要默默猜测。
5. **未经批准不得采取行动。** 唯一可以立即执行的行动就是组织内容本身。第 4 部分中的每个行动提议都必须等待用户明确选择。

## 组织过程中的追问式澄清

Capture 的设计目标是快速执行。**不要事先收集信息。** 这段倾倒式内容已经足够——立即开始组织。

追问式原则适用于**组织过程中的一次澄清问题**：仅当倾倒内容中的某一项确实难以判断属于*任务*还是*项目*，且错误分类会显著改变输出时，才提出该问题：

> **快速澄清——你倾倒的内容中有一项可能属于两种类型。 [X] 是一次性任务，还是多步骤项目？**
>
> *我之所以询问：* 如果我对边界项猜错，要么会把项目埋在任务中，要么会把不需要这种结构的任务扩充成项目。每次倾倒内容只问一个问题，可以避免这种情况。

**停止条件：** 每次倾倒内容最多提出 1 个澄清问题。得到回答后（或不需要澄清时），输出四个部分（或压缩后的部分）。

如果倾倒内容没有歧义，完全跳过澄清问题。

**反模式（不要这样做）：** 一开始就提出 3 个澄清问题。这会破坏让 Capture 发挥作用的“倾倒并整理”流程。

## 第 1 部分：项目与创意

在自然存在相关聚类时，将相关事项聚类为主题项目。本部分还包括：
- 独立的创意火花
- 尚未成形的概念
- “如果……会怎样”的想法
- 内嵌的决策（`Decide: X or Y`）和开放性问题（`Q: ...`）——保留在相关项目**内部**，而不是提取为单独的顶级类别

**每个项目的格式：**

```text
### {Project name in user's voice}

- {component / sub-idea}
- {component}
- Q: {open question this project needs answered}
- Decide: {decision this project requires}
```

使用用户自己的措辞作为项目名称。如果用户写的是 “ai dating app for ferrets”，不要将其重命名为 “AI-Powered Pet Companion Platform”。

## 第 2 部分：任务

扁平、便于快速浏览、以行动为导向。包括：
- 明确的待办事项
- 使用 `Decide: ...` 表述的决策
- 使用 `Resolve: ...` 表述的开放性问题

如果某项任务属于第 1 部分中的某个项目，请在其后附加 `[Project: X]` 以建立关联——但不要重复该项目的背景。

**格式：**

```text
- {task in imperative voice}  [Project: X if related]
- Decide: {decision}  [Project: X if related]
- Resolve: {open question}
- ...
```

## 第 3 部分：关联

这是该 skill 发挥作用的地方——也是**严禁捏造内容**的地方。

**工作流程：**

1. **盘点工作区** — 使用 Glob 查找与转储关键词匹配的文件名模式，使用 Grep 查找内容匹配项，并读取顶层目录结构。使用 `scripts/workspace_inventory.py` 以确定性的方式完成此操作。
2. **将转储项目与现有内容匹配** — 查找与转储项目相关的文件 / 文件夹、文档中的既有思考，以及存在重叠内容的进行中项目。
3. **发现转储内容内部的依赖关系** — 找出相互影响的项目、主题以及顺序上的影响。
4. **如实说明无法访问的内容** — 如果无法检查工作区（没有文件系统可用、MCP 未连接），请明确说明。不要编造听起来合理的关联。

**硬性规则：**绝不捏造关联。只能展示通过 Glob/Grep/Read 实际发现的关联。如果不存在真实关联：

> **关联：**未发现关联——工作区盘点结果干净。

如果工作区无法访问：

> **关联：**当前无法访问工作区。如果你是在 Claude Code 中运行此操作，或有附加项目文件，我可以补充这一部分。愿意分享这些内容所在的位置吗？

请参阅 `references/workspace_detection.md`，了解针对不同上下文的检测策略目录。

## 第 4 部分：我能提供的帮助

**提供具体的帮助，而不是抽象的可能性。** 每项帮助都必须说明将产出什么，以及产出会放在哪里。

| ✅ 正确模式 | ❌ 反模式 |
|---|---|
| “我可以研究 Consensus MCP 的集成模式，并给你 3 个选项。输出：`docs/consensus-options.md`。” | “你可以考虑研究一下集成方式。” |
| “我可以将 Q3 发布计划起草成一页纸。输出：聊天回复；如果你希望归档，我也可以随后写入 `docs/q3-launch.md`。” | “也许可以想想 Q3 规划。” |
| “我可以参照 `src/users/` 中的现有模式，为新的 auth 模块搭建框架。输出：`src/auth/` 中的 4 个文件。” | “我们可以探索一下 auth 方案。” |

最后以指令式问题结尾：

> **你希望我先处理哪一项？**

## 压缩输出格式

当转储内容包含 **5 项或更少**，且各项目**互不相关**（不存在自然的聚类关系）时，省略上述 4 部分格式，改用压缩格式：

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

触发条件是 `complexity_estimator.py` 的建议，或者在不存在聚类时根据你的判断决定。有关每种格式适用时机的示例，请参阅 `references/complexity_matching.md`。

## 工作区检测策略

| 上下文 | 检测方法 |
|---|---|
| Claude Code CLI | 对匹配转储关键词的文件执行 Glob；对内容匹配项执行 Grep；读取顶层结构。使用 `scripts/workspace_inventory.py`。 |
| 带项目的 Claude.ai | 检查项目知识文件是否存在主题重叠。列出文件标题；通过关键词标出匹配项。 |
| 已连接的工具（Notion、Drive 等） | 如果可用，则通过 MCP 搜索。 |
| 无法访问工作区 | 明确说明此限制；询问用户的设置；不要捏造。 |

## 审批门槛

交付四个（或压缩后的）部分后：

- **在进行任何其他操作前，等待用户明确选择。**
- 如果用户只说“go”而没有选择具体提议：遵从用户指示，但明确指出任何你无法 100% 确定的项目，以便用户纠正。
- 组织本身是唯一可以自动执行的操作。第 4 部分中的每项提议都需要获得批准。

## 错误处理

| 情况 | 行为 |
|---|---|
| 无法访问工作区 | 说明这一点；跳过第 3 部分，或展示“无法访问工作区”并询问设置情况 |
| 转储内容非常简短（3-5 项） | 使用压缩输出；不要强行套用四个部分 |
| 项目高度含糊 | 在输出中标记，并最多提出 1 个澄清问题（或者不提澄清问题，直接在交付内容中呈现歧义） |
| 转储包含敏感信息 | 如果用户要求组织内容但不要求逐字引用，则予以确认，但不要逐字复述 |
| 转储中的项目相互冲突 | 在第 1 或第 3 部分明确呈现冲突（`Conflict: X says A, Y says B`） |
| 用户在审批前说“go” | 遵从用户指示，但明确指出你不确定的项目 |

## 工具

| 脚本 | 作用 |
|---|---|
| `scripts/workspace_inventory.py` | 第 3 部分的 Glob+Grep 辅助工具。`python workspace_inventory.py --root . --keywords "k1,k2"` 按关键词和文件夹结构返回匹配项。 |
| `scripts/dump_classifier.py` | 将转储中的每一行按正则分类为 `task` / `decision` / `question` / `idea` / `project-component`。这是启发式分类，应根据判断进行覆盖。 |
| `scripts/complexity_estimator.py` | 统计项目数量，检测聚类信号，并建议使用 `format=full` 或 `format=compressed`。 |

## 参考资料

- `references/workspace_detection.md` — 针对不同上下文的检测策略（CLI / Web / MCP / 无法访问）
- `references/voice_preservation.md` — 带有具体示例的企业化措辞反模式
- `references/complexity_matching.md` — 压缩输出与完整输出，以及适用示例

## 应拒绝的反模式

- 捏造未经实际 Glob/Grep 验证的工作区连接
- 丢弃被认为“琐碎”的项目——完整捕获所有内容，让用户自行删减
- 将用户随意的语言改写成企业化表达
- 输入内容较少时强行套用四个部分的结构（5 个简单任务不需要这样做）
- 未经批准就立即执行第 4 部分中的提议
- 将决策/问题拆分为单独的顶层类别，而不是嵌入相关项目中
- 含糊的第 4 部分提议（“你可能需要考虑……”）
- 一开始就提出 3 个以上的澄清问题（这会阻碍快速行动）

---

**版本：** 1.0.0  
**源规范：** `megaprompts/05-capture-megaprompt.md`（维护者本地草案规范——已被 gitignore 忽略，不存在于公共仓库中）  
**构建模式：**路径 B（直接转换）。如果规范与实现之间出现偏差，请使用 `/cs:grill-with-docs` 重新检查。