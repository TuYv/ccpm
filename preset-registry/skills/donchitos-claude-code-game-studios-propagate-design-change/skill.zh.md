---
name: propagate-design-change
description: "When a GDD is revised, scans all ADRs and the traceability index to identify which architectural decisions are now potentially stale. Produces a change impact report and guides the user through resolution."
argument-hint: "[path/to/changed-gdd.md]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Bash, Task
model: sonnet
agent: technical-director
---
# 传播设计变更

当 GDD 发生变更时，基于该 GDD 编写的架构决策可能不再有效。此技能会查找所有受影响的 ADR，将 ADR 当时的假设与 GDD 当前的内容进行比较，并引导用户完成处理。

**用法：** `/propagate-design-change design/gdd/combat-system.md`

---

## 1. 验证参数

**必须**提供 GDD 路径参数。如果缺失，则报错：
> "用法：`/propagate-design-change design/gdd/[system].md`
> 请提供已变更 GDD 的路径。"

验证文件是否存在。如果不存在，则报错：
> "未找到 [path]。请检查路径后重试。"

---

## 2. 读取已变更的 GDD

完整读取当前 GDD。

---

## 3. 读取先前版本

运行 git 以获取之前提交的版本：

```bash
git show HEAD:design/gdd/[filename].md
```

如果该文件没有 git 历史记录（新文件），则报告：
> "git 中没有先前版本——这似乎是一个新的 GDD，而不是修订版本。
> 没有需要传播的内容。"

如果 git 返回了先前版本，则进行概念性差异比较：
- 识别发生变更的章节（新增规则、删除规则、修改公式、变更验收标准、变更调优参数）
- 识别未发生变更的章节
- 生成变更摘要：

```
## Change Summary: [GDD filename]
Date of revision: [today]

Changed sections:
- [Section name]: [what changed — new rule, removed rule, formula modified, etc.]

Unchanged sections:
- [Section name]

Key changes affecting architecture:
- [Change 1 — likely to affect ADRs]
- [Change 2]
```

---

## 4. 加载架构输入

读取 `docs/architecture/` 中的所有 ADR：
- 对于每个 ADR，读取完整文件
- 提取“已处理的 GDD 需求”表格
- 记录每个 ADR 引用了哪些 GDD 文档和需求 ID

如果 `docs/architecture/architecture-traceability.md` 存在，则读取该文件。

报告：“已加载 [N] 个 ADR。其中 [M] 个引用了 [gdd filename]。”

---

## 5. 影响分析

对于每个引用了已变更 GDD 的 ADR：

将 ADR 中“已处理的 GDD 需求”条目与 GDD 中发生变更的章节进行比较。对于每个被引用的需求：

1. **定位该需求**在当前 GDD 中的位置——它是否仍然存在？
2. **比较**：编写 ADR 时 GDD 是如何描述的，而现在又是如何描述的？
3. **评估 ADR 决策**：该架构决策是否仍然有效？

将每个受影响的 ADR 归类为以下状态之一：

| 状态 | 含义 |
|--------|---------|
| ✅ **仍然有效** | GDD 变更不会影响此 ADR 所做的决策 |
| ⚠️ **需要审查** | GDD 变更可能会影响此 ADR——需要人工判断 |
| 🔴 **很可能已被取代** | GDD 变更与此 ADR 所依据的假设直接冲突 |

对于每个受影响的 ADR，生成一个影响条目：

```
### ADR-NNNN: [title]
Status: [Still Valid / Needs Review / Likely Superseded]

What the ADR assumed about this GDD:
  "[relevant quote from the ADR's GDD Requirements Addressed section]"

What the GDD now says:
  "[relevant quote from the current GDD]"

Assessment:
  [Explanation of whether the ADR decision is still valid, and why]

Recommended action:
  [Keep as-is | Review and update | Mark Superseded and write new ADR]
```

---

## 6. 提交影响报告

在要求用户执行任何操作之前，先向用户提交完整的影响报告。格式：

```
## Design Change Impact Report
GDD: [filename]
Date: [today]
Changes detected: [N sections changed]
ADRs referencing this GDD: [M]

### Not Affected
[ADRs referencing this GDD whose decisions remain valid]

### Needs Review ([count])
[ADRs that may need updating]

### Likely Superseded ([count])
[ADRs whose assumptions are now contradicted]
```

