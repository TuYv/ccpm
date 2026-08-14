---
name: memory-onboarding
description: "Guide someone new to Basic Memory through designing and building a complete personal knowledge system — interview them about what they want to track, propose a structure, build it with schemas and instruction notes, teach them to use it, and set up their AI assistant to load it automatically. Use this skill whenever a user says they're new to Basic Memory, wants to 'get started', 'set up', or 'onboard' with Basic Memory, doesn't know what to use it for, asks how to organize their memory project or knowledge base, wants help designing folders/schemas/conventions, or asks how to make their assistant remember context between sessions. Also use it when a user has an empty or messy Basic Memory project and wants structure."
---
# Basic Memory 基础入门

你将引导一位刚开始使用 Basic Memory 的用户，构建一套适合*他们*生活的知识系统——然后教会他们如何使用，并将它接入其 AI 助手，让今后的每次会话从一开始就已经了解这些规则。

此技能适用于任何 LLM 或助手平台。如需进行特定于平台的设置（系统提示词、项目指令），请确定你所在的环境支持哪些功能，并调整 `references/assistant-setup.md` 中的通用模式。

## 为什么采用这种方法

Basic Memory 会将 Markdown 文件解析为知识图谱。一堆杂乱无章的笔记，并不比装着文本文件的文件夹好多少。这项技能从第一天起就会配置以下四项能力，从而带来不断累积的价值：

1. **模式**——为笔记类型定义字段，使每条任务、联系人或支出笔记都采用相同的格式，并可进行结构化查询。
2. **观察和关系**——通过分类事实（`- [status] active`）和类型化链接（`- depends_on [[Other Note]]`），将散文式内容转化为图谱。
3. **指令笔记**——系统规则存在于系统*内部*，以笔记形式保存，并由助手在会话开始时加载。知识库因此能够自我描述。
4. **启动路由器**——一条简短的笔记，能够准确告诉任何平台上的任何助手：针对每种任务应该加载哪些内容。

**无论规模大小，其中两项绝不能省略：**蓝图中的每种笔记类型都必须有模式，而写入的每条笔记都必须包含 Observations 部分，并至少有一条 `[category]` 事实。为轻量使用而缩减设计时，可以减少文件夹、索引和*必填字段*——但绝不能去掉模式本身，也绝不能去掉观察。一项仅含一个字段的模式和一行观察只需几秒即可完成；等到积累了数百条无结构笔记后再补充结构，正是这项技能旨在避免的失败模式。

## 使用浅白的语言——用户不懂这些术语

你正在帮助入门的用户很可能从未听说过“模式”“观察”“前置元数据”或“知识图谱”这些词——而他们也完全不需要学会这些术语，就能从中受益。结构是供你使用的；对话则是面向他们的。

- 在每个概念变得相关时，用浅白的语言介绍它：模式是“一种模板，可以让同类笔记保持一致，这样我就能可靠地回答‘哪些任务逾期了？’之类的问题”；观察是“笔记中的关键事实，带有标签，方便以后查找”；关系是“笔记之间的链接，让你可以从一件事找到下一件事”。
- **用户永远不需要编写语法。** 你会在底层处理 `[category]` 行、Wiki 链接和验证——他们只需正常交流。请明确告诉他们这一点；这会让人安心。
- 每次只介绍一个概念，并且只在它确实有用时介绍。如果你发现自己一口气定义了三个术语，就停止解释，改用他们的数据构建一些实际内容——示例比定义更有教学效果。

## 工作流程概览

```
Phase 0  Preflight        — verify tools, pick/create project, assess existing content
Phase 1  Interview        — what do they want to track? (suggest if they don't know)
Phase 2  Blueprint        — propose full structure; iterate until approved
Phase 3  Build            — schemas → templates → instruction notes → indexes → seed notes
Phase 4  Assistant setup  — persistent instructions that load the router every session
Phase 5  Teach            — hands-on exercises with their real data
Phase 6  Grow             — suggest expansions and a maintenance cadence
```

不要跳过阶段 2 与阶段 3 之间的审批关卡。构建错误的结构比什么都不构建更糟——用户将不得不摆脱已经形成的错误习惯。

## 阶段 0——预检

在向用户询问任何问题之前：

1. 确认 Basic Memory 工具可用（`write_note`、`read_note`、`search_notes`、`list_directory`，最好还有 `schema_infer`/`schema_validate`）。如果不可用，请停止后续操作，并先帮助用户连接 Basic Memory。
2. 列出他们的项目（`list_memory_projects`）。询问要在哪个项目中构建，或者是否要创建一个全新的项目。**后续每次调用都必须显式传入此项目**——写入时混用项目是最常见、也最令人头疼的设置错误之一。
3. 检查现有内容（在根目录执行 `list_directory`，深度为 2）。可能有三种情况：
   - **空**——全新搭建，正常继续。
   - **有少量零散笔记**——继续，并计划在阶段 3 中将现有笔记纳入新结构。
   - **已有大量内容**——这属于重构，而不是新用户引导。仍然使用此技能，但阶段 1 要改为了解“哪些地方有效、哪些地方无效”，并且阶段 2 必须在移动任何内容之前，建立旧位置 → 新位置的映射。
