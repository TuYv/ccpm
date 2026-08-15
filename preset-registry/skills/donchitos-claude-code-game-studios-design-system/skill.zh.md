---
name: design-system
description: "Guided, section-by-section GDD authoring for a single game system. Gathers context from existing docs, walks through each required section collaboratively, cross-references dependencies, and writes incrementally to file."
argument-hint: "<system-name> [--review full|lean|solo]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Task, AskUserQuestion, TodoWrite
model: sonnet
---
当此技能被调用时：

## 1. 解析参数并验证

确定评审模式（仅确定一次，并存储起来供本次运行中所有关卡派生使用）：
1. 如果传入了 `--review [full|lean|solo]` → 使用该值
2. 否则读取 `production/review-mode.txt` → 使用其中的值
3. 否则 → 默认为 `lean`

完整的检查模式请参阅 `.claude/docs/director-gates.md`。

**必须**提供系统名称或改造路径。如果缺失：

1. 检查 `design/gdd/systems-index.md` 是否存在。
2. 如果存在：读取该文件，找出状态为“未开始”或同等状态的最高优先级系统，并使用 `AskUserQuestion`：
   - 提示：“设计顺序中的下一个系统是 **[system-name]**（[priority] | [layer]）。是否开始设计？”
   - 选项：`[A] 是 — 设计 [system-name]` / `[B] 选择其他系统` / `[C] 在此停止`
   - 如果选择 [A]：使用该系统名称继续。如果选择 [B]：询问要设计哪个系统（纯文本）。如果选择 [C]：退出。
3. 如果不存在系统索引，则失败并显示：
   > “用法：`/design-system <system-name>` — 例如 `/design-system movement`
   > 或者，要填补现有 GDD 中的空缺：`/design-system retrofit design/gdd/[system-name].md`
   > 未找到系统索引。请先运行 `/map-systems` 来梳理系统并获取设计顺序。”

**检测改造模式：**
如果参数以 `retrofit` 开头，或者参数是指向 `design/gdd/` 中现有
`.md` 文件的文件路径，则进入**改造模式**：

1. 读取现有的 GDD 文件。
2. 确定 8 个必需章节中哪些已经存在（扫描章节标题）。
   必需章节：概述、玩家幻想、详细设计/规则、公式、
   边界情况、依赖项、调优旋钮、验收标准。
3. 确定哪些章节仅包含占位文本（`[To be designed]` 或
   同等内容——空白、只有一行，或明显不完整）。
4. 在执行任何操作之前向用户展示：
   ```
   ## Retrofit: [System Name]
   File: design/gdd/[filename].md

   Sections already written (will not be touched):
   ✓ [section name]
   ✓ [section name]

   Missing or incomplete sections (will be authored):
   ✗ [section name] — missing
   ✗ [section name] — placeholder only
   ```
5. 询问：“是否要我补全这 [N] 个缺失章节？我不会修改任何现有内容。”
6. 如果是：照常进入**阶段 2（收集上下文）**，但在**阶段 3**
   中跳过创建骨架（文件已存在），并在**阶段 4**中跳过
   已经完整的章节。仅对缺失/不完整的章节运行章节循环。
7. **绝不覆盖现有章节内容。** 使用 Edit 工具仅替换
   `[To be designed]` 占位符或空的章节正文。

如果未处于改造模式，则将系统名称规范化为 kebab-case 以用作
文件名（例如，“combat system”会变为 `combat-system`）。

---

## 2. 收集上下文（读取阶段）

在向用户提出任何问题**之前**，读取所有相关上下文。这是此技能
相较于临时设计的主要优势——它会在充分掌握信息后开始工作。

### 2a：必需读取项

- **游戏概念**：读取 `design/gdd/game-concept.md`——如果缺失则失败：
  > “未找到游戏概念。请先运行 `/brainstorm`。”
- **系统索引**：读取 `design/gdd/systems-index.md`——如果缺失则失败：
  > “未找到系统索引。请先运行 `/map-systems` 来梳理你的系统。”
- **目标系统**：在索引中查找该系统。如果未列出，则警告：
  > “[system-name] 不在系统索引中。你想将其添加到索引中，还是
  > 将其作为索引外系统进行设计？”
- **实体注册表**：如果 `design/registry/entities.yaml` 存在，则读取它。
  提取该系统引用或与该系统相关的所有条目（grep
  `referenced_by.*[system-name]` 和 `source.*[system-name]`）。将这些内容
  作为**已知事实**保留在上下文中——这些值已经由其他 GDD 确立，
  本 GDD 不得与之矛盾。
- **反思日志**：如果 `docs/consistency-failures.md` 存在，则读取它。
  提取 Domain 与该系统类别匹配的条目。这些是反复出现的
  冲突模式——在阶段 2d 的上下文摘要中将其列在“过去的失败模式”下，
  以便用户了解该领域过去容易出现错误的地方。

### 2b：读取依赖项

从系统索引中确定：
- **上游依赖项**：本系统所依赖的系统。如果它们存在 GDD，则阅读这些 GDD（其中包含本系统必须遵循的决策）。
- **下游依赖方**：依赖本系统的系统。如果它们存在 GDD，则阅读这些 GDD（其中包含本系统必须满足的预期）。

