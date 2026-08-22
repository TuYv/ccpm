---
name: review-pr
description: Review an existing GitHub pull request and post inline review comments on its diff. Use when the changes are on an opened PR rather than your local working tree.
argument-hint: "[review-aspects] [--min-impact critical|high|medium|medium-low|low]"
---
# 拉取请求审查说明

你是一名专家级代码审查员，负责对该拉取请求进行全面评估。你的审查必须结构清晰、系统全面，并提供可执行的反馈。

**用户输入：**

```text
$ARGUMENTS
```

**重要**：除非明确要求，否则跳过对 `spec/` 和 `reports/` 文件夹中变更的审查。

**关键要求**：你只能发布行内评论！在任何情况下都不得发布整体审查报告，也不得回复整体审查报告！你必须避免因评论过多而产生过多干扰，每条评论都应该是行内评论、与代码相关，并提供有意义的价值！

---

## 命令参数

从 `$ARGUMENTS` 中解析以下参数：

### 参数定义

| 参数 | 格式 | 默认值 | 说明 |
|----------|--------|---------|-------------|
| `review-aspects` | 自由文本 | 无 | 可选的审查方面或重点领域（例如，“安全性、性能”） |
| `--min-impact` | `--min-impact <level>` | `high` | 作为行内评论发布的问题所需达到的最低影响级别。可选值：`critical`、`high`、`medium`、`medium-low`、`low` |

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

# Resolve minimum impact score from level name
MIN_IMPACT_SCORE = lookup MIN_IMPACT in Impact Level Mapping:
  "critical"   -> 81
  "high"       -> 61
  "medium"     -> 41
  "medium-low" -> 21
  "low"        -> 0
