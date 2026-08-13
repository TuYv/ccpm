---
name: slash-command-factory
description: Generate custom Claude Code slash commands through intelligent 5-7 question flow. Creates powerful commands for business research, content analysis, healthcare compliance, API integration, documentation automation, and workflow optimization. Outputs organized commands to generated-commands/ with validation and installation guidance.
---
# 斜杠命令工厂

一个综合系统，通过简单的问答式工作流生成可用于生产环境的 Claude Code 斜杠命令。

---

## 此 Skill 的功能

此 Skill 可帮助你为 Claude Code 创建自定义斜杠命令，具体方式包括：
- 针对你的命令需求提出 5-7 个简单明了的问题
- 生成包含正确 YAML frontmatter 的完整命令 .md 文件
- 针对常见使用场景提供 10 个强大的预设命令
- 验证命令格式和语法
- 创建组织良好的文件夹结构
- 提供安装指导

**输出**：可直接在 Claude Code 中使用的完整斜杠命令

---

## 官方命令结构模式

此 Skill 按照 Anthropic 文档中的**三种官方模式**生成命令：

### 模式 A：简单型（上下文 → 任务）

**最适合**：输入/输出明确的直接任务  
**示例**：代码审查、文件更新、简单分析  
**官方参考**：code-review.md

**结构**：
```markdown
---
allowed-tools: Bash(git diff:*), Bash(git log:*)
description: Purpose description
---

## Context
- Current state: !`bash command`
- Additional data: !`another command`

## Your task
[Clear instructions with numbered steps]
[Success criteria]
```

**适用情况**：
- 简单、聚焦的任务
- 快速分析或审查
- 直接明了的工作流
- 使用 1-3 个 bash 命令获取上下文

---

### 模式 B：多阶段型（探索 → 分析 → 任务）

**最适合**：复杂的探索和文档编写任务  
**示例**：代码库分析、全面审计、系统映射  
**官方参考**：codebase-analysis.md

**结构**：
```markdown
---
allowed-tools: Bash(find:*), Bash(tree:*), Bash(ls:*), Bash(grep:*), Bash(wc:*), Bash(du:*)
description: Comprehensive purpose
---

# Command Title

## Phase 1: Project Discovery
### Directory Structure
!`find . -type d | sort`

### File Count Analysis
!`find . -type f | wc -l`

## Phase 2: Detailed Analysis
[More discovery commands]
[File references with @]

## Phase 3: Your Task
Based on all discovered information, create:

1. **Deliverable 1**
   - Subsection
   - Details

2. **Deliverable 2**
   - Subsection
   - Details

At the end, write output to [filename].md
```

**适用情况**：
- 需要全面分析
- 包含多个探索阶段
- 需要收集大量上下文
- 使用 10 个以上的 bash 命令收集数据
- 生成详细的文档文件

---

### 模式 C：Agent 风格（角色 → 流程 → 指南）

**最适合**：专业化的专家角色和协调工作  
**示例**：领域专家、编排器、专业顾问  
**官方参考**：openapi-expert.md

**结构**：
```markdown
---
name: command-name
description: |
  Multi-line description for complex purpose
  explaining specialized role
color: yellow
---

You are a [specialized role] focusing on [domain expertise].

**Core Responsibilities:**

1. **Responsibility Area 1**
   - Specific tasks
   - Expected outputs

2. **Responsibility Area 2**
   - Specific tasks
   - Expected outputs

**Working Process:**

1. [Step 1 in workflow]
2. [Step 2 in workflow]
3. [Step 3 in workflow]

**Important Considerations:**

- [Guideline 1]
- [Guideline 2]
- [Constraint or best practice]

When you encounter [scenario], [action to take].
```

**何时使用**：
- 需要专业领域知识
- 编排复杂工作流
- 协调多个子流程
- 担任专家顾问
- 需要特定的程序性指南

---

## 综合命名规范

### 命令文件命名规则

所有斜杠命令文件都必须遵循 kebab-case 规范：

**格式**：`[verb]-[noun].md`、`[noun]-[verb].md` 或 `[domain]-[action].md`