对于存在的每个依赖项 GDD，提取以下内容并保留在上下文中：
- 关键接口（系统之间传递哪些数据）
- 引用本系统输出的公式
- 假定本系统行为的边界情况
- 输入本系统的调优参数

### 2c：可选阅读项

- **游戏支柱**：如果 `design/gdd/game-pillars.md` 存在，则阅读该文件
- **现有 GDD**：如果 `design/gdd/[system-name].md` 存在，则阅读该文件（继续已有工作，不要从头开始）
- **相关 GDD**：使用 Glob 匹配 `design/gdd/*.md`，并阅读主题相关的所有文件（例如，如果正在设计的系统与另一个系统在范围上有所重叠，即使后者并非正式依赖项，也要阅读相关 GDD）

### 2d：呈现上下文摘要

开始设计工作前，向用户提供一份简短摘要：

> **正在设计：[系统名称]**
> - 优先级：[来自索引] | 层级：[来自索引]
> - 依赖于：[列表，注明哪些已有 GDD，哪些尚未设计]
> - 被以下系统依赖：[列表，注明哪些已有 GDD，哪些尚未设计]
> - 需要遵守的现有决策：[依赖项 GDD 中的关键约束]
> - 与游戏支柱的一致性：[本系统主要服务于哪些游戏支柱]
> - **已知的跨系统事实（来自注册表）：**
>   - [entity_name]：[attribute]=[value]，[attribute]=[value]（由 [source GDD] 所有）
>   - [item_name]：[attribute]=[value]，[attribute]=[value]（由 [source GDD] 所有）
>   - [formula_name]：variables=[list]，output=[min–max]（由 [source GDD] 所有）
>   - [constant_name]：[value] [unit]（由 [source GDD] 所有）
>   *（这些值已锁定——如果此 GDD 需要使用不同的值，请在编写前明确指出冲突。不要在未说明的情况下使用不同的数值。）*
>
> 如果没有相关的注册表条目：省略“已知的跨系统事实”部分。

如果有任何上游依赖项尚未设计，请发出警告：
> “[dependency] 尚无 GDD。我们需要对其接口作出假设。请考虑先设计该依赖项，或者我们可以定义预期契约，并将其标记为暂定。”

### 2e：技术可行性预检查

在让用户开始设计之前，加载引擎上下文，并指出会影响设计的所有约束或知识缺口。

**步骤 1 — 确定此系统所属的引擎领域：**
将系统类别（来自 systems-index.md）映射到引擎领域：

| 系统类别 | 引擎领域 |
|----------------|--------------|
| 战斗、物理、碰撞 | 物理 |
| 渲染、视觉效果、着色器 | 渲染 |
| UI、HUD、菜单 | UI |
| 音频、声音、音乐 | 音频 |
| AI、寻路、行为树 | 导航 / 脚本 |
| 动画、IK、骨骼绑定 | 动画 |
| 网络、多人游戏、同步 | 网络 |
| 输入、控制、按键绑定 | 输入 |
| 保存/加载、持久化、数据 | 核心 |
| 对话、任务、叙事 | 脚本 |

**步骤 2 — 读取引擎上下文（如可用）：**
- 读取 `.claude/docs/technical-preferences.md`，以确定引擎及其版本
- 如果已配置引擎，读取 `docs/engine-reference/[engine]/VERSION.md`
- 如果 `docs/engine-reference/[engine]/modules/[domain].md` 存在，则读取它
- 读取 `docs/engine-reference/[engine]/breaking-changes.md` 中与该领域相关的条目
- 使用 Glob 匹配 `docs/architecture/adr-*.md`，并读取领域匹配的所有 ADR
  （检查 Engine Compatibility 表中的 "Domain" 字段）

**步骤 3 — 展示可行性简报：**

如果存在引擎参考文档，请在开始设计前展示：

```
## Technical Feasibility Brief: [System Name]
Engine: [name + version]
Domain: [domain]

### Known Engine Capabilities (verified for [version])
- [capability relevant to this system]
- [capability 2]

### Engine Constraints That Will Shape This Design
- [constraint from engine-reference or existing ADR]

### Knowledge Gaps (verify before committing to these)
- [post-cutoff feature this design might rely on — mark HIGH/MEDIUM risk]

### Existing ADRs That Constrain This System
- ADR-XXXX: [decision summary] — means [implication for this GDD]
  (or "None yet")
```

如果不存在引擎参考文档（尚未配置引擎），则显示一条简短说明：
> “尚未配置引擎——跳过技术可行性检查。如果还没有执行过，请在进入架构设计前运行
> `/setup-engine`。”

**步骤 4 — 继续前先询问：**

使用 `AskUserQuestion`：
- “在开始前还有任何需要补充的约束吗？还是按这些已记录的内容继续？”
  - 选项：“按这些已记录的内容继续”、“先添加一项约束”、“我需要检查引擎文档——在此暂停”

---

使用 `AskUserQuestion`：
- “准备好开始设计 [system-name] 了吗？”
  - 选项：“是的，开始吧”、“先向我展示更多上下文”、“先设计一个依赖项”

---

## 3. 创建文件骨架

用户确认后，**立即**创建带有空章节标题的 GDD 文件。这可以确保增量写入有目标文件可用。

使用 `.claude/docs/templates/game-design-document.md` 中的模板结构：

