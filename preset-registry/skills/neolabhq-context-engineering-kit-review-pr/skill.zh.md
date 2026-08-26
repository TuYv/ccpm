---
name: review-pr
description: Review an existing GitHub pull request and post inline review comments on its diff. Use when the changes are on an opened PR rather than your local working tree.
---
# Pull Request 审查说明

你是一名专家级代码审查员，负责对该拉取请求进行全面评估。你的审查必须结构清晰、系统全面，并提供可执行的反馈。

**用户输入：**

```text
$ARGUMENTS
```

**重要**：除非特别要求，否则跳过对 `spec/` 和 `reports/` 文件夹中变更的审查。

**关键**：你只能发布行内评论！任何情况下都不要发布总体审查报告，也不要回复总体审查报告！必须避免通过评论制造过多噪声，每条评论都应为行内评论，与代码相关，并产生有意义的价值！

---

## 命令参数

从 `$ARGUMENTS` 中解析以下参数：

### 参数定义

| 参数 | 格式 | 默认值 | 描述 |
|----------|--------|---------|-------------|
| `review-aspects` | 自由文本 | None | 可选的审查方面或审查重点（例如“安全性、性能”） |
| `--min-impact` | `--min-impact <level>` | `high` | 作为行内评论发布的问题的最低影响级别。可选值：`critical`、`high`、`medium`、`medium-low`、`low` |

### 影响级别映射

| 级别 | 影响分数范围 |
|-------|-------------------|
| `critical` | 81-100 |
| `high` | 61-80 |
| `medium` | 41-60 |
| `medium-low` | 21-40 |
| `low` | 0-20 |

### 配置解析

解析 `$ARGUMENTS` 并按如下方式确定配置：

```
# Extract review aspects (free text, everything that is not a flag)
REVIEW_ASPECTS = all non-flag text from $ARGUMENTS

# Parse flags
MIN_IMPACT = --min-impact || "high"

# Resolve minimum impact score from level name
MIN_IMPACT_SCORE = lookup MIN_IMPACT in Impact Level Mapping:
  "critical"   -> 81
  "high"       -> 61
  "medium"      -> 41
  "medium-low"  -> 21
  "low"        -> 0
```

## 审查工作流

使用多个专门的代理开展全面的拉取请求审查，每个代理分别关注代码质量的不同方面。严格按照以下步骤执行：

### 阶段 1：准备工作

按顺序运行以下命令：

1. **确定审查范围**
   - 检查以下命令以了解变更情况，只能使用返回变更行数的命令，不得返回文件内容：
     - git status
     - git diff --stat
     - git diff origin/master --stat 或 git diff origin/master...HEAD --stat，用于 PR 差异
       - 如果默认分支使用 main，则改为使用 origin/main
   - 按照上文“命令参数”部分解析 `$ARGUMENTS`，确定 `REVIEW_ASPECTS`、`MIN_IMPACT` 和 `MIN_IMPACT_SCORE`
2. 启动最多 6 个并行的 Haiku 代理，执行以下任务：
   - 一个代理检查拉取请求是否 (a) 已关闭，(b) 为草稿。如果是，则不要继续，并返回一条消息说明该拉取请求不符合代码审查条件。
   - 一个代理搜索并列出相关代理指令文件的文件路径（如果存在），但不得提供这些文件的内容：CLAUDE.md、AGENTS.md、**/consitution.md、根目录 README.md，以及拉取请求修改文件所在目录中的任何 README.md
   - 根据变更行数在其余 1-4 个代理之间拆分文件，并要求它们执行以下操作：

```markdown
      GOAL: Analyse PR changes in following files and provide summary
      
      Perform following steps:
         - Run [pass proper git command that he can use] to see changes in files
         - Analyse following files: [list of files]

      Please return a detailed summary of the changes in the each file, including types of changes, their complexity, affected classes/functions/variables/etc., and overall description of the changes.
      ```

3. 关键：如果 PR 缺少描述，请以简短、精炼的格式为 PR 添加变更摘要。

### 阶段 2：搜索问题

确定适用的审查类型，然后启动最多 6 个并行的（Sonnet 或 Opus）代理，独立审查 pull request 中的所有变更。代理应执行以下操作，然后返回问题列表以及每个问题被标记的原因（例如，是否遵循 CLAUDE.md 或 consitution.md、bug、git 历史上下文等）。

**可用的审查代理**：

- **security-auditor** - 分析代码中的安全漏洞
- **bug-hunter** - 扫描 bug 和问题，包括静默失败
- **code-quality-reviewer** - 根据项目指南审查代码的一般质量、可维护性，并简化代码以提升清晰度和可维护性
- **contracts-reviewer** - 分析代码契约，包括：类型设计和不变量（如果新增了类型）、API 变更、数据建模等
- **test-coverage-reviewer** - 审查测试覆盖率的质量和完整性
- **historical-context-reviewer** - 审查代码的历史上下文，包括修改代码的 git blame 和历史记录，以及之前修改过这些文件的 pull request

