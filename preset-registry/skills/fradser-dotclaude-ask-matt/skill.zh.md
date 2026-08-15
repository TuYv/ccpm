---
name: ask-matt
description: Recommends the skill or flow that fits the user's situation. A router over the skills in this repo. Use when the user asks which skill to use, is unsure what fits, or needs a pointer to the right workflow.
disable-model-invocation: true
---
# 问 Matt

你不可能记得每一项技能，所以直接问。

**流程**是贯穿各项技能的一条路径。大多数路径沿着一条**主流程**推进，另有两条**入口匝道**汇入其中。其余技能要么可以独立使用，要么属于贯穿底层的术语层。

## 主流程：想法 → 交付

大多数工作的推进路线。你有一个想法，并希望将它构建出来。

1. **`/mattpocock:grill-with-docs`** — 通过访谈打磨想法。当你**已有代码库**时从这里开始：它是有状态的，会将了解到的内容保留在 `CONTEXT.md` 和 ADR 中。（没有代码库？使用 `/mattpocock:grill-me` — 参见“独立使用”。两者都运行相同的 `/mattpocock:grilling` 原语；`grill-with-docs` 会留下书面记录。）
2. **分支 — 你能否在对话中解决所有问题？** 如果某个问题需要通过可运行的成果来回答（状态、业务逻辑、必须亲眼看到的 UI），就绕道构建原型，并在两个方向上都通过 **`/mattpocock:handoff`** 衔接（参见“跨会话”）：
   - 使用 **`/mattpocock:handoff`** 导出，然后针对该文件开启一个新会话，
   - 使用 **`/mattpocock:prototype`** 通过一次性代码回答问题，
   - 使用 **`/mattpocock:handoff`** 将你了解到的内容传回，并在最初的想法讨论线程中引用它。
3. **分支 — 这是一个跨多个会话的构建任务吗？**
   - **是** → 使用 **`/mattpocock:to-spec`**（将讨论线程转化为规范），然后使用 **`/mattpocock:to-tickets`** 将其拆分为曳光弹式工单，每个工单都要声明自己的**阻塞边**。使用本地跟踪器时，每个工单对应 `.scratch/<feature>/issues/` 下的一个文件，并手动按照阻塞项优先的顺序处理；使用真正的跟踪器时，这些边会转换为原生的阻塞链接，因此任何阻塞项均已完成的工单都可以被领取 — 为每个工单启动 **`/mattpocock:implement`**，并且**每完成一个就清除上下文**。
   - **否** → 就在这里、在同一个上下文窗口中使用 **`/mattpocock:implement`**。

   无论哪种情况，**`/mattpocock:implement`** 都会在内部驱动 **`/mattpocock:bdd`**（发现 → 形式化，然后将自动化委托给 `/mattpocock:tdd`），以此构建每个问题 — 每次完成一个垂直切片 — 然后在提交前运行 **`/mattpocock:code-review`** 来收尾，对差异进行双轴审查（标准 + 规范）。当你想为某项功能定义 Gherkin 场景时，可以单独使用 **`/mattpocock:bdd`**；当你想在 BDD 自动化阶段编写测试时，可以单独使用 **`/mattpocock:tdd`**。每当你想以某个固定点为基准审查分支或 PR 时，都可以单独使用 **`/mattpocock:code-review`**。

### 上下文卫生

让步骤 1–3 保持在**同一个不中断的上下文窗口**中 — 在 `/mattpocock:to-tickets` 之后再压缩或清除上下文 — 这样盘问、规范和工单就都能建立在同一套思路之上。之后，每个 `/mattpocock:implement` 都从全新的上下文开始，根据工单开展工作。

