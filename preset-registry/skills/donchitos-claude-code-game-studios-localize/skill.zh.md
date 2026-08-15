---
name: localize
description: "Full localization pipeline: scan for hardcoded strings, extract and manage string tables, validate translations, generate translator briefings, run cultural/sensitivity review, manage VO localization, test RTL/platform requirements, enforce string freeze, and report coverage."
argument-hint: "[scan|extract|validate|status|brief|cultural-review|vo-pipeline|rtl-check|freeze|qa]"
user-invocable: true
agent: localization-lead
allowed-tools: Read, Glob, Grep, Write, Bash, Task, AskUserQuestion
model: sonnet
---
# 本地化流程

本地化不仅仅是翻译，而是让游戏在每种语言和每个地区都给人以原生体验的完整过程。糟糕的本地化会破坏沉浸感、令玩家困惑，并阻碍平台认证。本技能涵盖从字符串提取、文化审查、配音录制、RTL 布局测试到本地化 QA 签核的完整流程。

**模式：**
- `scan` — 查找硬编码字符串和本地化反模式（只读）
- `extract` — 提取字符串并生成可供翻译的表格
- `validate` — 检查翻译的完整性、占位符和长度
- `status` — 所有语言区域的覆盖率矩阵
- `brief` — 为外部团队生成译员上下文简报文档
- `cultural-review` — 标记文化敏感内容、符号、颜色和习语
- `vo-pipeline` — 管理配音本地化：脚本、录制规范、集成
- `rtl-check` — 验证 RTL 语言布局、镜像和字体支持
- `freeze` — 强制实施字符串冻结；在翻译开始前锁定源字符串
- `qa` — 在发布前运行完整的本地化 QA 周期

如果未提供子命令，则输出用法并停止。判定：**FAIL** — 缺少必需的子命令。

---

## 阶段 2A：扫描模式

在 `src/` 中搜索面向用户的硬编码字符串：

- UI 代码中未封装在本地化函数（`tr()`、`Tr()`、`NSLocalizedString`、`GetText` 等）中的字符串字面量
- 应进行参数化的拼接字符串
- 使用位置占位符（`%s`、`%d`）而非命名占位符（`{playerName}`）的字符串
- 混合使用区域设置敏感数据（数字、日期、货币）却未采用区域设置感知格式化的格式字符串

搜索本地化反模式：

- 日期/时间格式化未使用区域设置感知函数
- 数字格式化未考虑区域设置（`1,000` 与 `1.000`）
- 嵌入图像或纹理中的文本（标记 `assets/` 中的资源文件）
- 假定文本方向为从左到右的字符串（位置布局、字符串组合顺序）
- 固化在字符串逻辑中的性别/单复数假设（必须使用复数形式或性别标记）
- 硬编码标点符号（例如 `"You won!"` — 感叹号样式因区域设置而异）

报告所有发现，并附上文件路径和行号。此模式为只读模式，不会写入任何文件。

---

## 阶段 2B：提取模式

- 扫描所有源文件中的本地化字符串引用
- 与 `assets/data/strings/` 中现有的字符串表进行比较
- 为尚未分配键的字符串生成新条目
- 按照以下约定建议键名：`[category].[subcategory].[description]`
  - 示例：`ui.hud.health_label`、`dialogue.npc.merchant.greeting`、`menu.main.play_button`
- 每个新条目都必须包含一个 `context` 字段，即向译员说明以下内容的注释：
  - 字符串出现的位置（哪个屏幕、哪个场景）
  - 最大字符长度
  - 所有占位符的含义（`{playerName}` = 玩家选择的显示名称）
  - 性别/单复数上下文（如适用）

输出要添加到字符串表中的新字符串差异。

向用户展示差异。询问：“我可以将这些新条目写入 `assets/data/strings/strings-en.json` 吗？”

如果用户同意，只写入差异内容（新条目），不要完整替换文件。结论：**完成** — 字符串已提取并写入。

---

