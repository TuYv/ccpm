---
name: start
description: "First-time onboarding — asks where you are, then guides you to the right workflow. No assumptions."
argument-hint: "[no arguments]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, AskUserQuestion
model: sonnet
---
# 引导式入门

此技能会写入一个文件：`production/review-mode.txt`（在阶段 3b 中设置的审查模式配置）。

此技能是新用户的入口。它不假设你已有游戏创意、引擎偏好或任何经验。它会先提问，然后将你引导至正确的工作流。

---

## 阶段 1：检测项目状态

在提出任何问题之前，先静默收集上下文，以便提供有针对性的指导。不要在用户未要求时显示这些结果——它们用于支持你的建议，而不是作为对话的开场白。

检查：
- **是否已配置引擎？** 读取 `.claude/docs/technical-preferences.md`。如果 Engine 字段包含 `[TO BE CONFIGURED]`，则表示尚未设置引擎。
- **是否已有游戏概念？** 检查 `design/gdd/game-concept.md` 是否存在。
- **是否已有源代码？** 使用 Glob 查找 `src/` 中的源文件（`*.gd`、`*.cs`、`*.cpp`、`*.h`、`*.rs`、`*.py`、`*.js`、`*.ts`）。
- **是否已有原型？** 检查 `prototypes/` 中是否存在子目录。
- **是否已有设计文档？** 统计 `design/gdd/` 中的 Markdown 文件数量。
- **是否已有制作产物？** 检查 `production/sprints/` 或 `production/milestones/` 中是否存在文件。

在内部保存这些发现，以验证用户的自我评估并提供有针对性的建议。

---

## 阶段 2：询问用户当前所处阶段

这是用户首先看到的内容。使用 `AskUserQuestion` 并提供以下准确选项，让用户可以通过点击而不是输入来回答：

- **提示语**："欢迎来到 Claude Code Game Studios！在提出任何建议之前，我想先了解一下你的起点。你目前的游戏创意处于什么阶段？"
- **选项**：
  - `A) No idea yet` — 我还完全没有游戏概念。我想先进行探索，弄清楚该做什么。
  - `B) Vague idea` — 我心中有一个大致的主题、感觉或类型（例如“与太空有关的内容”或“一款温馨的农场游戏”），但还没有具体成形。
  - `C) Clear concept` — 我已经明确了核心创意——类型、基本机制，或许还有一句话提案——但尚未将其正式整理成文档。
  - `D) Existing work` — 我已经有设计文档、原型、代码或大量规划成果。我希望整理或继续推进这些工作。

等待用户做出选择。在他们回复之前不要继续。

---

## 阶段 3：根据回答进行引导

#### 如果选择 A：尚无创意

用户在进行其他任何工作之前，需要先开展创意探索。

1. 告知用户，从零开始完全没问题
2. 简要说明 `/brainstorm` 的作用（使用专业框架进行引导式创意构思——MDA、玩家心理学、动词优先设计）。说明它有两种模式：使用 `/brainstorm open` 进行完全开放式探索；如果用户哪怕只有一个模糊的主题（例如“太空”“温馨”“恐怖”），也可以使用 `/brainstorm [hint]`。
3. 建议下一步运行 `/brainstorm open`，但如果用户想到任何提示词，也可以邀请他们使用提示词
4. 展示建议路径：
   **概念阶段：**
   - `/brainstorm open` — 发掘你的游戏概念
   - `/setup-engine` — 配置引擎（头脑风暴会推荐一个）
   - `/prototype` — 一次性概念构建：在开始设计之前验证核心创意是否有趣（1–3 天）
   - `/art-bible` — 定义视觉识别（使用头脑风暴产出的 Visual Identity Anchor）
   - `/map-systems` — 将概念拆解为多个系统
   - `/design-system` — 为每个 MVP 系统编写一份 GDD
   - `/review-all-gdds` — 检查跨系统一致性
   - `/gate-check` — 在开展架构工作之前验证准备情况
   **架构阶段：**
   - `/create-architecture` — 产出总体架构蓝图和 Required ADR 列表
   - `/architecture-decision (×N)` — 按照 Required ADR 列表记录关键技术决策
   - `/create-control-manifest` — 将决策汇编为可执行的规则表
   - `/architecture-review` — 验证架构覆盖范围
   **前期制作阶段：**
   - `/ux-design` — 为关键界面编写 UX 规格（主菜单、HUD、核心交互）
   - `/vertical-slice` — 构建达到制作质量的端到端版本，以验证完整游戏循环
   - `/playtest-report (×1+)` — 记录每次垂直切片试玩会话
   - `/create-epics` — 将系统映射为 Epic
   - `/create-stories` — 将 Epic 拆分为可实现的 Story
   - `/sprint-plan` — 规划第一个 Sprint
   **制作阶段：** → 使用 `/dev-story` 领取 Story 并开始工作