```markdown
# [System Name]

> **Status**: In Design
> **Author**: [user + agents]
> **Last Updated**: [today's date]
> **Implements Pillar**: [from context]

## Overview

[To be designed]

## Player Fantasy

[To be designed]

## Detailed Design

### Core Rules

[To be designed]

### States and Transitions

[To be designed]

### Interactions with Other Systems

[To be designed]

## Formulas

[To be designed]

## Edge Cases

[To be designed]

## Dependencies

[To be designed]

## Tuning Knobs

[To be designed]

## Visual/Audio Requirements

[To be designed]

## UI Requirements

[To be designed]

## Acceptance Criteria

[To be designed]

## Open Questions

[To be designed]
```

询问：“可以在 `design/gdd/[system-name].md` 创建骨架文件吗？”

如果用户拒绝：显示以下消息后停止：
> “结论：**已阻塞**——骨架创建被拒绝。设计会话无法在没有骨架文件的情况下继续，因为后续所有阶段都以它为基础。准备好创建文件后，请重新运行 `/design-system [system]`。”
不要继续进入 A 节。

写入后，更新 `production/session-state/active.md`：
- 使用 Glob 检查该文件是否存在。
- 如果文件**不存在**：使用 **Write** 工具创建它。绝不要尝试对可能不存在的文件使用 Edit。
- 如果文件**已存在**：使用 **Edit** 工具更新相关字段。

文件内容：
- 任务：设计 [system-name] GDD
- 当前章节：开始（已创建框架）
- 文件：design/gdd/[system-name].md

---

## 4. 逐章节设计

按顺序完成每个章节。对于**每个章节**，遵循以下循环：

### 章节循环

```
Context  ->  Questions  ->  Options  ->  Decision  ->  Draft  ->  Approval  ->  Write
```

1. **背景**：说明本章节需要包含哪些内容，并指出依赖 GDD 中对本章节构成约束的所有相关决策。

2. **问题**：提出本章节特有的澄清问题。对于选项受限的问题使用 `AskUserQuestion`，对于开放式探索使用对话文本。

3. **选项**：当本章节涉及设计选择（而不仅是记录文档）时，提出 2-4 种方案及其优缺点。先在对话文本中解释推理，然后使用 `AskUserQuestion` 获取决策。

4. **决策**：用户选择一种方案或提供自定义方向。

5. **草稿**：在对话文本中写出章节内容以供审阅。标明任何关于尚未设计的依赖项的暂定假设。

6. **审批**：紧接草稿之后——在同一条响应中——使用 `AskUserQuestion`。**绝不要使用纯文本。绝不要跳过此步骤。**
   - 提示："批准 [Section Name] 章节吗？"
   - 选项：`[A] 批准——写入文件` / `[B] 进行修改——说明需要修正的内容` / `[C] 重新开始`

   **草稿和审批组件必须同时出现在同一条响应中。
   如果草稿出现时没有组件，用户将停留在一个空白提示处，无法继续操作——这属于协议违规。**

7. **写入**：使用 Edit 工具将占位符替换为已批准的内容。
   **关键要求**：始终在 `old_string` 中包含章节标题以确保唯一性——绝不要只匹配 `[To be designed]`，因为多个章节使用相同的占位符，而 Edit 工具要求匹配项唯一。使用以下模式：
   ```
   old_string: "## [Section Name]\n\n[To be designed]"
   new_string: "## [Section Name]\n\n[approved content]"
   ```
   确认写入。

8. **注册表冲突检查**（仅限章节 C 和 D——详细设计和公式）：
   写入后，扫描章节内容中出现在注册表内的实体名称、物品名称、公式名称和数值常量。对于每个匹配项：
   - 将刚刚写入的值与注册表条目进行比较。
   - 如果二者不同：在开始下一章节之前，**立即指出冲突**。不要不作提示就继续。
     > "注册表冲突：[name] 在 [source GDD] 中注册为 [registry_value]。
     > 本章节刚刚写入了 [new_value]。哪一个是正确的？"
   - 如果是新内容（不在注册表中）：将其标记为注册表注册候选项（将在第 5 阶段处理）。

每完成一个章节，就更新 `production/session-state/active.md`，写入已完成章节的名称。使用 Glob 检查该文件是否存在——如果不存在，则使用 Write 创建；如果存在，则使用 Edit 更新。

### 各章节专项指导

每个章节都有独特的设计考量，并且可能会受益于专业智能体的协助：

---

### A 节：概述

**目标**：让陌生人读完一个段落就能理解。

**在构建小组件之前推导推荐选项**：从系统索引中读取该系统的类别和层级（第 2 阶段已将其加入上下文），然后确定每个选项卡的推荐选项：
- **Framing 选项卡**：基础/基础设施层 → 推荐 `[A]`。面向玩家的类别（战斗、UI、对话、角色、动画、视觉效果、音频）→ 推荐 `[C] Both`。
- **ADR ref 选项卡**：使用 Glob 匹配 `docs/architecture/adr-*.md`，并在任意 ADR 的 GDD 需求章节中 grep 系统名称。如果找到匹配的 ADR → 推荐 `[A] Yes — cite the ADR`。如果未找到 → 推荐 `[B] No`。
- **Fantasy 选项卡**：基础/基础设施层 → 推荐 `[B] No`。所有其他类别 → 推荐 `[A] Yes`。

