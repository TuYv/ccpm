---
name: improve-codebase-architecture
description: Scans a codebase for deepening opportunities, presents them as a visual HTML report, then grills through the chosen one. Use when the user wants to improve codebase architecture or find refactoring opportunities.
disable-model-invocation: true
---
# 改进代码库架构

揭示架构摩擦，并提出**深化机会**——通过重构将浅层 module 转变为深层 module。目标是提升可测试性和 AI 可导航性。

此命令以项目的领域模型为依据，并建立在一套共享的设计词汇之上：

- 运行 `/mattpocock:codebase-design` skill，获取架构词汇（**module**、**interface**、**depth**、**seam**、**adapter**、**leverage**、**locality**）及其原则（deletion test、“interface 就是测试表面”、“一个 adapter = 假想 seam，两个 adapter = 真实 seam”）。在每条建议中都必须准确使用这些术语——不要偏移到“component”、“service”、“API”或“boundary”。
- `CONTEXT.md` 中的领域语言为良好的 seam 提供了命名；`docs/adr/` 中的 ADR 记录了此命令不应重新争论的决策。

## 流程

### 1. 探索

**先确定范围再扫描——YAGNI。** 深化 module 的收益在于让未来对它的修改更加容易，因此要格外关注代码库中近期发生过变更的部分。在查看之前，先决定要查看*哪里*：

- 如果用户指定了方向——某个 module、子系统或痛点——就遵循该方向，并跳过下面的推断过程。
- 否则，向前回溯足够长的一段提交历史（`git log --oneline`），找出代码库中的热点——反复出现的文件和区域——并优先让这些路径引导你的注意力。如果变更分散且没有明确热点，就扩大范围。

首先阅读项目的领域术语表（`CONTEXT.md`），以及与你正在处理的区域相关的所有 ADR。

然后启动一个 sub-agent 遍历代码库。不要遵循僵化的启发式规则——以自然方式探索，并记录你遇到摩擦的位置：

- 在哪些地方，理解一个概念需要在许多小型 module 之间反复跳转？
- 哪些 module 是**浅层的**——interface 几乎与实现一样复杂？
- 哪些地方只是为了可测试性而提取了纯函数，但真正的 bug 隐藏在它们的调用方式中（缺乏 **locality**）？
- 哪些紧密耦合的 module 会跨越其 seam 泄漏？
- 代码库的哪些部分未经测试，或者难以通过其当前 interface 进行测试？

对任何你怀疑是浅层的内容应用 **deletion test**：删除它会集中复杂性，还是只会转移复杂性？你想要的信号是“是的，会集中复杂性”。

### 2. 以 HTML 报告形式展示候选项

将一个自包含的 HTML 文件写入操作系统临时目录，确保不会有任何内容落入仓库。通过 `$TMPDIR` 解析临时目录，若不可用则回退到 `/tmp`（Windows 上则为 `%TEMP%`），并写入 `<tmpdir>/architecture-review-<timestamp>.html`，确保每次运行都会生成一个新文件。为用户打开该文件——Linux 上使用 `xdg-open <path>`，macOS 上使用 `open <path>`，Windows 上使用 `start <path>`——并告知用户其绝对路径。

报告通过 CDN 使用 **Tailwind** 进行布局和样式设计，并通过 CDN 使用 **Mermaid** 绘制适合用图、流程或序列清晰表达结构的图表。将 Mermaid 与手工制作的 CSS/SVG 视觉元素混合使用——当关系呈图结构时（调用图、依赖关系、序列）使用 Mermaid；当你希望呈现更具编辑性的内容时（质量图、剖面图、折叠动画），使用手工构建的 div/SVG。每个候选项都要包含一个**前后对比可视化**。要注重视觉呈现。

对于每个候选项，渲染一张卡片，其中包含：

- **文件** — 涉及哪些文件/模块
- **问题** — 当前架构为何会造成阻力
- **解决方案** — 用通俗的语言描述将发生哪些变化
- **收益** — 从局部性和杠杆效应的角度进行说明，并解释测试将如何得到改善
- **之前 / 之后图示** — 并排、自定义绘制，用于说明当前设计的浅薄以及加深后的变化
- **推荐强度** — `Strong`、`Worth exploring`、`Speculative` 之一，以徽章形式渲染

在报告末尾添加一个**首要推荐**部分：说明你会优先处理哪个候选项，以及原因。

**领域相关内容使用 CONTEXT.md 中的词汇，架构相关内容使用 `/mattpocock:codebase-design` 中的词汇。** 如果 `CONTEXT.md` 定义了“Order”，就使用“Order 接收模块”——而不是“FooBarHandler”，也不是“Order 服务”。

**ADR 冲突**：如果某个候选项与现有 ADR 冲突，只有当实际阻力大到足以重新审视该 ADR 时，才将其列出。在卡片中明确标注（例如警告提示：_“与 ADR-0007 冲突——但值得重新讨论，因为……”_）。不要列出 ADR 所禁止的每一种理论上的重构方式。

完整的 HTML 脚手架、图示模式和样式指南请参阅 [HTML-REPORT.md](HTML-REPORT.md)。

暂时不要提出接口设计。文件写入后，使用 AskUserQuestion 工具询问用户希望探索哪个候选项，将候选项作为选项，并在你推荐的候选项后标注“(Recommended)”。

## 关键要求：先确定范围再扫描——并且绝不要提出接口设计

在查看之前先决定查看范围：遵循用户的指示，或者查看提交历史以寻找热点——遵循 YAGNI。报告只呈现候选项：**暂时不要提出接口设计**——先展示报告并使用 AskUserQuestion 工具询问用户希望探索哪个候选项，然后再进行任何设计工作。

### 3. 追问循环

用户选择候选项后，运行 `/mattpocock:grilling` skill，与他们一起梳理决策树——约束、依赖关系、加深后模块的形态、接缝后面包含什么，以及哪些测试能够保留下来。

随着决策逐渐明确，相关变更应同步发生——在此过程中运行 `/mattpocock:domain-modeling` skill，使领域模型始终保持最新：

- **要使用 `CONTEXT.md` 中不存在的概念为加深后的模块命名？** 将该术语添加到 `CONTEXT.md`。如果文件不存在，则按需创建。
- **在对话中让某个模糊术语变得更加准确？** 当场更新 `CONTEXT.md`。
- **用户以一个对整体设计至关重要的理由否决了该候选项？** 主动询问是否需要创建 ADR，表述为：_“要我把这记录为 ADR 吗？这样未来的架构审查就不会再次建议它。”_ 只有当未来的探索者确实需要知道该理由，才能避免再次提出相同建议时，才进行询问——对于临时性理由（“现在不值得做”）和不言自明的理由则跳过。
- **想要探索加深后模块的其他接口方案？** 运行 `/mattpocock:codebase-design` skill，并使用其中的 design-it-twice 并行子代理模式。