#### 如果是 B：模糊的想法

1. 请他们分享自己的模糊想法——哪怕只有几个词也足够
2. 肯定这个想法可以作为起点（不要评判或引导到其他方向）
3. 建议运行 `/brainstorm [their hint]` 来完善这个想法
4. 展示推荐路径：
   **概念阶段：**
   - `/brainstorm [hint]` —— 将想法完善为完整概念
   - `/setup-engine` —— 配置引擎
   - `/prototype` —— 一次性概念构建：在开始设计之前，验证核心想法是否有趣（1–3 天）
   - `/art-bible` —— 定义视觉识别体系（使用头脑风暴产出的视觉识别锚点）
   - `/map-systems` —— 将概念分解为多个系统
   - `/design-system` —— 为每个 MVP 系统编写 GDD
   - `/review-all-gdds` —— 检查跨系统一致性
   - `/gate-check` —— 在开展架构工作之前验证准备情况
   **架构阶段：**
   - `/create-architecture` —— 生成总体架构蓝图和必需 ADR 列表
   - `/architecture-decision (×N)` —— 按照必需 ADR 列表记录关键技术决策
   - `/create-control-manifest` —— 将决策汇编为可执行的规则表
   - `/architecture-review` —— 验证架构覆盖范围
   **前期制作阶段：**
   - `/ux-design` —— 为关键界面编写 UX 规格（主菜单、HUD、核心交互）
   - `/vertical-slice` —— 通过具备生产质量的端到端构建来验证完整游戏循环
   - `/playtest-report (×1+)` —— 记录每次垂直切片试玩会话
   - `/create-epics` —— 将系统映射为史诗
   - `/create-stories` —— 将史诗拆分为可实施的故事
   - `/sprint-plan` —— 规划第一个冲刺
   **制作阶段：** → 使用 `/dev-story` 领取故事

#### 如果是 C：明确的概念

1. 请他们用一句话描述自己的概念——类型和核心机制。使用纯文本，不要使用 AskUserQuestion（这是开放式回答）。
2. 确认理解该概念，然后使用 `AskUserQuestion` 提供两条路径：
   - **提示语**：“你希望如何继续？”
   - **选项**：
     - `Formalize it first` —— 运行 `/brainstorm [concept]`，将其组织成正式的游戏概念文档
     - `Jump straight in` —— 立即转到 `/setup-engine`，之后再手动编写 GDD
3. 展示推荐路径：
   **概念阶段：**
   - `/brainstorm` 或 `/setup-engine` ——（他们在第 2 步中的选择）
   - `/prototype` —— 一次性概念构建：在开始设计之前，验证核心想法是否有趣（1–3 天）
   - `/art-bible` —— 定义视觉识别体系（如果运行了头脑风暴，则在其后进行；否则在概念文档存在后进行）
   - `/design-review` —— 验证概念文档
   - `/map-systems` —— 将概念分解为各个独立系统
   - `/design-system` —— 为每个 MVP 系统编写 GDD
   - `/review-all-gdds` —— 检查跨系统一致性
   - `/gate-check` —— 在开展架构工作之前验证准备情况
   **架构阶段：**
   - `/create-architecture` —— 生成总体架构蓝图和必需 ADR 列表
   - `/architecture-decision (×N)` —— 按照必需 ADR 列表记录关键技术决策
   - `/create-control-manifest` —— 将决策汇编为可执行的规则表
   - `/architecture-review` —— 验证架构覆盖范围
   **前期制作阶段：**
   - `/ux-design` —— 为关键界面编写 UX 规格（主菜单、HUD、核心交互）
   - `/vertical-slice` —— 通过具备生产质量的端到端构建来验证完整游戏循环
   - `/playtest-report (×1+)` —— 记录每次垂直切片试玩会话
   - `/create-epics` —— 将系统映射为史诗
   - `/create-stories` —— 将史诗拆分为可实施的故事
   - `/sprint-plan` —— 规划第一个冲刺
   **制作阶段：** → 使用 `/dev-story` 领取故事

#### 如果是 D：已有工作

1. 分享你在阶段 1 中发现的内容：
   - “我看到你已有 [X 个源文件 / Y 份设计文档 / Z 个原型]……”
   - “你的引擎[已配置为 X / 尚未配置]……”

2. **子情况 D1 — 早期阶段**（引擎尚未配置，或只有一个游戏概念）：
   - 如果引擎尚未配置，建议先运行 `/setup-engine`
   - 然后运行 `/project-stage-detect`，盘点缺口

   **子情况 D2 — 已有 GDD、ADR 或故事：**
   - 说明：“有文件并不等于模板中的技能能够使用它们。GDD 可能缺少必需章节。`/adopt` 会专门检查这一点。”
   - 建议：
     1. `/project-stage-detect` — 了解当前所处阶段以及完全缺失的内容
     2. `/adopt` — 审核现有产物是否采用了正确的内部格式