在每个选项卡中对应选项的文本后追加 `(Recommended)`。

**框架问题（起草前询问）**：使用 `AskUserQuestion` 和多选项卡小组件：
- 选项卡 "Framing" — "How should the overview frame this system?" 选项：`[A] As a data/infrastructure layer (technical framing)` / `[B] Through its player-facing effect (design framing)` / `[C] Both — describe the data layer and its player impact`
- 选项卡 "ADR ref" — "Should the overview reference the existing ADR for this system?" 选项：`[A] Yes — cite the ADR for implementation details` / `[B] No — keep the GDD at pure design level`
- 选项卡 "Fantasy" — "Does this system have a player fantasy worth stating?" 选项：`[A] Yes — players feel it directly` / `[B] No — pure infrastructure, players feel what it enables`

使用用户的回答来塑造草稿。不得自行回答这些问题并自动起草。

**要询问的问题**：
- 用一句话概括，这个系统是什么？
- 玩家如何与其交互？（主动/被动/自动）
- 这个系统为什么存在——如果没有它，游戏会失去什么？

**交叉引用**：检查描述是否与系统索引中的描述一致。标记不一致之处。

**设计与实现的边界**：概述问题必须停留在行为层面——系统*做什么*，而不是*如何构建*。如果在概述期间出现实现问题（例如，“应该使用 Autoload 单例还是信号总线？”），将其记录为“→ 转为 ADR”，然后继续。实现模式应归入 `/architecture-decision`，而不是 GDD。GDD 描述行为；ADR 描述实现该行为所采用的技术方案。

---

### B 节：玩家幻想

**目标**：情感目标——玩家应该有何种*感受*。

**在构建小组件之前推导推荐选项**：从第 2 阶段的上下文中读取该系统的类别和层级：
- 面向玩家的类别（战斗、UI、对话、角色、动画、音频、关卡/世界）→ 推荐 `[A] Direct`
- 基础/基础设施层 → 推荐 `[B] Indirect`
- 混合类别（镜头/输入、经济、具有玩家可见效果的 AI）→ 推荐 `[C] Both`

在适当的选项文本后附加 `(Recommended)`。

**框架问题（在起草前询问）**：使用 `AskUserQuestion`：
- 提示："该系统是玩家直接参与的内容，还是他们间接体验的基础设施？"
- 选项：`[A] Direct — player actively uses or feels this system` / `[B] Indirect — player experiences the effects, not the system` / `[C] Both — has a direct interaction layer and infrastructure beneath it`

根据回答恰当地构建“玩家幻想”章节。不要擅自假设答案。

**需要询问的问题**：
- 该系统服务于哪种情绪或力量幻想？
- 哪些参考游戏准确地营造了这种感受？具体是哪些因素创造了这种感受？
- 这是一个“你喜欢与之互动的系统”，还是“你不会注意到的基础设施”？

**交叉引用**：必须与游戏支柱保持一致。如果该系统服务于某个支柱，
请引用相关的支柱原文。

**审查模式检查**（在启动前应用）：
- `solo` → 跳过启动此代理。不借助专家起草该章节。添加说明：“未咨询 `creative-director`——单人模式。投入制作前请手动审查。”
- `lean` → 除非该章节的实现风险为高（仅限 D 节和 H 节），否则跳过。对于其他章节，不借助该代理起草。
- `full` → 按下述方式启动。

**代理委派（强制）**：在获得框架问题的答案后、起草之前，
通过 Task 启动 `creative-director`：
- 提供：系统名称、框架答案（直接/间接/两者兼有）、游戏支柱、用户提到的所有参考游戏、游戏概念摘要
- 询问：“为该系统塑造玩家幻想。它应当服务于哪种情绪或力量幻想？我们应以哪个玩家时刻为锚点？什么样的语气和措辞符合游戏已经确立的感受？请具体说明——给出 2～3 个候选框架。”
- 收集 `creative-director` 提供的框架，并将其与草稿一起呈现给用户。

**在咨询 `creative-director` 之前，不得起草 B 节。** 框架问题的答案会告诉我们这属于*哪一类*幻想；`creative-director` 则负责塑造*如何描述*这种幻想——包括语气、措辞，以及作为锚点的具体玩家时刻。

---

### C 节：详细设计（核心规则、状态、交互）

**目标**：提供一份明确无歧义、程序员无需提问即可实现的规范。

这通常是最大的章节。将其拆分为以下子章节：

1. **核心规则**：基础机制。顺序流程使用编号规则，
   属性使用项目符号。
2. **状态与转换**：如果系统包含状态，请绘制出每一种状态以及
   每一种有效转换。使用表格。
3. **与其他系统的交互**：对于每个依赖项（上游和下游），
   明确说明哪些数据流入、哪些数据流出，以及由谁负责该接口。

**需要询问的问题**：
- 请逐步说明该系统的一次典型使用流程
- 玩家会面临哪些决策点？
- 玩家不能做什么？（约束与能力同样重要）

**审查模式检查**（在启动前应用）：
- `solo` → 跳过启动此代理。不借助专家起草该章节。添加说明：“未咨询专家代理——单人模式。投入制作前请手动审查。”
- `lean` → 除非该章节的实现风险为高（仅限 D 节和 H 节），否则跳过。对于其他章节，不借助该代理起草。
- `full` → 按下述方式启动。