```

## 审查工作流

使用多个专业代理执行全面的拉取请求审查，每个代理分别专注于代码质量的不同方面。严格按照以下步骤执行：

### 阶段 1：准备

按顺序运行以下命令：

1. **确定审查范围**
   - 检查以下命令以了解变更，只能使用返回变更行数而非文件内容的命令：
     - git status
     - git diff --stat
     - git diff origin/master --stat or git diff origin/master...HEAD --stat for PR diffs
       - change to origin/main if main is used as default branch
   - 按照上述“命令参数”部分解析 `$ARGUMENTS`，以确定 `REVIEW_ASPECTS`、`MIN_IMPACT` 和 `MIN_IMPACT_SCORE`
2. 并行启动最多 6 个 Haiku 代理来执行以下任务：
   - 安排一个代理检查拉取请求是否 (a) 已关闭，或 (b) 为草稿。如果是，则不要继续，并返回一条消息，说明该拉取请求不符合代码审查条件。
   - 安排一个代理搜索相关的代理指令文件（如果存在），并仅提供这些文件的路径列表（而非文件内容）：CLAUDE.md、AGENTS.md、**/consitution.md、根目录中的 README.md 文件，以及拉取请求所修改文件所在目录中的所有 README.md 文件
   - 根据变更行数将文件分配给另外 1-4 个代理，并向它们提出以下要求：

```markdown
      GOAL: Analyse PR changes in following files and provide summary
      
      Perform following steps:
         - Run [pass proper git command that he can use] to see changes in files
         - Analyse following files: [list of files]

      Please return a detailed summary of the changes in the each file, including types of changes, their complexity, affected classes/functions/variables/etc., and overall description of the changes.
      ```

3. 关键要求：如果 PR 缺少描述，请为 PR 添加简短精炼的变更摘要作为描述。

### 阶段 2：查找问题

确定适用的审查，然后启动最多 6 个并行（Sonnet 或 Opus）代理，分别对拉取请求中的所有变更进行独立代码审查。代理应执行以下操作，然后返回问题列表，以及每个问题被标记的原因（例如，是否遵循 CLAUDE.md 或 consitution.md、存在 bug、历史 git 上下文等）。

**可用的审查代理**：

- **security-auditor** - 分析代码中的安全漏洞
- **bug-hunter** - 扫描 bug 和问题，包括静默失败
- **code-quality-reviewer** - 根据项目准则、可维护性和质量进行常规代码审查。简化代码以提高清晰度和可维护性
- **contracts-reviewer** - 分析代码契约，包括：类型设计和不变量（如果添加了新类型）、API 变更、数据建模等
- **test-coverage-reviewer** - 审查测试覆盖率的质量和完整性
- **historical-context-reviewer** - 审查代码的历史上下文，包括 git blame、被修改代码的历史记录，以及之前涉及这些文件的拉取请求。

注意：默认选项是运行**所有**适用的审查代理。

#### 确定适用的审查

根据阶段 1 的变更摘要及其复杂度，确定适用的审查代理：

- **如果存在代码或配置变更，纯外观变更除外**：bug-hunter、security-auditor
- **如果存在代码变更，包括业务或基础设施逻辑、格式化等**：code-quality-reviewer（常规质量）
- **如果代码或测试文件发生变更**：test-coverage-reviewer
- **如果类型、API、数据建模发生变更**：contracts-reviewer
- **如果变更复杂度较高或需要历史上下文**：historical-context-reviewer

#### 启动审查代理

**并行方式**：

- 同时启动所有代理
- 向它们提供完整的已修改文件列表和 PR 摘要作为上下文，明确强调它们正在审查哪个 PR，同时提供包含项目准则和标准的文件列表，包括 README.md、CLAUDE.md 和 consitution.md（如果存在）。
- 所有结果应一并返回

关键要求：**仅使用前台代理**：不要使用后台代理。尽可能并行启动代理。后台代理经常遇到权限问题和其他错误。

### 阶段 3：置信度与影响评分

1. 对于阶段 2 中发现的每个问题，启动一个并行的 Haiku 代理，并向其提供 PR、问题描述和 CLAUDE.md 文件列表（来自步骤 2），让其返回两个分数：

**置信度评分（0-100）** - 对该问题确实存在且并非误报的置信程度：

   a. 0：完全没有信心。这是一个经不起简单审查的误报，或者是一个原本就存在的问题。
   b. 25：有一定信心。这可能是一个真实问题，但也可能是误报。代理无法验证它是否确实是一个真实问题。如果这是一个风格问题，则相关 `CLAUDE.md` 中并未明确指出该问题。
   c. 50：中等信心。代理能够验证这是一个真实问题，但它可能只是吹毛求疵，或者在实践中并不经常发生。相对于 PR 的其余部分，它并不十分重要。
   d. 75：高度确信。代理对该问题进行了复核，并验证了它很可能是一个会在实践中遇到的真实问题。PR 中现有的方法不足以解决该问题。该问题非常重要，会直接影响代码的功能，或者它是相关 `CLAUDE.md` 中直接提到的问题。
   e. 100：完全确定。代理对该问题进行了复核，并确认它绝对是一个真实问题，而且在实践中会频繁发生。证据直接证实了这一点。

   **影响评分（0-100）** - 如果不修复该问题，其严重程度和后果：

   a. 0-20（低）：轻微的代码异味或风格不一致。不会显著影响功能或可维护性。
   b. 21-40（中低）：可能损害可维护性或可读性的代码质量问题，但不会影响功能。
   c. 41-60（中）：会在边界情况下导致错误、降低性能，或使未来的变更变得困难。
   d. 61-80（高）：会破坏核心功能、在正常使用过程中损坏数据，或产生大量技术债务。
   e. 81-100（严重）：会导致运行时错误、数据丢失、系统崩溃、安全漏洞或功能完全失效。

   对于因 `CLAUDE.md` 指令而标记的问题，代理应复核 `CLAUDE.md` 是否确实明确指出了该问题。

2. **使用下方的渐进式阈值表筛选问题** - 影响越大的问题，通过筛选所需的置信度越低：

   | 影响评分 | 最低置信度要求 | 理由 |
   |--------------|----------------------------|-----------|
   | 81-100（严重） | 50 | 即使只有中等置信度，严重问题也值得调查 |
   | 61-80（高） | 65 | 高影响问题需要较高的置信度，以避免误报 |
   | 41-60（中） | 75 | 中等影响问题需要高置信度，才值得处理 |
   | 21-40（中低） | 85 | 中低影响问题需要非常高的置信度 |
   | 0-20（低） | 95 | 仅在几乎完全确定时才纳入轻微问题 |

   **筛除所有未达到其影响级别所要求的最低置信度阈值的问题。** 如果没有任何问题符合此标准，则不要继续。

   **重要：请勿针对以下问题发布行内评论：**
   - **低于已配置的 `MIN_IMPACT` 级别的问题** - 影响评分低于 `MIN_IMPACT_SCORE`（根据 `--min-impact` 参数解析，默认值：`high` / 61）的任何问题都必须排除。
   - **低置信度问题** - 任何低于其影响级别最低置信度阈值的问题都应完全排除。

将行内评论聚焦于影响级别达到或高于 `MIN_IMPACT` 且满足置信度阈值的问题。

3. 使用 Haiku 智能体重复执行阶段 1 中的资格检查，以确保拉取请求仍然符合代码审查条件。（以防审查开始后又有更新）
4. **仅发布行内评论**（如果未发现问题则跳过）：

   a. **首选方法 - 如果可用，使用 MCP GitHub 工具**：
      - 针对每个单独的问题，使用 `mcp__github_inline_comment__create_inline_comment` 提供特定于行的反馈。

   b. 备用方法 - 使用直接 API 调用：
      - 首先，通过读取 `git:attach-review-to-pr` 命令来检查该命令是否可用。
      - 如果该命令可用且发现了问题：
         - **多个问题**：使用 `gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews` 创建包含特定于行的评论的审查。
         - **单个问题**：使用 `gh api repos/{owner}/{repo}/pulls/{pr_number}/comments` 仅添加一条特定于行的评论。

   撰写评论时，请注意：
   - 保持输出简洁
   - 使用表情符号
   - 链接并引用相关代码、文件和 URL

#### 阶段 3 中的误报示例

- 预先存在的问题
- 看起来像错误但实际上并非错误的内容
- 资深工程师不会指出的吹毛求疵问题
- 能被代码检查器、类型检查器或编译器发现的问题（例如缺失或不正确的导入、类型错误、测试损坏、格式问题、换行符等吹毛求疵的风格问题）。无需自行运行这些构建步骤——可以放心假设它们会作为 CI 的一部分单独运行。
- 一般性的代码质量问题（例如缺乏测试覆盖率、一般性的安全问题、文档质量差），除非 CLAUDE.md 中明确要求
- CLAUDE.md 中指出但在代码中被明确忽略的问题（例如通过代码检查忽略注释）
- 可能是有意为之或与更广泛的变更直接相关的功能变更
- 确实存在但位于用户未在其拉取请求中修改的行上的问题

注意：

- 如果可以使用构建、代码检查和测试命令，请使用它们。它们可以帮助你发现仅通过代码变更不易察觉的潜在问题。
- 使用 `gh` 与 Github 交互（例如获取拉取请求或创建行内评论），而不是使用网页抓取
- 首先创建待办事项列表
- 你必须引用并链接每个错误（例如，如果提到 CLAUDE.md，则必须提供其链接）
- 使用特定于行的评论时（通过 `git:attach-review-to-pr`）：
  - 每个问题都应映射到特定文件和行号
  - 对于多个问题：使用 `gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews`，并提供包含审查正文（质量门禁摘要）和评论数组（特定于行的问题）的 JSON 输入
  - 对于单个问题：使用 `gh api repos/{owner}/{repo}/pulls/{pr_number}/comments` 仅发布一条特定于行的评论

### 特定于行的审查评论模板

使用 `git:attach-review-to-pr` 命令添加特定于行的评论时，请对每个问题使用此模板：

```markdown
🔴/🟠/🟡/🟢 [Critical/High/Medium/Low]: [Brief description]

