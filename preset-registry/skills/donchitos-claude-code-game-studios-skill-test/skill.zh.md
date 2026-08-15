---
name: skill-test
description: "Validate skill files for structural compliance and behavioral correctness. Three modes: static (linter), spec (behavioral), audit (coverage report)."
argument-hint: "static [skill-name | all] | spec [skill-name] | category [skill-name | all] | audit"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write
model: sonnet
---
# 技能测试

验证 `.claude/skills/*/SKILL.md` 文件的结构合规性和行为正确性。无外部依赖——完全在
现有的技能/钩子/模板架构内运行。

**四种模式：**

| 模式 | 命令 | 用途 | Token 成本 |
|------|---------|---------|------------|
| `static` | `/skill-test static [name\|all]` | 结构检查器——对每个技能执行 7 项合规性检查 | 低（约 1k/技能） |
| `spec` | `/skill-test spec [name]` | 行为验证器——评估测试规范中的断言 | 中（约 5k/技能） |
| `category` | `/skill-test category [name\|all]` | 类别评分标准——根据技能所属类别的特定指标进行检查 | 低（约 2k/技能） |
| `audit` | `/skill-test audit` | 覆盖率报告——技能、代理规范、最近测试日期 | 低（总计约 3k） |

---

## 阶段 1：解析参数

根据第一个参数确定模式：

- `static [name]` → 对一个技能执行 7 项结构检查
- `static all` → 对所有技能执行 7 项结构检查（Glob `.claude/skills/*/SKILL.md`）
- `spec [name]` → 读取技能和测试规范，评估断言
- `category [name]` → 使用 `CCGS Skill Testing Framework/quality-rubric.md` 中针对特定类别的评分标准
- `category all` → 对目录中含有 `category:` 的每个技能执行类别评分
- `audit`（或无参数）→ 读取目录，列出所有技能和代理，显示覆盖情况

如果参数缺失或无法识别，输出用法并停止。

---

## 阶段 2A：静态模式——结构检查器

对于每个待测试的技能，完整读取其 `SKILL.md` 并执行全部 7 项检查：

### 检查 1——必需的 Frontmatter 字段
文件的 YAML frontmatter 块中必须包含以下所有字段：
- `name:`
- `description:`
- `argument-hint:`
- `user-invocable:`
- `allowed-tools:`

如果缺少任何字段，则为 **FAIL**。

### 检查 2——多个阶段
技能必须包含 ≥2 个带编号的阶段标题。查找以下模式：
- `## Phase N` 或 `## Phase N:`
- `## N.`（带编号的顶级章节）
- 如果阶段未明确编号，则至少包含 2 个不同的 `##` 标题

如果找到的阶段式标题少于 2 个，则为 **FAIL**。

### 检查 3——判定关键字
技能必须至少包含以下关键字之一：`PASS`、`FAIL`、`CONCERNS`、`APPROVED`、
`BLOCKED`、`COMPLETE`、`READY`、`COMPLIANT`、`NON-COMPLIANT`

如果均未出现，则为 **FAIL**。

### 检查 4——协作协议语言
技能必须包含写入前询问的语言。查找：
- `"May I write"`（规范形式）
- 文件写入指令附近的 `"before writing"` 或 `"approval"`
- 位置相近的 `"ask"` + `"write"`（位于同一章节中）

如果不存在，则为 **WARN**（某些只读技能确实可以跳过此项）。
如果 `allowed-tools` 包含 `Write` 或 `Edit`，但未找到写入前询问的语言，则为 **FAIL**。

### 检查 5——后续步骤交接
技能必须以建议的下一项操作或后续路径结尾。查找：
- 提及其他技能的最终章节（例如 `/story-done`、`/gate-check`）
- “建议的下一步”或“下一步”措辞
- “后续”或“此后”章节

如果缺失，则为 **WARN**。

### 检查 6 — 分支上下文复杂度
如果前置元数据包含 `context: fork`，该技能应具有 ≥5 个阶段标题
（`##` 级标题或带编号的 Phase N 标题）。分支上下文用于复杂的多阶段
技能；简单技能不应使用它。

如果设置了 `context: fork` 但找到的阶段少于 5 个，则为 **WARN**。

### 检查 7 — 参数提示合理性
`argument-hint` 不得为空。如果技能正文提到多种模式
（例如，“Mode A | Mode B”），提示应反映这些模式。将该
提示与第一阶段的“Parse Arguments”部分进行交叉核对。

如果提示为 `""`，或文档中的模式与提示不匹配，则为 **WARN**。

---

### 静态模式输出格式

