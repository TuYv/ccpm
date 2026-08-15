---
name: asset-spec
description: "Generate per-asset visual specifications and AI generation prompts from GDDs, level docs, or character profiles. Produces structured spec files and updates the master asset manifest. Run after art bible and GDD/level design are approved, before production begins."
argument-hint: "[system:<name> | level:<name> | character:<name>] [--review full|lean|solo]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Task, AskUserQuestion
model: sonnet
---
如果未提供参数，请检查 `design/assets/entity-inventory.md` 是否存在：
- 如果存在：读取该文件，找到第一个状态为 "Needed" 但尚无规格文件的实体或界面，并使用 `AskUserQuestion`：
  - 提示："下一个尚未编写规格的项目是 **[name]**。是否为其生成规格？"
  - 选项：`[A] 是 — 为 [name] 编写规格` / `[B] 选择其他项目` / `[C] 到此为止`
- 如果没有实体清单：检查 `design/assets/asset-manifest.md`。如果清单存在，则执行与上述相同的流程，但从该清单中读取。
- 如果两者都不存在：**启动实体与界面清单流程**（见下方阶段 0b），而不是失败退出。

---

## 阶段 0b：实体与界面清单（在无参数且不存在现有清单时运行）

此流程会生成 `design/assets/entity-inventory.md`——游戏在视觉层面所需一切内容的主清单。
在开始资产规格工作之前运行一次。

### 步骤 1——从文档中收集
并行读取所有可用的源材料：
- `design/gdd/systems-index.md`——提取列出的每个系统
- `design/gdd/` 中的所有 GDD——提取：视觉/音频需求章节、提及的 UI 元素、VFX 事件，以及所有具名实体（角色、敌人、建筑、物品）
- `design/art/art-bible.md`——提取：所有具名视觉类别、资产类型预期
- `design/narrative/`——扫描可能存在的角色或世界实体文档（可选——并非必需）

### 步骤 2——构建拟议清单
将找到的所有内容整理到以下类别中：

```
Characters / Protagonists
Enemies / Creatures
Buildings / Structures
Environment / Terrain
Items / Props
VFX / Particles
UI Screens (list each screen by name)
HUD Elements
Audio (SFX, music — descriptions only, no generation prompts)
Other
```

对于每个项目，注明发现该项目的源文档。

### 步骤 3——展示并协作
在对话中向用户展示完整的拟议清单。然后使用 `AskUserQuestion`：
- 提示："我在你的 GDD 和美术圣经中找到了 **[N] 个视觉实体和 [N] 个 UI 界面**。请检查该列表——还缺少什么？哪些不需要？"
- 选项：
  - `[A] 看起来不错 — 保存此清单`
  - `[B] 添加我将描述的项目`
  - `[C] 移除不适用的项目`
  - `[D] 同时添加和移除 — 让我编辑`

如果选择 [B] 或 [D]：请用户描述要添加的项目。简短描述（"一个中世纪城堡，用作关卡背景"）或详细描述均可。以协作方式逐项处理，直到用户满意。

如果选择 [C] 或 [D]：询问要移除哪些项目以及原因。将这些项目从列表中移除。

### 步骤 4——写入清单
用户批准后，询问："我可以将实体清单写入 `design/assets/entity-inventory.md` 吗？"

写入以下文件：

```markdown
# Visual Entity & Screen Inventory

> Generated: [date]
> Sources: [list of source docs read]

## Entities

| # | Name | Type | Description | Source | Status |
|---|------|------|-------------|--------|--------|
| 1 | [name] | Character / Enemy / Building / Environment / Item / Other | [brief description] | [source doc] | Needed |

## UI Screens

| # | Screen Name | Description | Source | Status |
|---|-------------|-------------|--------|--------|
| 1 | Main Menu | [description] | [source] | Needed |

## HUD Elements

| # | Element | Description | Source | Status |
|---|---------|-------------|--------|--------|

## Audio

| # | Name | Type (SFX / Music / Ambient) | Description | Source | Status |
|---|------|------------------------------|-------------|--------|--------|
```

写入后，告知用户：
> “实体清单已保存。后续步骤：
> - 对清单中的每个 UI 屏幕运行 `/ux-design [screen name]`
> - 运行 `/asset-spec entity:[name]` 为每个视觉实体编写规格
> - 或再次运行 `/asset-spec`，逐项处理清单中的内容”

