---
name: code-review
description: Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes — Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating issue/spec asked for?). Runs both reviews in parallel sub-agents and reports them side by side. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to "review since X".
---
对 `HEAD` 与用户提供的固定点之间的差异进行 **双轴评审**：

- **标准（Standards）**——代码是否符合该仓库记录的编码标准？
- **规格（Spec）**——代码是否忠实实现了源问题/规格说明？

两个轴以 **并行子代理**方式运行，以避免彼此污染上下文，之后该技能汇总它们的发现。

问题追踪器应该已提供给你——如果缺失 `docs/agents/issue-tracker.md`，请运行 `/setup-matt-pocock-skills`。

## 流程

### 1. 锁定固定点

无论用户说的是提交哈希、分支名、标签、`main`、`HEAD~5` 等，都是固定点——如果未指定，需要询问。

先获取一次 diff 命令：`git diff <fixed-point>...HEAD`（三点号，对比基于 merge-base）。同时记录提交列表：`git log <fixed-point>..HEAD --oneline`。

继续之前，先确认固定点可解析（`git rev-parse <fixed-point>`）且 diff 非空。无效引用或空 diff 在这里应直接失败——不能留到两个并行子代理里处理。

### 2. 识别规格来源

按以下顺序查找源规格：

1. 提交信息中的问题引用（`#123`、`Closes #45`、GitLab `!67` 等）——通过 `docs/agents/issue-tracker.md` 中的流程获取。
2. 用户作为参数传入的路径。
3. 在 `docs/`、`specs/` 或 `.scratch/` 下，按分支名或特性匹配的规格文件。
4. 若未找到任何内容，询问用户规格位置；若其表示不存在，则 **Spec** 子代理将跳过并报告“no spec available”。

### 3. 识别标准来源

仓库中任何记录代码书写方式的文档，如 `CODING_STANDARDS.md` 或 `CONTRIBUTING.md`。

在仓库文档之外，标准轴始终带有如下 **气味基线**——一组固定的 Fowler 代码异味（《重构》第 3 章），即使仓库什么都没写也适用。它有两条规则：

- **仓库优先。** 文档化的仓库规范始终优先；当其认可某项内容时，即便基线会标记，也应抑制该气味。
- **始终是判断题。** 每个气味都是带标签的启发式（“possible Feature Envy”），并非硬性违规——像这里的任何标准一样，跳过已有工具强制的内容。

每种异味都按“是什么”→“如何修复”描述；按 diff 进行匹配：

- **Mysterious Name** —— 函数、变量或类型的名字无法体现其作用或承载内容。→ 重命名；若找不到真实名字，设计可能不清晰。
- **Duplicated Code** —— 同一逻辑形状在修改中出现在多个代码块或文件中。→ 提取公共形状并在两处调用。
- **Feature Envy** —— 方法访问另一个对象的数据比访问自身数据更多。→ 将方法移到它“依赖”数据所在对象上。
- **Data Clumps** —— 相同的少量字段或参数总是一起出现（暗示一个类型应诞生）。→ 将它们封装成一个类型并传递该类型。
- **Primitive Obsession** —— 用原始类型或字符串代替应有的领域概念。→ 给该概念定义一个小型专用类型。
- **Repeated Switches** —— 在变更中对同一类型重复出现相同 `switch`/`if` 链。→ 用多态替代，或让两个位置共享一张映射。
- **Shotgun Surgery** —— 一项逻辑变更迫使在 diff 中的多个文件做零散改动。→ 将相关改动汇总到一个模块。
- **Divergent Change** —— 一个文件或模块因多项不相关原因被编辑。→ 拆分，让每个模块只为单一原因修改。
- **Speculative Generality** —— 为当前规格不存在的需求添加了抽象、参数或钩子。→ 删除它们；等真实需求出现再逐步补齐。
- **Message Chains** —— 出现 `a.b().c().d()` 这种调用链，调用者不应依赖。→ 在首个对象上封装为单一方法。
- **Middle Man** —— 类或函数主要只是转发调用。→ 去掉它，直接调用真正目标。
- **Refused Bequest** —— 子类或实现者忽略/覆盖了继承的大部分行为。→ 放弃继承，改用组合。

### 4. 并行启动两个子代理

**Standards 子代理提示词** — 包含：

- 完整的 diff 命令和提交列表。
- 第 3 步中找到的所有标准来源文件，**以及完整粘贴第 3 步的气味基线**——该子代理无法从其他地方获取它。
- 简报：“报告——按文件/代码块逐项（如相关）——(a) diff 中每个违反文档化标准的地方：引用标准（文件 + 规则）；以及 (b) 你发现的任何基线异味：命名并引用相关代码块。区分硬性违规与判断性问题——文档化标准冲突可算硬性违规，但基线异味始终为判断性；工具已强制的内容应跳过。控制在 400 字以内。”

**Spec 子代理提示词** — 包含：

- diff 命令和提交列表。
- 规格文件路径或已抓取的规格内容。
- 简报：“报告：(a) 规格要求但缺失或仅部分实现的需求；(b) diff 中出现但规格未要求的行为（范围蔓延）；(c) 看似已实现但实现明显有误的需求。每个发现都要引用对应规格原文。控制在 400 字以内。”

如果缺少规格，跳过 Spec 子代理，并在最终报告中注明。

### 5. 汇总

在 `## Standards` 和 `## Spec` 标题下分别给出两份报告，可逐字保留或轻微精修。**不要**合并或重排发现——两个轴刻意独立（见 *Why two axes*）。

以一行总结收尾：每个轴的发现总数，以及每个轴内最严重的问题（若有）。不要在两个轴之间选“胜者”——分开展示就是为了避免一个轴掩盖另一个。

## 为什么是两个轴

一次变更可能在一个轴上通过、另一个上失败：

- 代码完全符合所有标准但实现了错误内容 → **Standards 通过，Spec 失败。**
- 代码完全按问题要求实现，但破坏了项目惯例 → **Spec 通过，Standards 失败。**

分开报告可避免一个轴掩盖另一个轴。