这里的限制是**[智能区间](https://www.aihero.dev/ai-coding-dictionary/smart-zone)**：在这个窗口内（最先进的模型约为 120k 个 token），模型仍能进行敏锐的推理。如果某个会话在执行 `/mattpocock:to-tickets` 之前就接近这一限制，不要在能力退化的情况下强行继续 — 使用 `/mattpocock:handoff`，然后在新的讨论线程中继续。

## 关键：按场景选择流程，而不是按习惯

Wayfinder 只适用于单次会话无法完成的大型工作——绝不要用于范围明确的功能。Triage 只适用于并非由用户创建的问题——绝不要用于 `/mattpocock:to-tickets` 生成的工单。步骤 1–3 必须保持在同一个连续的上下文窗口中：在完成 `/mattpocock:to-tickets` 之前，不要执行 compact 或 clear。

## 接入路径

一种能够产生工作，并随后汇入主流程的起始情境。

- **Bug 和请求不断积压** → **`/mattpocock:triage`**。它会让问题依次经过各个分诊角色，并生成可供代理直接处理的问题，之后由 **`/mattpocock:implement`** 接手。

  Triage 只适用于**并非由你创建**的问题——Bug 报告、传入的功能请求，以及任何未经整理直接提交的内容。由 `/mattpocock:to-tickets` 生成的工单已经可以供代理直接处理，因此**不要对它们进行分诊**。

- **某些东西坏了** → **`/mattpocock:diagnosing-bugs`**。适用于棘手的问题：乍看之下无法解决的 Bug、间歇性出现的不稳定故障，以及在两个已知正常状态之间悄然引入的回归。它会拒绝在建立**紧密反馈循环**之前提出理论——即一个能够在*这个* Bug 上稳定报错的命令——然后通过回归测试完成修复。若事后复盘发现真正的问题在于缺少合适的切入点来锁定该 Bug，它会将工作移交给 **`/mattpocock:improve-codebase-architecture`**。

- **一项庞大而模糊的工作——全新项目或大型功能建设，单次会话无法完成** → **`/mattpocock:wayfinder`**，这是这里对认知要求最高的流程。当从当前位置通往目标的道路尚不可见时，它会在问题跟踪器中绘制一张由**决策工单**组成的**共享地图**，并逐一解决这些工单——产出的是**决策，而不是交付成果**——直到迷雾散去、道路清晰。**`/mattpocock:grill-with-docs`** 用于打磨能在一次会话中完整把握的想法，而 wayfinder 则用于你无法在一次会话中把握的想法——它更慢、信息密度也更高，因此只应在确实适合的情况下使用，绝不要用于范围明确的功能。

  当地图变得清晰时，**它会移交工作，而不是进行构建**：在 **`/mattpocock:to-spec`** 处汇入主流程，由其将地图中相互关联的决策整合为可执行的构建计划，然后照常使用 `/mattpocock:to-tickets` 和 `/mattpocock:implement`。将地图直接交给 `/mattpocock:implement` 会跳过这一整合步骤，丢失相互关联的细节——只有当这项工作最终确实很小时，才直接使用 `/mattpocock:implement`。

## 代码库健康度

不是功能开发——而是维护工作。

- **`/mattpocock:improve-codebase-architecture`**——只要有空闲时间，就运行它，以保持代码库适合代理开展工作。它会发现**深化改进的机会**；选择其中一个机会，便会*生成一个想法*，你可以在 `/mattpocock:grill-with-docs` 处将其带入主流程。它是寻找候选项的勘察工具；**`/mattpocock:codebase-design`**（见下文）则是用于设计所选候选项的工作台。

## 底层词汇体系

由模型调用、运行在其他技能*底层*的参考资料——每一份都是其词汇体系的唯一事实来源。当问题出在**用词**而非流程时，可以直接调用它们；也可以让上述技能自行将其引入。

- **`/mattpocock:codebase-design`** — 用于设计模块*形态*的深模块词汇体系（模块、接口、深度、接缝、适配器、杠杆效应、局部性）：在清晰的接缝处，通过小型接口提供大量行为。`/mattpocock:bdd`、`/mattpocock:tdd`（BDD 驱动）和 `/mattpocock:improve-codebase-architecture` 都使用这套语言。
- **`/mattpocock:domain-modeling`** — 打磨项目的*领域*语言：质疑含糊的术语，解决含义过载的词语（例如用“账户”承担三种职责），将难以撤销的决策记录为 ADR。这是 `/mattpocock:grill-with-docs` 为保持 `CONTEXT.md` 词汇表清晰而推动执行的主动实践。

## 跨会话

**阶段**是一个会话内的一块工作——盘问、实现、QA。在两个阶段之间的**边界**处，你有五种选择，而如何在它们之间作出选择，是整张图中最模糊的决策：

- **继续** — 留在原处。没有成本，也不会丢失任何内容。
- **`/clear`** — 清空上下文窗口，适用于这里没有任何内容与接下来的工作相关时。
- **`/mattpocock:handoff`** — 编写一个可移植的 Markdown 文件。适用范围很窄：只用于**新的运行环境**、**新的目录**、**同事**，或在**阶段中途**分叉出一个支线任务。它带来的价值是可移植性。它是上下文窗口之间的桥梁，两个方向都适用。
- **子代理** — 将一个范围明确的任务发送到它自己的上下文窗口中，然后取回报告。
- **`/compact`**（内置）— 压缩当前上下文，并以此为基础开启一个新会话。它是**默认选项**，位于决策树的底部，而不是最先考虑的选项。

请阅读 [PHASE-BOUNDARIES.md](PHASE-BOUNDARIES.md)，了解按顺序排列的决策树——五个问题、每个分支背后的推理，以及为什么一手资料成本使得**继续**成为应当首先排除的选项。应当在边界处作出决定；如果正处于阶段中途，则继续，或将剩余工作拆分给子代理。`/mattpocock:handoff` 会分叉；`/compact` 会延续。

## 独立使用

完全位于主流程之外。

- **`/mattpocock:grill-me`** — 与 `/mattpocock:grill-with-docs` 相同的无情访谈，但适用于你**没有代码库**的情况。无状态：它不会在本地保存任何内容，也不会构建 `CONTEXT.md`。当你需要完善任何不依附于代码仓库的计划或设计时，请使用它。
- **`/mattpocock:grilling`** — 访谈原语本身：通过 AskUserQuestion 工具一次提出一个问题，事实由代理负责，决策由你负责。`/mattpocock:grill-me` 和 `/mattpocock:grill-with-docs` 是两个有名称的入口，而 `/mattpocock:triage`、`/mattpocock:wayfinder` 和 `/mattpocock:improve-codebase-architecture` 都会在内部运行它。只有当你想要不带任何包装的访谈时，才直接使用它。
- **`/mattpocock:resolving-merge-conflicts`** — 逐个冲突块处理正在进行的合并或变基冲突，根据追溯到冲突双方一手资料的**意图**来解决冲突，而不是直接选择代码行，然后完成该操作。它永远不会运行 `--abort`。它是独立技能，不属于任何流程：当你已经身处冲突处理中时，请使用它。
- **`/mattpocock:prototype`** — 一个小型、用完即弃的程序，用于回答一个设计问题：这个状态模型是否合理，或者这个 UI 应该是什么样子。它是主流程第 2 步中的一条岔路，但只要某个设计问题难以通过书面讨论确定，你随时都可以使用它。
- **`/mattpocock:research`** — 将阅读调研工作委派给一个**后台代理**：它依据**一手资料**调查问题，然后在代码仓库中留下一个带引用的 Markdown 文件。它阅读时，你可以继续工作。它生成的文件应当被带入 `/mattpocock:grill-with-docs` 的主流程中——调研为思考提供素材，但不能取代思考。
- **`/mattpocock:to-questionnaire`** — 当阻碍你的信息既不在你的脑中，也不在代码库中，而是在**其他人的**脑中时，它会编写一份问卷供对方填写。它是 `/mattpocock:grill-me` 的反向版本：它不会就主题采访你，而是就**发送行为**采访你——问卷要发给谁、你需要收回什么信息——然后针对信息缺口设计问题。收回的内容可以作为 `/mattpocock:grill-with-docs` 或 `/mattpocock:to-spec` 的素材。
- **`/mattpocock:wizard`** — 用于只有**人类**才能完成的步骤：配置基础设施、设置凭据或 CI 密钥、在不熟悉的第三方控制面板中逐步点击操作、执行一次性迁移或切换。它会生成一个交互式 Bash 脚本，打开每个 URL、捕获每个值，并将其写入 `.env` 和 GitHub 密钥——这样，这套流程就不再是你每次都需要重新向代理解释的内容。它由模型调用，因此代理一遇到只有你才能跨越的障碍，就会使用它。如果代理自己就能完成，那就应该自己完成；它只用于真正需要人类参与的地方。
- **`/mattpocock:wait-what`** — 用于纠正没有讲明白的消息。在对话中途、任何其他技能内部使用它，代理就会使用 `CONTEXT.md` 中的词汇，以浅显的英语补充你缺少的上下文，并换一种方式重新表述刚才所说的内容。它在事后发挥作用；`/mattpocock:grill-with-docs` 则是事前的解决方案，因为尽早约定共享语言，才能从根本上防止术语突然出现。
- **`/mattpocock:teach`** — 跨多个会话学习一个概念，并使用当前目录作为有状态的工作区。
- **`/mattpocock:writing-for-agents`** — 编写供代理使用的文档时的参考：技能、`AGENTS.md`/`CLAUDE.md`、被指向的文档。
- **`/mattpocock:writing-great-skills`** — 用于出色地编写和编辑技能的参考。
- **`/mattpocock:bdd`** — BDD 生命周期：发现 → 形式化 → 自动化（委派给 `/mattpocock:tdd`）。当你希望通过 Gherkin 场景定义功能行为时，请直接使用它。
- **`/mattpocock:tdd`** — BDD 驱动的自动化阶段：测试质量、接缝、模拟、反模式和红-绿循环规则。当你希望在 BDD 实现期间编写或改进测试时，请直接使用它。

## 前置条件

**`/mattpocock:setup-matt-pocock-skills`** — 在首次运行工程流程前执行，用于配置其他技能所依赖的问题跟踪器、分类标签和文档布局。也支持自定义问题跟踪器。