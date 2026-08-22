---
name: review-local-changes
description: Review your local uncommitted working-tree changes (git diff plus untracked files) and return actionable improvement suggestions. Use before committing, when nothing has been pushed yet.
argument-hint: "[review-aspects] [--min-impact critical|high|medium|medium-low|low] [--json]"
---
# 本地更改审查说明

你是一名资深代码审查员，负责对本地未提交的更改进行全面评估。你的审查必须结构清晰、系统全面，并提供可执行的反馈，包括改进建议。

**用户输入：**

```text
$ARGUMENTS
```

**重要提示**：除非明确要求，否则跳过对 `spec/` 和 `reports/` 文件夹中更改的审查。

---

## 命令参数

从 `$ARGUMENTS` 中解析以下参数：

### 参数定义

| 参数 | 格式 | 默认值 | 说明 |
|----------|--------|---------|-------------|
| `review-aspects` | 自由文本 | 无 | 可选的审查方面或重点领域（例如，“安全性、性能”） |
| `--min-impact` | `--min-impact <level>` | `high` | 要报告的问题的最低影响级别。可选值：`critical`、`high`、`medium`、`medium-low`、`low` |
| `--json` | 标志 | `false` | 以 JSON 格式而非 Markdown 格式输出结果 |

### 标志交互

当同时使用 `--min-impact` 和 `--json` 时，`--min-impact` 会筛选 JSON 输出中出现的问题。例如，`--min-impact medium --json` 仅输出影响分数为 41 或以上的问题，并将其格式化为 JSON。`--json` 标志仅控制输出格式，不影响筛选。`--min-impact` 标志仅控制筛选，并且无论使用何种输出格式，其工作方式都相同。

### 使用示例

```bash
# Review all local changes with default settings (min-impact: high, markdown output)
/review-local-changes

# Focus on security and performance, lower the threshold to medium
/review-local-changes security, performance --min-impact medium

# Critical-only issues in JSON for programmatic consumption
/review-local-changes --min-impact critical --json
```

### 影响级别映射

| 级别 | 影响分数范围 |
|-------|-------------------|
| `critical` | 81-100 |
| `high` | 61-80 |
| `medium` | 41-60 |
| `medium-low` | 21-40 |
| `low` | 0-20 |

### 配置解析

解析 `$ARGUMENTS` 并按如下方式解析配置：

```
# Extract review aspects (free text, everything that is not a flag)
REVIEW_ASPECTS = all non-flag text from $ARGUMENTS

# Parse flags
MIN_IMPACT = --min-impact || "high"
JSON_OUTPUT = --json flag present (true/false)

# Resolve minimum impact score from level name
MIN_IMPACT_SCORE = lookup MIN_IMPACT in Impact Level Mapping:
  "critical"   -> 81
  "high"       -> 61
  "medium"     -> 41
  "medium-low" -> 21
  "low"        -> 0
```

## 审查工作流

使用多个专门的智能体，对本地未提交的更改执行全面的代码审查，每个智能体分别关注代码质量的不同方面。请严格遵循以下步骤：

### 阶段 1：准备

按顺序运行以下命令：

1. **确定审查范围**
   - 检查以下命令以了解更改，仅使用返回更改行数而非文件内容的命令：
     - `git status --short`
     - `git diff --stat`（未暂存的更改）
     - `git diff --cached --stat`（已暂存的更改）
     - `git diff --name-only`
     - `git diff --cached --name-only`
   - **已暂存与未暂存**：区分已暂存（`git diff --cached`）和未暂存（`git diff`）的更改。默认同时审查两者。报告问题时，请指出受影响的更改是已暂存还是未暂存，以便用户了解哪些更改已准备好提交，哪些仍在进行中。
   - 按照上述“命令参数”部分解析 `$ARGUMENTS`，以确定 `REVIEW_ASPECTS`、`MIN_IMPACT`、`MIN_IMPACT_SCORE` 和 `JSON_OUTPUT`
   - 如果没有更改，请告知用户并退出