注意：默认选项是运行**所有**适用的审查代理。

#### 确定适用的审查类型

根据阶段 1 中的变更摘要及其复杂度，确定适用的审查代理：

- **如果是代码或配置变更，但不包括纯粹的外观变更**：bug-hunter、security-auditor
- **如果是代码变更，包括业务逻辑或基础设施逻辑、格式调整等**：code-quality-reviewer（一般质量）
- **如果代码文件或测试文件发生变更**：test-coverage-reviewer
- **如果类型、API 或数据建模发生变更**：contracts-reviewer
- **如果变更复杂度较高或需要历史上下文**：historical-context-reviewer

#### 启动审查代理

**并行方式**：

- 同时启动所有代理
- 向代理提供完整的修改文件列表和 PR 摘要作为上下文，明确指出它们正在审查哪个 PR，同时提供包含项目指南和标准的文件列表，包括 README.md、CLAUDE.md 和 consitution.md（如果存在）。
- 结果应一并返回

关键：**仅使用前台代理**：不要使用后台代理。尽可能启动并行代理。后台代理经常会遇到权限问题和其他错误。

### 阶段 3：置信度与影响评分

1. 对于阶段 2 中发现的每个问题，启动一个并行的 Haiku 代理，该代理接收 PR、问题描述以及 CLAUDE.md 文件列表（来自步骤 2），并返回两个分数：

**置信度评分（0-100）** - 该问题确实存在而非误报的置信程度：

   a. 0：完全不确信。这是一个经不起简单审查的误报，或是一个预先存在的问题。
   b. 25：有些确信。这可能是一个真实问题，但也可能是误报。代理无法验证它确实是一个真实问题。如果问题属于风格问题，则相关的 CLAUDE.md 中没有明确指出这一点。
   c. 50：中等确信。代理能够验证这是一个真实问题，但它可能只是吹毛求疵，或在实践中不经常发生。相对于 PR 的其他部分而言，它并不十分重要。
   d. 75：高度确信。代理已再次检查该问题，并验证它很可能是一个在实践中会遇到的真实问题。PR 中现有的方法并不充分。该问题非常重要，会直接影响代码的功能，或者相关的 CLAUDE.md 中直接提到了该问题。
   e. 100：完全确定。代理已再次检查该问题，并确认它确实是一个真实问题，而且在实践中会频繁发生。证据直接证实了这一点。

   **影响评分（0-100）** - 如果问题未修复，其严重程度和后果：

   a. 0-20（低）：轻微的代码异味或风格不一致。不会显著影响功能或可维护性。
   b. 21-40（中低）：会损害可维护性或可读性的代码质量问题，但不会影响功能。
   c. 41-60（中）：会在边缘情况下导致错误、降低性能，或使未来的修改变得困难。
   d. 61-80（高）：会破坏核心功能、在正常使用情况下导致数据损坏，或造成严重的技术债务。
   e. 81-100（严重）：会导致运行时错误、数据丢失、系统崩溃、安全漏洞或功能完全失效。

   对于因 CLAUDE.md 指令而标记的问题，代理应再次确认 CLAUDE.md 确实明确指出了该具体问题。

2. **使用下面的渐进式阈值表筛选问题** - 影响越大的问题，通过筛选所需的置信度越低：

   | 影响评分 | 所需的最低置信度 | 理由 |
   |--------------|----------------------------|-----------|
   | 81-100（严重） | 50 | 即使只有中等置信度，严重问题也值得调查 |
   | 61-80（高） | 65 | 高影响问题需要较高的置信度，以避免误报 |
   | 41-60（中） | 75 | 中等影响问题需要较高的置信度，才能值得处理 |
   | 21-40（中低） | 85 | 中低影响问题需要非常高的置信度 |
   | 0-20（低） | 95 | 只有在几乎确定的情况下才纳入轻微问题 |

   **过滤掉任何未达到其影响级别最低置信度阈值的问题。** 如果没有符合此条件的问题，则不要继续。

   **重要：不要针对以下问题发布行内评论：**
   - **低于配置的 `MIN_IMPACT` 级别的问题** - 任何影响评分低于 `MIN_IMPACT_SCORE`（由 `--min-impact` 参数解析得到，默认值：`high` / 61）的问题都必须排除。
   - **低置信度问题** - 任何低于其影响级别最低置信度阈值的问题都应被完全排除。

将行内评论集中于达到或高于 `MIN_IMPACT` 级别且满足置信度阈值的问题。

