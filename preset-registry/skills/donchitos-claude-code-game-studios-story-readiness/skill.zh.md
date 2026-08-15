---
name: story-readiness
description: "Validate that a story file is implementation-ready. Checks for embedded GDD requirements, ADR references, engine notes, clear acceptance criteria, and no open design questions. Produces READY / NEEDS WORK / BLOCKED verdict with specific gaps. Use when user says 'is this story ready', 'can I start on this story', 'is story X ready to implement'."
argument-hint: "[story-file-path or 'all' or 'sprint']"
user-invocable: true
allowed-tools: Read, Glob, Grep, AskUserQuestion, Task
model: sonnet
---
# 故事就绪度

此技能用于验证故事文件是否包含开发者开始实施所需的一切内容——避免在冲刺中途因设计问题而中断、避免猜测、避免模糊不清的验收标准。请在分配故事之前运行此技能。

**此技能为只读。** 它绝不会编辑故事文件。它会报告发现的问题，并询问用户是否需要帮助填补缺口。

**输出：** 每个故事的结论（READY / NEEDS WORK / BLOCKED），并为每个未就绪的故事列出具体的缺口清单。

---

## 阶段 0：确定审查模式

在启动时确定一次审查模式（存储下来，供本次运行中生成的所有关卡使用）：

1. 如果调用技能时传入了 `--review [full|lean|solo]` → 使用该值
2. 否则，读取 `production/review-mode.txt` → 使用其中的值
3. 否则 → 默认使用 `lean`

有关完整的检查模式和模式定义，请参阅 `.claude/docs/director-gates.md`。

---

## 1. 解析参数

**范围：** `$ARGUMENTS[0]`（留空 = 通过 AskUserQuestion 询问用户）

- **特定路径**（例如 `/story-readiness production/epics/combat/story-001-basic-attack.md`）：
  验证该单个故事文件。
- **`sprint`**：从 `production/sprints/` 读取当前冲刺计划（最新的
  文件），提取其中引用的每个故事路径，并逐一验证。
- **`all`**：使用 glob 匹配 `production/epics/**/*.md`，排除 `EPIC.md` 索引文件，
  验证找到的每个故事文件。
- **无参数**：询问用户要验证哪个范围。

如果未提供参数，请使用 `AskUserQuestion`：
- “你想验证什么？”
  - 选项：“特定的故事文件”、“当前冲刺中的所有故事”、
    “production/epics/ 中的所有故事”、“特定史诗中的故事”

继续之前报告范围：“正在验证 [N] 个故事文件。”

---

## 2. 加载辅助上下文

检查任何故事之前，先加载一次参考文档（而非为每个故事分别加载）：

- `design/gdd/systems-index.md` —— 用于了解哪些系统已有获批的 GDD
- `docs/architecture/control-manifest.md` —— 用于了解存在哪些清单规则
  （如果该文件不存在，记录一次缺失即可；不要为每个故事重复标记）
  如果该文件存在，还要从头部区块提取 `Manifest Version:` 日期。
- `docs/architecture/tr-registry.yaml` —— 按 `id` 为所有条目建立索引。用于
  验证故事中的 TR-ID。如果该文件不存在，记录一次即可；所有故事的 TR-ID
  检查将自动通过（注册表的引入早于故事，因此缺少注册表意味着这些故事来自
  引入 TR 跟踪之前）。
- 所有 ADR 状态字段——对于待检查故事中引用的每个唯一 ADR，
  读取 ADR 文件并记录其 `Status:` 字段。缓存这些信息，以免
  对每个故事重复读取同一个 ADR。
- 当前冲刺文件（如果范围为 `sprint`）——用于识别 Must Have /
  Should Have 优先级，以便作出升级决策

---

## 3. 故事就绪度检查清单

对于每个故事文件，评估以下所有项目。只有所有项目均通过，或明确标记为 N/A 并说明理由时，故事才是 READY。

### 设计完整性

- [ ] **引用了 GDD 要求**：故事包含一个 `design/gdd/` 路径，
  并引用或链接了该 GDD 中的具体要求、验收标准或规则——
  而不只是 GDD 文件名。仅链接文档而未追溯到具体要求，不能通过。
- [ ] **要求是自包含的**：无需打开 GDD 即可理解故事中的
  验收标准。开发者不应需要阅读另一份文档，才能理解 DONE 的含义。