对于单个技能：
```
=== Skill Static Check: /[name] ===

Check 1 — Frontmatter Fields:    PASS
Check 2 — Multiple Phases:       PASS (7 phases found)
Check 3 — Verdict Keywords:      PASS (PASS, FAIL, CONCERNS)
Check 4 — Collaborative Protocol: PASS ("May I write" found)
Check 5 — Next-Step Handoff:     WARN (no follow-up section found)
Check 6 — Fork Context Complexity: PASS (8 phases, context: fork set)
Check 7 — Argument Hint:         PASS

Verdict: WARNINGS (1 warning, 0 failures)
Recommended: Add a "Follow-Up Actions" section at the end of the skill.
```

对于 `static all`，先生成汇总表，然后列出所有不合规的技能：
```
=== Skill Static Check: All 52 Skills ===

Skill                  | Result       | Issues
-----------------------|--------------|-------
gate-check             | COMPLIANT    |
design-review          | COMPLIANT    |
story-readiness        | WARNINGS     | Check 5: no handoff
...

Summary: 48 COMPLIANT, 3 WARNINGS, 1 NON-COMPLIANT
Aggregate Verdict: N WARNINGS / N FAILURES
```

---

## 阶段 2B：规范模式 — 行为验证器

### 步骤 1 — 定位文件

在 `.claude/skills/[name]/SKILL.md` 查找技能。
从 `CCGS Skill Testing Framework/catalog.yaml` 中查找规范路径——使用
匹配技能条目中的 `spec:` 字段。

如果任一项缺失：
- 缺少技能："Skill '[name]' not found in `.claude/skills/`."
- 目录中缺少规范路径："No spec path set for '[name]' in catalog.yaml."
- 在指定路径找不到规范文件："Spec file missing at [path]. Run `/skill-test audit`
  to see coverage gaps."

### 步骤 2 — 读取两个文件

完整读取技能文件和测试规范文件。

### 步骤 3 — 评估断言

对于规范中的每个 **测试用例**：

1. 阅读 **夹具** 描述（项目文件的假定状态）
2. 阅读 **预期行为** 步骤
3. 阅读每个 **断言** 复选框

对于每个断言，评估在给定夹具状态下，如果正确遵循技能的书面指令，
是否能够满足该断言。这是一项由 Claude 执行的推理检查，而不是代码执行。

标记每个断言：
- **PASS** — 技能指令明确满足此断言
- **PARTIAL** — 技能指令部分涉及此断言，但存在歧义
- **FAIL** — 在给定夹具的情况下，技能指令不会满足此断言

对于 **协议合规性** 断言（始终存在）：
- 检查技能是否要求在写入文件前询问“May I write”
- 检查技能是否在请求批准前呈现发现
- 检查技能是否以建议的后续步骤结束
- 检查技能是否避免在未经批准的情况下自动创建文件

### 步骤 4 — 生成报告

```
=== Skill Spec Test: /[name] ===
Date: [date]
Spec: CCGS Skill Testing Framework/skills/[category]/[name].md

Case 1: [Happy Path — name]
  Fixture: [summary]
  Assertions:
    [PASS] [assertion text]
    [FAIL] [assertion text]
       Reason: The skill's Phase 3 says "..." but the fixture state means "..."
  Case Verdict: FAIL

Case 2: [Edge Case — name]
  ...
  Case Verdict: PASS

Protocol Compliance:
  [PASS] Uses "May I write" before file writes
  [PASS] Presents findings before asking approval
  [WARN] No explicit next-step handoff at end

Overall Verdict: FAIL (1 case failed, 1 warning)
```

### 步骤 5 — 提议写入结果

“我可以将这些结果写入 `CCGS Skill Testing Framework/results/skill-test-spec-[name]-[date].md`
并更新 `CCGS Skill Testing Framework/catalog.yaml` 吗？”

如果同意：
- 将结果文件写入 `CCGS Skill Testing Framework/results/`
- 更新 `CCGS Skill Testing Framework/catalog.yaml` 中该技能的条目：
  - `last_spec: [date]`
  - `last_spec_result: PASS|PARTIAL|FAIL`

---

## 阶段 2D：类别模式 — 量规评估

### 步骤 1 — 定位技能和类别

在 `.claude/skills/[name]/SKILL.md` 中查找技能。
在 `CCGS Skill Testing Framework/catalog.yaml` 中查找 `category:` 字段。

如果未找到技能：“未找到技能 '[name]'。”
如果没有 `category:` 字段：“catalog.yaml 中没有为 '[name]' 分配类别。
请先将 `category: [name]` 添加到该技能条目中。”

对于 `category all`：收集所有具有 `category:` 字段的技能，并逐一处理。
`category: utility` 技能仅根据 U1（静态检查通过）和 U2
（门控模式正确，如适用）进行评估——对于 U1，直接跳转到静态模式。

### 步骤 2 — 读取量规章节

读取 `CCGS Skill Testing Framework/quality-rubric.md`。
提取与技能类别匹配的章节（例如 `### gate`、`### team`）。

### 步骤 3 — 读取技能

完整读取技能的 `SKILL.md`。

### 步骤 4 — 评估量规指标

