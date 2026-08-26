---
name: utility-pm-skill-validate
description: Audits an existing pm-skills skill against structural conventions and quality criteria. Produces a structured validation report with pass/fail checks, severity-graded findings, and actionable recommendations. Use when checking whether a skill meets repo standards before shipping or after making changes.
license: Apache-2.0
metadata:
  classification: utility
  version: "1.0.0"
  updated: 2026-04-03
  category: coordination
  frameworks: [triple-diamond]
  author: product-on-purpose
---
# PM 技能验证

此技能根据仓库的结构约定和质量标准，对现有的 pm-skills 技能进行审核。它会生成一份人类可以快速浏览、且 `/pm-skill-iterate` 可以作为输入使用的验证报告。

验证器检查两个层级：
- **层级 1（结构）**：与 CI 对应的确定性检查：frontmatter、命名、文件是否存在、描述词数。
- **层级 2（质量）**：由 LLM 评估的一致性检查：输出契约是否引用模板？示例是否完整？检查清单项目是否可测试？

## 适用场景

- 使用 `/pm-skill-builder` 创建技能后、发布前
- 手动编辑技能后，确认其仍符合约定
- 运行 `/pm-skill-iterate` 前，找出需要改进的地方
- 约定发生变化时，审核哪些技能需要更新（批量模式）
- 审核贡献的技能是否具备良好的质量和完整性

## 不适用场景

- 从零创建新技能 -> 使用 `/pm-skill-builder`
- 修复或改进技能 -> 使用 `/pm-skill-iterate`（将此报告提供给它）
- 在流水线中运行 CI 检查 -> 使用 `scripts/lint-skills-frontmatter.sh`
  （此技能用于交互式、深度高于 CI 的验证）

## Instructions

当被要求验证技能时，请遵循以下步骤：

### Step 1: Identify the Target

以任意形式接受技能名称：
- 目录名称：`deliver-prd`
- 完整路径：`skills/deliver-prd/SKILL.md`
- Slash 命令：`/prd`

解析为规范目录路径：`skills/{name}/`。

如果技能目录不存在，立即报告：

```
# Validation Report: {input}
Result: FAIL
Skill directory `skills/{input}/` does not exist.
```

**Batch mode：**如果输入为 `--all`，对所有技能运行层级 1 的结构检查，并生成汇总表（见 Step 5）。不要在批量模式下运行层级 2。

### Step 2: Read Skill Files

读取技能目录中的所有文件：

| 文件 | 必需 | 用途 |
|------|----------|---------|
| `SKILL.md` | 是 | Frontmatter + 指令 |
| `references/TEMPLATE.md` | 是 | 输出模板 |
| `references/EXAMPLE.md` | 是 | 完整示例 |
| `HISTORY.md` | 否 | 版本历史（如果存在） |

还要读取：
- 对应的命令文件：`commands/{command-name}.md`
- 此技能在 AGENTS.md 中的条目

如果无法读取文件（MCP/嵌入式环境），请用户在继续前粘贴每个文件的内容（见 Degraded Mode）。

### Step 3: Run Tier 1 . Structural Checks

运行以下确定性检查。每项都会生成一行 `PASS` 或 `FAIL`。

| 检查 ID | 检查内容 | 通过条件 |
|----------|--------------|----------------|
| `frontmatter-at-byte-zero` | `SKILL.md`、`references/TEMPLATE.md`、`references/EXAMPLE.md` 的第一行是否完全为 `---` | 第 1 行是开头的 `---` 分隔符，前面没有 HTML 注释、BOM 或空白字符。严重级别：FAIL。参考：`library/skill-output-samples/SAMPLE_CREATION.md` 第 5 节。 |
| `name-match` | Frontmatter 中的 `name` 是否与目录名称匹配 | 字符串完全匹配 |
| `description-present` | Frontmatter 中是否存在 `description` | 值非空 |
| `description-length` | 描述词数 | 20-100 个词 |
| `version-present` | Frontmatter 中是否存在 `version` | 非空且为有效的 SemVer |
| `updated-present` | Frontmatter 中是否存在 `updated` | 非空且为 ISO 日期 |
| `license-present` | Frontmatter 中是否存在 `license` | 值非空 |
| `phase-classification` | Phase/分类一致性 | Domain 有 `phase:`，foundation/utility 有 `classification:`，两者不能同时存在 |
| `template-exists` | `references/TEMPLATE.md` 是否存在 | 文件存在 |
| `template-sections` | TEMPLATE.md 是否具有足够的结构 | 至少有 3 个 `##` 二级标题 |
| `example-exists` | `references/EXAMPLE.md` 是否存在 | 文件存在 |
| `command-exists` | `commands/` 中是否存在命令文件 | 文件存在，且引用了正确的技能路径 |
| `agents-entry` | AGENTS.md 中是否有此技能的条目 | 条目存在，且包含匹配的 `**Path:**` |

