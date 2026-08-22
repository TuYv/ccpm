---
name: apply-anthropic-skill-best-practices
description: Comprehensive guide for skill development based on Anthropic's official best practices - use for complex skills requiring detailed structure
argument-hint: Optional skill name or path to skill being reviewed
---
# Anthropic 官方技能编写最佳实践

将 Anthropic 官方技能编写最佳实践应用于你的技能。

优秀的技能应当简洁、结构清晰，并经过实际使用测试。本指南提供实用的编写建议，帮助你编写 Claude 能够有效发现和使用的技能。

## 核心原则

### 技能元数据

技能中的每个词元并不会立即产生开销。启动时，只会预加载所有技能的元数据（名称和描述）。Claude 仅在技能变得相关时读取 SKILL.md，并且仅在需要时读取其他文件。不过，保持 SKILL.md 简洁仍然很重要：Claude 一旦加载它，其中的每个词元都会与对话历史及其他上下文争夺上下文空间。

### 使用你计划采用的所有模型进行测试

技能是对模型能力的补充，因此其有效性取决于底层模型。请使用你计划搭配该技能使用的所有模型进行测试。

**不同模型的测试注意事项**：

- **Claude Haiku**（快速、经济）：该技能是否提供了足够的指导？
- **Claude Sonnet**（均衡）：该技能是否清晰且高效？
- **Claude Opus**（推理能力强）：该技能是否避免了过度解释？

对 Opus 完美有效的内容，可能需要为 Haiku 提供更多细节。如果你计划在多个模型中使用该技能，应尽量编写适用于所有模型的说明。

## 技能结构

<Note>
  **YAML 前置元数据**：SKILL.md 前置元数据支持两个字段：