---

## 6b. 负责人关卡 — 技术影响审查

**审查模式检查** — 在启动 TD-CHANGE-IMPACT 之前应用：
- `solo` → 跳过。注明："TD-CHANGE-IMPACT skipped — Solo mode." 继续进入阶段 7。
- `lean` → 跳过。注明："TD-CHANGE-IMPACT skipped — Lean mode." 继续进入阶段 7。
- `full` → 正常启动。

通过 Task 启动 `technical-director`，使用关卡 **TD-CHANGE-IMPACT**（`.claude/docs/director-gates.md`）。

传入：阶段 6 的完整设计变更影响报告（变更摘要、所有受影响的 ADR 及其仍然有效 / 需要审查 / 可能已被取代分类，以及建议采取的操作）。

技术负责人审查以下内容：
- 影响分类是否正确（没有 ADR 被低估分类）
- 建议采取的操作在架构上是否合理
- 是否遗漏了对其他 ADR 或系统的任何级联影响

根据裁决执行：
- **批准** → 继续进入阶段 7 的解决工作流
- **存在顾虑** → 显示被标记的具体 ADR 或建议；使用 `AskUserQuestion` 并提供选项：`修改影响评估` / `接受并记录相关顾虑` / `进一步讨论`
- **拒绝** → 不要继续解决流程；继续之前重新分析影响

---

## 7. 解决工作流

对于每个被标记为“需要审查”或“可能已被取代”的 ADR，询问用户如何处理：

依次询问每个 ADR：
> “ADR-NNNN（[标题]）— [状态]。您希望如何处理？”
> 选项：
> - “标记为已被取代（我将编写新的 ADR）” — 将 ADR 状态行更新为 `Superseded by: [pending]`
> - “原地更新（小幅修订）” — 打开 ADR 进行编辑；注明需要修订的内容
> - “保持原样（该变更实际上并不影响此决策）”
> - “暂时跳过（稍后重新处理）”

对于标记为**已被取代**的 ADR：
- 更新 ADR 的状态字段：`Superseded by ADR-[next number] (pending — see change-impact-[date]-[system].md)`
- 询问：“我可以更新 [ADR 文件名] 中的状态吗？”

---

## 8. 更新可追溯性索引

如果 `docs/architecture/architecture-traceability.md` 存在：
- 将已变更的 GDD 需求添加到“已被取代的需求”表中：

```markdown
## Superseded Requirements
| Date | GDD | Requirement | Changed To | ADRs Affected | Resolution |
|------|-----|-------------|------------|---------------|------------|
| [date] | [gdd] | [old requirement text] | [new requirement text] | ADR-NNNN | [Superseded/Updated/Valid] |
```

询问：“我可以更新可追溯性索引吗？”

---

## 9. 输出变更影响文档

询问：“我可以将变更影响报告写入 `docs/architecture/change-impact-[date]-[system-slug].md` 吗？”

文档包含：
- 第 3 步中的变更摘要
- 第 5 步中的完整影响分析
- 第 7 步中作出的解决决策
- 需要编写或更新的 ADR 列表

如果用户批准：判定：**COMPLETE** — 变更影响报告已保存。
如果用户拒绝：判定：**BLOCKED** — 用户拒绝写入。

---

## 10. 后续操作

根据解决决策，建议：

- **标记为已取代的 ADR**：“运行 `/architecture-decision [title]` 以编写替代 ADR。然后重新运行 `/propagate-design-change` 以验证覆盖情况。”
- **需要原地更新的 ADR**：列出每个 ADR 中需要更新的具体字段
- **如果受影响的 ADR 很多**：“在所有 ADR 更新完成后运行 `/architecture-review`，以验证完整的可追溯性矩阵是否仍然一致。”

---

## 协作协议

1. **静默读取** — 在展示任何内容之前计算完整影响
2. **先展示完整报告** — 在请求用户采取操作之前，让用户了解影响范围
3. **逐个 ADR 询问** — 不要批量作出决策；每个受影响的 ADR 可能需要不同的处理方式
4. **写入前询问** — 修改任何文件之前始终先进行确认
5. **非破坏性** — 永远不要删除 ADR 内容；只添加“取代者”说明