### 第 4 步：运行第 2 层质量检查

运行以下由 LLM 评估的检查。每项检查都会生成一行 `PASS`、`WARN` 或 `INFO`。
第 2 层检查结果的最高级别为 `WARN`，除非有客观依据（占位符泄漏是例外——它可以是 `FAIL`）。

| 检查 ID | 评估内容 | 评估方式 | 最高严重级别 |
|----------|---------------|---------------|-------------|
| `output-contract-coverage` | SKILL.md 是否引用模板 | 检查是否在 Output 部分明确引用 `references/TEMPLATE.md` 或 "use the template"。任一模式均视为有效。只有在完全未引用模板时才标记为 WARN。 | WARN |
| `checklist-verifiability` | 质量检查清单项目是否可测试 | 阅读每一项检查清单。标记模糊的项目（"质量很好"）与具体的项目（"指标是可衡量的"）。如果至少有 2 项模糊，则标记为 WARN。 | WARN |
| `example-completeness` | EXAMPLE.md 是否填充了模板的所有部分 | 将 TEMPLATE.md 中的 `##` 标题与 EXAMPLE.md 中的 `##` 标题进行比较。如果 EXAMPLE.md 缺少模板中出现的部分，则标记为 WARN。同时检查是否存在未解决的占位符。行数仅供参考——报告行数，但不要以此作为阻断条件。 | WARN |
| `template-example-alignment` | EXAMPLE.md 是否遵循 TEMPLATE.md 的结构 | 比较各部分标题的顺序。如果 EXAMPLE.md 中的部分顺序不同，或使用了与 TEMPLATE.md 不同的标题名称，则标记为 WARN。 | WARN |
| `description-actionability` | 描述是否说明何时使用该技能 | 检查 frontmatter description 中是否包含类似 "Use when..." 或 "Use for..." 的触发短语。如果描述只说明技能的作用，却没有说明何时使用，则标记为 WARN。 | WARN |
| `instruction-clarity` | 指令是否采用编号并使用祈使句 | 检查 Instructions 部分是否包含 `### Step` 标题或编号列表模式。如果指令只是没有清晰步骤结构的散文段落，则标记为 WARN。 | WARN |
| `placeholder-leakage` | 任何随附文件中是否没有遗留脚手架内容 | 扫描 SKILL.md、TEMPLATE.md 和 EXAMPLE.md，检查以下内容：`[Placeholder]` 或 `[Feature Name]` 模式、`<!-- ... -->` HTML 注释（许可证头部除外）、本应删除的模板指导性引用块，以及 "TODO" 或 "FIXME" 等编写者备注。如果发现任何此类内容，则标记为 FAIL——这是有客观依据的。 | FAIL |
| `when-not-to-use` | SKILL.md 中是否存在 "When NOT to Use" 部分 | 检查是否存在标题为 "When NOT to Use" 或类似名称的部分。仅提供 INFO——该部分目前仅存在于 1/27 个随附技能中，尚未成为约定。 | INFO |

**质量标准说明：**这些检查依据当前的库约定进行验证——即当前随附库实际采用的做法。标记为 WARN 或 INFO 的结果代表 v2.8 质量标准，使用 `/pm-skill-builder` 构建的新技能应满足这些标准。较旧的技能在通过生命周期迭代之前，可能会合理地出现这些检查结果。

### 第 5 步：生成验证报告

使用以下确切结构整理报告。F-11（`/pm-skill-iterate`）会按部分标题和以竖线分隔的字段解析此报告。