**规则**：
1. **大小写**：仅使用小写字母，并以连字符作为分隔符
2. **长度**：最多 2-4 个单词
3. **字符**：仅允许使用 `[a-z0-9-]`（字母、数字、连字符）
4. **开头/结尾**：必须以字母或数字开头和结尾（不能是连字符）
5. **禁止使用**：空格、下划线、camelCase、TitleCase 或特殊字符

---

### 转换算法

**用户输入** → **命令名称**

```
Input: "Analyze customer feedback and generate insights"
↓
1. Extract action: "analyze"
2. Extract target: "feedback"
3. Combine: "analyze-feedback"
4. Validate: Matches [a-z0-9-]+ pattern ✓
5. Output: analyze-feedback.md
```

**更多示例**：
- “审查拉取请求” → `pr-review.md` 或 `review-pr.md`
- “生成 API 文档” → `api-document.md` 或 `document-api.md`
- “更新 README 文件” → `update-readme.md` 或 `readme-update.md`
- “审核安全合规性” → `security-audit.md` 或 `compliance-audit.md`
- “研究市场趋势” → `research-market.md` 或 `market-research.md`
- “分析代码质量” → `code-analyze.md` 或 `analyze-code.md`

---

### 官方示例（来自 Anthropic 文档）

**正确**：
- ✅ `code-review.md`（动词-名词）
- ✅ `codebase-analysis.md`（名词-名词复合词）
- ✅ `update-claude-md.md`（动词-名词-限定词）
- ✅ `openapi-expert.md`（领域-角色）

**错误**：
- ❌ `code_review.md`（snake_case——错误）
- ❌ `CodeReview.md`（PascalCase——错误）
- ❌ `codeReview.md`（camelCase——错误）
- ❌ `review.md`（过于模糊——需要指定目标）
- ❌ `analyze-customer-feedback-data.md`（过长——超过 4 个单词）

---

## Bash 权限模式

### 关键规则：禁止通配权限

**❌ 绝不允许**：
```yaml
allowed-tools: Bash
```
根据 Anthropic 官方模式，这种通配权限是**被禁止的**。

**✅ 始终要求**：
```yaml
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*)
```
必须指定**确切命令**，通配符只能用于子命令。

---

### 官方权限模式

基于 Anthropic 文档中的示例：

**Git 操作**（代码审查、更新文档）：
```yaml
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git branch:*), Bash(git add:*), Bash(git commit:*)
```

**文件发现**（代码库分析）：
```yaml
allowed-tools: Bash(find:*), Bash(tree:*), Bash(ls:*), Bash(du:*)
```

**内容分析**（全面发现）：
```yaml
allowed-tools: Bash(grep:*), Bash(wc:*), Bash(head:*), Bash(tail:*), Bash(cat:*)
```

**数据处理**（自定义分析）：
```yaml
allowed-tools: Bash(awk:*), Bash(sed:*), Bash(sort:*), Bash(uniq:*)
```

**组合模式**（多阶段命令）：
```yaml
allowed-tools: Bash(find:*), Bash(tree:*), Bash(ls:*), Bash(grep:*), Bash(wc:*), Bash(du:*), Bash(head:*), Bash(tail:*), Bash(cat:*), Bash(touch:*)
```

---

### 权限选择指南

| 命令类型 | Bash 权限 | 示例命令 |
|--------------|------------------|------------------|
| **Git 命令** | `git status, git diff, git log, git branch` | code-review, commit-assist |
| **发现** | `find, tree, ls, du` | codebase-analyze, structure-map |
| **分析** | `grep, wc, head, tail, cat` | search-code, count-lines |
| **更新** | `git diff, find, grep` | update-docs, sync-config |
| **数据处理** | `awk, sed, sort, uniq` | parse-data, format-output |
| **综合** | 以上所有权限 | full-audit, system-analyze |

---

## 生成命令的两种方式

### 方式 1：快速入门预设（30 秒）

从 10 个功能强大的预设命令中选择：

**商业与研究**：
1. **/research-business** - 全面的市场研究和竞争分析
2. **/research-content** - 多平台内容趋势分析和 SEO 策略

**医疗与合规**：
3. **/medical-translate** - 将医学术语翻译为适合 8 至 10 年级理解的语言（德语/英语）
4. **/compliance-audit** - HIPAA/GDPR/DSGVO 合规性验证

**开发与集成**：
5. **/api-build** - 生成包含测试的完整 API 集成代码
6. **/test-auto** - 自动生成全面的测试套件