- [ ] **验收标准可测试**：每项标准都是具体且可观察的条件——
  而不是“实现 X”或“系统正常工作”。
  反例：“实现跳跃机制。”正例：“按住跳跃键时，跳跃在 0.3 秒内
  达到 5 个单位的最大高度。”
- [ ] **没有需要主观判断的验收标准** *（对于 `Type: Visual/Feel` 自动通过）*：
  “感觉响应灵敏”或“看起来不错”之类的标准，如果没有定义基准，
  就无法测试。对于 Logic、Integration、UI 和 Config/Data 故事，必须将这些标准
  替换为具体、可观察的条件。对于 Visual/Feel 故事，主观标准属于预期情况，
  因此此检查自动通过——但应改为验证每项主观标准是否配有对应的试玩测试协议或证据要求
  （例如，“需要在 `production/qa/evidence/[slug]-evidence.md` 提供证据文档”）。
  如果验收标准以类似 `production/qa/evidence/[slug]-evidence.md` 的明确文件路径引用结尾，或附带此类引用，则为 PASS。如果标准纯属主观且未指定证据文件路径，则为 NEEDS WORK。

### 架构完整性

- [ ] **已引用 ADR 或声明不适用**：故事至少引用一个 ADR，
  或明确声明“没有适用的 ADR”并简要说明原因。
  既未引用 ADR，也未明确注明不适用的故事无法通过此检查。
- [ ] **ADR 已被接受（而非提议中）**：对于每个引用的 ADR，使用第 2 节中加载的缓存 ADR 状态检查其
  `Status:` 字段。
  - 如果为 `Status: Accepted` → 通过。
  - 如果为 `Status: Proposed` → **受阻**：该 ADR 在被接受之前可能会发生变化，
    故事中的实现指导可能有误。
    修复：`BLOCKED: ADR-NNNN is Proposed — wait for acceptance before implementing.`
  - 如果 ADR 文件不存在 → **受阻**：引用的 ADR 缺失。
  - 如果故事明确注明“没有适用的 ADR”，则自动通过。
- [ ] **TR-ID 有效且处于活动状态**：如果故事包含 `TR-[system]-NNN`
  引用，请在第 2 节加载的 TR 注册表中查找该引用。
  - 如果该 ID 存在且 `status: active` → 通过。
  - 如果该 ID 存在且为 `status: deprecated` 或 `status: superseded-by: ...` →
    需要修改：该需求已被移除或替换。
    修复：更新故事以引用当前的需求 ID；如果该需求不再适用，则移除引用。
  - 如果该 ID 不存在于注册表中 → 需要修改：该 ID 尚未注册
    （故事可能早于注册表创建，或者注册表需要运行一次 `/architecture-review`）。
  - 如果故事没有 TR-ID 引用，或者注册表不存在，则自动通过。
- [ ] **清单版本为当前版本**：如果故事的标头中包含 `Manifest Version:` 日期，
  且 `docs/architecture/control-manifest.md` 存在：
  - 如果故事版本与当前清单的 `Manifest Version:` 一致 → 通过。
  - 如果故事版本早于当前清单 → 需要修改：可能有新规则
    适用。修复：审查发生变化的清单规则；如果任何禁止项或必需项发生变化，则更新故事，
    然后将故事的 `Manifest Version:` 更新为当前版本。
  - 如果故事没有 `Manifest Version:` 字段，或者清单不存在，则自动通过。
- [ ] **包含引擎说明**：对于此故事可能涉及的任何截止日期之后的引擎 API，
  均包含实现说明或验证要求。如果故事显然不涉及引擎 API（例如，
  纯数据/配置变更），则可注明“不适用 — 不涉及引擎 API”。
- [ ] **已注明控制清单规则**：引用了控制清单中相关的层级规则，
  或声明“不适用 — 清单尚未创建”。
  如果 `docs/architecture/control-manifest.md` 尚不存在，此项自动通过
  （不要因此扣除清单创建之前编写的故事）。

### 范围清晰度

- [ ] **包含估算**：故事包含工作量估算（小时、
  点数或 T 恤尺码）。没有估算的故事无法进行规划。