对于类别量规表中的每项指标：
1. 检查技能的书面指令是否明确满足该标准
2. 标记为 PASS、FAIL 或 WARN
3. 对于 FAIL/WARN，指出技能文本中的确切缺失之处（引用相关章节
   或注明其不存在）

### 步骤 5 — 输出报告

```
=== Skill Category Check: /[name] ([category]) ===

Metric G1 — Review mode read:      PASS
Metric G2 — Full mode directors:   FAIL
  Gap: Phase 3 spawns only CD-PHASE-GATE; TD-PHASE-GATE, PR-PHASE-GATE, AD-PHASE-GATE absent
Metric G3 — Lean mode: PHASE-GATE only: PASS
Metric G4 — Solo mode: no directors:    PASS
Metric G5 — No auto-advance:       PASS

Verdict: FAIL (1 failure, 0 warnings)
Fix: Add TD-PHASE-GATE, PR-PHASE-GATE, and AD-PHASE-GATE to the full-mode director
     panel in Phase 3.
```

### 步骤 6 — 提议更新目录

“我可以更新 `CCGS Skill Testing Framework/catalog.yaml`，为 [name] 记录此次类别检查
（`last_category`、`last_category_result`）吗？”

---

## 阶段 2C：审计模式 — 覆盖率报告

### 步骤 1 — 读取目录

读取 `CCGS Skill Testing Framework/catalog.yaml`。如果文件缺失，请注明目录尚不存在（首次运行状态）。

### 步骤 2 — 枚举所有技能和代理

使用 Glob 匹配 `.claude/skills/*/SKILL.md`，获取完整的技能列表。
从每个路径中提取技能名称（目录名）。

同时读取 `CCGS Skill Testing Framework/catalog.yaml` 中的 `agents:` 部分，获取完整的代理列表。

### 步骤 3 — 构建技能覆盖率表

对于每个技能：
- 检查规范文件是否存在（使用目录中的 `spec:` 路径，或使用 Glob 匹配 `CCGS Skill Testing Framework/skills/*/[name].md`）
- 从目录中查找 `last_static`、`last_static_result`、`last_spec`、`last_spec_result`、`last_category`、`last_category_result`、`category`（如果不在目录中，则标记为 "never" / "—"）
- 优先级取自目录的 `priority:` 字段（critical/high/medium/low）

### 步骤 3b — 构建代理覆盖率表

对于目录的 `agents:` 部分中的每个代理：
- 检查规范文件是否存在（使用目录中的 `spec:` 路径，或使用 Glob 匹配 `CCGS Skill Testing Framework/agents/*/[name].md`）
- 从目录中查找 `last_spec`、`last_spec_result`、`category`

### 步骤 4 — 输出报告

```
=== Skill Test Coverage Audit ===
Date: [date]

SKILLS (72 total)
Specs written: 72 (100%) | Never static tested: 72 | Never category tested: 72

Skill                  | Cat      | Has Spec | Last Static | S.Result | Last Cat | C.Result | Priority
-----------------------|----------|----------|-------------|----------|----------|----------|----------
gate-check             | gate     | YES      | never       | —        | never    | —        | critical
design-review          | review   | YES      | never       | —        | never    | —        | critical
...

AGENTS (49 total)
Agent specs written: 49 (100%)

Agent                  | Category   | Has Spec | Last Spec   | Result
-----------------------|------------|----------|-------------|--------
creative-director      | director   | YES      | never       | —
technical-director     | director   | YES      | never       | —
...

Top 5 Priority Gaps (skills with no spec, critical/high priority):
(none if all specs are written)

Skill coverage:  72/72 specs (100%)
Agent coverage:  49/49 specs (100%)
```

在审计模式下不写入任何文件。

询问：“是否要运行 `/skill-test static all` 来检查所有技能的结构合规性？运行 `/skill-test category all` 来执行类别评分规则检查？还是运行 `/skill-test spec [name]` 来执行特定的行为测试？”

---

## 阶段 3：建议的后续步骤

任何模式完成后，提供与上下文相关的后续建议：

- 执行 `static [name]` 后：“如果测试规范存在，请运行 `/skill-test spec [name]` 来验证行为正确性。”
- 执行 `static all` 后存在失败项时：“优先处理 NON-COMPLIANT 技能。单独运行 `/skill-test static [name]` 以获取详细的修复指导。”
- 执行 `spec [name]` 并得到 PASS 后：“更新 `CCGS Skill Testing Framework/catalog.yaml` 以记录此次通过的日期。可以考虑运行 `/skill-test audit` 来查找下一个规范缺口。”
- 执行 `spec [name]` 并得到 FAIL 后：“检查失败的断言，并更新技能或测试规范以解决不匹配问题。”
- 执行 `audit` 后：“从关键优先级的缺口开始。使用位于 `CCGS Skill Testing Framework/templates/skill-test-spec.md` 的规范模板创建新规范。”