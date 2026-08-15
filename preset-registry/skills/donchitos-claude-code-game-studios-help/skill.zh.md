---
name: help
description: "Analyzes what is done and the users query and offers advice on what to do next. Use if user says what should I do next or what do I do now or I'm stuck or I don't know what to do"
argument-hint: "[optional: what you just finished, e.g. 'finished design-review' or 'stuck on ADRs']"
user-invocable: true
allowed-tools: Read, Glob, Grep
context: |
  !echo "=== Live Project State ===" && echo "Stage: $(cat production/stage.txt 2>/dev/null | tr -d '[:space:]' || echo 'not set')" && echo "Latest sprint: $(ls -t production/sprints/*.md 2>/dev/null | head -1 || echo 'none')" && echo "Session state: $(head -5 production/session-state/active.md 2>/dev/null || echo 'none')"
model: haiku
---
# Studio 帮助 — 我接下来该做什么？

此技能为只读技能——它会报告检查结果，但不会写入任何文件。

此技能会准确判断你当前处于游戏开发流程的哪个阶段，并告知你接下来该做什么。它是**轻量级的**——并非完整审计。如需进行完整的差距分析，请使用 `/project-stage-detect`。

---

## 步骤 1：读取目录

读取 `.claude/docs/workflow-catalog.yaml`。这是所有阶段及其步骤（按顺序排列）、每个步骤为必需还是可选，以及用于表示步骤已完成的制品 glob 模式的权威列表。

---

## 步骤 1b：查找未列入目录的技能

读取目录后，使用 Glob 匹配 `.claude/skills/*/SKILL.md`，以获取已安装技能的完整列表。对于每个文件，从其 frontmatter 中提取 `name:` 字段。

将其与目录中的 `command:` 值进行比较。任何名称未作为目录命令出现的技能都是**未编入目录的技能**——仍然可以使用，但不属于阶段门控工作流。

收集这些技能，以便在步骤 7 的输出中使用——将它们显示为页脚区块：

```
### Also installed (not in workflow)
- `/skill-name` — [description from SKILL.md frontmatter]
- `/skill-name` — [description]
```

仅当至少存在一个未编入目录的技能时，才显示此区块。根据用户当前所处的阶段，最多显示 10 个最相关的技能（例如，生产阶段显示 QA 技能，生产/润色阶段显示团队技能等）。

---

## 步骤 2：确定当前阶段

按以下顺序检查：

1. **读取 `production/stage.txt`**——如果该文件存在且包含内容，则其内容是权威的阶段名称。将其映射到目录中的阶段键：
   - “概念” → `concept`
   - “系统设计” → `systems-design`
   - “技术设置” → `technical-setup`
   - “前期制作” → `pre-production`
   - “制作” → `production`
   - “润色” → `polish`
   - “发布” → `release`

2. **如果缺少 stage.txt**，则根据制品推断阶段（以最靠后的匹配阶段为准）：
   - `src/` 中有 10 个或更多源文件 → `production`
   - 存在 `production/stories/*.md` → `pre-production`
   - 存在 `docs/architecture/adr-*.md` → `technical-setup`
   - 存在 `design/gdd/systems-index.md` → `systems-design`
   - 存在 `design/gdd/game-concept.md` → `concept`
   - 什么都没有 → `concept`（全新项目）

---

## 步骤 3：读取会话上下文

如果 `production/session-state/active.md` 存在，则读取该文件。提取：
- 最近处理的内容
- 任何进行中的任务或待解决的问题
- STATUS 区块中的当前史诗/功能/任务（如果存在）

这些信息可以告诉你用户刚刚完成了什么，或目前卡在哪里——使用这些信息对输出进行个性化处理。

---

## 步骤 4：检查当前阶段的步骤完成情况

对于当前阶段中的每个步骤（来自目录）：

### 基于制品的检查

如果步骤包含 `artifact.glob`：
- 使用 Glob 检查是否存在与该模式匹配的文件
- 如果指定了 `min_count`，验证是否至少有这么多文件匹配
- 如果指定了 `artifact.pattern`，使用 Grep 验证匹配文件中是否存在该模式
- **已完成** = 满足制品条件
- **未完成** = 缺少制品或未找到模式

如果步骤包含 `artifact.note`（没有 glob）：
- 标记为 **MANUAL** — 无法自动检测，将询问用户

如果步骤没有 `artifact` 字段：
- 标记为 **UNKNOWN** — 无法跟踪完成状态（例如，可重复的实现工作）