- [ ] **已说明范围内/范围外的边界**：故事说明了其
  不包含的内容，可以通过明确的“范围外”章节说明，也可以使用
  能够清楚界定边界的表述。否则，实现过程中很可能发生范围蔓延。
- [ ] **已列出故事依赖项**：如果此故事依赖其他故事
  先达到 DONE 状态，则列出这些故事的 ID。如果没有依赖项，
  则明确声明“无”（而非直接省略）。

### 待确认问题

- [ ] **没有未解决的设计问题**：故事中的任何验收标准、实现说明或规则陈述均不包含标记为 "UNRESOLVED"、"TBD"、"TODO"、"?" 或其他等效标记的文本。
- [ ] **依赖故事未处于 DRAFT 状态**：对于列为依赖项的每个故事，检查其文件是否存在且状态不是 DRAFT。依赖处于 DRAFT 状态或缺失故事的故事应判定为 BLOCKED，而不仅仅是 NEEDS WORK。

### 资产引用检查

- [ ] **引用的资产存在**：扫描故事文本，查找资产路径模式（包含 `assets/` 的路径，或扩展名为 `.png`、`.jpg`、`.svg`、`.wav`、`.ogg`、`.mp3`、`.glb`、`.gltf`、`.tres`、`.tscn`、`.res` 的文件）。
  - 对于找到的每个资产路径：使用 Glob 检查文件是否存在。
  - 如果任何引用的资产不存在：**NEEDS WORK** — 记录缺失的路径。（故事引用了尚未创建的资产。请移除该引用、创建占位资产，或将其标记为对某个资产创建故事的显式依赖。）
  - 如果所有引用的资产均存在：记录 "Referenced assets verified:
    [count] found."
  - 如果故事中未引用任何资产路径：记录 "No asset references
    found in story — skipping asset check." 此项自动通过。
  - 此检查仅验证文件是否存在。不要验证文件格式或内容。

### 完成定义

- [ ] **按故事类型规定的最低可测试验收标准数量**：
  - 逻辑/集成故事：至少 3 条
  - 视觉/体验和 UI 故事：至少 2 条
  - 配置/数据故事：至少 1 条
  应用与故事 `Type:` 字段匹配的阈值。如果故事的验收标准少于最低数量，则标记为 NEEDS WORK。
- [ ] **在适用时注明性能预算**：如果此故事涉及游戏循环、渲染或物理系统的任何部分，则必须提供性能预算，或包含 "no performance impact expected — [reason]" 说明。
- [ ] **已声明故事类型**：故事的标头中包含 `Type:` 字段，用于标识测试类别（Logic / Integration / Visual/Feel / UI / Config/Data）。
  如果缺少此字段，则无法在故事关闭时强制执行测试证据要求。
  修复方法：在故事标头中添加 `Type: [Logic|Integration|Visual/Feel|UI|Config/Data]`。
- [ ] **测试证据要求明确**：如果已设置 Story Type，则故事中应包含 `## Test Evidence` 章节，说明证据的存储位置（Logic/Integration 对应测试文件路径，Visual/Feel/UI 对应证据文档路径）。
  修复方法：添加 `## Test Evidence`，并注明该故事类型所需的证据位置。

---

## 4. 判定结果分配

为每个故事分配以下三种判定结果之一：

**READY** — 所有检查项均通过，或具有明确的 N/A 理由。
故事可以立即分配。

**NEEDS WORK** — 一个或多个检查项未通过，但所有依赖故事均存在且未处于 DRAFT 状态。故事可在分配前修复。

**BLOCKED** — 一个或多个依赖故事缺失或处于 DRAFT 状态，
或者某个关键设计问题（在标准或规则中标记为 UNRESOLVED）没有负责人。故事在阻塞问题解决前无法分配。注意：
处于 BLOCKED 状态的故事也可能包含 NEEDS WORK 项目 — 两者均需列出。

---

## 5. 输出格式

### 单个故事输出

```
## Story Readiness: [story title]
File: [path]
Verdict: [READY / NEEDS WORK / BLOCKED]

### Passing Checks (N/[total])
[list passing items briefly]

### Gaps
- [Checklist item]: [exact description of what is missing or wrong]
  Fix: [specific text needed to resolve this gap]

### Blockers (if BLOCKED)
- [What is blocking]: [story ID or design question that must resolve first]
```