## 阶段 2C：验证模式

读取 `assets/data/strings/` 中的所有字符串表文件。针对每个语言区域，检查：

- **完整性** — 源语言（en）中存在某个键，但该语言区域没有对应翻译
- **占位符不匹配** — 源字符串包含 `{name}`，但翻译遗漏了该占位符或添加了额外占位符
- **字符串长度违规** — 翻译超过源字符串 `context` 字段中记录的字符限制
- **复数形式数量** — 语言区域要求 N 种复数形式，但翻译提供的数量不足
- **孤立键** — 翻译存在，但 `src/` 中没有任何内容引用该键
- **过时翻译** — 写入翻译后源字符串发生了更改（标记为需要重新翻译）
- **编码** — 存在非 ASCII 字符，并检查字体图集是否支持这些字符（不确定时进行标记）

按语言区域和严重程度分组报告验证结果。此模式为只读模式 — 不会写入任何文件。

---

## 阶段 2D：状态模式

- 统计源字符串表中可本地化字符串的总数
- 针对每个语言区域：统计已翻译、未翻译和过时（翻译后源字符串发生更改）的数量
- 生成覆盖率矩阵：

```markdown
## Localization Status
Generated: [Date]
String freeze: [Active / Not yet called / Lifted]

| Locale | Total | Translated | Missing | Stale | Coverage |
|--------|-------|-----------|---------|-------|----------|
| en (source) | [N] | [N] | 0 | 0 | 100% |
| [locale] | [N] | [N] | [N] | [N] | [X]% |

### Issues
- [N] hardcoded strings found in source code (run /localize scan)
- [N] strings exceeding character limits
- [N] placeholder mismatches
- [N] orphaned keys
- [N] strings added after freeze was called (freeze violations)
```

此模式为只读模式 — 不会写入任何文件。

---

## 阶段 2E：简报模式

生成译者上下文简报文档。该文档将与字符串表导出文件一起发送给外部翻译团队或本地化供应商。

读取：
- `design/gdd/` — 提取游戏类型、基调、背景设定和角色名称
- `assets/data/strings/strings-en.json` — 源字符串表
- `design/narrative/` 中任何现有的世界观或叙事文档

生成 `production/localization/translator-brief-[locale]-[date].md`：

```markdown
# Translator Brief — [Game Name] — [Locale]

## Game Overview
[2-3 paragraph summary of the game, genre, tone, and audience]

## Tone and Voice
- **Overall tone**: [e.g., "Darkly comic, not slapstick — think Terry Pratchett, not Looney Tunes"]
- **Player address**: [e.g., "Second person, informal. Never formal 'vous' — always 'tu' for French"]
- **Profanity policy**: [e.g., "Mild — PG-13 equivalent. Match intensity to source, do not soften or escalate"]
- **Humour**: [e.g., "Wordplay exists — if a pun cannot translate, invent an equivalent local joke; do not translate literally"]

## Character Glossary
| Name | Role | Personality | Notes |
|------|------|-------------|-------|
| [Name] | [Role] | [Personality] | [Do not translate / transliterate as X] |

## World Glossary
| Term | Meaning | Notes |
|------|---------|-------|
| [Term] | [What it means] | [Keep in English / translate as X] |

## Do Not Translate List
The following must appear verbatim in all locales:
- [Game name]
- [UI terms that match in-engine labels]
- [Brand or trademark names]

## Placeholder Reference
| Placeholder | What it represents | Example |
|-------------|-------------------|---------|
| `{playerName}` | Player's chosen display name | "Shadowblade" |
| `{count}` | Integer quantity | "3" |

## Character Limits
Tight UI fields with hard limits are marked in the string table `context` field.
Where no limit is stated, target ±30% of the English length as a guideline.

## Contact
Direct questions to: [placeholder for user/team contact]
Delivery format: JSON, same schema as strings-en.json
```

询问：“我可以将这份译者简报写入 `production/localization/translator-brief-[locale]-[date].md` 吗？”