### 特殊情况：生产阶段 — 读取 `sprint-status.yaml`

当当前阶段为 `production` 时，在执行任何基于 glob 的故事检查之前，先检查是否存在 `production/sprint-status.yaml`。如果存在，直接读取它：

- `status: in-progress` 的故事 → 显示为“当前正在进行”
- `status: ready-for-dev` 的故事 → 显示为“下一步”
- `status: done` 的故事 → 计为已完成
- `status: blocked` 的故事 → 使用 `blocker` 字段显示为阻塞项

这可以提供精确到每个故事的状态，而无需扫描 Markdown。跳过 `implement` 和 `story-done` 步骤的 glob 产物检查 — 以 YAML 为准。

### 特殊情况：`repeatable: true`（非生产阶段）

对于生产阶段之外的可重复步骤（例如“系统 GDD”），产物检查只能说明是否做过*任何*工作，而不能说明工作是否已完成。请以不同方式标记这些步骤 — 显示已检测到的内容，然后注明相关工作可能仍在进行中。

---

## 第 5 步：确定当前位置并识别后续步骤

根据完成状态数据，确定：

1. **最后一个确认完成的步骤** — 已完成的必需步骤中进度最靠后的一个
2. **当前阻塞项** — 第一个未完成的*必需*步骤（这是用户接下来必须完成的内容）
3. **可选机会** — 可以在阻塞项之前或与其同时完成的未完成*可选*步骤
4. **后续必需步骤** — 当前阻塞项之后的必需步骤（显示为“即将进行”，方便用户提前规划）

如果用户提供了参数（例如“刚刚完成 design-review”），即使产物检查结果不明确，也应将其指定的步骤视为已完成并继续推进。

---

## 第 6 步：检查进行中的工作

如果 `active.md` 显示存在进行中的任务或史诗：
- 在顶部显著显示：“看起来你之前正在处理 [X]”
- 建议继续处理，或确认它是否已完成

---

## 第 7 步：呈现输出

保持**简短直接**。这是快速定位，不是报告。

```
## Where You Are: [Phase Label]

**In progress:** [from active.md, if any]

### ✓ Done
- [completed step name]
- [completed step name]

### → Next up (REQUIRED)
**[Step name]** — [description]
Command: `[/command]`

### ~ Also available (OPTIONAL)
- **[Step name]** — [description] → `/command`
- **[Step name]** — [description] → `/command`

### Coming up after that
- [Next required step name] (`/command`)
- [Next required step name] (`/command`)

---
Approaching **[next phase]** gate → run `/gate-check` when ready.
```

**格式规则：**
- 使用 `✓` 表示确认完成
- 使用 `→` 表示当前必需的下一步（只能有一个 — 即第一个阻塞项）
- 使用 `~` 表示当前可执行的可选步骤
- 命令使用反引号代码格式以内联方式显示
- 如果步骤没有命令（例如“实现故事”），应说明要执行的操作，而不是显示斜杠命令
- 对于 MANUAL 步骤，询问用户：“我无法判断 [step] 是否已完成 — 它已经完成了吗？”

结论：**COMPLETE** — 已确定后续步骤。

---

## 步骤 8：关卡提醒（接近关卡时）

完成当前阶段的步骤后，检查用户是否可能正在接近关卡：
- 如果当前阶段的所有必需步骤均已完成（或接近完成），
  添加：“你即将到达 **[Current] → [Next]** 关卡。准备好后运行 `/gate-check`。”
- 如果仍有多个必需步骤尚未完成，则跳过关卡提醒——此时它还不相关。

---

## 步骤 9：升级路径

给出建议后，如果用户似乎遇到困难或感到困惑，请添加：

```
---
Need more detail?
- `/project-stage-detect` — full gap analysis with all missing artifacts listed
- `/gate-check` — formal readiness check for your next phase
- `/start` — re-orient from scratch
```

仅当用户的输入表现出困惑时（例如 “I don't know”、“stuck”、
“lost”、“not sure”）才显示此内容。对于简单的 “what's next?” 查询，不要显示。

---

## 协作协议

- **绝不要自动运行下一个 Skill。** 推荐它，让用户自行调用。
- **询问 MANUAL 步骤的状态**，而不是假定其已完成或未完成。
- **匹配用户的语气**——如果他们听起来压力很大（“I'm totally lost”），应给予
  安慰并只提供一个行动建议，而不是列出六项。
- **只给出一个首要建议**——用户离开时应明确知道接下来只需做哪一件事。
  可选步骤和“后续事项”属于次要背景信息。