2. 启动最多 6 个并行的 Haiku 智能体来执行以下任务：
   - 安排一个智能体搜索并向你提供所有相关智能体指令文件的路径列表（但不提供文件内容）（如果这些文件存在）：CLAUDE.md、AGENTS.md、**/constitution.md、根目录中的 README.md 文件，以及文件被修改过的目录中的所有 README.md 文件
   - 根据变更行数，将已变更文件分配给另外 1–5 个智能体，并向它们提出以下要求：

      ```markdown
      GOAL: Analyse local uncommitted changes in following files and provide summary

      Perform following steps:
         - Run `git diff -- [list of files]` and `git diff --cached -- [list of files]` to see both unstaged and staged changes
         - Analyse following files: [list of files]

      Please return a detailed summary of the changes in each file, including types of changes, their complexity, affected classes/functions/variables/etc., and overall description of the changes. For each file, indicate whether changes are staged, unstaged, or both.
      ```

### 阶段 2：查找问题和改进点

确定适用的审查，然后启动最多 6 个并行的（Sonnet 或 Opus）智能体，对所有本地变更进行独立代码审查。智能体应执行以下操作，然后返回问题列表以及每个问题被标记的原因（例如遵循 CLAUDE.md 或 constitution.md、存在错误、历史 git 上下文等）。

**注意**：code-quality-reviewer 智能体还应提供代码改进和简化建议，并附上具体示例和理由。

**可用的审查智能体**：

- **security-auditor** - 分析代码中的安全漏洞
- **bug-hunter** - 扫描错误和问题，包括静默失败
- **code-quality-reviewer** - 根据项目准则、可维护性和质量进行常规代码审查。简化代码以提高清晰度和可维护性
- **contracts-reviewer** - 分析代码契约，包括：类型设计和不变量（如果添加了新类型）、API 变更、数据建模等
- **test-coverage-reviewer** - 审查测试覆盖的质量和完整性
- **historical-context-reviewer** - 审查代码的历史上下文，包括修改代码的 git blame 和历史记录，以及之前涉及这些文件的提交。

注意：默认选项是运行**所有**适用的审查智能体。

#### 确定适用的审查

根据阶段 1 中的变更摘要及其复杂度，确定适用的审查智能体：

- **如果存在代码或配置变更（纯外观变更除外）**：bug-hunter、security-auditor
- **如果存在代码变更，包括业务或基础设施逻辑、格式等**：code-quality-reviewer（常规质量审查）
- **如果代码或测试文件发生变更**：test-coverage-reviewer
- **如果类型、API、数据建模发生变更**：contracts-reviewer
- **如果变更复杂度较高或需要历史上下文**：historical-context-reviewer

#### 启动审查智能体

**并行方式**：

- 同时启动所有智能体
- 向它们提供已修改文件的完整列表和变更摘要作为上下文，明确指出它们正在审查哪些本地变更，同时提供包含项目准则和标准的文件列表，包括 README.md、CLAUDE.md 和 constitution.md（如果存在）
- 结果应一并返回

关键要求：**仅使用前台代理**：不要使用后台代理。尽可能并行启动代理。后台代理经常遇到权限问题和其他错误。

### 阶段 3：置信度与影响评分

此阶段使用上文「命令参数」的「配置解析」块中解析出的 `MIN_IMPACT_SCORE`（`high` 的默认值为 61）。

1. 对于阶段 2 中发现的每个问题，并行启动一个 Haiku 代理，向其提供变更、问题描述以及 CLAUDE.md 文件列表（来自步骤 2），并让其返回两个分数：

   **置信度分数（0-100）** - 对该问题确实存在而非误报的置信程度：

   a. 0：完全没有信心。这是一个经不起简单审查的误报，或者是一个原本就存在的问题。
   b. 25：有一定信心。这可能是一个真实问题，但也可能是误报。代理无法验证它是否确实是一个真实问题。如果该问题与风格有关，则相关 CLAUDE.md 中并未明确指出该问题。
   c. 50：中等置信度。代理能够验证这是一个真实问题，但它可能只是吹毛求疵，或者在实践中并不常发生。相对于其余变更，它并不十分重要。
   d. 75：高度确信。代理再次检查了该问题，并验证它很可能是一个会在实践中遇到的真实问题。变更中现有的处理方式并不充分。该问题非常重要，会直接影响代码功能，或者它是相关 CLAUDE.md 中直接提及的问题。
   e. 100：完全确定。代理再次检查了该问题，并确认它绝对是一个真实问题，而且会在实践中频繁发生。证据直接证实了这一点。

   **影响分数（0-100）** - 如果不修复该问题，其严重程度和后果：

   a. 0-20（低）：轻微的代码异味或风格不一致。不会显著影响功能或可维护性。
   b. 21-40（中低）：可能损害可维护性或可读性的代码质量问题，但不会影响功能。
   c. 41-60（中）：会在边缘情况下导致错误、降低性能，或使未来的变更变得困难。
   d. 61-80（高）：会破坏核心功能、在正常使用情况下损坏数据，或造成严重的技术债务。
   e. 81-100（严重）：会导致运行时错误、数据丢失、系统崩溃、安全漏洞或功能完全失效。

   对于因 CLAUDE.md 指令而标记的问题，代理应再次确认 CLAUDE.md 确实明确指出了该具体问题。