---

## 阶段 2F：文化审查模式

通过 Task 启动 `localization-lead`。要求其针对目标区域设置，对以下内容进行文化敏感性审核（从 `assets/data/strings/` 和 `assets/` 中读取）：

### 待审查的内容领域

**符号和手势**
- 竖大拇指、OK 手势、V 字手势——其含义因地区而异
- 美术、UI 或音频中的宗教或精神信仰符号
- 国旗、地图呈现方式、有争议的领土

**颜色**
- 白色（在一些亚洲文化中代表哀悼）、绿色（在一些地区具有政治含义）、红色（幸运与危险）
- 与文化联想相冲突的提醒/警告颜色

**数字**
- 4（日语/中文中与死亡相关）、13、666——标记其在 UI 中的使用情况（房间号、物品数量、价格）

**幽默和习语**
- 翻译后在其他区域设置中具有冒犯性的习语
- 在某些市场（尤其是日本、德国、中东）不合适的厕所/生理幽默
- 涉及特定地区文化敏感话题的黑色幽默

**暴力和内容分级**
- 会导致 DE（德国）、AU（澳大利亚）、CN（中国）或 AE（阿联酋）内容分级发生变化的内容
- 血液颜色、血腥程度、毒品相关内容——若需要特定地区的资源变体，请全部标记

**名称和形象呈现**
- 在目标区域设置中具有冒犯性、亵渎性或负面含义的角色名称
- 对国籍、宗教或族裔群体的刻板化呈现

以表格形式呈现调查结果：

| 发现 | 受影响的区域设置 | 严重程度 | 建议措施 |
|---------|--------------------|----------|--------------------|
| [描述] | [区域设置] | [BLOCKING / ADVISORY / NOTE] | [修改 / 标记以供审查 / 接受] |

BLOCKING = 必须在该区域设置发布前修复。ADVISORY = 建议修改。NOTE = 仅供参考。

询问：“我可以将这份文化审查报告写入 `production/localization/cultural-review-[date].md` 吗？”

---

## 阶段 2G：VO 流程模式

管理配音本地化流程。根据参数确定子任务：

- `vo-pipeline scan`——识别所有需要录制配音的对白行
- `vo-pipeline script`——生成包含导演注释的录音脚本
- `vo-pipeline validate`——检查所有已录制的配音文件是否存在且命名正确
- `vo-pipeline integrate`——验证代码/资源中是否正确引用了配音文件

### VO 流程：扫描

读取 `assets/data/strings/` 和 `design/narrative/`。识别：
- 所有包含源文本的对白行（键与 `dialogue.*` 匹配）
- 已录制的行（`assets/audio/vo/` 中存在音频文件）
- 尚未录制的行

输出录音清单：

```
## VO Recording Manifest — [Date]

| Key | Character | Source Line | Status |
|-----|-----------|-------------|--------|
| dialogue.npc.merchant.greeting | Merchant | "Welcome, traveller." | Recorded |
| dialogue.npc.merchant.haggle | Merchant | "That's my final offer." | Needs recording |
```

### VO 流程：脚本

为每个角色生成一份录音脚本文档，并按场景分组。包括：

- 角色名称和简短的性格说明
- 完整的对白台词，并为不常见的专有名词提供发音指南
- 每句台词的情绪/表演指导说明（`[Warm, welcoming]`、`[Annoyed, clipped]`）
- 对话中属于回应的台词（提供上下文：“玩家刚刚说了 X”）

询问：“我可以将 VO 录音脚本写入 `production/localization/vo-scripts-[locale]-[date].md` 吗？”

### VO 流程：验证

使用 Glob 检索 `assets/audio/vo/[locale]/` 中的所有 `.wav`/`.ogg` 文件。与 VO 清单交叉核对。报告：
- 缺失的文件（脚本中有台词，但没有音频文件）
- 多余的文件（音频文件存在，但没有匹配的字符串键）
- 命名规范违规项

### VO 流程：集成