### 多个故事汇总输出

```
## Story Readiness Summary — [scope] — [date]

Ready:      [N] stories
Needs Work: [N] stories
Blocked:    [N] stories

### Ready Stories
- [story title] ([path])

### Needs Work
- [story title]: [primary gap — one line]
- [story title]: [primary gap — one line]

### Blocked Stories
- [story title]: Blocked by [story ID / design question]

---
[Full detail for each non-ready story follows, using the single-story format]
```

### Sprint 升级处理

如果范围为 `sprint`，且任何 Must Have 故事处于 NEEDS WORK 或 BLOCKED 状态，请在输出顶部添加醒目的警告：

```
WARNING: [N] Must Have stories are not implementation-ready.
[List them with their primary gap or blocker.]
Resolve these before the sprint begins or replan with `/sprint-plan update`.
```

---

## 6. 协作协议

此技能为只读技能。它绝不会建议编辑内容，也不会请求写入文件。

报告检查结果后，询问：

“你是否希望我帮助补全其中任何故事的缺失内容？我可以起草缺失的章节，供你审核。”

如果用户针对某个特定故事回答“是”，则仅在对话中起草缺失的章节。不要使用 Write 或 Edit 工具——由用户（或 `/create-stories`）负责写入。

**重定向规则：**
- 如果故事文件完全不存在：“此故事文件完全缺失。请先运行 `/create-epics [layer]`，然后运行 `/create-stories [epic-slug]`，以基于 GDD 和 ADR 生成故事。”
- 如果故事没有 GDD 引用，且工作量看起来较小：“此故事没有 GDD 引用。如果改动较小（少于约 4 小时），请运行 `/quick-design [description]` 创建 Quick Design Spec，然后在故事中引用该规范。”
- 如果故事范围已超出最初的规模估算：“此故事的范围似乎已经扩大。请考虑拆分该故事，或在实施开始前将其上报给制作人。”

---

## 7. 后续故事交接

完成单个故事的就绪检查后（范围不是 `all` 或 `sprint`）：

1. 从 `production/sprints/` 中读取当前的 Sprint 文件（最新的文件）。
2. 查找符合以下条件的故事：
   - 状态为 READY 或 NOT STARTED
   - 不是刚刚检查的故事
   - 未被尚未完成的依赖项阻塞
   - 属于 Must Have 或 Should Have 层级

如果找到符合条件的故事，最多列出 3 个：

```
### Other Ready Stories in This Sprint

1. [Story name] — [1-line description] — Est: [X hrs]
2. [Story name] — [1-line description] — Est: [X hrs]

Run `/story-readiness [path]` to validate before starting.
```

如果不存在 Sprint 文件，或没有找到其他已就绪的故事，则静默跳过此章节。

---

## 阶段 8：主管关卡——故事就绪度审查

在生成 QL-STORY-READY 之前，应用阶段 0 中确定的审查模式：

- `solo` → 跳过。注明："QL-STORY-READY skipped — Solo mode." 然后进入收尾。
- `lean` → 跳过。注明："QL-STORY-READY skipped — Lean mode." 然后进入收尾。
- `full` → 正常生成。

通过 Task 生成 `qa-lead`，使用关卡 **QL-STORY-READY**（`.claude/docs/director-gates.md`）。

传入以下上下文：
- 故事标题
- 验收标准列表（故事验收标准章节中的所有条目）
- 依赖项状态（列出的所有依赖项及其当前状态：存在 / DRAFT / 缺失）
- 阶段 4 得出的总体结论（READY / NEEDS WORK / BLOCKED）

按照 `director-gates.md` 中的标准规则处理结论：
- **ADEQUATE** → 故事已获批准。进入收尾。
- **GAPS [list]** → 通过 `AskUserQuestion` 向用户展示具体缺口：
  选项：`Update story with suggested gaps` / `Accept and proceed anyway` / `Discuss further`。
- **INADEQUATE** → 展示具体缺口；询问用户是更新故事还是仍然继续。

---

## 建议的后续步骤

- 故事达到 READY 后，运行 `/dev-story [story-path]` 开始实施
- 运行 `/story-readiness sprint`，一次性检查当前冲刺中的所有故事
- 如果故事文件完全缺失，运行 `/create-stories [epic-slug]`