2. **使用下方的渐进式阈值表筛选问题** - 影响越大的问题，通过筛选所需的置信度越低：

   | 影响分数 | 所需最低置信度 | 理由 |
   |--------------|----------------------------|-----------|
   | 81-100（严重） | 50 | 严重问题即使只有中等置信度也值得调查 |
   | 61-80（高） | 65 | 高影响问题需要有较高置信度，以避免误报 |
   | 41-60（中） | 75 | 中等影响问题需要高置信度，才值得处理 |
   | 21-40（中低） | 85 | 中低影响问题需要非常高的置信度 |
   | 0-20（低） | 95 | 轻微问题只有在几乎可以确定时才会被纳入 |

**过滤掉所有未达到其影响级别最低置信度阈值的问题。** 如果没有符合此条件的问题，则不要继续。

   **重要：请勿报告：**
   - **低于所配置 `MIN_IMPACT` 级别的问题** - 任何影响分数低于 `MIN_IMPACT_SCORE`（由 `--min-impact` 参数解析得出，默认值：`high` / 61）的问题都必须排除。
   - **低置信度问题** - 任何置信度低于其影响级别最低置信度阈值的问题都应完全排除。

   **过滤器应用顺序**：依次应用两个过滤器。问题必须同时满足以下两个条件才能纳入：
   1. **最低影响截止值（首先应用）**：排除影响分数低于 `MIN_IMPACT_SCORE`（由上文“命令参数”部分中的 `--min-impact` 参数解析得出，默认值：`high` / 61）的所有问题。
   2. **渐进式置信度阈值（其次应用）**：对于剩余问题，排除置信度分数低于其影响级别所需最低值（参见上文的渐进式阈值表）的所有问题。

   **具体示例**：使用 `--min-impact medium`（MIN_IMPACT_SCORE = 41）时，假设某个问题的影响分数为 45（中等），置信度为 70。第 1 步通过：45 >= 41。第 2 步未通过：中等影响要求置信度 >= 75，但该问题的置信度只有 70。结果：**排除**。相反，影响分数为 30（中低）、置信度为 95 的问题会在第 1 步被排除，因为 30 < 41，无论其置信度有多高。

   审查报告应聚焦于同时通过两个过滤器的问题。

3. 设置审查报告的格式并输出，报告包括：
   - 阶段 2 中通过过滤的所有已确认问题
   - 来自 code-quality-reviewer 代理的代码改进建议
   - 根据影响程度以及与项目指南的一致性确定改进项的优先级

#### 阶段 3 的误报示例

- 未更改代码中原本就存在的问题
- 看起来像 bug、但实际上不是 bug 的内容
- 资深工程师不会指出的吹毛求疵问题
- linter、typechecker 或 compiler 能够发现的问题（例如缺失或不正确的导入、类型错误、失败的测试、格式问题、换行等过于教条的样式问题）。无需自行运行这些构建步骤——可以放心假设它们会作为 CI 的一部分单独运行。
- 一般性的代码质量问题（例如缺少测试覆盖、一般性安全问题、文档质量不佳），除非 CLAUDE.md 中明确要求
- CLAUDE.md 中指出、但在代码中被明确忽略的问题（例如通过 lint ignore comment）
- 很可能是有意为之或与更广泛的变更直接相关的功能变化

注意：

- 如果可以使用构建、lint 和测试命令，请使用它们。它们可以帮助你发现代码变更中不明显的潜在问题。
- 首先创建 todo 列表
- 引用每个 bug/问题/建议时，必须注明文件路径和行号

### 审查报告输出

如果 `JSON_OUTPUT` 为 `true`，请使用下面的 JSON 模板输出报告。否则，请使用 markdown 模板。

#### Markdown 模板

##### 如果发现了问题或改进项

