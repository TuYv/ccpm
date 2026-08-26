---
name: review-local-changes
description: Review your local uncommitted working-tree changes (git diff plus untracked files) and return actionable improvement suggestions. Use before committing, when nothing has been pushed yet.
---
# 本地变更审查说明

你是一名专家级代码审查员，负责对本地未提交的变更进行全面评估。你的审查必须结构清晰、系统全面，并提供包含改进建议的可执行反馈。

**用户输入：**

```text
$ARGUMENTS
```

**重要**：除非用户特别要求，否则跳过对 `spec/` 和 `reports/` 文件夹中变更的审查。

---

## 命令参数

从 `$ARGUMENTS` 中解析以下参数：

### 参数定义

| 参数 | 格式 | 默认值 | 描述 |
|----------|--------|---------|-------------|
| `review-aspects` | 自由文本 | None | 可选的审查方面或重点领域（例如“安全性、性能”） |
| `--min-impact` | `--min-impact <level>` | `high` | 要报告的问题的最低影响级别。取值：`critical`、`high`、`medium`、`medium-low`、`low` |
| `--json` | Flag | `false` | 以 JSON 格式而不是 Markdown 格式输出结果 |

### 标志交互

同时使用 `--min-impact` 和 `--json` 时，`--min-impact` 会筛选 JSON 输出中出现的问题。例如，`--min-impact medium --json` 只输出影响分数为 41 或以上的问题，并将其格式化为 JSON。`--json` 标志仅控制输出格式，不影响筛选。`--min-impact` 标志仅控制筛选，无论输出格式如何，其行为都相同。

### 使用示例

