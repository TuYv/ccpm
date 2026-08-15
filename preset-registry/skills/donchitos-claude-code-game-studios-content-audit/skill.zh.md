---
name: content-audit
description: "Audit GDD-specified content counts against implemented content. Identifies what's planned vs built."
argument-hint: "[system-name | --summary | (no arg = full audit)]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write
model: sonnet
agent: producer
---
当此技能被调用时：

解析参数：
- 无参数 → 对所有系统执行完整审计
- `[system-name]` → 仅审计该单个系统
- `--summary` → 仅输出汇总表，不写入文件

---

## 阶段 1 — 上下文收集

1. **读取 `design/gdd/systems-index.md`**，获取完整的系统列表及其类别和 MVP/优先级层级。

2. **L0 预扫描**：在完整读取任何 GDD 之前，对所有 GDD 文件执行 Grep，查找 `## Summary` 章节以及常见的内容数量关键词：
   ```
   Grep pattern="(## Summary|N enemies|N levels|N items|N abilities|enemy types|item types)" glob="design/gdd/*.md" output_mode="files_with_matches"
   ```
   对于单系统审计：跳过此步骤，直接进行完整读取。
   对于完整审计：仅完整读取匹配到内容数量关键词的 GDD。
   对于不包含内容数量表述的 GDD（纯机制 GDD），无需完整读取，并将其标记为“No auditable content counts”。

3. **完整读取范围内的 GDD 文件**（如果指定了系统名称，则读取该单个系统的 GDD）。

4. **从每个 GDD 中提取明确的内容数量或列表。** 查找如下模式：
   - “N enemies” / “enemy types:” / 具名敌人的列表
   - “N levels” / “N areas” / “N maps” / “N stages”
   - “N items” / “N weapons” / “N equipment pieces”
   - “N abilities” / “N skills” / “N spells”
   - “N dialogue scenes” / “N conversations” / “N cutscenes”
   - “N quests” / “N missions” / “N objectives”
   - 任何明确的枚举列表（具名内容项的项目符号列表）

4. **根据提取的数据构建内容清单表**：

   | 系统 | 内容类型 | 指定数量/列表 | 来源 GDD |
   |--------|-------------|---------------------|------------|

   注意：如果 GDD 仅对内容进行定性描述，但未给出数量，则记录为“Unspecified”并进行标记——未指定数量是一个值得指出的设计缺口。

---

## 阶段 2 — 实现扫描

对于阶段 1 中发现的每种内容类型，扫描相关目录以统计已实现的内容。使用 Glob 和 Grep 定位文件。

**关卡 / 区域 / 地图：**
- Glob `assets/**/*.tscn`, `assets/**/*.unity`, `assets/**/*.umap`
- Glob `src/**/*.tscn`, `src/**/*.unity`
- 在名为 `levels/`、`areas/`、`maps/`、`worlds/`、`stages/` 的子目录中查找场景文件
- 统计看起来属于关卡/场景定义的唯一文件（不包括 UI 场景）

**敌人 / 角色 / NPC：**
- Glob `assets/data/**/enemies/**`, `assets/data/**/characters/**`
- Glob `src/**/enemies/**`, `src/**/characters/**`
- 查找用于定义实体属性的 `.json`、`.tres`、`.asset`、`.yaml` 数据文件
- 在角色子目录中查找场景/预制体文件

**物品 / 装备 / 战利品：**
- Glob `assets/data/**/items/**`, `assets/data/**/equipment/**`,
  `assets/data/**/loot/**`
- 查找 `.json`、`.tres`、`.asset` 数据文件

**能力 / 技能 / 法术：**
- Glob `assets/data/**/abilities/**`, `assets/data/**/skills/**`,
  `assets/data/**/spells/**`
- 查找 `.json`、`.tres`、`.asset` 数据文件

**对话 / 交谈 / 过场动画：**
- Glob `assets/**/*.dialogue`, `assets/**/*.csv`, `assets/**/*.ink`
- 在 `assets/data/` 中使用 Grep 查找对话数据文件

