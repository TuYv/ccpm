---
name: consistency-check
description: "Scan all GDDs against the entity registry to detect cross-document inconsistencies: same entity with different stats, same item with different values, same formula with different variables. Grep-first approach — reads registry then targets only conflicting GDD sections rather than full document reads."
argument-hint: "[full | since-last-review | entity:<name> | item:<name>]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Bash, AskUserQuestion
model: sonnet
---
# 一致性检查

通过将所有 GDD 与实体注册表（`design/registry/entities.yaml`）进行比较，检测跨文档不一致问题。采用 grep 优先的方法：仅读取注册表一次，然后仅针对提及已注册名称的 GDD 章节进行检查——除非需要调查冲突，否则不会完整读取文档。

**此技能是写入阶段的安全网。** 它会捕获 `/design-system` 的逐章节检查可能遗漏的问题，以及 `/review-all-gdds` 的整体审查发现得过晚的问题。

**运行时机：**
- 每编写完一个新的 GDD 后（在继续处理下一个系统之前）
- 在运行 `/review-all-gdds` 之前（使该技能从干净的基线开始）
- 在运行 `/create-architecture` 之前（不一致会影响下游 ADR）
- 按需运行：使用 `/consistency-check entity:[name]` 专门检查某个实体

**输出：** 冲突报告 + 可选的注册表修正

---

## 阶段 1：解析参数并加载注册表

**模式：**
- 无参数 / `full` — 对照所有 GDD 检查所有已注册条目
- `since-last-review` — 仅检查自上次审查报告以来修改过的 GDD
- `entity:<name>` — 跨所有 GDD 检查一个特定实体
- `item:<name>` — 跨所有 GDD 检查一个特定物品

**加载注册表：**

```
Read path="design/registry/entities.yaml"
```

如果文件不存在或没有任何条目：
> “实体注册表为空。运行 `/design-system` 编写 GDD——每个 GDD 完成后，注册表会自动填充。目前没有可检查的内容。”

停止并退出。

根据注册表构建四个查找表：
- **entity_map**：`{ name → { source, attributes, referenced_by } }`
- **item_map**：`{ name → { source, value_gold, weight, ... } }`
- **formula_map**：`{ name → { source, variables, output_range } }`
- **constant_map**：`{ name → { source, value, unit } }`

统计已注册条目的总数。报告：
```
Registry loaded: [N] entities, [N] items, [N] formulas, [N] constants
Scope: [full | since-last-review | entity:name]
```

---

## 阶段 2：定位范围内的 GDD

```
Glob pattern="design/gdd/*.md"
```

排除：`game-concept.md`、`systems-index.md`、`game-pillars.md`——这些不是系统 GDD。

对于 `since-last-review` 模式：
```bash
git log --name-only --pretty=format: -- design/gdd/ | grep "\.md$" | sort -u
```
仅保留自最近的 `design/gdd/gdd-cross-review-*.md` 文件创建日期以来修改过的 GDD。

在扫描前报告范围内的 GDD 列表。

---

## 阶段 3：grep 优先的冲突扫描

对于每个已注册条目，在每个范围内的 GDD 中 grep 该条目的名称。不要完整读取文档——仅提取匹配行及其紧邻上下文（前后各 3 行，即 -C 3）。

这是核心优化：不读取 10 个 GDD × 每个 400 行（共 4,000 行），而是对 50 个实体名称 × 10 个 GDD 执行 grep（50 次定向搜索，每次命中时返回约 10 行）。

### 3a：实体扫描

对于 entity_map 中的每个实体：

```
Grep pattern="[entity_name]" glob="design/gdd/*.md" output_mode="content" -C 3
```

对于命中的每个 GDD，提取实体名称附近提及的值：
- 任何数值属性（数量、成本、持续时间、范围、比率）
- 任何类别属性（类型、层级、类别）
- 任何派生值（总计、输出、结果）
- entity_map 中注册的任何其他属性

将提取的值与注册表条目进行比较。

**冲突检测：**
- 注册表中为 `[entity_name].[attribute] = [value_A]`，而 GDD 中为 `[entity_name] has [value_B]`。→ **冲突**
- 注册表中为 `[item_name].[attribute] = [value_A]`，而 GDD 中为 `[item_name] is [value_B]`。→ **冲突**
- GDD 提到了 `[entity_name]`，但未指定该属性。→ **备注**（没有冲突，只是无法验证）

### 3b：物品扫描

对于 item_map 中的每个物品，在所有 GDD 中 grep 该物品名称。提取：
- 售价 / 价值 / 金币价值
- 重量
- 堆叠规则（可堆叠 / 不可堆叠）
- 类别

与注册表条目中的值进行比较。

### 3c：公式扫描

对于 formula_map 中的每个公式，在所有 GDD 中 grep 该公式名称。提取：
- 公式附近提到的变量名
- 提到的输出范围或上限值

与注册表条目进行比较：
- 变量名不同 → **冲突**
- 输出范围表述不同 → **冲突**

### 3d：常量扫描

对于 constant_map 中的每个常量，在所有 GDD 中 grep 该常量名称。提取：
- 常量名称附近提到的任何数值

与注册表中的值进行比较：
- 数字不同 → **冲突**

---

## 阶段 4：深入调查（仅限冲突）

对于阶段 3 中发现的每个冲突，对存在冲突的 GDD 进行有针对性的完整章节阅读，以获取准确的上下文：

```
Read path="design/gdd/[conflicting_gdd].md"
```
（如果文件很大，也可以使用具有更宽上下文范围的 Grep）

