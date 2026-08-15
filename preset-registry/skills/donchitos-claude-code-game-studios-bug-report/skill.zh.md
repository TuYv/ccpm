---
name: bug-report
description: "Creates a structured bug report from a description, or analyzes code to identify potential bugs. Ensures every bug report has full reproduction steps, severity assessment, and context."
argument-hint: "[description] | analyze [path-to-file]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write
model: sonnet
---
## 阶段 1：解析参数

根据参数确定模式：

- 无关键字 → **描述模式**：根据提供的描述生成结构化缺陷报告
- `analyze [path]` → **分析模式**：读取目标文件并识别潜在缺陷
- `verify [BUG-ID]` → **验证模式**：确认已报告的修复确实解决了缺陷
- `close [BUG-ID]` → **关闭模式**：将已验证的缺陷标记为已关闭，并记录解决情况

如果未提供参数，请先要求用户提供缺陷描述，然后再继续。

---

## 阶段 2A：描述模式

1. **解析描述**，提取关键信息：什么出现了故障、何时发生、如何复现，以及预期行为是什么。

2. **搜索代码库**，使用 Grep/Glob 查找相关文件以补充上下文（受影响的系统、可能涉及的文件）。

3. **起草缺陷报告**：

```markdown
# Bug Report

## Summary
**Title**: [Concise, descriptive title]
**ID**: BUG-[NNNN]
**Severity**: [S1-Critical / S2-Major / S3-Minor / S4-Trivial]
**Priority**: [P1-Immediate / P2-Next Sprint / P3-Backlog / P4-Wishlist]
**Status**: Open
**Reported**: [Date]
**Reporter**: [Name]

## Classification
- **Category**: [Gameplay / UI / Audio / Visual / Performance / Crash / Network]
- **System**: [Which game system is affected]
- **Frequency**: [Always / Often (>50%) / Sometimes (10-50%) / Rare (<10%)]
- **Regression**: [Yes/No/Unknown -- was this working before?]

## Environment
- **Build**: [Version or commit hash]
- **Platform**: [OS, hardware if relevant]
- **Scene/Level**: [Where in the game]
- **Game State**: [Relevant state -- inventory, quest progress, etc.]

## Reproduction Steps
**Preconditions**: [Required state before starting]

1. [Exact step 1]
2. [Exact step 2]
3. [Exact step 3]

**Expected Result**: [What should happen]
**Actual Result**: [What actually happens]

## Technical Context
- **Likely affected files**: [List of files based on codebase search]
- **Related systems**: [What other systems might be involved]
- **Possible root cause**: [If identifiable from the description]

## Evidence
- **Logs**: [Relevant log output if available]
- **Visual**: [Description of visual evidence]

## Related Issues
- [Links to related bugs or design documents]

## Notes
[Any additional context or observations]
```

---

## 阶段 2B：分析模式

1. **读取参数中指定的目标文件**。

2. **识别潜在缺陷**：空引用、差一错误、竞态条件、未处理的边界情况、资源泄漏、不正确的状态转换。

3. **针对每个潜在缺陷**，使用上述模板生成缺陷报告，并填写可能的触发场景和建议的修复方案。

---

## 阶段 2C：验证模式

读取 `production/qa/bugs/[BUG-ID].md`。提取复现步骤和预期结果。

1. **重新执行复现步骤**——使用 Grep/Glob 检查所描述的根本原因代码路径是否仍然存在。如果修复已将其移除或更改，请注明相关变更。
2. **运行相关测试**——如果该缺陷所属系统在 `tests/` 中有测试文件，请通过 Bash 运行该测试并报告通过/失败。
3. **检查回归问题**——使用 grep 搜索代码库，查找是否新出现了导致该缺陷的模式。

给出验证结论：

- **VERIFIED FIXED** — 复现步骤不再触发该缺陷；相关测试通过
- **STILL PRESENT** — 缺陷仍可按描述复现；修复未能解决该问题
- **CANNOT VERIFY** — 自动化检查无法得出结论；需要手动试玩验证

询问：“我可以更新 `production/qa/bugs/[BUG-ID].md`，将 Status 设置为 Verified Fixed / Still Present / Cannot Verify 吗？”

如果为 STILL PRESENT：重新打开该缺陷，将 Status 恢复为 Open，并建议重新运行 `/hotfix [BUG-ID]`。

---

## 阶段 2D：关闭模式

读取 `production/qa/bugs/[BUG-ID].md`。关闭前确认 Status 为 `Verified Fixed`。如果状态为其他任何值，则停止：“缺陷 [ID] 必须处于 Verified Fixed 状态才能关闭。请先运行 `/bug-report verify [BUG-ID]`。”

将关闭记录追加到缺陷文件：

```markdown
## Closure Record
**Closed**: [date]
**Resolution**: Fixed — [one-line description of what was changed]
**Fix commit / PR**: [if known]
**Verified by**: qa-tester
**Closed by**: [user]
**Regression test**: [test file path, or "Manual verification"]
**Status**: Closed
```

将顶层的 `**Status**: Open` 字段更新为 `**Status**: Closed`。

询问：“我可以更新 `production/qa/bugs/[BUG-ID].md`，将其标记为 Closed 吗？”

关闭后，检查 `production/qa/bug-triage-*.md`——如果该缺陷出现在未关闭的分诊报告中，请注明：“缺陷 [ID] 在分诊报告中被引用。请运行 `/bug-triage` 以刷新未关闭缺陷的数量。”

---

## 阶段 3：保存报告

向用户展示已完成的缺陷报告。

询问：“我可以将其写入 `production/qa/bugs/BUG-[NNNN].md` 吗？”

如果同意，则写入文件，并在需要时创建目录。结论：**COMPLETE** — 缺陷报告已归档。

如果不同意，则在此停止。结论：**BLOCKED** — 用户拒绝写入。

---

## 阶段 4：后续步骤

保存后，根据模式给出建议：

**归档后（描述/分析模式）：**
- 运行 `/bug-triage`，与现有未关闭缺陷一并确定优先级
- 如果是 S1 或 S2：运行 `/hotfix [BUG-ID]`，进入紧急修复工作流

**修复缺陷后（开发者确认修复已完成）：**
- 运行 `/bug-report verify [BUG-ID]`——在关闭前确认修复确实有效
- 绝不要在未经验证的情况下将缺陷标记为已关闭——无法通过验证的修复，其缺陷状态仍为 Open

**验证返回 VERIFIED FIXED 后：**
- 运行 `/bug-report close [BUG-ID]`——写入关闭记录并更新状态
- 运行 `/bug-triage`，刷新未关闭缺陷数量，并将其从活动列表中移除