---

## 阶段 0：解析参数

提取：
- **目标类型**：`system`、`level` 或 `character`
- **目标名称**：冒号后的名称（规范化为 kebab-case）
- **审查模式**：`--review [full|lean|solo]`（如果存在）

**模式行为：**
- `full`（默认）：并行启动 `art-director` 和 `technical-artist`
- `lean`：仅启动 `art-director`——速度更快，跳过技术约束检查
- `solo`：不启动任何代理——主会话仅根据美术圣经规则编写规格。适用于简单的资产类别，或重视速度而非深度的情况。

---

## 阶段 1：收集上下文

在向用户提问**之前**阅读所有源材料。

### 必读内容：
- **美术圣经**：读取 `design/art/art-bible.md`——如果缺失则失败：
  > “未找到美术圣经。请先运行 `/art-bible`——资产规格以美术圣经中的视觉规则和资产标准为基准。”
  提取：视觉识别声明、色彩系统（语义色彩）、形状语言、资产标准（第 8 节——尺寸、格式、面数预算、纹理分辨率层级）。

- **技术偏好**：读取 `.claude/docs/technical-preferences.md`——提取性能预算和命名约定。

### 源文档读取方式（按目标类型）：
- **system**：读取 `design/gdd/[target-name].md`。提取 **视觉/音频要求**部分。如果该部分不存在或内容为 `[To be designed]`：
  > “`design/gdd/[target-name].md` 的视觉/音频部分为空。请运行 `/design-system [target-name]` 完成 GDD，或手动描述视觉需求。”
  使用 `AskUserQuestion`：`[A] 手动描述需求` / `[B] 停止——先完成 GDD`
- **level**：读取 `design/levels/[target-name].md`。提取美术要求、资产列表、VFX 需求，以及第 4 步中美术总监的制作概念规格。
- **character** 或 **entity**：读取 `design/narrative/characters/[target-name].md`，或在 `design/narrative/` 和 `design/assets/entity-inventory.md` 中搜索匹配条目。提取视觉描述、角色定位，以及任何指定的辨识特征。
  - **如果不存在源文档**：不要失败。改用 `AskUserQuestion`：
    - 提示：“未找到 **[name]** 的档案。请简要描述它——一两句话就足够。”
    - 选项：`[A] 立即描述` / `[B] 跳过此实体` / `[C] 在此停止`
    - 如果选择 [A]：将用户的描述作为源材料。简短的回答生成简洁的规格；详细的回答生成详细的规格。无论用户提供何种详细程度，都应接受并以此为基础开展工作。

### 可选读取内容：
- **现有清单**：如果 `design/assets/asset-manifest.md` 存在，则读取该文件——提取此目标已编写规格的资产，以避免重复。
- **相关规格**：使用 Glob 匹配 `design/assets/specs/*.md`——扫描可共享的资产（例如，为某个系统编写规格的通用 UI 元素也可能适用于此处）。

### 展示上下文摘要：
> **资产规格：[Target Type] — [Target Name]**
> - 来源文档：[path] — 已识别 [N] 种资产类型
> - 美术规范：已找到 — 第 8 节中的资产标准
> - 此目标的现有规格：[N already specced / none]
> - 在其他规格中找到的共享资产：[list or "none"]

---

## 阶段 2：资产识别

从来源文档中提取提到的每一种资产类型，包括明确提及和隐含需要的资产。

**对于系统**：查找 VFX 事件、精灵引用、UI 元素、音频触发器、粒子效果、图标需求，以及任何与“视觉反馈”相关的表述。

**对于关卡**：查找独特的环境道具、氛围 VFX、灯光设置、环境音频、天空盒/背景，以及任何特定区域使用的材质。

**对于角色**：查找精灵表（待机、行走、攻击、死亡）、肖像/头像、附加到技能上的 VFX，以及 UI 表现形式（图标、生命条皮肤）。

将资产分为以下类别：
- **精灵 / 2D 美术** — 角色精灵、UI 图标、图块表
- **VFX / 粒子** — 命中特效、环境粒子、屏幕特效
- **环境** — 道具、图块、背景、天空盒
- **UI** — HUD 元素、菜单美术、字体（如果为自定义字体）
- **音频** — SFX、音乐曲目、环境音循环 *（注意：音频规格仅包含描述，不提供生成提示词）*
- **3D 资产** — 网格、材质（如果适用于相应引擎）