```
# Validation Report: {skill-name}
Date: {YYYY-MM-DD}
Skill version: {version from frontmatter}
Validator version: 1.0.0
Report schema: v1
Result: {PASS | WARN | FAIL}

## Summary
{1-2 sentence overall assessment.}
Errors: {n} | Warnings: {n} | Info: {n}

> Tier 2 findings are heuristic quality assessments and may require human review.

## Structural Checks
- {STATUS} | structural | {check-id} | {message}
- {STATUS} | structural | {check-id} | {message}
...

## Quality Checks
- {STATUS} | quality | {check-id} | {message}
- {STATUS} | quality | {check-id} | {message}
...

## Recommendations
1. {STATUS} | {check-id} | Target: {file-path}
   Action: {what to do}
2. {STATUS} | {check-id} | Target: {file-path}
   Action: {what to do}
...
```

**报告规则：**

- **Result** = 发现的最严重级别：存在任何 FAIL → `FAIL`，否则存在任何 WARN → `WARN`，否则为 `PASS`。
- **Structural Checks**：每个 Tier 1 检查占一行。STATUS 为 `PASS` 或 `FAIL`。
- **Quality Checks**：每个 Tier 2 检查占一行。STATUS 为 `PASS`、`WARN` 或 `INFO`。
- **Recommendations**：仅包含未通过的检查。每条建议都包含检查 ID、目标文件路径和具体操作。
- 如果所有检查均通过，Recommendations 部分应写为："No issues found."
- 从 Recommendations 中省略通过的检查，仅列出需要采取行动的发现项。

**批处理模式输出**（输入为 `--all` 时）：

仅对所有 skill 运行 Tier 1 结构检查。生成汇总表：

```
# Batch Validation Summary
Date: {YYYY-MM-DD}
Validator version: 1.0.0
Report schema: v1
Skills checked: {n}

| Skill | Result | Errors | Warnings |
|-------|--------|--------|----------|
| deliver-prd | PASS | 0 | 0 |
| define-hypothesis | WARN | 0 | 1 |
| foundation-persona | FAIL | 1 | 0 |
...

Skills passing: {n}/{total}
Run `/pm-skill-validate {skill}` for a detailed report.
```

## 降级模式

如果无法直接读取 skill 文件（例如通过 MCP 运行，或在无法访问文件系统的嵌入式环境中运行）：

1. 要求用户提供每个必需文件的内容：
   - `skills/{name}/SKILL.md`
   - `skills/{name}/references/TEMPLATE.md`
   - `skills/{name}/references/EXAMPLE.md`
2. 针对所提供的内容运行所有检查。
3. 在报告中注明："Validated from user-provided content (file system not available)."
4. 降级模式下不提供批处理模式，仅支持单个 skill。

## 输出契约

验证器 **MUST** 生成遵循 Step 5 中格式的验证报告。

该报告：
- 使用完全一致的章节标题：`## Summary`、`## Structural Checks`、
  `## Quality Checks`、`## Recommendations`
- 使用管道分隔的检查行：`STATUS | TIER | CHECK-ID | message`
- 使用管道分隔的建议：`STATUS | CHECK-ID | Target: path`
  下一行使用 `Action: description`
- 为兼容 F-11，在标题中包含 `Report schema: v1`
- 在 Summary 部分包含 Tier 2 注意事项行

## 质量检查清单

交付报告前，请确认：

- [ ] 已运行所有第 1 层结构检查（未跳过）
- [ ] 已运行所有第 2 层质量检查（未跳过）。仅限单技能模式
- [ ] 报告遵循步骤 5 中规定的确切章节和行格式
- [ ] 每项未通过的检查都出现在 Recommendations 中，并包含目标文件路径
- [ ] Result 字段反映发现的最严重级别
- [ ] 第 2 层检查结果最高标记为 WARN（占位符泄漏除外，后者可以为 FAIL）
- [ ] 除非有客观依据，否则不得将任何第 2 层检查标记为 FAIL

## 示例

请参阅 `references/EXAMPLE.md`，其中提供了一份完整的验证报告，演示了如何针对实际发布的技能执行第 1 层和第 2 层检查。