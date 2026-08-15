---
name: art-bible
description: "Guided, section-by-section Art Bible authoring. Creates the visual identity specification that gates all asset production. Run after /brainstorm is approved and before /map-systems or any GDD authoring begins."
argument-hint: "[--review full|lean|solo]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Task, AskUserQuestion
model: sonnet
---
## 阶段 0：解析参数与上下文检查

确定评审模式（仅确定一次，并存储以供本次运行中的所有关卡生成使用）：
1. 如果传入了 `--review [full|lean|solo]` → 使用该值
2. 否则读取 `production/review-mode.txt` → 使用其中的值
3. 否则 → 默认为 `lean`

完整的检查模式请参阅 `.claude/docs/director-gates.md`。

读取 `design/gdd/game-concept.md`。如果该文件不存在，则以下述信息终止：
> "未找到游戏概念。请先运行 `/brainstorm`——美术圣经将在游戏概念获批后编写。"

从 game-concept.md 中提取：
- 游戏标题（暂定标题）
- 核心幻想与电梯推介
- 游戏支柱（全部）
- **Visual Identity Anchor** 章节（如果存在，来自头脑风暴阶段 4 的美术指导输出）
- 目标平台（如果注明）

**改造模式检测**：使用 Glob 查找 `design/art/art-bible.md`。如果该文件存在：
- 完整读取该文件
- 针对 9 个章节中的每一个，检查正文是否包含实际内容（不只是 `[To be designed]` 占位符或类似内容），还是为空/占位内容
- 构建章节状态表：

```
Section | Status
--------|--------
1. Visual Identity Statement | [Complete / Empty / Placeholder]
2. Color Palette | ...
3. Lighting & Atmosphere | ...
4. Character Art Direction | ...
5. Environment & Level Art | ...
6. UI Visual Language | ...
7. VFX & Particle Style | ...
8. Asset Standards | ...
9. Style Prohibitions | ...
```

- 向用户展示此表：
  > "在 `design/art/art-bible.md` 中发现现有美术圣经。[N] 个章节已完成，[M] 个章节需要补充内容。我将仅处理未完成的章节——现有内容不会被修改。"
- 仅处理 Status 为 Empty 或 Placeholder 的章节。不要重新编写已经完成的章节。

如果该文件不存在，则这是一次全新的编写会话——按正常流程继续。

如果 `.claude/docs/technical-preferences.md` 存在，则读取该文件——提取性能预算和引擎信息，用于制定资源标准约束。

---

## 阶段 1：框定范围

在编写任何内容之前，展示会话上下文并提出两个问题：

使用带有两个选项卡的 `AskUserQuestion`：
- 选项卡 **"范围"** — "今天需要编写哪些章节？"
  选项：`完整圣经——全部 9 个章节` / `视觉识别核心（仅第 1–4 节）` / `仅资源标准（第 8 节）` / `继续——填补缺失章节`
- 选项卡 **"参考资料"** — "你是否有能够定义视觉方向的参考游戏、电影或艺术作品？"
  （自由文本——让用户输入具体标题。不要在此处预设选项。）

如果 game-concept.md 中包含 Visual Identity Anchor 章节，请注明：
> "发现头脑风暴阶段确定的视觉识别锚点：'[anchor name] — [one-line rule]'。我会以此作为美术圣经的基础。"

---

## 阶段 2：视觉识别基础（第 1–4 节）

这四个章节定义了核心视觉语言。**其他所有章节均由此衍生。** 每个章节都应先完成编写并写入文件，然后再继续下一章节。

### 第 1 节：视觉识别陈述

**目标**：用一条视觉规则和 2–3 条辅助原则来消除视觉歧义。

如果 game-concept.md 中存在视觉锚点：展示该锚点并询问：
- “直接基于此锚点构建？”
- “在扩展之前先修改它？”
- “从全新的方案开始？”

**代理委派（强制）**：通过 Task 启动 `art-director`：
- 提供：游戏概念（电梯演讲、核心幻想）、完整的支柱集合、目标平台、第一阶段框定过程中提及的任何参考游戏/艺术作品，以及视觉锚点（如果存在）
- 询问：“为这款游戏起草一份视觉识别声明。请提供：(1) 一条能够解决任何视觉决策歧义的单行视觉规则；(2) 2–3 条辅助视觉原则，每条原则附带一句设计检验标准（‘当 X 存在歧义时，此原则要求选择 Y’）。所有原则都必须直接锚定于既定支柱——每条原则都必须服务于一个具体支柱。”

向用户展示 `art-director` 的草案。使用 `AskUserQuestion`：
- 选项：`[A] 确定采用` / `[B] 修改单行声明` / `[C] 修改一条辅助原则` / `[D] 描述我自己的方向`

立即将获批的章节写入文件。

### 第 2 节：情绪与氛围

**目标**：按游戏状态定义情感目标——具体到足以让灯光美术师据此开展工作。