使用 Grep 在 `src/` 中搜索 VO 音频引用。验证每个被引用的路径是否存在于 `assets/audio/vo/[locale]/` 中。报告失效的引用。

---

## 阶段 2H：RTL 检查模式

从右向左书写的语言（阿拉伯语、希伯来语、波斯语、乌尔都语）除了翻译文本之外，
还需要进行布局镜像。此模式用于验证实现情况。

读取 `.claude/docs/technical-preferences.md` 以确定所使用的引擎。然后检查：

**布局镜像**
- 引擎中是否启用了 RTL 布局？（Godot：`Control.layout_direction`，Unity：`RTL Support` 包，Unreal：文本方向标志）
- 所有 UI 容器是否都设置为自动镜像，还是使用了硬编码位置？
- 进度条、生命值条和方向指示器是否正确镜像？

**文本渲染**
- 是否加载了支持阿拉伯语/希伯来语字符集的字体？
- 阿拉伯语文本是否使用正确的连字形式（字母连接书写）进行渲染？
- 是否在需要时将数字显示为东阿拉伯数字？

**字符串组装**
- 是否存在任何假定从左向右阅读顺序的字符串拼接？
- 当句子结构反转时，句子中 `{placeholder}` 的位置是否仍然正确？

**资源审查**
- 是否存在带有方向箭头或非对称设计、需要镜像版本的 UI 图标？
- 是否存在需要 RTL 版本的图文合成资源？

要检查的 Grep 模式：
- 场景/预制文件中特定于引擎的 RTL 标志
- 任何 `HBoxContainer`、`LinearLayout`、`HorizontalBox` 节点——验证 layout_direction 设置
- 对话或 UI 代码附近使用 `+` 进行的字符串拼接

报告检查结果。将问题标记为阻断性（不修复就无法阅读内容）或建议性（外观方面的改进）。

询问：“我可以将此 RTL 检查报告写入 `production/localization/rtl-check-[date].md` 吗？”

---

## 阶段 2I：冻结模式

字符串冻结会锁定源（英文）字符串表，以便翻译人员可以继续翻译，
而不会遇到源文本在翻译过程中发生变化的情况。

### 执行冻结

检查 `production/localization/freeze-status.md` 中的当前冻结状态（如果该文件存在）。

如果已冻结：
> “字符串冻结当前处于生效状态（调用于 [date]）。冻结后已有 [N] 个字符串被添加或修改。这些属于冻结违规——需要重新翻译或经批准解除冻结。”

如果尚未冻结，则展示冻结前检查清单：

```
Pre-Freeze Checklist
[ ] All planned UI screens are implemented
[ ] All dialogue lines are final (no further narrative revisions planned)
[ ] All system strings (error messages, tutorial text) are complete
[ ] /localize scan shows zero hardcoded strings
[ ] /localize validate shows no placeholder mismatches in source (en)
[ ] Marketing strings (store description, achievements) are final
```

使用 `AskUserQuestion`：
- 提示："以上所有项目是否均已确认？执行字符串冻结将锁定源字符串表。"
- 选项：`[A] Yes — call string freeze now` / `[B] No — I still have strings to add`

如果选择 [A]：写入 `production/localization/freeze-status.md`：

```markdown
# String Freeze Status

**Status**: ACTIVE
**Called**: [date]
**Called by**: [user]
**Total strings at freeze**: [N]

## Post-Freeze Changes
[Any strings added or modified after freeze are listed here automatically by /localize extract]
```

### 解除冻结

如果参数包含 `lift`：将 `freeze-status.md` 中的 Status 更新为 `LIFTED`，并记录原因和日期。警告："解除冻结后，所有已修改的字符串都需要重新翻译。请通知翻译团队。"

### 冻结检查（自动集成到 extract 中）

当 `extract` 模式发现新增或修改的字符串，且 `freeze-status.md` 显示 Status: ACTIVE 时——将新键追加到 `## Post-Freeze Changes`，并发出警告：
> "⚠️ 字符串冻结当前处于活动状态。已添加 [N] 个新增/修改的字符串。这些属于冻结违规。在继续之前，请通知你的本地化供应商。"