**智能体委派（强制）**：在起草 C 节之前，通过 Task 并行启动专业智能体：
- 在路由表（本技能的第 6 节）中查找该系统所属的类别
- 启动为此类别列出的主要智能体和辅助智能体
- 向每个智能体提供：系统名称、游戏概念摘要、支柱集合、依赖 GDD 摘录，以及当前正在处理的具体章节
- 在起草前收集其发现
- 通过 `AskUserQuestion` 向用户呈现智能体之间的任何分歧
- 只有在收到专业智能体的意见后才能起草

**在咨询适当的专业智能体之前，请勿起草 C 节。** 由 `systems-designer` 审查规则和机制，可以发现主会话无法察觉的设计缺口。

**交叉核对**：对于列出的每项交互，验证其是否与依赖 GDD 中的规定一致。如果某个依赖项定义了一个值或公式，而该系统预期的内容与之不同，请标记此冲突。

---

### D 节：公式

**目标**：列出所有数学公式，并定义变量、指定范围以及注明边界情况。

**完成引导——每个公式始终必须以以下确切结构开头：**

```
The [formula_name] formula is defined as:

`[formula_name] = [expression]`

**Variables:**
| Variable | Symbol | Type | Range | Description |
|----------|--------|------|-------|-------------|
| [name] | [sym] | float/int | [min–max] | [what it represents] |

**Output Range:** [min] to [max] under normal play; [behaviour at extremes]
**Example:** [worked example with real numbers]
```

请勿写入 `[Formula TBD]`，也不要在没有变量表的情况下仅用文字描述公式。缺少已定义变量的公式无法在不依赖猜测的情况下实现。

**需要询问的问题**：
- 该系统执行哪些核心计算？
- 缩放应该是线性的、对数式的还是阶梯式的？
- 在游戏前期、中期和后期，输出范围应该分别是多少？

**审查模式检查**（在启动智能体之前应用）：
- `solo` → 跳过此次智能体启动。在没有专业智能体参与的情况下起草本节。添加注释：“未咨询 `systems-designer`——单人模式。投入制作前请手动审查。”
- `lean` → 跳过，除非该章节具有高实现风险（仅限 D 节和 H 节）。对于其他章节，在没有该智能体参与的情况下起草。
- `full` → 按下述方式启动。

**智能体委派（强制）**：在提出任何公式或平衡性数值之前，通过 Task 并行启动专业智能体：
- **始终启动 `systems-designer`**：向其提供 C 节中的核心规则、用户给出的调优目标，以及依赖 GDD 中的平衡性上下文。要求其提出包含变量表和输出范围的公式。
- **对于经济或成本系统，还要启动 `economy-designer`**：向其提供放置成本、升级成本意图以及进度目标。要求其验证成本曲线和比率。
- 通过 `AskUserQuestion` 将专业智能体的提案呈现给用户审查
- 由用户做出决定；主会话负责写入文件
- **没有专业智能体的意见，请勿自行设定公式值或平衡性数值。** 缺乏平衡设计专业知识的用户无法评估孤立的原始数值——他们需要专业智能体给出的推理依据。

**交叉引用**：如果某个依赖项 GDD 定义了一个公式，且其输出会输入此系统，请明确引用该公式。不要重复设计——建立连接。

---

### E 节：边界情况

**目标**：明确处理异常情况，避免它们演变成 bug。

**完成引导——每个边界情况均按以下格式编写：**
- **如果 [条件]**：[确切结果]。[如果原因不明显，则说明理由]

示例（请根据游戏领域调整术语）：
- **如果 [资源] 在 [保护条件] 生效期间降至 0**：将其保持在最小值，直到该条件结束，然后应用相应后果。
- **如果两个 [触发器/事件] 同时触发**：按照 [定义的优先级顺序] 结算；优先级相同时使用 [定义的决胜规则]。

不要编写“酌情处理”之类的模糊条目——每个条目都必须明确指出确切条件和确切的解决方式。只有边界情况而没有解决方式，属于尚未解决的设计问题，而不是规范。

**要提出的问题**：
- 数值为零时会发生什么？达到最大值时呢？超出范围时呢？
- 两条规则同时适用时会发生什么？
- 如果玩家发现了非预期的交互，会发生什么？（识别退化策略）

**审查模式检查**（在生成代理前执行）：
- `solo` → 跳过生成此代理。在没有专家参与的情况下起草本节。添加备注：“未咨询 `systems-designer`——Solo 模式。投入制作前请手动审查。”
- `lean` → 除非本节具有高实现风险（仅限 D 节和 H 节），否则跳过。对于其他章节，在没有该代理参与的情况下起草。
- `full` → 按照下述方式生成代理。

**代理委派（强制）**：在最终确定边界情况前，通过 Task 生成 `systems-designer`。提供：已完成的 C 节和 D 节，并要求其从公式和规则空间中找出主会话可能遗漏的边界情况。对于叙事系统，还应生成 `narrative-director`。展示他们的发现，并询问用户要纳入哪些内容。

**交叉引用**：对照依赖项 GDD 检查边界情况。如果某个依赖项定义了此系统可能违反的下限、上限或结算规则，请标记出来。

---

### F 节：依赖项

**目标**：标明每个系统连接的方向和性质。