向用户展示识别出的完整列表。使用 `AskUserQuestion`：
- 提示：“我为 **[target]** 识别出了分属 [N] 个类别的 [N] 项资产。请在编写规格前进行审核：”
- 首先在对话文本中展示按类别分组的列表
- 选项：`[A] 继续 — 为所有这些资产编写规格` / `[B] 移除部分资产` / `[C] 添加我遗漏的资产` / `[D] 调整类别`

在用户确认资产列表之前，不得进入阶段 3。

---

## 阶段 3：规格生成

根据审核模式启动专业代理。**同时发起所有 Task 调用——不要等待某个调用完成后再启动下一个调用。**

### 完整模式 — 并行启动：

通过 Task 启动 **`art-director`**：
- 提供：阶段 2 中的完整资产列表、美术规范中的视觉识别声明、色彩系统、形状语言、来源文档中的视觉要求，以及美术规范第 9 节中提到的任何参考游戏/美术作品
- 要求：“对于此列表中的每项资产，提供：(1) 一段 2–3 句话的视觉描述，以美术规范中的形状语言和色彩系统为依据——内容应足够具体，确保两名不同的美术师能够产出一致的结果；(2) 可直接用于 AI 图像工具的生成提示词（Midjourney/Stable Diffusion 风格——包括风格关键词、构图、调色板基准和负面提示词）；(3) 直接约束该资产的美术规范规则（引用具体章节）。对于音频资产，描述其声音特征，而不是提供生成提示词。”

通过 Task 启动 **`technical-artist`**：
- 提供：完整资产列表、美术规范中的资产标准（第 8 节）、technical-preferences.md 中的性能预算、引擎名称和版本
- 要求：“对于此列表中的每项资产，指定：(1) 确切尺寸或多边形数量（与美术规范中的资产标准分级保持一致——不要自行创造新尺寸）；(2) 文件格式和导出设置；(3) 命名约定（来自 technical-preferences.md）；(4) 此资产类型必须遵循的所有引擎特定约束；(5) LOD 要求（如适用）。标记出美术规范的首选标准与引擎约束存在冲突的所有资产类型。”

### 精简模式 — 仅启动 art-director（跳过 technical-artist）。

### 单人模式 — 两者都跳过。仅根据艺术圣经规则推导规格，并注明技术约束未经验证。

**在进入阶段 4 之前收集两者的回复。** 如果 art-director 与 technical-artist 之间存在任何冲突（例如，art-director 指定使用 4K 纹理，但 technical-artist 指出引擎预算要求使用 512px），请明确指出——不要静默解决。

---

## 阶段 4：汇编与审查

将智能体的输出合并，为每项资产生成一份规格草案。使用以下格式，在对话文本中呈现所有规格：

```
## ASSET-[NNN] — [Asset Name]

| Field | Value |
|-------|-------|
| Category | [Sprite / VFX / Environment / UI / Audio / 3D] |
| Dimensions | [e.g. 256×256px, 4-frame sprite sheet] |
| Format | [PNG / SVG / WAV / etc.] |
| Naming | [e.g. vfx_frost_hit_01.png] |
| Polycount | [if 3D — e.g. <800 tris] |
| Texture Res | [e.g. 512px — matches Art Bible §8 Tier 2] |

**Visual Description:**
[2–3 sentences. Specific enough for two artists to produce consistent results.]

**Art Bible Anchors:**
- §3 Shape Language: [relevant rule applied]
- §4 Color System: [color role — e.g. "uses Threat Blue per semantic color rules"]

**Generation Prompt:**
[Ready-to-use prompt. Include: style keywords, composition notes, color palette anchors, lighting direction, negative prompts.]

**Status:** Needed
```

呈现所有规格后，使用 `AskUserQuestion`：
- 提示："**[target]** 的资产规格——共 [N] 项资产。审查完成了吗？"
- 选项：`[A] Approve all — write to file` / `[B] Revise a specific asset` / `[C] Regenerate with different direction`

如果选择 [B]：询问要修改哪项资产以及修改内容。以内联方式修订并重新呈现。对于轻微的文本修订，不要重新启动智能体——仅当视觉方向本身需要改变时才重新启动。