结合完整上下文确认冲突。确定：
1. **哪个 GDD 是正确的？** 检查注册表中的 `source:` 字段——来源 GDD 是权威归属方。任何与其矛盾的其他 GDD 都是需要更新的文档。
2. **注册表本身是否已过时？** 如果来源 GDD 是在注册表条目写入后更新的（检查 git log），则注册表可能已经过时。
3. **这是否属于真正的设计变更？** 如果该冲突代表有意做出的设计决策，则解决方案是：更新来源 GDD、更新注册表，然后修复所有其他 GDD。

对每个冲突进行分类：
- **🔴 冲突** — 同一个具名实体、物品、公式或常量在不同 GDD 中具有不同的值。必须在架构设计开始前解决。
- **⚠️ 注册表过时** — 来源 GDD 中的值已更改，但注册表尚未更新。需要更新注册表；其他 GDD 可能已经正确。
- **ℹ️ 无法验证** — 提到了实体，但未陈述可供比较的属性。不是冲突，只是记录该引用。

---

## 阶段 5：输出报告

```
## Consistency Check Report
Date: [date]
Registry entries checked: [N entities, N items, N formulas, N constants]
GDDs scanned: [N] ([list names])

---

### Conflicts Found (must resolve before architecture)

🔴 [Entity/Item/Formula/Constant Name]
   Registry (source: [gdd]): [attribute] = [value]
   Conflict in [other_gdd].md: [attribute] = [different_value]
   → Resolution needed: [which doc to change and to what]

---

### Stale Registry Entries (registry behind the GDD)

⚠️ [Entry Name]
   Registry says: [value] (written [date])
   Source GDD now says: [new value]
   → Update registry entry to match source GDD, then check referenced_by docs.

---

### Unverifiable References (no conflict, informational)

ℹ️ [gdd].md mentions [entity_name] but states no comparable attributes.
   No conflict detected. No action required.

---

### Clean Entries (no issues found)

✅ [N] registry entries verified across all GDDs with no conflicts.

---

Verdict: PASS | CONFLICTS FOUND
```

**结论：**
- **PASS** — 无冲突。注册表与各 GDD 在所有已检查的值上均一致。
- **CONFLICTS FOUND** — 检测到一个或多个冲突。列出解决步骤。

---

## 阶段 6：注册表修正

如果发现过时的注册表条目，请询问：
> “我可以更新 `design/registry/entities.yaml` 来修正这 [N] 个过时条目吗？”

对于每个过时条目：
- 更新 `value` / 属性字段
- 将 `revised:` 设置为今天的日期
- 添加一条包含旧值的 YAML 注释：`# was: [old_value] before [date]`

如果在 GDD 中发现了注册表尚未收录的新条目，请询问：
> “发现 GDD 中提到了 [N] 个尚未收录到注册表中的实体/物品。
> 我可以将它们添加到 `design/registry/entities.yaml` 吗？”

仅添加出现在多个 GDD 中的条目（真正的跨系统事实）。

**绝不删除注册表条目。** 如果某个条目已从所有 GDD 中移除，请将其设置为 `status: deprecated`。

写入后：结论：**COMPLETE** — 一致性检查已完成。
如果仍有冲突未解决：结论：**BLOCKED** — 在开始架构设计之前，有 [N] 个冲突需要手动解决。

### 6b：追加到反思日志

如果发现了任何 🔴 CONFLICT 条目（无论是否已解决），
请为每个冲突向 `docs/consistency-failures.md` 追加一条记录：

```markdown
### [YYYY-MM-DD] — /consistency-check — 🔴 CONFLICT
**Domain**: [system domain(s) involved]
**Documents involved**: [source GDD] vs [conflicting GDD]
**What happened**: [specific conflict — entity name, attribute, differing values]
**Resolution**: [how it was fixed, or "Unresolved — manual action needed"]
**Pattern**: [generalised lesson, e.g. "Item values defined in combat GDD were not
referenced in economy GDD before authoring — always check entities.yaml first"]
```

如果 `docs/consistency-failures.md` 不存在，请先使用以下标题创建该文件，然后再追加内容：

```markdown
# Consistency Failure Log

<!-- Auto-maintained by /consistency-check. Do not edit manually. -->
<!-- One entry per detected conflict, in chronological order. -->

| Date | GDD A | GDD B | Conflict Type | Status |
|------|-------|-------|---------------|--------|
```

然后追加新的冲突条目。绝不能跳过日志记录——文件缺失不能成为丢失冲突历史的理由。

---

## 阶段 7：会话状态与结束

静默追加到 `production/session-state/active.md`（如果文件不存在，则创建）：

```
<!-- CONSISTENCY-CHECK: [date] | GDDs checked: [N] | Conflicts found: [N] | Report: docs/consistency-report-[date].md -->
```

然后使用 `AskUserQuestion` 组件结束：

- **提示**：“一致性检查已完成——发现 [N] 个冲突。接下来做什么？”
- **选项**：
  - `[A] 立即修复优先级最高的冲突`
  - `[B] 保存完整报告并停止`
  - `[C] 对冲突最多的 GDD 运行 /design-review`
  - `[D] 在此停止`

绝不要以纯文本结束该 Skill。始终使用此组件结束。

---

## 恢复 / 参考

- **如果为 PASS**：运行 `/review-all-gdds` 进行全面的设计理论审查，或者如果所有 MVP GDD 均已完成，则运行 `/create-architecture`。
- **如果为 CONFLICTS FOUND**：修复标记出的 GDD，然后重新运行 `/consistency-check` 以确认问题已解决。
- **如果为 STALE REGISTRY**：更新注册表（阶段 6），然后重新运行以验证。
- 每编写一个新 GDD 后都应运行 `/consistency-check`，以便尽早发现问题，
  而不是等到架构设计阶段。