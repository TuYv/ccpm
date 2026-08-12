---
name: brand-discovery
description: >-
  Use when a brand needs to discover or articulate its identity through
  structured multi-session interviews. Covers purpose, positioning, audience,
  personality, voice, narrative, and founder-brand tension across 8 modules
  using laddering, 5 Whys, and projective techniques. Produces a resumable
  session with disk-persisted state and a master brandbook (90_SYNTHESIS.md).
---
# 品牌探索

使用此技能开展结构化、可适应调整的品牌识别访谈。  
目标是完成一份 `90_SYNTHESIS.md`——一本品牌总手册，组织可以用它向设计师、文案撰稿人和外部协作者提供工作简报。

访谈将跨多个会话进行。过程中应随时将回答保存到磁盘，以确保会话结束时不会丢失已获取的信息，并使后续会话能够从上次停止的位置继续。

## 何时启用

- 正在创建或重新定位品牌，或需要一份书面的品牌识别参考资料来向协作者提供工作简报。
- 预计需要多个会话——对话将持续数天或数周。
- 在进行协调统一之前，需要分别访谈多位创始人或利益相关者。
- 用户需要一种结构化、可重复的方法，而非临时随意的对话。
- 现有品牌文档零散分布、含而不显或依赖创始人的个人认知，需要将其明确记录下来。

## 会话启动协议

每次启用时，在提出任何访谈问题**之前**执行以下步骤：

1. **检查先前进度。** 在项目的品牌识别目录中查找现有的模块文件集和 `state.json` 检查点。如果均不存在，则表示这是全新开始——确认品牌名称、参与者以及品牌识别文件的保存位置，然后从第一个模块开始。
2. 如果有正在进行的模块，**读取当前模块文件**，并扫描其 Raw 部分，查看此前记录的回答。
3. 用两三句话**向用户报告**：当前所在的模块、模块状态以及剩余工作。然后询问：“继续当前模块，还是切换模块？”

## 访谈规范

在每个模块中始终遵循以下规则：

1. **一次只问一个问题。** 绝不一次列出一组问题。
2. **每次回答之后：** 简短复述 → 提出一个深入追问，或者在该话题已充分挖掘时结束讨论。绝不默不作声地进入下一话题。
3. **阶梯式追问：** 对每个关于“是什么”的回答，都继续追问“为什么这对你很重要？”，直到浮现出核心价值观（通常需要追问两到四轮）。
4. **五个为什么：** 对于信念或定位主张——持续追问，直到根本原因而非表层陈述被摆到台面上。
5. **识别内容单薄的回答：** 如果回答过于笼统、充斥术语或含糊不清，则要求提供一个具体示例、一段客户经历或一个数字。
6. **投射技术**（每个模块使用一次，以突破访谈停滞期）：
   - “如果品牌是一个人，他们会怎样走进一个房间？”
   - 品牌讣告：“如果组织在五年后关闭，客户会怀念什么？你会后悔哪些话没有说出来？”
   - 竞争对照：“请说出一个你钦佩、但绝不希望成为的同行。具体是什么让他们成为了错误的参照对象？”
7. **饱和信号：** 当连续两次追问都没有产生新信息时，进行总结并结束该模块。
8. **模块结束时：** 编写一份包含两个部分的结构化模块文件：
   - `## Raw`——逐字记录的引语和示例。
   - `## Synthesis`——你的解读、三个候选表述、待解决的问题、参与者之间的矛盾。
   然后更新 `state.json` 检查点（参见下方的状态协议）。

## 模块顺序

