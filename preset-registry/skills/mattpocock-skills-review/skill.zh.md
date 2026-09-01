---
name: review
description: Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes — Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating issue/PRD asked for?). Runs both reviews in parallel sub-agents and reports them side by side. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to "review since X".
---
对 `HEAD` 与用户提供的固定点之间的 diff 进行双轴评审：

- **Standards** — 代码是否符合本仓库已记录的编码规范？
- **Spec** — 代码是否忠实实现了来源 issue / PRD / spec？

两个轴都以**并行子代理**运行，以免彼此污染上下文，随后此技能会汇总它们的发现。

issue 跟踪系统应当已经提供给你 —— 如果缺少 `docs/agents/issue-tracker.md`，请运行 `/setup-matt-pocock-skills`。

## 流程

### 1. 固定固定点

用户所说的固定点就是固定点 —— commit SHA、分支名、tag、`main`、`HEAD~5` 等。如果他们没有指定，请询问。

只捕获一次 diff 命令：`git diff <fixed-point>...HEAD`（使用三点，因此比较对象是 merge-base）。同时通过 `git log <fixed-point>..HEAD --oneline` 记录 commit 列表。

在继续之前，确认固定点可解析（`git rev-parse <fixed-point>`），并且 diff 非空。坏的 ref 或空 diff 应在这里失败 —— 而不是在两个并行子代理内部失败。

### 2. 确定 spec 来源

按以下顺序查找来源 spec：

1. commit 消息中的 issue 引用（`#123`、`Closes #45`、GitLab `!67` 等） —— 按照 `docs/agents/issue-tracker.md` 中的工作流获取。
2. 用户作为参数传入的路径。
3. `docs/`、`specs/` 或 `.scratch/` 下与分支名或功能匹配的 PRD/spec 文件。
4. 如果什么都没找到，询问用户 spec 在哪里。如果对方说没有 spec，**Spec** 子代理将跳过并报告“没有可用 spec”。

### 3. 确定规范来源

仓库中任何记录代码应如何编写的内容，例如 `CODING_STANDARDS.md` 或 `CONTRIBUTING.md`。

除仓库记录的内容外，Standards 轴始终携带以下 **smell 基线** —— 一组固定的 Fowler 代码坏味道（_Refactoring_，第 3 章），即使仓库没有任何记录也适用。两条规则约束它：

- **仓库优先。** 已记录的仓库规范始终胜出；在它认可基线会标记的内容时，抑制该 smell。
- **始终是判断题。** 每个 smell 都是带标签的启发式规则（“可能的 Feature Envy”），绝不是硬性违规 —— 并且，与这里的任何规范一样，跳过工具已经强制执行的内容。

每种坏味道的阅读方式都是*它是什么* → *如何修复*；将其与 diff 匹配：

- **Mysterious Name** —— 函数、变量或类型的名称无法揭示其作用或内容。 → 重命名；如果起不出诚实的名称，说明设计混乱。
- **Duplicated Code** —— 同一逻辑形状出现在变更中的多个 hunk 或文件中。 → 提取共享形状，让两处都调用它。
- **Feature Envy** —— 方法访问另一个对象数据的次数多于自身数据。 → 把该方法移动到它艳羡的数据上。
- **Data Clumps** —— 同样几个字段或参数总是结伴出现（一个想要诞生的类型）。 → 将它们捆绑成一个类型并传递它。
- **Primitive Obsession** —— 用基本类型或字符串替代本应拥有自己类型的领域概念。 → 为该概念创建一个小类型。
- **Repeated Switches** —— 对同一类型的相同 `switch`/`if` 级联在变更中反复出现。 → 用多态替换，或使用两处共享的一个映射。
- **Shotgun Surgery** —— 一次逻辑变更迫使 diff 中许多文件分散修改。 → 把一起变化的内容聚集到一个模块中。
- **Divergent Change** —— 一个文件或模块因多个无关原因被修改。 → 拆分，使每个模块只因一个原因变化。
- **Speculative Generality** —— 为 spec 没有的需求添加抽象、参数或钩子。 → 删除它；回退内联，直到真实需求出现。
- **Message Chains** —— 调用方不应依赖的长 `a.b().c().d()` 导航。 → 用第一个对象上的一个方法隐藏这段遍历。
- **Middle Man** —— 主要只是继续委派的类或函数。 → 去掉它，直接调用真实目标。
- **Refused Bequest** —— 忽略或覆盖大部分继承内容的子类或实现者。 → 放弃继承，使用组合。

### 4. 并行生成两个子代理

发送一条包含两个 `Agent` 工具调用的消息。两者都使用 `general-purpose` 子代理。

**Standards 子代理提示词** —— 包含：

- 完整 diff 命令和 commit 列表。
- 你在第 3 步找到的规范来源文件列表，**加上第 3 步的 smell 基线全文** —— 子代理无法通过其他途径访问它。
- 简要说明：“报告 —— 按相关文件/hunk —— (a) diff 违反已记录规范的每一处：引用该规范（文件 + 规则）；以及 (b) 你发现的任何基线 smell：命名它并引用对应 hunk。区分硬性违规与判断题 —— 已记录规范违反可能是硬性的，但基线 smell 始终是判断题，且已记录的仓库规范优先于基线。跳过工具已强制执行的内容。400 词以内。”

**Spec 子代理提示词** —— 包含：

- diff 命令和 commit 列表。
- spec 的路径或获取到的内容。
- 简要说明：“报告：(a) spec 要求但缺失或不完整的需求；(b) diff 中未被要求的行为（scope creep）；(c) 看似已实现但实现看起来错误的需求。每项发现都引用对应 spec 行。400 词以内。”

如果缺少 spec，跳过 Spec 子代理，并在最终报告中注明这一点。

### 5. 汇总

将两份报告放在 `## Standards` 和 `## Spec` 标题下呈现，原样或轻度清理即可。**不要**合并或重新排序发现 —— 两个轴刻意分开（见 _Why two axes_）。

以一行摘要结束：每个轴的发现总数，以及_每个轴内_最严重的问题（如果有）。不要跨轴选出唯一赢家 —— 那正是这种分离所要防止的重新排序。

## 为什么要用两个轴

一个变更可能通过一个轴却未通过另一个轴：

- 代码遵循每条规范，但实现了错误的东西 → **Standards 通过，Spec 失败。**
- 代码完全按照 issue 要求执行，但破坏项目约定 → **Spec 通过，Standards 失败。**

分开报告可以防止一个轴掩盖另一个轴。