**文档与知识**：
7. **/docs-generate** - 自动创建文档
8. **/knowledge-mine** - 从文档中提取见解并进行结构化整理

**工作流与生产力**：
9. **/workflow-analyze** - 分析并优化业务流程
10. **/batch-agents** - 启动并协调多个代理以处理复杂任务

### 方式 2：自定义命令（5-7 个问题）

根据你的具体需求创建完全自定义的命令。

---

## 问题流程（自定义方式）

### 问题 1：命令用途

“这个斜杠命令应该做什么？

请具体说明其用途以及你将在何时使用它。

示例：
- ‘分析客户反馈并生成可执行的见解’
- ‘生成符合 HIPAA 要求的 API 文档’
- ‘研究市场趋势并制定内容策略’
- ‘从研究论文中提取关键见解’

你的命令用途：___”

---

### 问题 2：参数（自动确定）

该 Skill 会根据用途自动判断你的命令是否需要参数。

**如果需要参数**，将使用 `$ARGUMENTS` 格式：
- 用户输入：`/your-command argument1 argument2`
- 命令接收：`$ARGUMENTS` = "argument1 argument2"

**示例**：
- `/research-business "Tesla" "EV market"` → $ARGUMENTS = "Tesla EV market"
- `/medical-translate "Myokardinfarkt" "de"` → $ARGUMENTS = "Myokardinfarkt de"

**无需用户输入** - Skill 会智能判断。

---

### 问题 3：使用哪些工具？

“这个命令应该使用哪些 Claude Code 工具？

可用工具：
- **Read** - 读取文件
- **Write** - 创建文件
- **Edit** - 修改文件
- **Bash** - 执行 shell 命令（必须指定确切命令）
- **Grep** - 搜索代码
- **Glob** - 按模式查找文件
- **Task** - 启动代理

**关键要求**：对于 Bash，你必须指定确切的命令，而不是通配符。

**Bash 示例**：
- ✅ Bash(git status:*), Bash(git diff:*), Bash(git log:*)
- ✅ Bash(find:*), Bash(tree:*), Bash(ls:*)
- ✅ Bash(grep:*), Bash(wc:*), Bash(head:*)
- ❌ Bash（官方模式不允许使用通配符）

**工具组合示例**：
- Git 命令：Read, Bash(git status:*), Bash(git diff:*)
- 代码生成器：Read, Write, Edit
- 探索命令：Bash(find:*), Bash(tree:*), Bash(grep:*)
- 分析命令：Read, Grep, Task（启动代理）

你的工具（以逗号分隔）：___"

---

### 问题 4：代理集成

"此命令是否需要针对专门任务启动代理？

适合使用代理的情形示例：
- 复杂分析（启动 rr-architect、rr-security）
- 实现任务（启动 rr-frontend、rr-backend）
- 质量检查（启动 rr-qa、rr-test-runner）

选项：
1. **不使用代理** - 命令自行处理所有工作
2. **启动代理** - 委派给专门的代理

你的选择（1 或 2）：___"

如果选择“2”，则询问："应启动哪些代理？___"

---

### 问题 5：输出类型

"此命令应生成哪种类型的输出？

1. **分析** - 研究报告、洞察、建议
2. **文件** - 生成的代码、文档、配置
3. **操作** - 执行任务、运行工作流、部署
4. **报告** - 包含发现和后续步骤的结构化报告

你的选择（1、2、3 或 4）：___"

---

### 问题 6：模型偏好（可选）

"此命令应使用哪个 Claude 模型？

1. **默认** - 继承自主对话（推荐）
2. **Sonnet** - 最适合复杂任务
3. **Haiku** - 速度最快、成本最低（适用于简单命令）
4. **Opus** - 能力最强（适用于关键任务）

你的选择（1、2、3 或 4），或按 Enter 使用默认选项：___"

---

### 问题 7：附加功能（可选）

"是否需要任何特殊功能？

可选功能：
- **Bash 执行** - 运行 shell 命令并包含输出（!`command`）
- **文件引用** - 包含文件内容（@file.txt）
- **上下文收集** - 读取项目文件以获取上下文

你需要的功能（以逗号分隔），或按 Enter 跳过：___"

---

## 生成流程

收集答案后：