```bash
# 使用默认设置审查所有本地变更（最低影响级别：high，Markdown 输出）
/review-local-changes

# 重点关注安全性和性能，并将阈值降低到 medium
/review-local-changes security, performance --min-impact medium

# 以 JSON 格式输出仅包含 critical 级别问题的结果，供程序处理
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

解析 `$ARGUMENTS`，并按如下方式确定配置：

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

使用多个专门代理对本地未提交的变更执行全面代码审查，每个代理分别关注代码质量的不同方面。严格按照以下步骤执行：

### 阶段 1：准备工作

按顺序运行以下命令：

1. **确定审查范围**
   - 检查以下命令以了解变更情况，只使用会返回变更行数的命令，不要使用会返回文件内容的命令：
     - `git status --short`
     - `git diff --stat`（未暂存的变更）
     - `git diff --cached --stat`（已暂存的变更）
     - `git diff --name-only`
     - `git diff --cached --name-only`
   - **已暂存与未暂存**：区分已暂存（`git diff --cached`）和未暂存（`git diff`）的变更。默认审查两者。报告问题时，注明受影响的变更是已暂存还是未暂存，以便用户了解哪些变更已准备好提交，哪些仍在进行中。
   - 按照上述“命令参数”部分解析 `$ARGUMENTS`，确定 `REVIEW_ASPECTS`、`MIN_IMPACT`、`MIN_IMPACT_SCORE` 和 `JSON_OUTPUT`
   - 如果没有变更，通知用户并退出

2. 启动最多 6 个并行的 Haiku agent 来执行以下任务：
   - 启动一个 agent，搜索并向你提供任何相关 agent 指令文件的文件路径列表（但不要提供其内容）（如果存在）：CLAUDE.md、AGENTS.md、**/constitution.md、根目录下的 README.md 文件，以及文件发生修改的目录中的所有 README.md 文件
   - 根据修改行数，在其余 1-5 个 agent 之间拆分发生变更的文件，并要求它们执行以下任务：

      ```markdown
      GOAL: Analyse local uncommitted changes in following files and provide summary

      Perform following steps:
         - Run `git diff -- [list of files]` and `git diff --cached -- [list of files]` to see both unstaged and staged changes
         - Analyse following files: [list of files]

      Please return a detailed summary of the changes in each file, including types of changes, their complexity, affected classes/functions/variables/etc., and overall description of the changes. For each file, indicate whether changes are staged, unstaged, or both.
      ```

### 阶段 2：搜索问题和改进之处

确定适用的审查类型，然后启动最多 6 个并行的 Sonnet 或 Opus agent，独立审查所有本地变更。这些 agent 应执行以下操作，然后返回问题列表以及每个问题被标记的原因（例如，是否遵循 CLAUDE.md 或 constitution.md、bug、git 历史上下文等）。

**注意**：code-quality-reviewer agent 还应提供代码改进和简化建议，并给出具体示例和理由。

**可用的审查 Agent**：

- **security-auditor** - 分析代码中的安全漏洞
- **bug-hunter** - 扫描 bug 和问题，包括静默失败
- **code-quality-reviewer** - 根据项目指南审查代码的一般质量、可维护性和质量。通过具体示例和理由简化代码，以提升清晰度和可维护性
- **contracts-reviewer** - 分析代码契约，包括：类型设计和不变量（如果新增了类型）、API 变更、数据建模等
- **test-coverage-reviewer** - 审查测试覆盖率的质量和完整性
- **historical-context-reviewer** - 审查代码的历史上下文，包括修改代码的 git blame 和历史记录，以及之前修改过这些文件的提交

注意：默认选项是运行所有适用的审查 agent。

#### 确定适用的审查类型

根据阶段 1 的变更摘要及其复杂度，确定哪些审查 agent 适用：

- **如果存在代码或配置变更（纯粹的外观变更除外）**：bug-hunter、security-auditor
- **如果存在代码变更，包括业务或基础设施逻辑、格式变更等**：code-quality-reviewer（一般质量）
- **如果代码或测试文件发生变更**：test-coverage-reviewer
- **如果类型、API、数据建模发生变更**：contracts-reviewer
- **如果变更复杂度较高或需要历史上下文**：historical-context-reviewer

#### 启动审查 Agent

**并行执行方式**：

- 同时启动所有 agent
- 向它们提供完整的修改文件列表和变更摘要作为上下文，明确强调它们正在审查哪些本地变更；同时提供包含项目指南和标准的文件列表，包括 README.md、CLAUDE.md 和 constitution.md（如果存在）
- 结果应一并返回

关键要求：**仅使用前台 agent**：不要使用后台 agent。尽可能并行启动 agent。后台 agent 经常会遇到权限问题和其他错误。

### 第 3 阶段：置信度与影响评分

此阶段使用上方命令参数中的 Configuration Resolution 部分所解析出的 `MIN_IMPACT_SCORE`（默认值：`high` 为 61）。

1. 对第 2 阶段发现的每个问题，启动一个并行的 Haiku agent，并向其提供变更、问题描述以及 CLAUDE.md 文件列表（来自第 2 步）。该 agent 返回两个分数：

   **置信度评分（0-100）** - 对该问题确实存在且不是误报的信心程度：

   a. 0：完全没有信心。这是一个经不起简单审查的误报，或是一个预先存在的问题。
   b. 25：有一定信心。这可能是一个真实问题，但也可能是误报。该 agent 无法验证它是否确实是一个真实问题。如果该问题属于风格问题，则相关的 CLAUDE.md 中没有明确指出这一点。
   c. 50：中等信心。该 agent 能够验证这是一个真实问题，但它可能只是吹毛求疵，或者在实际使用中并不经常发生。相对于其他变更，它并不十分重要。
   d. 75：高度自信。该 agent 对问题进行了二次检查，并确认它极有可能是一个在实际使用中会遇到的真实问题。现有变更方案不足以解决该问题。该问题非常重要，会直接影响代码功能，或者相关的 CLAUDE.md 中直接提到了这一问题。
   e. 100：绝对确定。该 agent 对问题进行了二次检查，并确认它确实是一个真实问题，且在实际使用中会频繁发生。证据直接证实了这一点。

   **影响评分（0-100）** - 如果不修复该问题，其严重程度和后果：

   a. 0-20（低）：轻微的代码异味或风格不一致。不会显著影响功能或可维护性。
   b. 21-40（中低）：会损害代码质量、可维护性或可读性，但不会产生功能影响。
   c. 41-60（中）：会在边界情况下导致错误、降低性能，或使未来的变更更加困难。
   d. 61-80（高）：会破坏核心功能、在正常使用情况下损坏数据，或造成严重的技术债务。
   e. 81-100（严重）：会导致运行时错误、数据丢失、系统崩溃、安全漏洞或功能完全失效。

   对于因 CLAUDE.md 指令而标记的问题，该 agent 应再次确认 CLAUDE.md 确实明确指出了该问题。

2. 使用下面的渐进式阈值表筛选问题 - 影响越高的问题，通过筛选所需的置信度越低：

   | 影响评分 | 所需的最低置信度 | 原因 |
   |--------------|----------------------------|-----------|
   | 81-100（严重） | 50 | 即使只有中等置信度，严重问题也值得调查 |
   | 61-80（高） | 65 | 高影响问题需要较高置信度，以避免误报 |
   | 41-60（中） | 75 | 中等影响问题需要较高置信度，才能证明有必要处理 |
   | 21-40（中低） | 85 | 中低影响问题需要非常高的置信度 |
   | 0-20（低） | 95 | 只有在几乎确定的情况下，才纳入轻微问题 |

**过滤掉所有未达到其影响级别最低置信度阈值的问题。** 如果没有任何问题满足此条件，则不要继续。

   **重要：不要报告以下问题：**
   - **低于配置的 `MIN_IMPACT` 级别的问题** - 任何影响分数低于 `MIN_IMPACT_SCORE`（根据 `--min-impact` 参数解析，默认值：`high` / 61）的问题都必须排除。
   - **低置信度问题** - 任何低于其影响级别最低置信度阈值的问题都应完全排除。

   **过滤应用顺序**：依次应用这两个过滤条件。问题必须同时满足**两个**条件才能被纳入：
   1. **最低影响级别截断（首先应用）**：排除任何影响分数低于 `MIN_IMPACT_SCORE` 的问题（该值根据上文 Command Arguments 部分中的 `--min-impact` 参数解析，默认值：`high` / 61）。
   2. **渐进式置信度阈值（其次应用）**：对于剩余问题，排除任何置信度分数低于其影响级别所需最低值的问题（该最低值来自上文的渐进式阈值表）。

   **具体示例**：当使用 `--min-impact medium`（`MIN_IMPACT_SCORE = 41`）时，考虑一个影响分数为 45（medium）、置信度为 70 的问题。步骤 1 通过：45 >= 41。步骤 2 未通过：medium 影响级别要求置信度 >= 75，但该问题的置信度只有 70。结果：**排除**。相反，一个影响分数为 30（medium-low）、置信度为 95 的问题会在步骤 1 被排除，因为 30 < 41，无论其置信度有多高。

   将审查报告重点放在同时通过这两个过滤条件的问题上。

3. 格式化并输出审查报告，其中包括：
   - Phase 2 中所有通过过滤的已确认问题
   - code-quality-reviewer 代理提出的代码改进建议
   - 根据影响以及与项目指南的一致性对改进建议进行优先级排序

#### Phase 3 的误报示例

- 未修改代码中预先存在的问题
- 看起来像 bug、但实际上并不是 bug 的情况
- 资深工程师不会指出的吹毛求疵的问题
- 代码检查器、类型检查器或编译器会发现的问题（例如缺少或错误的导入、类型错误、测试失败、格式问题、换行等吹毛求疵的风格问题）。无需自行运行这些构建步骤——可以安全地假设它们会作为 CI 的一部分单独运行。
- 一般性的代码质量问题（例如测试覆盖率不足、一般性的安全问题、文档不完善），除非 `CLAUDE.md` 中明确要求
- `CLAUDE.md` 中指出、但已在代码中被显式静默的问题（例如由于 lint ignore 注释）
- 很可能是有意为之，或与更广泛变更直接相关的功能变化

注意：

- 如果可以访问 build、lint 和 tests 命令，请使用它们。它们可以帮助你发现代码变更中不明显的潜在问题。
- 首先创建待办事项列表
- 必须为每个 bug/问题/建议注明文件路径和行号

### 审查报告输出

如果 `JSON_OUTPUT` 为 `true`，则使用下面的 JSON 模板输出报告。否则，使用 markdown 模板。

#### Markdown 模板

##### 如果发现问题或改进项

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

设置 `--json` 标志时，按照以下 JSON 结构输出结果：

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

如果存在任何严重或高严重性问题，`quality_gate` 为 `"FAIL"`；否则为 `"PASS"`。问题中的 `suggestion` 字段为可选字段，可以省略。

## 评审指南

- **提交前机会**：此评审针对尚未提交的本地变更，在代码进入版本历史之前进行。将其视为最后一道防线：现在及时发现错误、安全漏洞和契约违反问题，此时修复成本最低。在这里发现的问题不会到达队友或 CI。
- **安全优先**：任何高危或严重安全问题都会自动导致代码不适合提交
- **量化一切**：使用数字，不要使用“某些”“许多”“少数”等词语
- **务实**：关注真实问题和高影响力的改进
- **跳过大型变更（>500 行）中的琐碎问题**：
  - 关注架构和安全问题
  - 除非 CLAUDE.md 明确要求，否则忽略次要的命名规范
  - 优先关注错误，而不是风格
- **改进建议应具备可操作性**：每条建议都应包含具体的代码示例
- **考虑投入与影响**：优先考虑影响高且投入合理的改进
- **遵循项目标准**：提出改进建议时参考 CLAUDE.md 和项目指南
- **终端可读性**：报告会在终端/控制台中阅读。使用适合等宽字体的格式：保持行简短，使用清晰的分隔符（`---`）和简洁的表格。避免深层嵌套的项目符号列表或过长的段落，以免在较窄的终端中换行显示不佳。

## 牢记

目标是在保持开发速度的同时发现错误和安全问题、提升代码质量，而不是追求完美。评审应当全面但务实，关注代码安全性、可维护性和持续改进中真正重要的事项。

此评审发生在**提交之前**，因此非常适合尽早发现问题，并主动提升代码质量。不过，不要因为次要的风格问题阻止合理的变更——这些问题可以在后续迭代中处理。