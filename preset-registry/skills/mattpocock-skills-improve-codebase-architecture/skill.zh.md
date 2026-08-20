---
name: improve-codebase-architecture
description: Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick.
disable-model-invocation: true
---
# 改进代码库架构

发现架构摩擦，并提出**深化机会**：通过重构将浅层 module 转变为深层 module。目标是提高可测试性和 AI 可导航性。

此命令以项目的领域模型为依据，并建立在一套共享的设计词汇之上：

- 使用 "codebase-design" 调用 Skill 工具，以获取架构词汇（**module**、**interface**、**depth**、**seam**、**adapter**、**leverage**、**locality**）及其原则（deletion test、"the interface is the test surface"、"one adapter = hypothetical seam, two = real"）。在每一条建议中都必须准确使用这些术语，不要偏移到 "component"、"service"、"API" 或 "boundary"。
- `CONTEXT.md` 中的领域语言为良好的 seam 提供了名称；`docs/adr/` 中的 ADR 记录了此命令不应重新争论的决策。

## 流程

### 1. 探索

**扫描之前先确定范围：YAGNI。** 深化 module 的价值在于让未来对它的修改更加容易，因此应特别关注代码库中近期发生过变更的部分。先决定*去哪里*查看，再开始查看：

- 如果用户指定了方向（某个 module、子系统或痛点），就沿该方向进行，并跳过下面的推断步骤。
- 否则，回溯足够长的一段提交历史（`git log --oneline`），找出代码库中的热点，即反复出现的文件和区域，并优先让这些路径引导你的注意力。如果变更较为分散，没有明确热点，则扩大搜索范围。

首先阅读项目的领域术语表（`CONTEXT.md`），以及与你正在处理的区域相关的所有 ADR。

然后启动一个子代理来遍历代码库。不要遵循僵化的启发式规则；应自然地探索，并记录你感受到摩擦的位置：

- 在哪些地方，理解一个概念需要在许多小型 module 之间来回跳转？
- 哪些 module 是**浅层的**，其 interface 几乎与实现同样复杂？
- 哪些地方仅为了可测试性而提取了纯函数，但真正的 bug 隐藏在这些函数的调用方式中（缺乏 **locality**）？
- 哪些紧密耦合的 module 会跨越其 seam 泄漏？
- 代码库中的哪些部分未经测试，或难以通过其当前 interface 进行测试？

对任何你怀疑是浅层的对象应用 **deletion test**：删除它会集中复杂性，还是只会转移复杂性？你要寻找的信号是“会集中复杂性”。

### 2. 以 HTML 报告形式展示候选项

将一个自包含的 HTML 文件写入操作系统的临时目录，确保不会有任何内容落入仓库。通过 `$TMPDIR` 解析临时目录，若不可用则回退到 `/tmp`（Windows 上为 `%TEMP%`），并写入 `<tmpdir>/architecture-review-<timestamp>.html`，以确保每次运行都会生成一个新文件。为用户打开该文件（Linux 上使用 `xdg-open <path>`，macOS 上使用 `open <path>`，Windows 上使用 `start <path>`），并告知用户其绝对路径。

报告通过 CDN 使用 **Tailwind** 完成布局和样式，并在图形、流程或时序能够可靠表达结构时，通过 CDN 使用 **Mermaid** 绘制图表。将 Mermaid 与手工制作的 CSS/SVG 可视化混合使用：当关系呈图结构时（调用图、依赖关系、时序），使用 Mermaid；当你希望获得更具编辑设计感的效果时（质量图、剖面图、折叠动画），使用手工构建的 div/SVG。每个候选项都要提供一组**重构前/重构后可视化图示**。增强视觉表现力。

对于每个候选方案，渲染一张卡片，包含：

- **文件**：涉及哪些文件/模块
- **问题**：当前架构为何会造成阻力
- **解决方案**：用通俗易懂的语言描述将做出哪些变更
- **收益**：从局部性和杠杆效应的角度进行说明，以及测试将如何得到改善
- **之前 / 之后示意图**：并排放置、自定义绘制，用于说明原本的浅层结构及其深化过程
- **推荐强度**：`Strong`、`Worth exploring`、`Speculative` 之一，以徽章形式呈现

在报告末尾添加一个**首要推荐**部分：说明你会优先处理哪个候选方案，以及原因。

**领域相关表述使用 CONTEXT.md 中的词汇，架构相关表述使用 `/codebase-design` 中的词汇。** 如果 `CONTEXT.md` 定义了“Order”，就使用“Order intake 模块”，而不是“FooBarHandler”，也不是“Order 服务”。

**ADR 冲突**：如果某个候选方案与现有 ADR 冲突，只有当实际存在的阻力足以证明值得重新审视该 ADR 时，才将其列出。在卡片中明确标记（例如使用警告提示：_*“与 ADR-0007 冲突，但值得重新讨论，因为……”*_）。不要列出 ADR 所禁止的每一种理论上的重构方案。

完整的 HTML 脚手架、示意图模式和样式指南，请参阅 [HTML-REPORT.md](HTML-REPORT.md)。

暂时不要提出接口设计。文件写入后，询问用户：“你想探索其中哪一个？”

### 3. 追问循环

用户选择候选方案后，使用“grilling”调用 Skill 工具，与他们一起梳理决策树：约束、依赖关系、深化后模块的形态、接缝之后包含什么，以及哪些测试能够保留。

随着决策逐渐明确，相关变更会同步发生；在此过程中，使用“domain-modeling”调用 Skill 工具，以保持领域模型为最新状态：

- **要用 `CONTEXT.md` 中不存在的概念命名深化后的模块？** 将该术语添加到 `CONTEXT.md`。如果文件不存在，则按需创建。
- **在对话过程中让某个模糊术语变得更精确？** 当场更新 `CONTEXT.md`。
- **用户以影响整体决策的理由否决了候选方案？** 提议编写 ADR，并这样表述：_*“要我将此记录为 ADR，以免未来的架构审查再次提出这个建议吗？”*_ 只有当未来的探索者确实需要知道该理由，才能避免再次提出同一建议时，才进行提议；对于临时性理由（“现在不值得做”）和不言自明的理由，则跳过。
- **想要探索深化后模块的替代接口？** 使用“codebase-design”调用 Skill 工具，并采用其 design-it-twice 并行子代理模式。