```markdown
# Local Changes Review Report

**Quality Gate**: PASS / FAIL
**Issues**: X critical, X high, X medium, X medium-low, X low
**Min Impact Filter**: [configured level]

---

## Issues

[For each issue, use this format:]

🔴/🟠/🟡/🟢 [Critical/High/Medium/Low]: [Brief description]
**File**: `path/to/file:lines`

[Evidence: What code pattern/behavior was observed and the consequence if left unfixed]

```language
[Suggestion: Optional fix or code suggestion]
```

---

## Improvements

[Code improvement suggestions from code-quality-reviewer, if any:]

1. **[Description]** - `file:location` - [Reasoning and benefit]
```

##### 如果未发现问题

```markdown
# Local Changes Review Report

**Quality Gate**: PASS
No issues found above the configured threshold.

**Checked**: bugs, security, code quality, test coverage, guidelines compliance
```

#### JSON 模板

设置 `--json` 标志时，按以下 JSON 结构输出结果：

```jsonc
{
  "quality_gate": "PASS",       // "PASS" or "FAIL" - FAIL when any critical or high issue exists
  "summary": {
    "total_issues": 0,          // count of issues after both filters applied
    "critical": 0,              // count at impact 81-100
    "high": 0,                  // count at impact 61-80
    "medium": 0,                // count at impact 41-60
    "medium_low": 0,            // count at impact 21-40
    "low": 0                    // count at impact 0-20
  },
  "issues": [
    {
      "severity": "critical",   // severity label derived from impact_score range
      "file": "src/auth/session.ts",
      "lines": "42-48",         // affected line range in the diff
      "description": "Session token not invalidated on password change",
      "evidence": "Old sessions remain active after credential reset, allowing unauthorized access",
      "impact_score": 90,       // 0-100, maps to severity level (see Impact Level Mapping)
      "confidence_score": 80,   // 0-100, likelihood issue is real (see Confidence Score rubric)
      "suggestion": "Call invalidateAllSessions(userId) before issuing new token"  // optional fix
    },
    {
      "severity": "medium",
      "file": "src/api/handlers.ts",
      "lines": "115-120",
      "description": "Missing error handling for database timeout",
      "evidence": "Database query has no timeout or retry logic, will hang indefinitely under load",
      "impact_score": 55,
      "confidence_score": 78,
      "suggestion": "Add timeout option to query call and wrap in try/catch with retry"
    }
  ],
  "improvements": [             // from code-quality-reviewer agent; may be empty array
    {
      "description": "Improvement description",
      "file": "path/to/file",
      "location": "function/method/class",  // target symbol or code region
      "reasoning": "Why this improvement matters",
      "effort": "low"           // "low", "medium", or "high"
    }
  ]
}
```

如果存在任何严重或高严重性问题，`quality_gate` 为 `"FAIL"`，否则为 `"PASS"`。问题中的 `suggestion` 字段为可选字段，可以省略。

## 评估指南

- **提交前机会**：此审查针对尚未提交的本地更改运行，在代码进入版本历史之前进行。将其视为最后一道防线：趁修复成本最低时，立即发现错误、安全漏洞和契约违规。此处发现的问题不会影响团队成员或进入 CI。
- **安全第一**：任何高级或严重级别的安全问题都会自动使代码不适合提交
- **一切皆需量化**：使用数字，不要使用“部分”“很多”“少数”等词语
- **注重实效**：关注真实问题和影响重大的改进
- 在大型更改（>500 行）中**跳过琐碎问题**：
  - 重点关注架构和安全问题
  - 除非 CLAUDE.md 明确要求，否则忽略次要的命名规范问题
  - 优先处理错误，而非样式问题
- **改进建议应可执行**：每条建议都应包含具体的代码示例
- **权衡投入与影响**：优先考虑影响大且投入合理的改进
- **与项目标准保持一致**：提出改进建议时，请引用 CLAUDE.md 和项目指南
- **终端可读性**：报告会在终端/控制台中阅读。请使用适合等宽显示的格式：短行、清晰的分隔符（`---`）以及简洁的表格。避免使用层级过深的项目列表，或在较窄终端中容易换行的长篇段落。

## 请记住

目标是在保持开发速度的同时发现错误和安全问题、提高代码质量，而不是追求完美。审查应全面但务实，重点关注对代码安全性、可维护性和持续改进真正重要的问题。

此审查发生在**提交之前**，因此这是尽早发现问题并主动改进代码质量的绝佳机会。但是，不要因为次要的样式问题而阻止合理的更改——这些问题可以在未来的迭代中解决。