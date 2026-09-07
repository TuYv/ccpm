---
name: code-review
description: "Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes: Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating issue/spec asked for?). Runs both reviews in parallel sub-agents and reports them side by side. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to \"review since X\"."
---
对 `HEAD` 与用户所提供的固定点之间的 diff 进行双轴审查：

- **Standards**：代码是否符合本仓库已文档化的编码规范？
- **Spec**：代码是否忠实实现了来源 issue / 规格？

两个轴以**并行子代理**的方式运行，以免相互污染上下文，随后由本技能汇总它们的发现。

issue 追踪器应当已经提供给你。如果 `docs/agents/issue-tracker.md` 缺失，请告知用户运行 `/setup-matt-pocock-skills`。

## 流程

### 1. 锁定固定点

用户所说的内容即为固定点（commit SHA、分支名、tag、`main`、`HEAD~5` 等）。如果用户没有指定，请向其询问。

一次性确定 diff 命令：`git diff <fixed-point>...HEAD`（三个点，因此比较对象是 merge-base）。同时用 `git log <fixed-point>..HEAD --oneline` 记下提交列表。

在继续之前，请确认固定点可以解析（`git rev-parse <fixed-point>`），且 diff 非空。无效的 ref 或空的 diff 应当在此处就报错，而不是等到两个并行子代理内部才失败。

### 2. 确定规格来源

按以下顺序查找规格来源：

1. 提交信息中的 issue 引用（`#123`、`Closes #45`、GitLab 的 `!67` 等），通过 `docs/agents/issue-tracker.md` 中的工作流获取。
2. 用户以参数形式传入的路径。
3. 位于 `docs/`、`specs/` 或 `.scratch/` 下、与分支名或功能相匹配的规格文件。
4. 如果一无所获，询问用户规格在哪里。如果用户表示没有规格，**Spec** 子代理将跳过并报告“无可用规格”。

### 3. 确定规范来源

仓库中任何记录代码应当如何编写的文档，例如 `CODING_STANDARDS.md` 或 `CONTRIBUTING.md`。

除仓库自身文档化的规范外，Standards 轴始终附带以下**坏味道基线**：一组固定的 Fowler 代码坏味道（_Refactoring_ 第 3 章），即使仓库没有文档化任何规范也适用。有两条规则约束它：

- **以仓库为准。** 已文档化的仓库规范总是优先；凡是仓库规范认可的、基线本会标记的写法，都应抑制该坏味道。
- **始终是主观判断。** 每个坏味道都是一个带标签的启发式判断（“可能存在 Feature Envy”），绝不是硬性违规。与这里的任何规范一样，凡工具已强制执行的内容一律跳过。

每个坏味道的表述为*是什么* → *如何修复*；请将其与 diff 对照：

- **Mysterious Name**：函数、变量或类型的名字无法揭示其功能或所承载的内容。→ 为其重命名；若想不出贴切的名字，说明设计本身含混不清。
- **Duplicated Code**：相同的逻辑形态出现在变更中的多个 hunk 或文件里。→ 提取共享形态，让两处都调用它。
- **Feature Envy**：某方法对其他对象数据的访问多于对自己数据的访问。→ 把该方法移到它所依恋的数据上。
- **Data Clumps**：同样几个字段或参数总是结伴出现（一个想要诞生的类型）。→ 将它们捆绑为一个类型，传递该类型。
- **Primitive Obsession**：用基本类型或字符串顶替一个本应拥有自己类型的领域概念。→ 为该概念创建一个专属的小类型。
- **Repeated Switches**：针对同一类型的相同 `switch`/`if` 级联在变更中反复出现。→ 改用多态，或改用两处共享的一个映射。
- **Shotgun Surgery**：一次逻辑变更迫使 diff 中的许多文件出现分散修改。→ 把共同变化的内容聚合到一个模块中。
- **Divergent Change**：一个文件或模块因多个互不相关的原因被修改。→ 拆分它，使每个模块只因一个原因而变化。
- **Speculative Generality**：为规格中并不存在的需求而添加的抽象、参数或钩子。→ 删除它；先内联回去，直到真实需求出现。
- **Message Chains**：调用方不应依赖的过长 `a.b().c().d()` 导航链。→ 在第一个对象上用一个方法隐藏这段遍历。
- **Middle Man**：基本只做转发委托的类或函数。→ 删掉它，直接调用真正的目标。
- **Refused Bequest**：忽略或覆盖了所继承内容大部分的子类或实现者。→ 放弃继承，改用组合。

### 4. 并行启动两个子代理

**Standards 子代理的提示词**应包含：

- 完整的 diff 命令和提交列表。
- 你在第 3 步找到的规范来源文件列表，**外加第 3 步的坏味道基线**（须完整粘贴进去；子代理没有其他途径获取它）。
- 任务简报：“在相关的文件/hunk 层面报告：(a) diff 中每一处违反已文档化规范的地方：引用该规范（文件 + 规则）；以及 (b) 你发现的任何基线坏味道：指明名称并引用相应的 hunk。区分硬性违规与主观判断：违反已文档化规范可以算硬性违规，但基线坏味道始终属于主观判断，且已文档化的仓库规范优先于基线。跳过工具已强制执行的内容。不超过 400 字。”

**Spec 子代理的提示词**应包含：

- diff 命令和提交列表。
- 规格的路径或已获取到的内容。
- 任务简报：“报告：(a) 规格有所要求但缺失或不完整的需求；(b) diff 中未被要求的行为（范围蔓延）；(c) 看似已实现、但实现方式看起来有误的需求。每条发现都要引用对应的规格原文行。不超过 400 字。”

如果规格缺失，则跳过 Spec 子代理，并在最终报告中注明这一点。

### 5. 汇总

将两份报告分别置于 `## Standards` 和 `## Spec` 标题之下呈现，逐字保留或仅作轻度清理。**不要**合并或重新排序各项发现，因为两个轴是有意分开的（见 _为什么是两个轴_）。

最后以一行总结收尾：每个轴的发现总数，以及_每个轴内部_最严重的问题（如有）。不要跨轴选出唯一的头号问题：那正是这种分离所要防止的重新排序。

## 为什么是两个轴

一个变更可能通过其中一个轴、却未通过另一个轴：

- 代码遵循了每一条规范，但实现的东西是错的 → **Standards 通过，Spec 失败。**
- 代码完全按 issue 的要求行事，却破坏了项目的约定 → **Spec 通过，Standards 失败。**

分开报告可以避免其中一个轴掩盖另一个轴。