| 文件 | 标签 | 使用的框架 |
|------|-------|-----------------|
| `10_purpose-why.md` | 使命 / 原因 | Sinek 黄金圈、Lencioni |
| `20_positioning.md` | 定位 | Dunford《Obviously Awesome》、Moore 模板 |
| `30_audience-niche.md` | 受众与细分市场 | Baker《Business of Expertise》、ICP |
| `40_personality-archetype.md` | 个性与原型 | Mark 与 Pearson 的 12 原型、J. Aaker 的 5 个维度 |
| `50_voice-tone.md` | 品牌声音与语调 | 品牌声音指南 |
| `60_narrative-story.md` | 叙事 / 故事 | Neumeier 核心陈述、品牌故事弧 |
| `70_founder-tension.md` | 创始人品牌与工作室品牌 | Enns《Win Without Pitching》 |
| `90_SYNTHESIS.md` | 品牌手册总纲 | Kapferer 棱镜、Aaker 品牌系统 |

按顺序完成各模块。如果用户要求跳转模块，应遵照执行，并在
`state.json` 中记录此次跳过。

## 状态写入协议

每个模块达到信息饱和或完成状态后，写入两个文件：

**模块文件**，路径为 `modules/{moduleFile}` — 包含完整的原始内容和综合内容。

**`state.json`** — 一个轻量级检查点，使后续会话可以继续处理。
更新 `completedModules`、`inProgressModule`、`nextModule`、`lastUpdated`。
结构如下：

```json
{
  "session": "{brand_name}-brand-{YYYY-MM}",
  "outputPath": "{path_to_brand_identity_directory}",
  "completedModules": [],
  "inProgressModule": "10_purpose-why.md",
  "nextModule": "20_positioning.md",
  "participants": ["founder-A"],
  "lastUpdated": "{ISO-8601}"
}
```

写入后，确认：“模块 X 已保存。状态已更新。下一步：Y。”

**终结模块（90_SYNTHESIS.md）：** 写入最终综合内容时，
在 `state.json` 中将 `inProgressModule` 设为 `"90_SYNTHESIS.md"`，并将 `nextModule` 设为 `null`。
写入后，更新 `completedModules` 以包含
`"90_SYNTHESIS.md"`，然后将 `inProgressModule` 设为 `null` — 如果仍保留该值，
后续恢复会话时会把已完成的品牌手册视为仍在进行中。
确认：“品牌手册已完成。所有模块均已保存。”

## 多创始人模式

当有多位创始人参与时，将每位创始人的回答写入
`founders/{participant}.md`，而不是主模块文件。写入前验证
`participant` 名称：仅接受字母、数字和连字符（例如 `founder-a`、`anna`）；
拒绝包含路径分隔符（`/`、`\`、`..`）或特殊字符的名称。根据
列举的模块顺序验证 `moduleFile`（仅限 10 至 90）。验证 `outputPath`，
确保它是项目目录中的绝对路径 — 拒绝相对路径以及通过 `..` 段逃逸的路径。
所有创始人完成一个模块后，执行一次协调处理：在模块文件中总结共识与分歧，
并标记“建设性张力”，供小组对齐工作坊使用。

## 反模式

- **未先读取状态就开始。** 每次会话开始时都必须检查现有模块文件和 `state.json`。跳过此步骤会失去此前会话的全部连续性。
- **一次提出多个问题。** 每次只问一个问题并非可选要求 — 问题列表只会产生清单式回答，而无法获得真正的洞见。
- **在信息饱和前进入综合阶段。** 如果最后两次追问没有产生新信息，则该模块已完成。如果产生了新信息 — 则尚未完成。
- **跳过多创始人协调。** 当涉及多个利益相关者时，必须先完成个人访谈，再进行协调。首先集体讨论品牌会引入锚定偏差。
- **将此视为一次性会话。** 此技能专为多次会话而设计。在一次对话中仓促推进到 `90_SYNTHESIS.md` 会导致输出流于浅薄。

## 相关技能

- `competitive-platform-analysis` — 在 brand-discovery 确立定位简报后，使用此技能确定竞争对手集合的范围并进行分类。
- `brand-voice` (ECC) — 当 brand-discovery 的声音与语调模块需要单独建立一份基于来源材料的写作风格档案时使用。