1. **生成 YAML Frontmatter**：
```yaml
---
description: [From command purpose]
argument-hint: [If $ARGUMENTS needed]
allowed-tools: [From tool selection]
model: [If specified]
---
```

2. **生成命令正文**：
```markdown
[Purpose-specific instructions]

[If uses agents]:
1. **Launch [agent-name]** with [specific task]
2. Coordinate workflow
3. Validate results

[If uses bash]:
- Context: !`bash command`

[If uses file refs]:
- Review: @file.txt

Success Criteria: [Based on output type]
```

3. **创建文件夹结构**：
```
generated-commands/[command-name]/
├── [command-name].md    # Command file (ROOT)
├── README.md            # Installation guide (ROOT)
├── TEST_EXAMPLES.md     # Testing examples (ROOT)
└── [folders if needed]  # standards/, examples/, scripts/
```

4. **验证格式**：
- ✅ YAML frontmatter 有效
- ✅ $ARGUMENTS 语法正确（如果使用）
- ✅ allowed-tools 格式正确
- ✅ 文件夹组织清晰

5. **提供安装说明**：
```
Your command is ready!

Output location: generated-commands/[command-name]/

To install:
1. Copy the command file:
   cp generated-commands/[command-name]/[command-name].md .claude/commands/

2. Restart Claude Code (if already running)

3. Test:
   /[command-name] [arguments]
```

---

## 预设命令详情

### 1. /research-business

**用途**：全面的商业和市场研究

**参数**：`$ARGUMENTS`（要研究的公司或市场）

**YAML**：
```yaml
---
description: Comprehensive business and market research with competitor analysis
argument-hint: [company/market] [industry]
allowed-tools: Read, Bash, Grep
---
```

**功能**：
- 分析市场规模和趋势
- 进行竞争对手 SWOT 分析
- 识别机会
- 概述行业格局
- 提供战略建议

---

### 2. /research-content

**用途**：多平台内容趋势分析

**参数**：`$ARGUMENTS`（要研究的主题）

**YAML**：
```yaml
---
description: Multi-platform content trend analysis for data-driven content strategy
argument-hint: [topic] [platforms]
allowed-tools: Read, Bash
---
```

**功能**：
- 分析 Google、Reddit、YouTube、Medium、LinkedIn、X 上的趋势
- 分析用户意图（信息型、商业型、交易型）
- 识别内容缺口
- 生成针对 SEO 优化的大纲
- 制定平台特定的发布策略

---

### 3. /medical-translate

**用途**：将医学术语翻译为患者易于理解的语言

**参数**：`$ARGUMENTS`（医学术语和语言）

**YAML**：
```yaml
---
description: Translate medical terminology to 8th-10th grade reading level (German/English)
argument-hint: [medical-term] [de|en]
allowed-tools: Read
---
```

**功能**：
- 翻译复杂的医学术语
- 简化至 8 至 10 年级阅读水平
- 使用 Flesch-Kincaid（英语）或 Wiener Sachtextformel（德语）进行验证
- 保持临床准确性
- 提供患者易于理解的解释

---

### 4. /compliance-audit

**用途**：检查代码是否符合法规要求

**参数**：`$ARGUMENTS`（路径和合规标准）

**YAML**：
```yaml
---
description: Audit code for HIPAA/GDPR/DSGVO compliance requirements
argument-hint: [code-path] [hipaa|gdpr|dsgvo|all]
allowed-tools: Read, Grep, Task
---
```

**功能**：
- 扫描 PHI/PII 处理情况
- 检查加密要求
- 验证审计日志记录
- 验证数据主体权利
- 生成合规报告

---

### 5. /api-build

**用途**：生成完整的 API 集成代码

**参数**：`$ARGUMENTS`（API 名称和端点）

**YAML**：
```yaml
---
description: Generate complete API client with error handling and tests
argument-hint: [api-name] [endpoints]
allowed-tools: Read, Write, Edit, Bash, Task
---
```

**功能**：
- 生成 API 客户端类
- 添加错误处理和重试机制
- 创建身份验证逻辑
- 生成单元测试和集成测试
- 添加使用文档

---

### 6. /test-auto

**用途**：自动生成全面的测试套件

**参数**：`$ARGUMENTS`（文件路径和测试类型）