- `name` - 技能的易读名称（最多 64 个字符）
- `description` - 单行描述技能的用途及其适用时机（最多 1024 个字符）

  有关完整的技能结构详情，请参阅[技能概述](docs.claude.com/en/docs/agents-and-tools/agent-skills/overview#skill-structure)。
</Note>

### 命名约定

使用一致的命名模式，使技能更易于引用和讨论。我们建议技能名称使用**动名词形式**（动词 + -ing），因为这种形式能够清晰描述技能提供的活动或能力。

**良好的命名示例（动名词形式）**：

- "处理 PDF"
- "分析电子表格"
- "管理数据库"
- "测试代码"
- "编写文档"

**可接受的替代形式**：

- 名词短语："PDF 处理"、"电子表格分析"
- 行动导向："处理 PDF"、"分析电子表格"

**应避免**：

- 含糊的名称："助手"、"实用工具"、"工具"
- 过于宽泛的名称："文档"、"数据"、"文件"
- 在技能集合中使用不一致的命名模式

一致的命名可以让你更轻松地：

- 在文档和对话中引用技能
- 一眼了解技能的作用
- 组织和搜索多个技能
- 维护专业且风格统一的技能库

### 编写有效的描述

`description` 字段用于支持技能发现，应同时包含技能的作用及其适用时机。

<Warning>
  **始终使用第三人称进行编写**。描述会被注入系统提示词，不一致的叙述视角可能导致发现问题。

- **推荐：**“处理 Excel 文件并生成报告”
- **避免：**“我可以帮助你处理 Excel 文件”
- **避免：**“你可以使用它来处理 Excel 文件”
</Warning>

**描述要具体，并包含关键术语**。既要说明 Skill 的功能，也要说明应在何种具体触发条件或场景下使用它。

每个 Skill 只能有一个描述字段。描述对于 Skill 选择至关重要：Claude 使用它从可能多达 100 个以上的可用 Skill 中选择正确的 Skill。你的描述必须提供足够的细节，让 Claude 知道何时应选择此 Skill，而 SKILL.md 的其余部分则提供实现细节。

有效示例：

**PDF 处理 Skill：**

```yaml  theme={null}
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

**Excel 分析 Skill：**

```yaml  theme={null}
description: Analyze Excel spreadsheets, create pivot tables, generate charts. Use when analyzing Excel files, spreadsheets, tabular data, or .xlsx files.
```

**Git 提交助手 Skill：**

```yaml  theme={null}
description: Generate descriptive commit messages by analyzing git diffs. Use when the user asks for help writing commit messages or reviewing staged changes.
```

避免使用如下模糊描述：

```yaml  theme={null}
description: Helps with documents
```

```yaml  theme={null}
description: Processes data
```

```yaml  theme={null}
description: Does stuff with files
```

### 渐进式披露模式

SKILL.md 用作概览，并根据需要将 Claude 引导至详细资料，就像入门指南中的目录一样。有关渐进式披露工作原理的说明，请参阅概览中的[Skill 的工作原理](docs.claude.com/en/docs/agents-and-tools/agent-skills/overview#how-skills-work)。

**实用指南：**

- 为获得最佳性能，请将 SKILL.md 正文控制在 500 行以内
- 接近此限制时，将内容拆分到单独的文件中
- 使用以下模式有效组织说明、代码和资源

#### 可视化概览：从简单到复杂

一个基础 Skill 起初只包含一个具有元数据和说明的 SKILL.md 文件：

<img src="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=87782ff239b297d9a9e8e1b72ed72db9" alt="显示 YAML 前置元数据和 Markdown 正文的简单 SKILL.md 文件" data-og-width="2048" width="2048" data-og-height="1153" height="1153" data-path="images/agent-skills-simple-file.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=280&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=c61cc33b6f5855809907f7fda94cd80e 280w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=560&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=90d2c0c1c76b36e8d485f49e0810dbfd 560w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=840&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=ad17d231ac7b0bea7e5b4d58fb4aeabb 840w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=1100&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=f5d0a7a3c668435bb0aee9a3a8f8c329 1100w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=1650&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=0e927c1af9de5799cfe557d12249f6e6 1650w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-simple-file.png?w=2500&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=46bbb1a51dd4c8202a470ac8c80a893d 2500w" />

随着 Skill 不断扩展，你可以将额外内容打包在其中，仅在需要时由 Claude 加载：

<img src="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=a5e0aa41e3d53985a7e3e43668a33ea3" alt="打包 reference.md 和 forms.md 等额外参考文件。" data-og-width="2048" width="2048" data-og-height="1327" height="1327" data-path="images/agent-skills-bundling-content.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=280&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=f8a0e73783e99b4a643d79eac86b70a2 280w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=560&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=dc510a2a9d3f14359416b706f067904a 560w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=840&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=82cd6286c966303f7dd914c28170e385 840w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=1100&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=56f3be36c77e4fe4b523df209a6824c6 1100w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=1650&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=d22b5161b2075656417d56f41a74f3dd 1650w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-bundling-content.png?w=2500&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=3dd4bdd6850ffcc96c6c45fcb0acd6eb 2500w" />

完整的 Skill 目录结构可能如下所示：

```
pdf/
├── SKILL.md              # Main instructions (loaded when triggered)
├── FORMS.md              # Form-filling guide (loaded as needed)
├── reference.md          # API reference (loaded as needed)
├── examples.md           # Usage examples (loaded as needed)
└── scripts/
    ├── analyze_form.py   # Utility script (executed, not loaded)
    ├── fill_form.py      # Form filling script
    └── validate.py       # Validation script
```

#### 模式 1：包含参考资料的高层级指南

````markdown  theme={null}
---
name: PDF Processing
description: Extracts text and tables from PDF files, fills forms, and merges documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
---

# PDF Processing

## Quick start

Extract text with pdfplumber:
```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

## Advanced features

**Form filling**: See [FORMS.md](FORMS.md) for complete guide
**API reference**: See [REFERENCE.md](REFERENCE.md) for all methods
**Examples**: See [EXAMPLES.md](EXAMPLES.md) for common patterns
````

Claude 仅在需要时加载 FORMS.md、REFERENCE.md 或 EXAMPLES.md。

#### 模式 2：按领域组织

对于涉及多个领域的 Skill，应按领域组织内容，以避免加载无关的上下文。当用户询问销售指标时，Claude 只需读取与销售相关的 schema，而不需要读取财务或营销数据。这样可以减少 token 使用量，并使上下文保持聚焦。

```
bigquery-skill/
├── SKILL.md (overview and navigation)
└── reference/
    ├── finance.md (revenue, billing metrics)
    ├── sales.md (opportunities, pipeline)
    ├── product.md (API usage, features)
    └── marketing.md (campaigns, attribution)
```

````markdown SKILL.md theme={null}
# BigQuery Data Analysis

## Available datasets

**Finance**: Revenue, ARR, billing → See [reference/finance.md](reference/finance.md)
**Sales**: Opportunities, pipeline, accounts → See [reference/sales.md](reference/sales.md)
**Product**: API usage, features, adoption → See [reference/product.md](reference/product.md)
**Marketing**: Campaigns, attribution, email → See [reference/marketing.md](reference/marketing.md)

## Quick search

Find specific metrics using grep:

```bash
grep -i "revenue" reference/finance.md
grep -i "pipeline" reference/sales.md
grep -i "api usage" reference/product.md
```
````

#### 模式 3：条件性详细信息

显示基本内容，并链接到高级内容：

```markdown  theme={null}
# DOCX Processing

## Creating documents

Use docx-js for new documents. See [DOCX-JS.md](DOCX-JS.md).

## Editing documents

For simple edits, modify the XML directly.

**For tracked changes**: See [REDLINING.md](REDLINING.md)
**For OOXML details**: See [OOXML.md](OOXML.md)
```

仅当用户需要这些功能时，Claude 才会读取 REDLINING.md 或 OOXML.md。

### 避免深层嵌套的引用

当文件由其他被引用的文件引用时，Claude 可能只会读取部分内容。遇到嵌套引用时，Claude 可能会使用 `head -100` 等命令预览内容，而不是读取整个文件，从而导致获取的信息不完整。

**将引用保持在距离 SKILL.md 一层的位置**。所有引用文件都应直接从 SKILL.md 链接，以确保 Claude 在需要时读取完整文件。

**错误示例：层级太深**：

```markdown  theme={null}
# SKILL.md
See [advanced.md](advanced.md)...

# advanced.md
See [details.md](details.md)...

# details.md
Here's the actual information...
```

**正确示例：仅一层**：

```markdown  theme={null}
# SKILL.md

**Basic usage**: [instructions in SKILL.md]
**Advanced features**: See [advanced.md](advanced.md)
**API reference**: See [reference.md](reference.md)
**Examples**: See [examples.md](examples.md)
```

### 使用目录组织较长的引用文件

对于超过 100 行的引用文件，请在顶部添加目录。这样即使 Claude 通过部分读取进行预览，也能看到所有可用信息的完整范围。

**示例**：

```markdown  theme={null}
# API Reference

## Contents
- Authentication and setup
- Core methods (create, read, update, delete)
- Advanced features (batch operations, webhooks)
- Error handling patterns
- Code examples

## Authentication and setup
...

## Core methods
...
```

随后，Claude 可以根据需要读取完整文件或跳转到特定章节。

有关这种基于文件系统的架构如何实现渐进式披露的详细信息，请参阅下方高级部分中的[运行时环境](#runtime-environment)章节。

## 工作流与反馈循环

### 对复杂任务使用工作流

将复杂操作拆分为清晰、有序的步骤。对于特别复杂的工作流，提供一份 Claude 可以复制到响应中并随着进展逐项勾选的清单。

**示例 1：研究综合工作流**（适用于不含代码的 Skills）：

````markdown  theme={null}
## Research synthesis workflow

Copy this checklist and track your progress:

```
Research Progress:
- [ ] Step 1: Read all source documents
- [ ] Step 2: Identify key themes
- [ ] Step 3: Cross-reference claims
- [ ] Step 4: Create structured summary
- [ ] Step 5: Verify citations
```

**Step 1: Read all source documents**

Review each document in the `sources/` directory. Note the main arguments and supporting evidence.

**Step 2: Identify key themes**

Look for patterns across sources. What themes appear repeatedly? Where do sources agree or disagree?

**Step 3: Cross-reference claims**

For each major claim, verify it appears in the source material. Note which source supports each point.

**Step 4: Create structured summary**

Organize findings by theme. Include:
- Main claim
- Supporting evidence from sources
- Conflicting viewpoints (if any)

**Step 5: Verify citations**

Check that every claim references the correct source document. If citations are incomplete, return to Step 3.
````

此示例说明了如何将工作流应用于不需要代码的分析任务。清单模式适用于任何复杂的多步骤流程。

**示例 2：PDF 表单填写工作流**（适用于含代码的 Skills）：

````markdown  theme={null}
## PDF form filling workflow

Copy this checklist and check off items as you complete them:

```
Task Progress:
- [ ] Step 1: Analyze the form (run analyze_form.py)
- [ ] Step 2: Create field mapping (edit fields.json)
- [ ] Step 3: Validate mapping (run validate_fields.py)
- [ ] Step 4: Fill the form (run fill_form.py)
- [ ] Step 5: Verify output (run verify_output.py)
```

**Step 1: Analyze the form**

Run: `python scripts/analyze_form.py input.pdf`

This extracts form fields and their locations, saving to `fields.json`.

**Step 2: Create field mapping**

Edit `fields.json` to add values for each field.

**Step 3: Validate mapping**

Run: `python scripts/validate_fields.py fields.json`

Fix any validation errors before continuing.

**Step 4: Fill the form**

Run: `python scripts/fill_form.py input.pdf fields.json output.pdf`

**Step 5: Verify output**

Run: `python scripts/verify_output.py output.pdf`

If verification fails, return to Step 2.
````

清晰的步骤可以防止 Claude 跳过关键的验证环节。清单有助于 Claude 和你跟踪多步骤工作流的进展。

### 实现反馈循环

**常见模式**：运行验证器 → 修复错误 → 重复

此模式可以显著提高输出质量。

**示例 1：风格指南合规性**（适用于不含代码的 Skills）：

```markdown  theme={null}
## Content review process

1. Draft your content following the guidelines in STYLE_GUIDE.md
2. Review against the checklist:
   - Check terminology consistency
   - Verify examples follow the standard format
   - Confirm all required sections are present
3. If issues found:
   - Note each issue with specific section reference
   - Revise the content
   - Review the checklist again
4. Only proceed when all requirements are met
5. Finalize and save the document
```

这展示了使用参考文档而非脚本的验证循环模式。“验证器”是 STYLE\_GUIDE.md，Claude 通过阅读和比较来执行检查。

**示例 2：文档编辑流程**（适用于包含代码的 Skill）：

```markdown  theme={null}
## Document editing process

1. Make your edits to `word/document.xml`
2. **Validate immediately**: `python ooxml/scripts/validate.py unpacked_dir/`
3. If validation fails:
   - Review the error message carefully
   - Fix the issues in the XML
   - Run validation again
4. **Only proceed when validation passes**
5. Rebuild: `python ooxml/scripts/pack.py unpacked_dir/ output.docx`
6. Test the output document
```

验证循环能够及早发现错误。

## 内容指南

### 避免时效性信息

不要包含会过时的信息：

**反面示例：具有时效性**（将变得不再正确）：

```markdown  theme={null}
If you're doing this before August 2025, use the old API.
After August 2025, use the new API.
```

**正面示例**（使用“旧模式”章节）：

```markdown  theme={null}
## Current method

Use the v2 API endpoint: `api.example.com/v2/messages`

## Old patterns

<details>
<summary>Legacy v1 API (deprecated 2025-08)</summary>

The v1 API used: `api.example.com/v1/messages`

This endpoint is no longer supported.
</details>
```

旧模式章节能够提供历史背景，同时避免主内容显得杂乱。

### 使用一致的术语

选择一个术语，并在整个 Skill 中始终使用它：

**正面示例——一致**：

- 始终使用“API 端点”
- 始终使用“字段”
- 始终使用“提取”

**反面示例——不一致**：

- 混用“API 端点”“URL”“API 路由”“路径”
- 混用“字段”“框”“元素”“控件”
- 混用“提取”“拉取”“获取”“检索”

一致性有助于 Claude 理解并遵循指令。

## 常见模式

### 模板模式

为输出格式提供模板。根据你的需求选择相应的严格程度。

**适用于严格要求**（例如 API 响应或数据格式）：

````markdown  theme={null}
## Report structure

ALWAYS use this exact template structure:

```markdown
# [Analysis Title]

## Executive summary
[One-paragraph overview of key findings]

## Key findings
- Finding 1 with supporting data
- Finding 2 with supporting data
- Finding 3 with supporting data

## Recommendations
1. Specific actionable recommendation
2. Specific actionable recommendation
```
````

**适用于灵活指导**（有必要进行调整时）：

````markdown  theme={null}
## Report structure

Here is a sensible default format, but use your best judgment based on the analysis:

```markdown
# [Analysis Title]

## Executive summary
[Overview]

## Key findings
[Adapt sections based on what you discover]

## Recommendations
[Tailor to the specific context]
```

Adjust sections as needed for the specific analysis type.
````

### 示例模式

对于输出质量取决于示例的 Skill，应像常规提示一样提供输入/输出对：

````markdown  theme={null}
## Commit message format

Generate commit messages following these examples:

**Example 1:**
Input: Added user authentication with JWT tokens
Output:
```
feat(auth): implement JWT-based authentication

Add login endpoint and token validation middleware
```

**Example 2:**
Input: Fixed bug where dates displayed incorrectly in reports
Output:
```
fix(reports): correct date formatting in timezone conversion

Use UTC timestamps consistently across report generation
```

**Example 3:**
Input: Updated dependencies and refactored error handling
Output:
```
chore: update dependencies and refactor error handling

- Upgrade lodash to 4.17.21
- Standardize error response format across endpoints
```

Follow this style: type(scope): brief description, then detailed explanation.
````

相比单纯的描述，示例能帮助 Claude 更清晰地理解所需的风格和详细程度。

### 条件式工作流模式

引导 Claude 完成各个决策点：

```markdown  theme={null}
## Document modification workflow

1. Determine the modification type:

   **Creating new content?** → Follow "Creation workflow" below
   **Editing existing content?** → Follow "Editing workflow" below

2. Creation workflow:
   - Use docx-js library
   - Build document from scratch
   - Export to .docx format

3. Editing workflow:
   - Unpack existing document
   - Modify XML directly
   - Validate after each change
   - Repack when complete
```

<Tip>
  如果工作流包含许多步骤，变得庞大或复杂，请考虑将其拆分到单独的文件中，并告诉 Claude 根据当前任务读取相应的文件。
</Tip>

## 评估与迭代

### 先构建评估

**在编写大量文档之前创建评估。** 这样可以确保你的 Skill 解决的是真实问题，而不是为设想出来的问题编写文档。

**评估驱动开发：**

1. **识别缺口**：在没有 Skill 的情况下，让 Claude 执行具有代表性的任务。记录具体的失败情况或缺失的上下文
2. **创建评估**：构建三个用于测试这些缺口的场景
3. **建立基线**：衡量 Claude 在没有 Skill 时的表现
4. **编写最少量的说明**：仅创建足以弥补这些缺口并通过评估的内容
5. **迭代**：执行评估，与基线进行比较并加以改进

这种方法可确保你解决的是实际问题，而不是预先设想那些可能永远不会出现的需求。

**评估结构**：

```json  theme={null}
{
  "skills": ["pdf-processing"],
  "query": "Extract all text from this PDF file and save it to output.txt",
  "files": ["test-files/document.pdf"],
  "expected_behavior": [
    "Successfully reads the PDF file using an appropriate PDF processing library or command-line tool",
    "Extracts text content from all pages in the document without missing any pages",
    "Saves the extracted text to a file named output.txt in a clear, readable format"
  ]
}
```

<Note>
  此示例展示了一个使用简单测试标准的数据驱动评估。我们目前未提供运行这些评估的内置方式。用户可以创建自己的评估系统。评估是衡量 Skill 有效性的事实依据。
</Note>

### 与 Claude 迭代开发 Skills

最高效的 Skill 开发流程需要 Claude 本身参与其中。与一个 Claude 实例（“Claude A”）协作创建一个供其他实例（“Claude B”）使用的 Skill。Claude A 帮助你设计和完善指令，而 Claude B 则在实际任务中对其进行测试。这种方式之所以有效，是因为 Claude 模型既了解如何编写有效的智能体指令，也了解智能体需要哪些信息。

**创建新的 Skill：**

1. **在不使用 Skill 的情况下完成任务**：使用常规提示词与 Claude A 一起解决问题。在此过程中，你会自然而然地提供上下文、说明偏好并分享流程知识。留意哪些信息是你反复提供的。

2. **识别可复用的模式**：完成任务后，确定你所提供的哪些上下文信息对未来的类似任务有用。

   **示例**：如果你完成了一项 BigQuery 分析，你可能提供了表名、字段定义、筛选规则（例如“始终排除测试账户”）以及常用查询模式。

3. **让 Claude A 创建 Skill**：“创建一个 Skill，用于记录我们刚才使用的 BigQuery 分析模式。包括表结构、命名约定以及筛除测试账户的规则。”

   <Tip>
     Claude 模型原生理解 Skill 的格式和结构。你不需要特殊的系统提示词或“编写 Skills”的 Skill 来让 Claude 帮助创建 Skills。只需让 Claude 创建一个 Skill，它便会生成结构正确的 SKILL.md 内容，其中包含适当的 frontmatter 和正文内容。
   </Tip>

4. **检查是否简洁**：检查 Claude A 是否添加了不必要的解释。可以提出：“删除关于胜率含义的解释——Claude 已经知道这一点。”

5. **改进信息架构**：让 Claude A 更有效地组织内容。例如：“重新组织这些内容，将表结构放入单独的参考文件中。以后我们可能会添加更多表。”

6. **在类似任务中测试**：让 Claude B（一个已加载该 Skill 的全新实例）在相关用例中使用此 Skill。观察 Claude B 是否能找到正确的信息、正确应用规则并成功完成任务。

7. **根据观察结果迭代**：如果 Claude B 遇到困难或遗漏了某些内容，带着具体情况回到 Claude A：“Claude 使用这个 Skill 时，忘记按日期筛选第四季度的数据。我们是否应该添加一个关于日期筛选模式的章节？”

**迭代现有 Skills：**

改进 Skills 时，同样的分层模式仍然适用。你需要在以下几项工作之间交替进行：

- **与 Claude A 协作**（帮助完善 Skill 的专家）
- **使用 Claude B 进行测试**（使用 Skill 执行实际工作的智能体）
- **观察 Claude B 的行为**，并将获得的见解反馈给 Claude A

1. **在实际工作流中使用 Skill**：向 Claude B（已加载该 Skill）提供真实任务，而不是测试场景

2. **观察 Claude B 的行为**：记录它在哪些方面遇到困难、取得成功或做出意外选择

**观察示例**：“当我让 Claude B 生成区域销售报告时，它编写了查询，却忘记过滤测试账户，尽管 Skill 中提到了这条规则。”

3. **返回 Claude A 进行改进**：分享当前的 SKILL.md 并描述你观察到的情况。询问：“我注意到，当我要求 Claude B 生成区域报告时，它忘记过滤测试账户。Skill 提到了过滤要求，但也许不够醒目？”

4. **审查 Claude A 的建议**：Claude A 可能会建议重新组织内容，使规则更加醒目；使用“MUST filter”这样更强硬的措辞来代替“always filter”；或者重构工作流部分。

5. **应用并测试更改**：根据 Claude A 的改进建议更新 Skill，然后使用类似请求再次测试 Claude B

6. **根据使用情况重复迭代**：在遇到新场景时，继续执行这一观察—改进—测试循环。每次迭代都基于智能体的实际行为而非假设来改进 Skill。

**收集团队反馈：**

1. 与团队成员分享 Skills，并观察他们的使用情况
2. 询问：Skill 是否会在预期情况下激活？说明是否清晰？还缺少什么？
3. 整合反馈，以解决你自身使用模式中的盲点

**这种方法为何有效**：Claude A 了解智能体的需求，你提供领域专业知识，Claude B 通过实际使用暴露不足，而迭代式改进则根据观察到的行为而非假设来完善 Skills。

### 观察 Claude 如何浏览 Skills

在迭代改进 Skills 时，请留意 Claude 在实践中究竟如何使用它们。重点观察：

- **意外的探索路径**：Claude 是否以你未预料到的顺序读取文件？这可能表明你的结构并不像你想象的那样直观
- **遗漏的关联**：Claude 是否没有沿着引用访问重要文件？你的链接可能需要更加明确或醒目
- **过度依赖某些部分**：如果 Claude 反复读取同一个文件，请考虑是否应该将其中的内容放入主 SKILL.md
- **被忽略的内容**：如果 Claude 从未访问某个随附文件，那么该文件可能没有必要，或者主说明中对它的提示不够明确

应根据这些观察结果而非假设进行迭代。Skill 元数据中的 'name' 和 'description' 尤为关键。Claude 会使用它们来决定是否应针对当前任务触发该 Skill。请确保它们清楚地描述了该 Skill 的作用以及应在何时使用。

## 应避免的反模式

### 避免使用 Windows 风格的路径

在文件路径中始终使用正斜杠，即使是在 Windows 上：

- ✓ **良好**：`scripts/helper.py`、`reference/guide.md`
- ✗ **避免**：`scripts\helper.py`、`reference\guide.md`

Unix 风格的路径可跨所有平台使用，而 Windows 风格的路径会在 Unix 系统上导致错误。

### 避免提供过多选项

除非确有必要，否则不要提供多种方法：

````markdown  theme={null}
**Bad example: Too many choices** (confusing):
"You can use pypdf, or pdfplumber, or PyMuPDF, or pdf2image, or..."

**Good example: Provide a default** (with escape hatch):
"Use pdfplumber for text extraction:
```python
import pdfplumber
```

For scanned PDFs requiring OCR, use pdf2image with pytesseract instead."
````

## 高级：包含可执行代码的技能

以下各节重点介绍包含可执行脚本的技能。如果你的技能仅使用 Markdown 指令，请跳至[高效技能检查清单](#checklist-for-effective-skills)。

### 解决问题，不要推给 Claude

为技能编写脚本时，应自行处理错误情况，而不是将其推给 Claude。

**良好示例：显式处理错误**：

```python  theme={null}
def process_file(path):
    """Process a file, creating it if it doesn't exist."""
    try:
        with open(path) as f:
            return f.read()
    except FileNotFoundError:
        # Create file with default content instead of failing
        print(f"File {path} not found, creating default")
        with open(path, 'w') as f:
            f.write('')
        return ''
    except PermissionError:
        # Provide alternative instead of failing
        print(f"Cannot access {path}, using default")
        return ''
```

**不良示例：推给 Claude**：

```python  theme={null}
def process_file(path):
    # Just fail and let Claude figure it out
    return open(path).read()
```

配置参数也应有合理依据并进行说明，以避免出现“巫术常量”（Ousterhout 定律）。如果你自己都不知道正确的值，Claude 又如何确定它？

**良好示例：自解释**：

```python  theme={null}
# HTTP requests typically complete within 30 seconds
# Longer timeout accounts for slow connections
REQUEST_TIMEOUT = 30

# Three retries balances reliability vs speed
# Most intermittent failures resolve by the second retry
MAX_RETRIES = 3
```

**不良示例：魔法数字**：

```python  theme={null}
TIMEOUT = 47  # Why 47?
RETRIES = 5   # Why 5?
```

### 提供实用工具脚本

即使 Claude 能够编写脚本，预先编写好的脚本仍具有以下优势：

**实用工具脚本的优势**：

- 比生成的代码更可靠
- 节省 token（无需在上下文中包含代码）
- 节省时间（无需生成代码）
- 确保不同使用场景下的一致性

<img src="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=4bbc45f2c2e0bee9f2f0d5da669bad00" alt="将可执行脚本与指令文件捆绑在一起" data-og-width="2048" width="2048" data-og-height="1154" height="1154" data-path="images/agent-skills-executable-scripts.png" data-optimize="true" data-opv="3" srcset="https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=280&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=9a04e6535a8467bfeea492e517de389f 280w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=560&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=e49333ad90141af17c0d7651cca7216b 560w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=840&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=954265a5df52223d6572b6214168c428 840w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=1100&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=2ff7a2d8f2a83ee8af132b29f10150fd 1100w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=1650&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=48ab96245e04077f4d15e9170e081cfb 1650w, https://mintcdn.com/anthropic-claude-docs/4Bny2bjzuGBK7o00/images/agent-skills-executable-scripts.png?w=2500&fit=max&auto=format&n=4Bny2bjzuGBK7o00&q=85&s=0301a6c8b3ee879497cc5b5483177c90 2500w" />

上图展示了可执行脚本如何与指令文件协同工作。指令文件（forms.md）引用了该脚本，Claude 无需将脚本内容加载到上下文中即可执行它。

**重要区别**：请在指令中明确说明 Claude 应该：

- **执行脚本**（最常见）：“运行 `analyze_form.py` 以提取字段”
- **将其作为参考阅读**（用于复杂逻辑）：“有关字段提取算法，请参阅 `analyze_form.py`”

对于大多数实用工具脚本，首选执行方式，因为这种方式更可靠、更高效。有关脚本执行方式的详细信息，请参阅下文的[运行时环境](#runtime-environment)部分。

**示例**：

````markdown  theme={null}
## Utility scripts

**analyze_form.py**: Extract all form fields from PDF

```bash
python scripts/analyze_form.py input.pdf > fields.json
```

Output format:
```json
{
  "field_name": {"type": "text", "x": 100, "y": 200},
  "signature": {"type": "sig", "x": 150, "y": 500}
}
```

**validate_boxes.py**: Check for overlapping bounding boxes

```bash
python scripts/validate_boxes.py fields.json
# Returns: "OK" or lists conflicts
```

**fill_form.py**: Apply field values to PDF

```bash
python scripts/fill_form.py input.pdf fields.json output.pdf
```
````

### 使用视觉分析

当输入可以渲染为图像时，让 Claude 对其进行分析：

````markdown  theme={null}
## Form layout analysis

1. Convert PDF to images:
   ```bash
   python scripts/pdf_to_images.py form.pdf
   ```

2. Analyze each page image to identify form fields
3. Claude can see field locations and types visually
````

<Note>
  在此示例中，你需要编写 `pdf_to_images.py` 脚本。
</Note>

Claude 的视觉能力有助于理解布局和结构。

### 创建可验证的中间输出

当 Claude 执行复杂的开放式任务时，可能会出错。“规划—验证—执行”模式通过让 Claude 先以结构化格式创建计划，再使用脚本验证该计划，最后执行，从而及早发现错误。

**示例**：假设你要求 Claude 根据电子表格更新 PDF 中的 50 个表单字段。如果不进行验证，Claude 可能会引用不存在的字段、创建相互冲突的值、遗漏必填字段，或者错误地应用更新。

**解决方案**：使用上文所示的工作流模式（填写 PDF 表单），但增加一个中间 `changes.json` 文件，在应用更改之前对其进行验证。工作流将变为：分析 → **创建计划文件** → **验证计划** → 执行 → 核验。

**此模式有效的原因：**

- **及早发现错误**：验证会在应用更改之前发现问题
- **可由机器验证**：脚本可提供客观验证
- **可逆的规划过程**：Claude 可以反复修改计划，而不会触碰原始文件
- **便于调试**：错误消息会指出具体问题

**适用场景**：批量操作、破坏性更改、复杂验证规则、高风险操作。

**实现提示**：让验证脚本输出详细信息，并提供具体的错误消息，例如“未找到字段 'signature\_date'。可用字段：customer\_name、order\_total、signature\_date\_signed”，以帮助 Claude 修复问题。

### 软件包依赖项

Skills 在代码执行环境中运行，并受到平台特定限制：

- **claude.ai**：可以安装来自 npm 和 PyPI 的软件包，并从 GitHub 仓库拉取内容
- **Anthropic API**：无法访问网络，也无法在运行时安装软件包

请在你的 SKILL.md 中列出所需的软件包，并在[代码执行工具文档](docs.claude.com/en/docs/agents-and-tools/tool-use/code-execution-tool)中确认它们可用。

### 运行时环境

Skills 在代码执行环境中运行，可以访问文件系统、执行 bash 命令和代码。有关此架构的概念性说明，请参阅概述中的 [Skills 架构](docs.claude.com/en/docs/agents-and-tools/agent-skills/overview#the-skills-architecture)。

**这会如何影响你的编写方式：**

**Claude 如何访问 Skills：**

1. **预加载元数据**：启动时，所有 Skills 的 YAML frontmatter 中的名称和描述都会加载到系统提示词中
2. **按需读取文件**：Claude 会在需要时使用 bash Read 工具访问文件系统中的 SKILL.md 和其他文件
3. **高效执行脚本**：实用脚本可以通过 bash 执行，而无需将其完整内容加载到上下文中。只有脚本的输出会消耗 token
4. **大文件不会造成上下文负担**：参考文件、数据或文档在被实际读取前不会消耗上下文 token

- **文件路径很重要**：Claude 会像浏览文件系统一样浏览你的 skill 目录。请使用正斜杠（`reference/guide.md`），不要使用反斜杠
- **使用描述性文件名**：使用能够表明内容的名称：`form_validation_rules.md`，而不是 `doc2.md`
- **以便于发现的方式组织内容**：按领域或功能组织目录结构
  - 推荐：`reference/finance.md`、`reference/sales.md`
  - 不推荐：`docs/file1.md`、`docs/file2.md`
- **打包完整的资源**：包含完整的 API 文档、丰富的示例和大型数据集；在被访问前不会造成上下文负担
- **对于确定性操作，优先使用脚本**：编写 `validate_form.py`，而不是让 Claude 生成验证代码
- **明确执行意图**：
  - “运行 `analyze_form.py` 以提取字段”（执行）
  - “参阅 `analyze_form.py` 了解提取算法”（作为参考读取）
- **测试文件访问模式**：通过真实请求进行测试，确认 Claude 能够浏览你的目录结构

**示例：**

```
bigquery-skill/
├── SKILL.md (overview, points to reference files)
└── reference/
    ├── finance.md (revenue metrics)
    ├── sales.md (pipeline data)
    └── product.md (usage analytics)
```

当用户询问收入相关问题时，Claude 会读取 SKILL.md，看到对 `reference/finance.md` 的引用，然后调用 bash，仅读取该文件。sales.md 和 product.md 文件会保留在文件系统中，在需要之前不会消耗任何上下文 token。这种基于文件系统的模型正是实现渐进式披露的基础。Claude 可以浏览文件，并根据每项任务的具体需求，有选择地加载所需的内容。

有关技术架构的完整详细信息，请参阅 Skills 概述中的 [Skills 如何工作](docs.claude.com/en/docs/agents-and-tools/agent-skills/overview#how-skills-work)。

### MCP 工具引用

如果你的 Skill 使用 MCP（Model Context Protocol，模型上下文协议）工具，请始终使用完全限定的工具名称，以避免出现“找不到工具”错误。

**格式**：`ServerName:tool_name`

**示例**：

```markdown  theme={null}
Use the BigQuery:bigquery_schema tool to retrieve table schemas.
Use the GitHub:create_issue tool to create issues.
```

其中：

- `BigQuery` 和 `GitHub` 是 MCP 服务器名称
- `bigquery_schema` 和 `create_issue` 是这些服务器中的工具名称

如果没有服务器前缀，Claude 可能无法找到该工具，尤其是在有多个 MCP 服务器可用时。

### 避免假设工具已安装

不要假设软件包可用：

````markdown  theme={null}
**Bad example: Assumes installation**:
"Use the pdf library to process the file."

**Good example: Explicit about dependencies**:
"Install required package: `pip install pypdf`

Then use it:
```python
from pypdf import PdfReader
reader = PdfReader("file.pdf")
```"
````

## 技术说明

### YAML frontmatter 要求

SKILL.md frontmatter 仅包含 `name`（最多 64 个字符）和 `description`（最多 1024 个字符）字段。有关完整的结构详情，请参阅 [Skills 概述](docs.claude.com/en/docs/agents-and-tools/agent-skills/overview#skill-structure)。

### Token 预算

为获得最佳性能，请将 SKILL.md 正文控制在 500 行以内。如果内容超出此限制，请使用前文所述的渐进式披露模式将其拆分到不同文件中。有关架构详情，请参阅 [Skills 概述](docs.claude.com/en/docs/agents-and-tools/agent-skills/overview#how-skills-work)。

## 高效 Skill 检查清单

在分享 Skill 之前，请确认：

### 核心质量

- [ ] 描述具体且包含关键词
- [ ] 描述同时说明了 Skill 的功能及其适用场景
- [ ] SKILL.md 正文少于 500 行
- [ ] 其他详细信息位于单独的文件中（如需要）
- [ ] 不包含时效性信息（或将其放在“旧模式”部分）
- [ ] 全文术语保持一致
- [ ] 示例具体，而非抽象
- [ ] 文件引用仅深入一层
- [ ] 恰当地使用渐进式披露
- [ ] 工作流具有清晰的步骤

### 代码和脚本

- [ ] 脚本能够解决问题，而不是将问题推给 Claude
- [ ] 错误处理明确且有帮助
- [ ] 不存在“巫术常量”（所有值均有合理依据）
- [ ] 说明中列出了必需的软件包，并确认其可用
- [ ] 脚本具有清晰的文档
- [ ] 不使用 Windows 风格的路径（全部使用正斜杠）
- [ ] 关键操作包含验证/核验步骤
- [ ] 对质量至关重要的任务包含反馈循环

### 测试

- [ ] 至少创建了三个评估
- [ ] 已使用 Haiku、Sonnet 和 Opus 进行测试
- [ ] 已使用真实使用场景进行测试
- [ ] 已采纳团队反馈（如适用）