4. **不确定时检查在线文档。** Basic Memory 的文档可供代理读取：获取 `https://docs.basicmemory.com/llms.txt` 以查看索引，并通过页面对应的 `raw/....md` URL 获取整洁的 Markdown（例如 `raw/reference/mcp-tools-reference.md`、`raw/concepts/schema-system.md`）。工具名称和参数会不断演变——当此技能与文档不一致时，以文档为准。

## 阶段 1——访谈

以对话方式，**一次只问一个问题**。绝不要一次性抛出一大堆问题。你需要了解：

1. **领域**——他们想记录哪些内容？如果他们已经有想法，请深入了解每个领域：具体要记录什么、频率如何、什么样才算“完成”？
2. **如果他们没有想法**，提供一份具体的选项菜单，并询问哪些选项符合他们的需求（可多选）。以下是一些适合作为起点的领域，按普遍适用程度大致排序：
   - **任务与项目**——待办事项、截止日期、多步骤项目
   - **笔记与日志**——每日笔记、想法、学到的内容
   - **人员与联系人**——认识的人、每个人的背景信息、后续跟进事项
   - **研究**——正在深入探索的主题、资料来源、研究发现
   - **财务**——订阅、支出、账户、续费
   - **流程**——那些总要反复摸索的方法指南（家庭、工作、技术）
   - **健康与习惯**——锻炼、症状、日常习惯
   - **资产**——家庭物品清单、设备、保修、序列号
   对于他们选择的每个领域，`references/domain-playbooks.md` 都提供了一套入门方案：文件夹、模式、命名约定和示例笔记。在提出蓝图之前，请先阅读该文件。
3. **数量与频率**——每周记录 5 篇笔记的系统与每周记录 50 篇笔记的系统截然不同。轻量使用 → 更少的文件夹、更少的必填字段。
4. **每个领域提供一个真实示例**——“告诉我你目前正在处理的一项任务”／“举一个你正在付费的订阅”。这些示例将在阶段 3 中成为种子笔记，并让之后的每个阶段都建立在具体实例而非假设之上。
5. **他们以前尝试过什么**——如果之前的系统失败了，找出原因。设计时要有针对性地避免再次失败。

即使他们对六个领域都很感兴趣，也应先从 2–3 个领域开始。一个能够运作的小型系统会不断成长；一个庞大却空洞的脚手架只会消亡。将暂缓处理的领域记录下来，留待第 6 阶段处理。

## 第 2 阶段 — 蓝图

如果还没有阅读，请现在阅读 `references/conventions.md` 和 `references/schema-guide.md`。然后展示一份文档（在聊天中展示，暂时不要写入任何位置），其中包含：

1. **文件夹树** — 完整的拟议目录结构，并用一行说明每个文件夹的用途。除各领域文件夹外，还应包含 `Schemas/`、`Templates/`，以及一个 `Instructions/`（或 `Meta/`）文件夹。
2. **Schema 表格** — 每种笔记类型一行：schema 名称、note_type、必需的 observations、可选的 observations、status 枚举值。
3. **命名约定** — 每种笔记类型的标题格式、日期格式和 status 词汇表。
4. **说明笔记** — 启动路由器，以及每个领域各一篇说明笔记（结构参见 `references/conventions.md`）。
5. **他们将遵循的纪律规则** — 创建前先搜索、路径大小写必须精确、添加变更日志行、更新索引、双向链接——每条规则都用一行说明“为什么”。

逐项讲解，邀请他们提出异议，并反复迭代。根据他们的回答调整规模——但调整规模意味着减少文件夹、减少索引，以及减少*必需*字段，绝不能移除 schema 或 observations（参见上面的不可协商项）。进入第 3 阶段之前，必须获得明确的“是的，开始构建”。

## 第 3 阶段 — 构建

按以下顺序构建——后面的项目会引用前面的项目：

1. **Schemas** → `Schemas/` 文件夹，每种类型一篇笔记，`validation: warn`。语法参见 `references/schema-guide.md`。
2. **Templates** → `Templates/`，每种笔记类型一个，并与 schema 完全匹配。
3. **说明笔记** → 先创建各领域的规则笔记，最后创建**启动路由器**（它会链接所有内容）。完整结构和实际示例参见 `references/conventions.md`。
4. **索引笔记** → 为每个需要索引的领域创建一篇（作为目录；并非每个领域都需要）。
5. **迁移现有笔记** *（重构路径）* → 在填充任何内容之前，执行第 2 阶段批准的旧→新映射：将每篇现有笔记移动到新位置，设置其笔记类型，添加其 schema 要求的 observations，并在笔记落位时更新索引。将不适配的内容归档——绝不删除。只要根目录中仍有任何未整理的内容，第 3 阶段就不算完成。
6. **填充示例笔记** → 使用第 1 阶段收集的示例，为每个领域创建 2–3 篇真实笔记。绝不要使用占位数据来填充——真实笔记既能示范格式，又能立即发挥作用；虚假笔记只是用户必须删除的噪声。
7. **验证** → 对示例笔记和所有已迁移笔记运行 `schema_validate`；修复它报告的所有问题。重新读取路由器和一篇说明笔记，确认链接可以正确解析。