**YAML**：
```yaml
---
description: Auto-generate comprehensive test suite with coverage analysis
argument-hint: [file-path] [unit|integration|e2e]
allowed-tools: Read, Write, Bash
---
```

**功能**：
- 分析待测试的代码
- 生成测试用例（正常路径、边界情况、错误）
- 添加测试夹具和模拟对象
- 计算覆盖率
- 提供测试文档

---

### 7. /docs-generate

**用途**：自动生成文档

**参数**：`$ARGUMENTS`（代码路径和文档类型）

**YAML**：
```yaml
---
description: Auto-generate documentation from code (API docs, README, architecture)
argument-hint: [code-path] [api|readme|architecture|all]
allowed-tools: Read, Write, Grep
---
```

**功能**：
- 提取代码结构和函数
- 生成 API 文档
- 创建包含使用示例的 README
- 构建架构图（Mermaid）
- 添加代码示例

---

### 8. /knowledge-mine

**用途**：从文档中提取结构化洞见

**参数**：`$ARGUMENTS`（文档路径和输出格式）

**YAML**：
```yaml
---
description: Extract and structure knowledge from documents into actionable insights
argument-hint: [doc-path] [faq|summary|kb|all]
allowed-tools: Read, Grep
---
```

**功能**：
- 阅读并分析文档
- 提取关键洞见
- 生成常见问题
- 创建知识库文章
- 总结分析结果

---

### 9. /workflow-analyze

**用途**：分析并优化业务工作流

**参数**：`$ARGUMENTS`（工作流描述）

**YAML**：
```yaml
---
description: Analyze workflows and provide optimization recommendations
argument-hint: [workflow-description]
allowed-tools: Read, Task
---
```

**功能**：
- 梳理当前工作流
- 识别瓶颈
- 提出自动化机会
- 计算效率提升幅度
- 创建实施路线图

---

### 10. /batch-agents

**用途**：启动多个协同代理

**参数**：`$ARGUMENTS`（代理名称和任务）

**YAML**：
```yaml
---
description: Launch and coordinate multiple agents for complex tasks
argument-hint: [agent-names] [task-description]
allowed-tools: Task
---
```

**功能**：
- 解析代理列表
- 并行（在安全的情况下）或按顺序启动代理
- 协调输出
- 整合结果
- 提供全面的总结

---

## 输出结构

命令会生成在项目的根目录中：

```
[your-project]/
└── generated-commands/
    └── [command-name]/
        ├── [command-name].md      # Command file (ROOT level)
        ├── README.md              # Installation guide (ROOT level)
        ├── TEST_EXAMPLES.md       # Testing guide (ROOT level - if applicable)
        │
        ├── standards/             # Only if command has standards
        ├── examples/              # Only if command has examples
        └── scripts/               # Only if command has helper scripts
```

**组织规则**：
- 所有 .md 文件均放在根目录中
- 支持文件夹单独存放（standards/、examples/、scripts/）
- 不要在同一文件夹中混放不同类型的内容
- 保持清晰的层级结构

---

## 安装

**生成后**：

1. **检查输出**：
   ```bash
   ls generated-commands/[command-name]/
   ```

2. **复制到 Claude Code**（准备就绪后）：
   ```bash
   # Project-level (this project only)
   cp generated-commands/[command-name]/[command-name].md .claude/commands/

   # User-level (all projects)
   cp generated-commands/[command-name]/[command-name].md ~/.claude/commands/
   ```

3. **重启 Claude Code**（如果正在运行）

4. **测试命令**：
   ```bash
   /[command-name] [arguments]
   ```

---

## 使用示例

### 生成预设命令

```
@slash-command-factory

Use the /research-business preset
```

**输出**：可直接安装的完整商业研究命令

---

### 生成自定义命令

```
@slash-command-factory

Create a custom command for analyzing customer feedback and generating product insights
```

**Skill 会提出 5-7 个问题** → **生成完整命令** → **验证格式** → **提供安装步骤**

---

## 命令格式（生成的内容）

**生成的命令示例**（`my-command.md`）：

```markdown
---
description: Brief description of what the command does
argument-hint: [arg1] [arg2]
allowed-tools: Read, Write, Bash
model: claude-3-5-sonnet-20241022
---

# Command Instructions

Do [task] with "$ARGUMENTS":

1. **Step 1**: First action
2. **Step 2**: Second action
3. **Step 3**: Generate output

**Success Criteria**:
- Criterion 1
- Criterion 2
- Criterion 3
```