[Evidence: Explain what code pattern/behavior was observed that indicates this issue and the consequence if left unfixed]

[If applicable, provide code suggestion]:
```suggestion
[code here]
```

```

#### Bug 问题示例

```markdown
🟠 High: Potential null pointer dereference

Variable `user` is accessed without null check after fetching from database. This will cause runtime error if user is not found, breaking the user profile feature.

```suggestion
if (!user) {
  throw new Error('User not found');
}
```

```

#### 安全问题示例

```markdown
🔴 Critical: SQL Injection vulnerability

User input is directly concatenated into SQL query without sanitization. Attackers can execute arbitrary SQL commands, leading to data breach or deletion.

Use parameterized queries instead:
```suggestion
db.query('SELECT * FROM users WHERE id = ?', [userId])
```

```

### 使用 GitHub API 发表行内评论的模板

#### 多个问题（使用 `/reviews` 端点）

使用 `gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews` 时，`comments` 数组中的每条评论都使用上述针对特定行的模板（问题类别、证据、影响/严重程度、置信度、建议的修复方案）。

#### 单个问题（使用 `/comments` 端点）

使用 `gh api repos/{owner}/{repo}/pulls/{pr_number}/comments` 时，仅使用上述模板发布一条针对特定行的评论。

**链接到代码时的注意事项：**

- 使用完整的 git sha + 行范围，例如 `https://github.com/owner/repo/blob/1d54823877c4de72b2316a64032a54afc404e619/README.md#L13-L17`
- 行范围格式为 `L[start]-L[end]`
- 前后各提供至少 1 行上下文

**评估说明：**

- **安全优先**：任何 High 或 Critical 级别的安全问题都会自动成为阻塞项
- **一切都要量化**：使用数字，不要使用 "some"、"many"、"few" 等词语
- **在大型 PR（>500 行）中跳过琐碎问题**：重点关注架构和安全问题

#### 如果未发现任何问题

不要发布任何评论。只需向用户报告未发现问题。

## 请记住

目标是发现 Bug 和安全问题，在保持开发速度的同时提升代码质量，而不是追求完美。审查应全面但务实，重点关注对代码安全性和可维护性真正重要的问题。