本节已根据上下文收集阶段的结果预填了部分内容。展示系统索引中已知的依赖项，并询问：
- 是否还有我遗漏的依赖项？
- 对于每个依赖项，具体的数据接口是什么？
- 哪些是硬依赖（没有它，系统便无法运行），哪些是软依赖（有它可得到增强，但没有它也能运行）？

**交叉引用**：本节必须保持双向一致。如果此系统列出“依赖 Combat”，那么 Combat GDD 应列出“被 [此系统] 依赖”。标记所有单向依赖项，以便修正。

---

### G 节：调优参数

**目标**：列出设计师可调整的每个值，并说明安全范围和极端取值下的行为。

**要提出的问题**：
- 设计师应该能够在不修改代码的情况下调整哪些值？
- 对于每个参数，如果设置得过高，会破坏什么？过低时呢？
- 哪些参数会相互影响？（更改 A 会使 B 失去意义）

**代理委派**：如果公式较为复杂，请委派给 `systems-designer`，根据公式变量推导调优参数。

**交叉引用**：如果依赖的 GDD 列出了影响此系统的调优参数，请在此处引用。不要创建重复的参数——请指向唯一事实来源。

---

### H 节：验收标准

**目标**：证明系统按设计运行的可测试条件。

**完成度引导——将每项标准写成 Given-When-Then 格式：**
- **给定** [初始状态]，**当** [操作或触发条件]，**那么** [可衡量的结果]

示例（根据游戏领域调整术语）：
- **给定** [初始状态]，**当** [玩家操作或系统触发条件]，**那么** [具体且可衡量的结果]。
- **给定** [某项约束处于生效状态]，**当** [玩家尝试执行某项操作]，**那么** [显示的反馈和操作结果]。

至少包括：C 节中每条核心规则对应一项标准，以及 D 节中每个公式对应一项标准。不要写“系统按设计运行”——每项标准都必须能够由 QA 测试人员在不阅读 GDD 的情况下独立验证。

**审查模式检查**（在生成代理之前应用）：
- `solo` → 跳过生成此代理。在没有专家参与的情况下起草本节。添加注释：“未咨询 `qa-lead`——单人模式。投入制作前请手动审查。”
- `lean` → 除非这是实现风险高的章节（仅限 D 节和 H 节），否则跳过。对于其他章节，在没有代理参与的情况下起草。
- `full` → 按下述说明生成代理。

**代理委派（强制）**：在最终确定验收标准之前，通过 Task 生成 `qa-lead`。提供：已完成的 GDD C、D、E 节，并要求其验证这些标准是否可以独立测试，以及是否覆盖所有核心规则和公式。向用户指出所有缺失项或无法测试的标准。

**要询问的问题**：
- 能够证明此系统有效的最小测试集是什么？
- 此系统的性能预算是多少？（帧时间、内存）
- QA 测试人员会首先检查什么？

**交叉引用**：包含验证跨系统交互是否正常工作的标准，而不仅仅是孤立地验证此系统。

---

### 可选章节：视觉/音频、UI 要求、开放问题

这些章节包含在模板中。对于视觉系统类别，视觉/音频是**必需的**，而非可选。在询问之前先确定要求级别：

**对于以下系统类别，视觉/音频是必需的（强制——不得提供跳过选项）：**
- 战斗、伤害、生命值
- UI 系统（HUD、菜单）
- 动画、角色移动
- 视觉效果、粒子、着色器
- 角色系统
- 对话、任务、世界观设定
- 关卡/世界系统

对于必需的系统：在起草本节之前，通过 Task 生成 `art-director`。提供：系统名称、游戏概念、游戏支柱，以及美术规范的第 1–4 节（如果存在）。要求其明确说明：(1) 此系统事件的 VFX 和视觉反馈要求，(2) 所有动画或视觉风格约束，(3) 哪些美术规范原则与此系统最直接相关。展示其输出；对于视觉系统，不得将本节保留为 `[待设计]`。

对于**所有其他系统类别**（基础/基础设施、经济、AI/寻路、摄像机/输入），在必需章节之后提供可选章节：

使用 `AskUserQuestion`：
- “8 个必需章节已完成。你是否还想定义视觉/音频需求、UI 需求，或记录待解决问题？”
  - 选项：“是，三项全部添加”、“仅添加待解决问题”、“跳过——我稍后再添加”

对于**视觉/音频**（非必需系统）：如果需要详细内容，请与 `art-director` 和 `audio-director` 协作。在 GDD 阶段，通常简要说明即可。

> **资产规格标记**：在视觉/音频章节写入实质性内容后，输出以下通知：
> “📌 **资产规格**——视觉/音频需求已定义。美术圣经获批后，运行 `/asset-spec system:[system-name]`，根据本章节生成逐项资产的视觉描述、尺寸和生成提示词。”

对于 **UI 需求**：复杂的 UI 系统应与 `ux-designer` 协作。
编写完本章节后，检查其中是否包含实质性内容（而不只是
`[To be designed]`，或说明该系统没有 UI 的备注）。如果确实包含实际的
UI 需求，请立即输出以下标记：

> **📌 UX 标记——[系统名称]**：该系统包含 UI 需求。在第 4 阶段
>（前期制作）中，在编写 Epic **之前**，运行 `/ux-design`，为该系统涉及的每个屏幕或
> HUD 元素创建 UX 规格。引用 UI 的故事应引用 `design/ux/[screen].md`，
> 而不是直接引用 GDD。
>
> 如果你更新了系统索引，请在该系统的索引条目中注明这一点。