如果选择 [C]：询问要改变什么方向。使用更新后的简报重新启动相关智能体。

---

## 阶段 5：写入规格文件

获得批准后，询问："可以将规格写入 `design/assets/specs/[target-name]-assets.md` 吗？"

使用以下内容写入文件：

```markdown
# Asset Specs — [Target Type]: [Target Name]

> **Source**: [path to source GDD/level/character doc]
> **Art Bible**: design/art/art-bible.md
> **Generated**: [date]
> **Status**: [N] assets specced / [N] approved / [N] in production / [N] done

[all asset specs in ASSET-NNN format]
```

然后更新 `design/assets/asset-manifest.md`。如果该文件不存在，则创建它：

```markdown
# Asset Manifest

> Last updated: [date]

## Progress Summary

| Total | Needed | In Progress | Done | Approved |
|-------|--------|-------------|------|----------|
| [N] | [N] | [N] | [N] | [N] |

## Assets by Context

### [Target Type]: [Target Name]
| Asset ID | Name | Category | Status | Spec File |
|----------|------|----------|--------|-----------|
| ASSET-001 | [name] | [category] | Needed | design/assets/specs/[target]-assets.md |
```

如果清单已存在，则追加新的上下文区块，并更新进度摘要中的计数。

询问：“我可以更新 `design/assets/asset-manifest.md` 吗？”

---

## 阶段 6：结束

使用 `AskUserQuestion`：
- 提示：“**[target]** 的资产规格已完成。下一步做什么？”
- 选项：
  - `[A] 为另一个系统编写规格 — /asset-spec system:[next-system]`
  - `[B] 为一个关卡编写规格 — /asset-spec level:[level-name]`
  - `[C] 为一个角色编写规格 — /asset-spec character:[character-name]`
  - `[D] 运行 /asset-audit — 根据规格验证已交付的资产`
  - `[E] 到此为止`

---

## 资产 ID 分配

资产 ID 在整个项目中按顺序分配，而不是按上下文分别分配。分配 ID 前，请读取清单以查找当前的最大编号：

```
Grep pattern="ASSET-" path="design/assets/asset-manifest.md"
```

新资产从 `ASSET-[highest + 1]` 开始编号。这样可以确保 ID 在整个项目中保持稳定且唯一。

如果清单尚不存在，则从 `ASSET-001` 开始。

---

## 共享资产协议

在为资产编写规格之前，请检查其他上下文的规格中是否已经存在等效资产：

- 常见 UI 元素（生命条、分数显示）通常会在多个系统之间共享
- 通用环境道具可能会出现在多个关卡中
- 角色 VFX（命中特效、死亡特效）可以复用基础规格并采用不同的颜色变体

如果找到匹配项：请引用现有的 ASSET-ID，而不要创建重复项。在清单的 referenced-by 列中注明共享使用情况。

> “ASSET-012（通用命中特效）已为战斗系统编写规格。将在塔防系统中复用——把 tower-defense 添加到 referenced-by。”

---

## 错误恢复协议

如果任何派生代理返回 BLOCKED 或无法完成任务：

1. 立即明确告知：“[AgentName]：BLOCKED — [reason]”
2. 在 `lean` 模式下，或当 `technical-artist` 被阻塞时：仅使用美术指导的输出继续推进——注明技术约束未经验证
3. 在 `solo` 模式下，或当 `art-director` 被阻塞时：根据美术圣经规则推导描述——标记为“未咨询美术指导——制作前请根据美术圣经进行验证”
4. 始终生成部分规格——绝不要因为某个代理被阻塞而丢弃工作成果

---

## 协作协议

每个阶段都遵循：**识别 → 确认 → 生成 → 审查 → 批准 → 写入**

- 在与用户确认资产列表之前，绝不要为资产编写规格
- 始终以美术圣经为规格依据——与美术圣经冲突的规格是错误的
- 明确呈现代理之间的所有分歧——不要擅自选择其中一方
- 仅在获得明确批准后写入规格文件
- 写入规格后立即更新清单

---

## 建议的后续步骤

- 运行 `/asset-spec [next-context]`，继续为其余系统、关卡或角色编写规格
- 运行 `/asset-audit`，根据书面规格验证已交付的资产，并找出缺失项或不匹配项