3. 展示针对 D2 的推荐路径：
   - `/project-stage-detect` — 阶段检测 + 现有内容缺口
   - `/adopt` — 格式合规性审核 + 迁移计划
   - `/setup-engine` — 如果引擎尚未配置
   - `/design-system retrofit [path]` — 补充缺失的 GDD 章节
   - `/architecture-decision retrofit [path]` — 添加缺失的 ADR 章节
   - `/architecture-review` — 初始化 TR 需求注册表
   - `/gate-check` — 验证是否已为下一阶段做好准备

---

## 阶段 3c：写入初始阶段文件

确认起始路径后（并且在询问审查模式之前），将初始阶段写入 `production/stage.txt`。如果 `production/` 目录不存在，则创建该目录。

阶段映射：
- **路径 A、B 或 C（从零开始）**：写入 `Concept`
- **路径 D，现有项目，引擎尚未配置或只有一个游戏概念**：写入 `Concept`
- **路径 D，现有项目，已有 GDD 但没有架构文档**：写入 `Systems Design`
- **路径 D，现有项目，已有完整架构（ADR、架构文档）**：写入 `Technical Setup`

静默执行此操作——对于这个单行文件，无需询问“可以写入吗？”。

告知：“我已将 `production/stage.txt` 设置为 `[stage]`——它将作为状态行和阶段检测的基准。”

---

## 阶段 3b：设置审查模式

检查 `production/review-mode.txt` 是否已经存在。

**如果存在**：读取该文件并显示当前模式——“审查模式已设置为 `[current]`。”——然后继续进入阶段 4。不要再次询问。

**如果不存在**：使用 `AskUserQuestion`：

- **提示**：“一个设置选项：在整个工作流的执行过程中，你希望进行多大程度的设计审查？”
- **选项**：
  - `Full` — 由总监级专家在工作流的每个关键步骤进行审查。最适合团队、正在学习该工作流的用户，或希望针对每项决策获得全面反馈的情况。
  - `Lean (recommended)` — 仅在阶段关卡转换时（/gate-check）由总监进行审查。跳过每项技能的审查。对于独立开发者和小型团队而言，这是一种平衡的方式。
  - `Solo` — 完全不进行总监审查。速度最快。最适合 Game Jam、原型开发，或审查会带来额外负担的情况。

用户选择后，立即将所选内容写入 `production/review-mode.txt`——无需单独询问“可以写入吗？”，因为此次写入是该选择的直接
结果：
- `Full` → 写入 `full`
- `Lean (recommended)` → 写入 `lean`
- `Solo` → 写入 `solo`

如果 `production/` 目录不存在，请创建它。

---

## 阶段 4：继续之前进行确认

给出推荐路径后，使用 `AskUserQuestion` 询问用户希望先执行哪个步骤。切勿自动运行下一个技能。

- **提示**：“你想先从[推荐的第一步]开始吗？”
- **选项**：
  - `是的，让我们从[推荐的第一步]开始`
  - `我想先做其他事情`

---

## 阶段 5：移交

当用户确认下一步时，仅用一句简短的话回复：“输入 `[skill command]` 即可开始。”不要添加任何其他内容。不要重新解释该技能，也不要添加鼓励的话。`/start` 技能的任务至此完成。

结论：**完成** — 用户已了解情况并被移交至下一步。

---

## 边界情况

- **用户选择 D，但项目为空**：温和地引导其重新选择 — “这个项目看起来是一个尚无任何产出物的全新模板。路径 A 或 B 是否更适合？”
- **用户选择 A，但项目中已有代码**：说明你发现的情况 — “我注意到 `src/` 中已经有代码。你原本是否想选择 D（现有工作）？”
- **用户再次回来（引擎已配置，概念已存在）**：完全跳过引导流程 — “看起来你已经完成设置！你的引擎是 [X]，并且 `design/gdd/game-concept.md` 中已有游戏概念。审查模式：`[read from production/review-mode.txt, or 'lean (default)' if missing]`。想从上次中断的地方继续吗？试试 `/sprint-plan`，或者直接告诉我你想做什么。”
- **用户不符合任何选项**：让他们用自己的话描述情况，并据此进行调整。

---

## 协作协议

1. **先询问** — 切勿假设用户的状态或意图
2. **提供选项** — 给出清晰的路径，而不是强制要求
3. **由用户决定** — 由他们选择方向
4. **不自动执行** — 推荐下一个技能，但未经询问不要运行
5. **灵活调整** — 如果用户的情况不符合模板，请倾听并作出调整