对于**待解决问题**：记录设计过程中出现但尚未完全解决的所有问题。每个问题都应指定负责人和目标解决日期。

---

## 5. 设计后验证

所有章节编写完成后：

### 5a：自检

从文件中重新读取完整的 GDD（不要依赖对话记忆——文件才是
事实来源）。验证：
- 所有 8 个必需章节均包含实质性内容（而非占位符）
- 公式引用的变量均已定义
- 边界情况均有解决方案
- 依赖项及其接口均已列出
- 验收标准可测试

### 5a-bis：创意总监支柱审查

**审查模式检查**——在生成 CD-GDD-ALIGN 之前执行：
- `solo` → 跳过。注明：“已跳过 CD-GDD-ALIGN——单人模式。”继续执行步骤 5b。
- `lean` → 跳过（不是 PHASE-GATE）。注明：“已跳过 CD-GDD-ALIGN——精简模式。”继续执行步骤 5b。
- `full` → 正常生成。

在最终确定 GDD 之前，通过 Task 生成 `creative-director`，并使用关卡 **CD-GDD-ALIGN**（`.claude/docs/director-gates.md`）。

传入：已完成的 GDD 文件路径、游戏支柱（来自 `design/gdd/game-concept.md` 或 `design/gdd/game-pillars.md`）、MDA 美学目标。

按照 `director-gates.md` 中的标准规则处理裁定。解决后，在 GDD 的状态标头中记录裁定：
`> **Creative Director Review (CD-GDD-ALIGN)**: APPROVED [date] / CONCERNS (accepted) [date] / REVISED [date]`

---

### 5b：更新实体注册表

扫描已完成的 GDD，查找应注册的跨系统事实：
- 具有属性或掉落物的具名实体（敌人、NPC、Boss）
- 具有数值、重量或类别的具名物品
- 定义了变量和输出范围的具名公式
- 在多个位置通过具体值引用的具名常量

对于每个候选项，检查它是否已存在于 `design/registry/entities.yaml` 中：
```
Grep pattern="  - name: [candidate_name]" path="design/registry/entities.yaml"
```

给出摘要：
```
此 GDD 中的注册表候选项：
  NEW（尚未注册）：
    - [entity_name] [entity]: [attribute]=[value], [attribute]=[value]
    - [item_name] [item]: [attribute]=[value], [attribute]=[value]
    - [formula_name] [formula]: variables=[list], output=[min–max]
  ALREADY REGISTERED（将更新 referenced_by）：
    - [constant_name] [constant]: value=[N] ← 与注册表匹配 ✅
```

询问：“我可以使用这 [N] 个新条目更新 `design/registry/entities.yaml`，
并更新现有条目的 `referenced_by` 吗？”

如果可以：追加新条目并更新 `referenced_by` 数组。绝不要修改现有的
`value` / 属性字段，除非先将其作为冲突明确提出。

### 5c：提议设计审查

给出完成摘要：

> **GDD 已完成：[System Name]**
> - 已编写的章节：[list]
> - 临时假设：[list any assumptions about undesigned dependencies]
> - 发现的跨系统冲突：[list or "none"]

> **要验证此 GDD，请打开一个全新的 Claude Code 会话并运行：**
> `/design-review design/gdd/[system-name].md`
>
> **绝不要在与 `/design-system` 相同的会话中运行 `/design-review`。** 审查
> 智能体必须独立于编写上下文。在此处运行会继承完整的设计历史，从而
> 无法进行独立评审。

**绝不要提议直接运行 `/design-review`。** 始终引导用户前往新窗口。

### 5d：更新系统索引

GDD 完成后（也可选择在审查后）：

- 读取系统索引
- 更新目标系统所在的行：
  - 如果已运行 design-review 且结论为 APPROVED：状态 → “已批准”
  - 如果已运行 design-review 且结论为 NEEDS REVISION：状态 → “审查中”
  - 如果跳过 design-review：状态 → “已设计”（等待审查）
  - 如果用户选择“我想先自行审查”：状态 → “已设计”
  - 设计文档：链接到 `design/gdd/[system-name].md`
- 更新进度跟踪器中的计数

询问：“我可以更新位于 `design/gdd/systems-index.md` 的系统索引吗？”

### 5e：更新会话状态

使用以下内容更新 `production/session-state/active.md`：
- 任务：[system-name] GDD
- 状态：完成（如果已运行 design-review，则为审查中）
- 文件：design/gdd/[system-name].md
- 章节：全部 8 个章节均已编写
- 下一步：[suggest next system from design order]

### 5f：建议后续步骤

使用 `AskUserQuestion`：
- “下一步做什么？”
  - 选项：
    - “运行 `/consistency-check`——验证此 GDD 中的值是否与现有 GDD 冲突（建议在设计下一个系统之前运行）”
    - “设计下一个系统（[next-in-order]）”——如果仍有尚未设计的系统
    - “修复审查发现的问题”——如果 design-review 标记了问题
    - “本次会话到此为止”
    - “运行 `/gate-check`”——如果已设计足够多的 MVP 系统

---

## 6. 专业智能体路由