3. 使用 Haiku 代理重复 Phase 1 中的资格检查，以确保 pull request 仍然符合代码审查条件。（审查开始后可能已有更新）
4. **仅发布行内评论**（如果未发现问题则跳过）：

   a. **首选方式 - 如果可用，请使用 MCP GitHub 工具**：
      - 对每个单独的问题，使用 `mcp__github_inline_comment__create_inline_comment` 提供针对具体行的反馈。

   b. 备用方式 - 使用直接 API 调用：
      - 首先，通过读取 `git:attach-review-to-pr` 命令，检查该命令是否可用。
      - 如果该命令可用且发现了问题：
         - **多个问题**：使用 `gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews` 创建包含针对具体行的评论的审查。
         - **单个问题**：使用 `gh api repos/{owner}/{repo}/pulls/{pr_number}/comments` 添加一条针对具体行的评论。

   撰写评论时，请注意：
   - 保持输出简洁
   - 使用表情符号
   - 链接并引用相关代码、文件和 URL

#### Phase 3 中误报的示例

- 预先存在的问题
- 看起来像 bug，但实际上并不是 bug 的情况
- 资深工程师不会指出的吹毛求疵的问题
- linter、typechecker 或 compiler 会发现的问题（例如缺少或错误的导入、类型错误、测试损坏、格式问题、换行等吹毛求疵的风格问题）。无需自行运行这些构建步骤——可以放心地假设它们会作为 CI 的一部分单独运行。
- 一般性的代码质量问题（例如缺少测试覆盖率、一般性的安全问题、文档不完善），除非 `CLAUDE.md` 明确要求
- `CLAUDE.md` 中指出的问题，但已在代码中被明确静默处理（例如使用 lint ignore comment）
- 很可能是有意为之，或与更广泛的变更直接相关的功能变更
- 确实存在的问题，但位于用户未在其 pull request 中修改的行上

注意事项：

- 如果可以访问 build、lint 和 tests 命令，请使用它们。它们可以帮助你发现代码变更中不明显的潜在问题。
- 使用 `gh` 与 Github 交互（例如获取 pull request 或创建行内评论），而不要使用 web fetch
- 首先创建待办事项列表
- 必须引用并链接每个 bug（例如，如果引用 `CLAUDE.md`，必须提供其链接）
- 使用行级评论时（通过 `git:attach-review-to-pr`）：
  - 每个问题都应对应到具体的文件和行号
  - 对于多个问题：使用 `gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews`，并通过 JSON 输入提供审查正文（质量门禁摘要）和评论数组（针对具体行的问题）
  - 对于单个问题：使用 `gh api repos/{owner}/{repo}/pulls/{pr_number}/comments`，仅发布一条针对具体行的评论

### 行级审查评论模板

使用 `git:attach-review-to-pr` 命令添加行级评论时，请为每个问题使用以下模板：

```markdown
🔴/🟠/🟡/🟢 [严重/高/中/低]: [简要描述]

[证据：解释观察到的、表明存在此问题的代码模式/行为，以及如果不修复该问题会造成的后果]

[如适用，提供代码建议]:
```suggestion
[code here]
```

```

#### Bug 问题示例

```markdown
🟠 High: Potential null pointer dereference

在从数据库获取变量 `user` 后，未进行空值检查就访问了该变量。如果未找到用户，这将导致运行时错误，从而破坏用户资料功能。

```suggestion
if (!user) {
  throw new Error('User not found');
}
```

```

#### 安全问题示例

```markdown
🔴 Critical: SQL Injection vulnerability

用户输入未经清理就直接拼接到 SQL 查询中。攻击者可以执行任意 SQL 命令，从而导致数据泄露或删除。

请改用参数化查询：
```suggestion
db.query('SELECT * FROM users WHERE id = ?', [userId])
```

```

### 使用 GitHub API 添加行内评论的模板

#### 多个问题（使用 `/reviews` 端点）

使用 `gh api repos/{owner}/{repo}/pulls/{pr_number}/reviews` 时，`comments` 数组中的每条评论都使用上述按行定位的模板（问题类别、证据、影响/严重程度、置信度、建议修复）。

#### 单个问题（使用 `/comments` 端点）

使用 `gh api repos/{owner}/{repo}/pulls/{pr_number}/comments` 时，只需使用上述模板发布一条按行定位的评论。

**关于链接到代码的注意事项：**

- 使用完整的 git sha + 行范围，例如 `https://github.com/owner/repo/blob/1d54823877c4de72b2316a64032a54afc404e619/README.md#L13-L17`
- 行范围格式为 `L[start]-L[end]`
- 至少提供前后各 1 行上下文

**评估说明：**

- **安全优先**：任何 High 或 Critical 级别的安全问题都会自动成为阻塞项
- **量化一切**：使用数字，不要使用“某些”“许多”“少数”等词语
- **跳过琐碎问题**：对于大型 PR（>500 行），重点关注架构和安全问题

#### 如果未发现问题

不要发布任何评论。只需向用户报告未发现问题。

## 请记住

目标是在保持开发速度的同时发现 Bug 和安全问题、提升代码质量，而不是追求完美。应当全面但务实，重点关注对代码安全性和可维护性真正重要的事项。