针对每种主要游戏状态（例如探索、战斗、胜利、失败、菜单——根据这款游戏的状态进行调整），定义：
- 主要情感/情绪目标
- 灯光特征（时段、色温、对比度）
- 氛围描述词（3–5 个形容词）
- 能量水平（狂热 / 从容 / 沉思 / 等）

**代理委派**：通过 Task 启动 `art-director`，并提供视觉识别声明和支柱集合。询问：“为这款游戏的每种主要游戏状态定义情绪与氛围目标。要具体——‘黑暗且不祥’还不够。请明确准确的情感目标、灯光特征（暖/冷、高/低对比度、时段方向），以及至少一种承载该情绪的视觉元素。每种游戏状态在视觉上都必须与其他状态明显不同。”

立即将获批的章节写入文件。

### 第 3 节：形状语言

**目标**：使这款游戏的世界在视觉上保持连贯且易于辨识的几何词汇体系。

涵盖：
- 角色轮廓理念（在缩略图尺寸下的可读性如何？每种原型是否具有独特特征？）
- 环境几何形态（棱角/曲线/有机/几何——哪一种占主导，为什么？）
- UI 形状语法（UI 是呼应世界的美学，还是采用独立的 HUD 语言？）
- 主体形状与辅助形状（什么吸引视线，什么退居次要位置？）

**代理委派**：通过 Task 启动 `art-director`，并提供视觉识别声明和情绪目标。询问：“定义这款游戏的形状语言。将每条形状原则关联回视觉识别声明和一个具体的游戏支柱。说明这些形状选择在情感上向玩家传达了什么。”

立即将获批的章节写入文件。

### 第 4 节：色彩系统

**目标**：建立一套兼顾审美与信息传达需求、完整且可投入制作的配色系统。

涵盖：
- 主色板（5–7 种具有明确作用的颜色——不仅要提供十六进制代码，还要说明每种颜色在这个世界中代表什么）
- 语义化色彩用法（红色传达什么？金色呢？蓝色呢？白色呢？建立色彩词汇体系）
- 各生物群系或各区域的色温规则（如果游戏包含不同区域）
- UI 配色（可以不同于世界配色——明确界定二者的差异）
- 色盲安全性：哪些语义色彩需要使用形状/图标/声音作为辅助

**智能体委派**：通过 Task 启动 `art-director`，并提供视觉识别声明和氛围目标。提问：“为这款游戏设计色彩系统。必须解释每一种语义色彩分配——为什么在这个世界中，这种颜色代表危险/安全/奖励？识别哪些颜色组合可能会给色盲玩家带来辨识困难，并明确需要哪些备用提示。”

立即将获批的章节写入文件。

---

## 阶段 3：制作指南（第 5–8 节）

这些章节将视觉识别转化为具体的制作规则。内容应足够明确，使外包团队无需额外说明即可遵循。

### 第 5 节：角色设计方向

**智能体委派**：通过 Task 启动 `art-director`，并提供第 1–4 节。提问：“定义这款游戏的角色设计方向。涵盖：玩家角色（如有）的视觉原型、各类角色的区分特征规则（玩家如何一眼区分敌人/NPC/盟友？）、表情/姿势风格目标（僵硬/富有表现力/写实/夸张），以及 LOD 理念（在游戏镜头距离下保留多少细节？）。”

将获批的章节写入文件。

### 第 6 节：环境设计语言

**智能体委派**：通过 Task 启动 `art-director`，并提供第 1–4 节。提问：“定义这款游戏的环境设计语言。涵盖：建筑风格及其与世界文化/历史的关系、纹理理念（手绘、PBR 还是风格化——为什么这种选择适合本游戏？）、道具密度规则（稀疏/密集——各类区域的选择由什么决定？），以及环境叙事指南（哪些视觉细节应在不使用文字的情况下讲述故事？）。”

将获批的章节写入文件。

### 第 7 节：UI/HUD 视觉方向

**智能体委派**：并行启动：
- **`art-director`**：UI 的视觉风格——叙事内界面还是屏幕空间 HUD、字体设计方向（字体个性、字重、字号层级）、图标风格（扁平/描边/插画/照片写实），以及 UI 元素的动画感觉
- **`ux-designer`**：UX 一致性检查——视觉方向是否支持这款游戏所需的交互模式？标记美术方向与可读性/无障碍需求之间的任何冲突。

汇总双方的结果。如果存在冲突（例如，`art-director` 希望采用精细复杂的叙事内 UI，但 `ux-designer` 指出这会降低战斗中的信息可读性），应明确呈现冲突以及双方的立场。不要擅自解决——使用 `AskUserQuestion` 让用户决定。

将获批的章节写入文件。

### 第 8 节：资产标准

**智能体委派**：并行启动：
- **`art-director`**：文件格式偏好、命名规范方向、纹理分辨率分级、LOD 级别要求、导出设置理念
- **`technical-artist`**：引擎特定的硬性约束——各资产类别的多边形数量预算、纹理内存限制、材质槽数量、导入器约束，以及 `.claude/docs/technical-preferences.md` 中性能预算涉及的任何内容