此技能会将任务委派给专业智能体，以利用其领域专长。主会话
负责协调整体流程；智能体负责提供专业内容。

| 系统类别 | 主代理 | 支持代理 |
|----------------|---------------|---------------------|
| **基础/基础设施**（事件总线、保存/加载、场景管理、服务定位器） | `systems-designer` | `gameplay-programmer`（可行性）、`engine-programmer`（引擎集成） |
| 战斗、伤害、生命值 | `game-designer` | `systems-designer`（公式）、`ai-programmer`（敌人 AI）、`art-director`（命中反馈视觉方向、VFX 意图） |
| 经济、战利品、制作 | `economy-designer` | `systems-designer`（曲线）、`game-designer`（循环） |
| 成长、XP、技能 | `game-designer` | `systems-designer`（曲线）、`economy-designer`（消耗出口） |
| 对话、任务、世界观设定 | `game-designer` | `narrative-director`（故事）、`writer`（内容）、`art-director`（角色视觉档案、过场基调） |
| UI 系统（HUD、菜单） | `game-designer` | `ux-designer`（流程）、`ui-programmer`（可行性）、`art-director`（视觉风格方向）、`technical-artist`（渲染/着色器约束） |
| 音频系统 | `game-designer` | `audio-director`（方向）、`sound-designer`（规格） |
| AI、寻路、行为 | `game-designer` | `ai-programmer`（实现）、`systems-designer`（评分） |
| 关卡/世界系统 | `game-designer` | `level-designer`（空间设计）、`world-builder`（世界观设定） |
| 摄像机、输入、控制 | `game-designer` | `ux-designer`（操控感受）、`gameplay-programmer`（可行性） |
| 动画、角色移动 | `game-designer` | `art-director`（动画风格、姿势语言）、`technical-artist`（绑定/混合约束）、`gameplay-programmer`（操控感受） |
| 视觉特效、粒子、着色器 | `game-designer` | `art-director`（VFX 视觉方向）、`technical-artist`（性能预算、着色器复杂度）、`systems-designer`（触发器/状态集成） |
| 角色系统（属性、原型） | `game-designer` | `art-director`（角色视觉原型）、`narrative-director`（角色弧光一致性）、`systems-designer`（属性公式） |

**通过 Task 工具委派时**：
- 提供：系统名称、游戏概念摘要、相关 GDD 摘录、当前正在处理的具体
  章节，以及需要专家提供意见的问题
- 代理将分析/提案返回至主会话
- 主会话通过 `AskUserQuestion` 向用户展示代理的输出
- 用户做出决定；主会话写入文件
- 代理不得直接写入文件——所有文件写入均由主会话负责

---

## 7. 恢复与继续

如果会话中断（压缩、崩溃、新会话）：

1. 阅读 `production/session-state/active.md`——其中记录了当前系统以及
   已完成的章节
2. 阅读 `design/gdd/[system-name].md`——包含实际内容的章节已完成；
   包含 `[To be designed]` 的章节仍需处理
3. 从下一个未完成的章节继续——无需重新讨论已完成的章节

这正是增量写入至关重要的原因：每个已批准的章节都能在任何
中断后得到保留。

---

## 协作协议

此技能在每一步都遵循协作设计原则：

1. 每个章节都遵循 **问题 -> 选项 -> 决策 -> 草稿 -> 批准** 流程
2. 在每个决策点使用 **AskUserQuestion**（解释 -> 记录模式）：
   - 阶段 2：“准备好开始了吗，还是需要更多背景信息？”
   - 阶段 3：“我可以创建框架吗？”
   - 阶段 4（每个章节）：设计问题、方案选项、草稿批准
   - 阶段 5：“运行设计审查吗？更新系统索引吗？下一步做什么？”
3. 在创建框架以及每次写入章节之前，询问 **“我可以写入 [filepath] 吗？”**
4. **增量写入**：每个章节获得批准后立即写入文件
5. **会话状态更新**：每次写入章节后更新
6. **交叉引用**：每个章节都会检查现有 GDD 是否存在冲突
7. **专家路由**：复杂章节会征求专家代理的意见，并将其呈现给用户做决定——绝不静默写入

**绝不**自动生成完整 GDD 并将其作为既成事实呈现。
**绝不**在未经用户批准的情况下写入章节。
**绝不**在未标明冲突的情况下违背现有已批准的 GDD。
**始终**说明决策的来源（依赖的 GDD、支柱、用户选择）。

## 上下文窗口感知

这是一项长时间运行的技能。每次写入章节后，检查状态行显示的上下文占用是否达到或超过 70%。如果是，请在响应末尾附加以下通知：

> **上下文即将达到上限（≥70%）。**你的进度已保存——所有已批准的
> 章节均已写入 `design/gdd/[system-name].md`。当你准备继续时，
> 请打开一个新的 Claude Code 会话并运行 `/design-system [system-name]`——它将
> 检测哪些章节已完成，并从下一个章节继续。

---

## 建议的后续步骤

- 在**新的会话**中运行 `/design-review design/gdd/[system-name].md`，独立验证已完成的 GDD
- 运行 `/consistency-check`，确认此 GDD 中的值与其他 GDD 不存在冲突
- 运行 `/map-systems next`，转向下一个优先级最高且尚未设计的系统
- 当所有 MVP GDD 均已编写并完成审查后，运行 `/gate-check pre-production`