**任务 / 使命：**
- 使用 Glob 匹配 `assets/data/**/quests/**`、`assets/data/**/missions/**`
- 查找 `.json`、`.yaml` 定义文件

**引擎特定说明（需在报告中注明）：**
- 计数为近似值——该技能无法完美解析所有引擎格式，也无法区分仅供编辑器使用的文件与随游戏发布的内容
- 场景文件可能同时包含玩法内容和系统/UI 场景；扫描会统计所有匹配项，并注明此限制

---

## 阶段 3 — 差距报告

生成差距表：

```
| System | Content Type | Specified | Found | Gap | Status |
|--------|-------------|-----------|-------|-----|--------|
```

**状态类别：**
- `COMPLETE` — 已找到数量 ≥ 规定数量（100% 及以上）
- `IN PROGRESS` — 已找到数量为规定数量的 50–99%
- `EARLY` — 已找到数量为规定数量的 1–49%
- `NOT STARTED` — 已找到数量为 0

**优先级标记：**
如果满足以下条件，则在报告中将某个系统标记为 `HIGH PRIORITY`：
- 状态为 `NOT STARTED` 或 `EARLY`，并且
- 该系统在系统索引中标记为 MVP 或 Vertical Slice，或者
- 系统索引显示该系统正在阻塞下游系统

**摘要行：**
- 规定的内容项总数（所有 Specified 列值之和）
- 找到的内容项总数（所有 Found 列值之和）
- 总体差距百分比：`(Specified - Found) / Specified * 100`

---

## 阶段 4 — 输出

### 完整审计和单系统模式

向用户展示差距表和摘要。询问：“是否允许我将完整报告写入 `docs/content-audit-[YYYY-MM-DD].md`？”

如果允许，则写入文件：

```markdown
# Content Audit — [Date]

## Summary
- **Total specified**: [N] content items across [M] systems
- **Total found**: [N]
- **Gap**: [N] items ([X%] unimplemented)
- **Scope**: [Full audit | System: name]

> Note: Counts are approximations based on file scanning.
> The audit cannot distinguish shipped content from editor/test assets.
> Manual verification is recommended for any HIGH PRIORITY gaps.

## Gap Table

| System | Content Type | Specified | Found | Gap | Status |
|--------|-------------|-----------|-------|-----|--------|

## HIGH PRIORITY Gaps

[List systems flagged HIGH PRIORITY with rationale]

## Per-System Breakdown

### [System Name]
- **GDD**: `design/gdd/[file].md`
- **Content types audited**: [list]
- **Notes**: [any caveats about scan accuracy for this system]

## Recommendation

Focus implementation effort on:
1. [Highest-gap HIGH PRIORITY system]
2. [Second system]
3. [Third system]

## Unspecified Content Counts

The following GDDs describe content without giving explicit counts.
Consider adding counts to improve auditability:
[List of GDDs and content types with "Unspecified"]
```

写入报告后，询问：

> “是否要为任何内容差距创建待办事项用户故事？”

如果需要：针对用户选择的每个系统，建议一个用户故事标题，并根据差距大小引导用户使用 `/create-stories [epic-slug]` 或 `/quick-design`。

### --summary 模式

直接在对话中输出差距表和摘要。不要写入文件。
最后以这句话结束：“运行 `/content-audit`（不带 `--summary`）以写入完整报告。”

---

## 阶段 5 — 后续步骤

审计完成后，建议采取价值最高的后续行动：

- 如果有任何系统为 `NOT STARTED` 且标记为 MVP → “运行 `/design-system [name]`，
  在实施开始前将缺失的内容数量添加到 GDD 中。”
- 如果总缺口超过 50% → “运行 `/sprint-plan`，将内容工作分配到即将开始的各个冲刺中。”
- 如果需要创建待办事项故事 → “针对每个 HIGH PRIORITY 缺口运行 `/create-stories [epic-slug]`。”
- 如果使用了 `--summary` → “运行 `/content-audit`（不带标志），将完整报告写入 `docs/`。”

结论：**COMPLETE** — 内容审计已完成。