如果任何美术偏好与技术约束冲突（例如，美术指导希望使用 4K 纹理，但性能预算要求移动端使用 2K 纹理），应明确解决冲突——同时注明理想标准和受限标准，并解释其中的权衡。资产标准中的歧义正是制作成本产生的根源。

将获批的章节写入文件。

---

## 阶段 4：参考方向（第 9 节）

**目标**：整理一组经过筛选的参考资料，具体说明要从每个来源中借鉴什么，以及要避免什么。

**智能体委派**：通过 Task 启动 `art-director`，并提供已完成的第 1–8 节。要求：“为这款游戏整理参考方向。提供 3–5 个参考来源（游戏、电影、美术风格或具体艺术家）。对于每个来源：给出其名称，明确说明要从中借鉴的具体视觉元素（不要写‘整体美学’——应是具体的技法、色彩选择或构图规则），并明确说明要避免或有所区别的内容（以防给人‘试图模仿 X’的印象）。各项参考应相互补充——不能有两个参考指向完全相同的方向。”

将获批的章节写入文件。

---

## 阶段 5：美术指导签核

**审查模式检查**——在启动 AD-ART-BIBLE 之前执行：
- `solo` → 跳过。注明：“AD-ART-BIBLE skipped — Solo mode.” 继续进入阶段 6。
- `lean` → 跳过（不是 PHASE-GATE）。注明：“AD-ART-BIBLE skipped — Lean mode.” 继续进入阶段 6。
- `full` → 正常启动。

所有章节完成后（或阶段 1 中确定范围的章节集完成后），通过 Task 启动 `creative-director`，并使用关卡 **AD-ART-BIBLE**（`.claude/docs/director-gates.md`）。

传入：美术圣经文件路径、游戏支柱、视觉识别锚点。

按照 `director-gates.md` 中的标准规则处理裁决。在美术圣经的状态标头中记录裁决：
`> **Art Director Sign-Off (AD-ART-BIBLE)**: APPROVED [date] / CONCERNS (accepted) [date] / REVISED [date]`

---

## 阶段 6：收尾

在展示后续步骤之前，检查项目状态：
- `design/gdd/systems-index.md` 是否存在？→ map-systems 已完成，跳过该选项
- `.claude/docs/technical-preferences.md` 是否包含已配置的引擎（不是 `[TO BE CONFIGURED]`）？→ setup-engine 已完成，跳过该选项
- `design/gdd/` 是否包含任何 `*.md` 文件？→ design-system 已运行，跳过该选项
- `design/gdd/gdd-cross-review-*.md` 是否存在？→ review-all-gdds 已完成
- GDD 是否存在（按上述方式检查）？→ 包含 /consistency-check 选项

使用 `AskUserQuestion` 询问后续步骤。根据上述状态检查，仅包含确实适合作为后续步骤的选项：

**选项池——仅包含尚未完成的选项：**
- `[_] Run /map-systems — decompose the concept into systems before writing GDDs`（如果 systems-index.md 已存在，则跳过）
- `[_] Run /setup-engine — configure the engine (asset standards may need revisiting after engine is set)`（如果引擎已配置，则跳过）
- `[_] Run /design-system — start the first GDD`（如果存在任何 GDD，则跳过）
- `[_] Run /review-all-gdds — cross-GDD consistency check (required before Technical Setup gate)`（如果 gdd-cross-review-*.md 已存在，则跳过）
- `[_] Run /asset-spec — generate per-asset visual specs and AI generation prompts from approved GDDs`（如果 GDD 存在，则包含）
- `[_] Run /consistency-check — scan existing GDDs against the art bible for visual direction conflicts`（如果 GDD 存在，则包含）
- `[_] Run /create-architecture — author the master architecture document (next Technical Setup step)`
- `[_] Stop here`

仅为实际包含的选项分配字母 A、B、C……。将最符合逻辑、最能推进流程的选项标记为 `(recommended)`。

> **始终包含** `/create-architecture` 和“在此停止”作为选项——美术圣经完成后，它们始终都是有效的后续步骤。

---

## 协作协议

每个章节都遵循：**提问 → 选项 → 决策 → 草拟（由 art-director 智能体完成）→ 批准 → 写入文件**

- 在生成相关智能体之前，绝不要草拟任何章节
- 每个章节获得批准后，立即写入文件——不要批量处理
- 向用户呈现所有智能体之间的分歧——绝不要默默解决 art-director 与 technical-artist 之间的冲突
- 美术圣经是一份约束文档：它通过限制未来的决策来换取视觉一致性。每个章节都应当让人感觉它在以富有成效的方式缩小解决方案空间。

---

## 推荐的后续步骤

美术圣经获得批准后：
- 运行 `/map-systems`，在编写 GDD 之前将概念拆解为游戏系统
- 如果尚未配置引擎，则运行 `/setup-engine`（选择引擎后，可能需要重新审视资产标准）
- 运行 `/design-system [first-system]`，开始编写各系统的 GDD
- 在 GDD 完成后运行 `/consistency-check`，根据美术圣经的视觉规则对其进行验证
- 运行 `/create-architecture`，生成主架构文档