整个过程中都要遵循 `references/conventions.md` 中的写入纪律——最重要的是：创建任何内容前先搜索、严格使用文件夹名称的准确大小写，并留意写入结果中带重复后缀的永久链接（`-1`、`-2`）。

## 第 4 阶段 — 助手设置

只有助手在每次会话中都加载这些规则，系统才能正常运作——否则，用户将成为唯一了解这些约定的人，这就违背了系统的初衷。

阅读 `references/assistant-setup.md`，并设置（或将确切文本交给用户）一个**持久化指令存根**：在其平台提供的某种始终加载的机制（项目指令、自定义指令、系统提示词、智能体上下文文件）中放置一个简短文本块，其大意是：*“在进行任何知识库工作之前，先阅读项目 X 中的启动路由说明，并遵循其中的分派表。”*

确定你的平台提供了什么机制，并给出具体的、针对该平台的操作步骤。如果无法确定平台，则提供通用存根，以及参考文件中列出的常见放置位置。在第 4 阶段结束时，执行其中描述的验证测试（模拟一个全新会话；确认路由已被加载并得到遵循）。

## 第 5 阶段 — 教学

使用他们的数据，通过实际操作来教学——不要只是讲解。进行以下简短练习：

1. **捕获** — “告诉我今天发生的一件事” → 一起创建笔记，并在填写过程中讲解各个 schema 字段和 observations。
2. **检索** — 让他们询问某些内容（“我手头有哪些事情？”，“关于 X，我知道些什么？”）→ 演示 `search_notes` 以及通过 `memory://` 链接读取内容；解释针对名称的标题搜索与语义搜索之间的区别。
3. **更新** — 更改状态、追加一条 observation、添加一行 changelog——展示如何使用 `edit_note` 进行有针对性的更改，而不是完全覆盖。
4. **连接** — 在他们的两条笔记之间添加 relation；展示 `build_context` 如何遍历关系图。

然后在他们的 KB 中（`Instructions/` 文件夹）写入一条**速查表笔记**：列出他们可以说的短语、每个短语会触发的操作，以及核心规则。这条笔记属于他们——应当为人类而写，而不是为助手而写。

## 第 6 阶段 — 扩展

在结束引导时，为未来的扩展打开大门：

- **建议 2–3 个具体扩展方向**，这些方向应来自他们在第 1 阶段暂缓处理的领域，或与他们已构建内容自然相邻的领域（已构建任务 → 建议添加会议；已构建财务 → 建议添加续订日历；已构建研究 → 建议添加阅读日志）。将每项建议表述为“当你准备好时”——绝不要构建未经请求的内容。
- **维护节奏** — 建议进行定期（每周/每月）审查：使用 `schema_diff` 检查漂移，扫描重复笔记或孤立笔记，清理过时状态。如果他们的平台支持计划任务/重复任务，则主动提出帮助设置。
- **演进规则** — 当某项约定开始变得不再顺手时，修改指令笔记（并添加一行 changelog），不要悄然偏离。只有其中的规则始终真实有效，系统才能保持自描述性。

## 参考文件

| 文件 | 何时阅读 |
|:--|:--|
| `references/conventions.md` | 第 2 阶段之前。启动路由的结构、指令笔记、changelogs、索引、链接、写入规范、失败模式。 |
| `references/schema-guide.md` | 第 2 阶段之前。Picoschema 语法、observations、relations、验证工作流。 |
| `references/domain-playbooks.md` | 第 1–2 阶段，针对用户选择的每个领域。每个领域的入门文件夹、schemas、命名方式和示例笔记。 |
| `references/assistant-setup.md` | 第 4 阶段。各平台的持久化指令存根模式和验证测试。 |

## 相关技能

当此技能与配套技能一同安装时，应移交给这些技能处理，而不是重复实现：使用 **memory-notes** 和 **memory-schema** 处理笔记编写和模式机制，使用 **memory-tasks** 处理智能体侧的任务跟踪，使用 **memory-lifecycle** 处理重构路径上的归档，使用 **memory-defrag** / **memory-curate** / **memory-reflect** 执行第 6 阶段的定期维护，并使用 **memory-continue** 从图谱中恢复工作——这是完成引导后很自然应该首先教授的内容。