---

## 验证

每个生成的命令都会自动验证以下内容：
- ✅ 有效的 YAML frontmatter（语法正确，包含必填字段）
- ✅ 正确的参数格式（$ARGUMENTS，而不是 $1 $2 $3）
- ✅ allowed-tools 语法（以逗号分隔的字符串）
- ✅ 清晰的文件夹组织结构（如果使用文件夹）
- ✅ 不含占位文本

**如果验证失败**，你将获得具体的修复说明。

---

## 最佳实践

**命令设计**：
- 保持命令专注（一个明确的用途）
- 使用描述性名称（文件名采用 kebab-case）
- 清晰记录预期参数
- 包含成功标准
- 在 TEST_EXAMPLES.md 中添加示例

**工具选择**：
- Read：用于分析文件
- Write/Edit：用于生成或修改文件
- Bash：用于执行系统命令和 Web 研究
- Task：用于启动代理
- Grep/Glob：用于搜索代码

**代理集成**：
- 使用 Task 工具启动代理
- 清楚指定使用哪些代理
- 协调输出
- 记录代理角色

---

## 重要说明

**参数**：
- ✅ 始终使用 `$ARGUMENTS`（将所有参数作为一个字符串）
- ❌ 切勿使用 `$1`、`$2`、`$3`（位置参数——此工厂不使用）

**文件夹组织结构**：
- ✅ 所有 .md 文件都位于命令根目录中
- ✅ 辅助文件夹应单独存放（standards/、examples/、scripts/）
- ✅ 不要混合不同类型

**输出位置**：
- 命令生成至：`./generated-commands/[command-name]/`
- 用户复制至：`.claude/commands/[command-name].md`（准备就绪后）

---

## 调用示例

### 使用预设

```
@slash-command-factory

Generate the /research-content preset command
```

→ 创建具备所有功能的内容研究命令

---

### 创建自定义医疗健康命令

```
@slash-command-factory

Create a command that generates German PTV 10 therapy applications
```

**Skill 会询问**：
- 用途？（生成 PTV 10 申请）
- 工具？（Read、Write、Task）
- Agent？（是——与 health-sdk-builder 相关的 Agent）
- 输出？（文件——治疗申请文档）
- 模型？（Sonnet——以确保质量）

**结果**：`/generate-ptv10` 命令已可使用

---

### 创建商业智能命令

```
@slash-command-factory

Build a command for competitive SWOT analysis
```

**Skill 会询问 5-7 个问题** → **生成 `/swot-analysis` 命令** → **验证** → **可供安装**

---

## 与 Factory Agent 集成

**可配合使用**：
- factory-guide（可通过 prompts-guide 模式委托给此 Skill）
- 现有斜杠命令（/build、/validate-output 等）

**相互补充**：
- skills-guide（构建 Skill）
- prompts-guide（构建 Prompt）
- agents-guide（构建 Agent）
- slash-command-factory（构建命令）← 此 Skill

用于构建所有 Claude Code 增强功能的**完整生态系统**！

---

## 输出验证

生成的命令将针对以下方面进行验证：

**YAML Frontmatter**：
- 包含 `description` 字段
- YAML 语法正确
- 仅包含有效的 frontmatter 字段

**参数**：
- 在需要时使用 $ARGUMENTS
- 使用 $ARGUMENTS 时包含 argument-hint
- 不使用 $1、$2、$3 位置参数

**工具**：
- 工具名称有效
- 使用正确的逗号分隔格式
- 适合命令用途

**组织结构**：
- .md 文件位于根目录中
- 文件夹已正确分隔
- 不存在散落的文件

---

## 成功标准

生成的命令应该：
- ✅ 包含有效的 YAML frontmatter
- ✅ 使用 $ARGUMENTS（绝不使用位置参数）
- ✅ 复制到 .claude/commands/ 后即可运行
- ✅ 使用参数时能够正确执行
- ✅ 生成预期输出
- ✅ 遵循组织标准

---

**版本**：1.0.0
**最后更新**：2025 年 10 月 28 日
**兼容性**：Claude Code（所有支持斜杠命令的版本）

**几分钟内构建强大的自定义斜杠命令！** ⚡