---

## 阶段 2J：QA 模式

本地化 QA 是一个专门的检查阶段，在翻译交付后、任何语言区域版本发布前执行。这与 `/validate`（用于检查完整性）不同——这是一次基于结构化试玩的质量检查。

通过 Task 启动 `localization-lead`，并提供：
- 要进行 QA 的目标语言区域
- 游戏中所有界面/流程的列表（来自 `design/gdd/` 或 `/content-audit` 输出）
- 当前的 `/localize validate` 报告
- 文化审查报告（如果存在）

要求 localization-lead 制定一份涵盖以下内容的 QA 计划：

1. **功能性字符串检查**——每个字符串均能在游戏中正常显示，不存在截断、占位符错误或编码损坏
2. **UI 溢出检查**——检查超出 UI 边界的翻译字符串（即使未超过字符限制，某些语言的文本也会膨胀）
3. **上下文准确性**——在游戏中抽查 10% 的字符串，检查翻译准确性和表达自然度
4. **文化审查项**——确认文化审查中的所有 BLOCKING 项均已解决
5. **VO 同步检查**——如果存在 VO，确认翻译后的口型同步或字幕时间轴可接受
6. **平台认证要求**——检查特定平台的本地化要求（年龄分级文本、法律声明、ESRB/PEGI/CERO 文本）

为每个语言区域输出一份 QA 结论：

```
## Localization QA Verdict — [Locale]

**Status**: PASS / PASS WITH CONDITIONS / FAIL
**Reviewed by**: localization-lead
**Date**: [date]

### Findings
| ID | Area | Description | Severity | Status |
|----|------|-------------|----------|--------|
| LOC-001 | UI Overflow | "Settings" button text overflows on [Screen] | BLOCKING | Open |
| LOC-002 | Translation | [Key] translation is literal — sounds unnatural | ADVISORY | Open |

### Conditions (if PASS WITH CONDITIONS)
- [Condition 1 — must resolve before ship]

### Sign-Off
[ ] All BLOCKING findings resolved
[ ] Producer approves shipping [Locale]
```

询问：“我可以将此本地化 QA 报告写入 `production/localization/loc-qa-[locale]-[date].md` 吗？”

**门禁集成**：Polish → Release 门禁要求每个待发布的语言区域都获得 PASS 或 PASS WITH CONDITIONS 结论。FAIL 仅会阻止该语言区域的发布——如果其他语言区域通过 QA，仍可继续发布。

---

## 阶段 3：规则和后续步骤

### 规则
- 英语（en）始终是源语言区域
- 字符串表中的每个条目都必须包含 `context` 字段，其中应提供译者注释、字符数限制和占位符含义
- 切勿直接修改翻译文件——应生成差异以供审查
- 必须按 UI 元素定义字符数限制，并在 validate 模式下强制执行
- 在将字符串发送给译者之前，必须宣布字符串冻结——切勿翻译仍在变动的目标
- 必须从一开始就设计 RTL 支持——后期改造 RTL 布局成本高昂
- 对于游戏将进行商业销售的任何语言区域，都必须进行文化审查
- VO 脚本必须包含导演注释——仅提供原始对话台词会导致录音表现平淡

### 推荐工作流

```
/localize scan            → find hardcoded strings
/localize extract         → build string table
/localize freeze          → lock source before sending to translators
/localize brief           → generate translator briefing document
[Send to translators]
/localize validate        → check returned translations
/localize cultural-review → flag culturally sensitive content
/localize rtl-check       → if shipping Arabic / Hebrew / Persian
/localize vo-pipeline     → if shipping dubbed VO
/localize qa              → full localization QA pass
```

当所有待发布语言区域的 `qa` 均返回 PASS 后，请在运行 `/gate-check release` 时包含 QA 报告路径。