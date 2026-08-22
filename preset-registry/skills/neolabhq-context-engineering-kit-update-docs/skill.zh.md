---
name: update-docs
description: Update and maintain project documentation for local code changes using multi-agent workflow with tech-writer agents. Covers docs/, READMEs, JSDoc, and API documentation.
argument-hint: Optional target directory, documentation type (api, guides, readme, jsdoc), or specific focus area
---
# 为本地变更更新文档

<task>
你是一名技术文档专家，负责维护真正满足用户需求的动态文档。你的使命是创建清晰、简洁且实用的文档，同时坚决避免文档膨胀和维护开销。
</task>

<context>
参考资料：
- 技术写作智能体：@/plugins/sdd/agents/tech-writer.md  
- 文档原则和质量标准
- Token 效率和渐进式披露模式
- 用于准确收集技术信息的 Context7 MCP
</context>

## 用户参数

用户可以提供具体的重点领域或文档类型：

```text
$ARGUMENTS
```

如果未提供任何内容，则关注未提交变更的所有文档需求。如果所有内容均已提交，则涵盖最新提交。

## 背景

实现新功能或重构现有代码后，必须更新文档以反映相关变更。此命令使用专门的技术写作智能体和并行分析来协调自动化文档更新。

## 目标

确保所有代码变更都得到恰当记录，并提供清晰、可维护的文档，帮助用户完成实际任务。

## 重要约束

- **关注面向用户的影响** - 并非每项代码变更都需要文档
- **保留现有文档风格** - 遵循既有模式
- **分析变更的复杂度**：
  - 如果有 3 个以上影响文档的变更文件，或存在重大 API 变更 → **使用多智能体工作流**
  - 如果只有 1-2 项简单变更 → **自行编写文档**
- **文档必须证明其存在的必要性** - 避免文档膨胀和维护开销

## 工作流步骤

### 准备

1. **读取 SADD Skill（如果可用）**
   - 如果可用，读取 SADD Skill 以了解管理智能体的最佳实践

2. **了解文档基础设施**
   - 关键要求：你必须读取根目录的 README.md 和项目配置（package.json、pyproject.toml 等）
   - 识别现有文档结构（docs/、README 文件、JSDoc）
   - 了解项目约定和文档模式
   - 检查文档生成工具（OpenAPI、JSDoc、TypeDoc）

3. **盘点现有文档**

```bash
# Find all documentation files
find . -name "*.md" -o -name "*.rst" | grep -E "(README|CHANGELOG|CONTRIBUTING|docs/)"

# Check for generated docs
find . -name "openapi.*" -o -name "*.graphql" -o -name "swagger.*"
```

### 分析

使用 haiku 智能体并行执行步骤 4-5：

4. **分析文档结构**
   - 启动 haiku 智能体来梳理现有文档：
     - 识别 docs/ 文件夹的结构和组织方式
     - 查找所有 README.md 文件及其用途
     - 定位 API 文档（自动生成或手动编写）
     - 记录代码库中的 JSDoc/TSDoc 模式
   - 输出：包含位置和类型的文档地图

5. **分析本地变更**
   - 运行 `git status -u` 以识别所有变更文件（包括未跟踪文件）
     - 如果没有未提交的变更，则针对最新提交运行 `git show --name-status`
   - 筛选并识别影响文档的变更：
     - 新增/修改的公共 API
     - 变更的模块结构
     - 更新的配置选项
     - 新功能或工作流
   - 为每个变更文件分别启动 haiku 智能体，以：
     - 分析文件及其对文档的影响
     - 识别需要创建/更新的文档
     - 识别需要更新的索引文档（参见“索引文档”部分）
     - 准备简短的文档需求摘要
   - 提取文档任务列表

### 文档规划

6. **按文档领域对变更进行分组**
   - 汇总来自 Haiku 智能体的分析结果
   - 将可通过同一次文档更新涵盖的变更分组：
     - **API 文档**：所有 API 变更 → 单个智能体
     - **模块 README**：同一模块中的变更 → 单个智能体
     - **用户指南**：相关的功能变更 → 单个智能体
     - **JSDoc/代码注释**：复杂的逻辑变更 → 每个文件分配一个智能体
     - **索引文档**：更新导航和内容发现文档 → 单个智能体
   - 确定需要更新的索引文档：
     - 根目录 `README.md` - 如果新模块/功能会影响项目概述，则很可能需要更新。
     - 模块 `README.md` - 如果模块的用途、导出内容或用法发生了变化
     - `docs/` 索引文件 - 如果文档结构发生了变化
   - 创建文档任务分配方案

### 文档编写

#### 简单变更流程（1-2 个文件，小幅更新）

如果变更较为简单，请按照以下指南自行编写文档：

1. 阅读 @/plugins/sdd/agents/tech-writer.md 中的技术文档撰写智能体指南
2. 审查发生变更的文件并了解其影响
3. 确定需要更新哪些文档
4. 遵循项目约定进行有针对性的更新
5. 验证所有链接和示例均可正常使用
6. 确保文档满足用户的实际需求

确保文档：

- 遵循项目风格和约定
- 包含可运行的代码示例
- 避免与现有文档重复
- 帮助用户完成任务

#### 多智能体流程（3 个以上文件或重大变更）

如果存在多个发生变更的文件或有大量文档需求，请使用专用智能体：

7. **并行启动 `doc-analysis` 智能体**（Haiku 模型）
   - 针对每个已确定的文档领域启动一个分析智能体
   - 向每个智能体提供：
     - **上下文**：相关文件中发生了哪些变更（git diff）
     - **目标**：要分析的文档领域
     - **资源**：该领域中的现有文档
     - **目的**：制定详细的文档需求
     - **输出**：按以下优先级列出的具体文档任务：
       - CRITICAL：面向用户的 API 变更、破坏性变更
       - IMPORTANT：新功能、配置选项
       - NICE_TO_HAVE：代码注释、小幅说明改进
   - 收集所有文档需求报告

8. **并行启动用于文档编写的 `sdd:tech-writer` 智能体**（Sonnet 或 Opus 模型）
   - 针对每个文档领域启动一个技术文档撰写智能体
   - 向每个智能体提供：
     - **上下文**：来自分析智能体的文档需求
     - **目标**：要创建/更新的具体文档文件
     - **文档任务**：分析智能体提供的任务列表
     - **指导**：阅读技术文档撰写智能体指南 @/plugins/sdd/agents/tech-writer.md，了解最佳实践
     - **资源**：用于参考风格的现有文档
     - **目的**：创建/更新全面的文档
     - **约束**：
       - 遵循现有文档模式
       - 包含可运行的代码示例
       - 避免文档臃肿
       - 专注于用户任务，而非实现细节

9. **启动文档质量审查代理（并行）**（Sonnet 或 Opus 模型）
   - 再次启动 `sdd:tech-writer` 代理进行质量审查
   - 提供：
     - **上下文**：原始变更 + 新创建的文档
     - **目标**：验证文档质量和完整性
     - **审查标准**：
       - 所有面向用户的变更均已记录
       - 代码示例准确且可运行
       - 链接和引用有效
       - 文档遵循项目约定
       - 没有不必要的文档膨胀
     - **输出**：确认通过（PASS）或列出需要修复的问题

10. **根据需要迭代**
    - 如果任何文档部分存在质量问题：返回步骤 8
    - 仅针对存在缺漏的部分启动新的技术文档代理
    - 提供关于需要修复内容的具体说明
    - 持续进行，直到所有文档都通过质量审查

11. **最终验证**
    - 从整体上审查所有文档变更
    - 验证文档之间的交叉引用是否有效
    - 确保不存在相互冲突的信息
    - 确认文档结构清晰且易于导航

## 成功标准

- 所有面向用户的变更均有适当的文档记录 ✅
- 代码示例准确且经过测试 ✅
- 文档遵循项目约定 ✅
- 没有失效的链接或引用 ✅
- 质量已由审查代理验证 ✅

## 代理指令模板

### 文档分析代理（Haiku）

```markdown
Analyze documentation needs for changes in {DOCUMENTATION_AREA}.

Context: These files were modified in local changes:
{CHANGED_FILES_LIST}

Git diff summary:
{GIT_DIFF_SUMMARY}

Your task:
1. Review the changes and understand their documentation impact
2. Identify what documentation needs to be created or updated:
   - New APIs or features to document
   - Existing docs that need updates
   - Code comments or JSDoc needed
   - README updates required
3. Identify index documents requiring updates:
   - Module README.md files affected by changes
   - Root README.md if features or modules changed
   - docs/ index files (index.md, SUMMARY.md, guides.md, getting-started.md, references, resources, etc.)
   - Navigation files (_sidebar.md, mkdocs.yml nav section)
4. Check existing documentation to avoid duplication
5. Create prioritized list of documentation tasks:
   - CRITICAL: Breaking changes, new public APIs
   - IMPORTANT: New features, configuration changes, index updates
   - NICE_TO_HAVE: Code comments, minor clarifications

Output format:
- List of documentation tasks with descriptions
- Priority level for each
- Suggested documentation file locations
- Index documents requiring updates
- Existing docs to reference for style
```

### 技术文档代理（文档创建）

```markdown
Create/update documentation for {DOCUMENTATION_AREA}.

Documentation requirements identified:
{DOCUMENTATION_TASKS_LIST}

Your task:
1. Read Tech Writer Agent guidelines @/plugins/sdd/agents/tech-writer.md
2. Read @README.md for project context and conventions
3. Review existing documentation for style and patterns
4. Create/update documentation for all identified tasks:
   - Follow project documentation conventions
   - Include working code examples
   - Write for the target audience
   - Focus on helping users accomplish tasks
5. Ensure documentation:
   - Is clear and concise
   - Avoids duplication with existing docs
   - Has valid links and references
   - Includes necessary context and examples

Target files: {TARGET_DOCUMENTATION_FILES}
```

### 质量审查代理（验证）

```markdown
Review documentation quality for {DOCUMENTATION_AREA}.

Context: Documentation was created/updated for local code changes.

Files to review:
{DOCUMENTATION_FILES}

Related code changes:
{CODE_CHANGES_SUMMARY}

Your task:
1. Read the documentation created/updated
2. Verify documentation quality:
   - All user-facing changes are covered
   - Code examples are accurate and work
   - Language is clear and helpful
   - Follows project conventions
   - Links and references are valid
3. Check for documentation issues:
   - Missing documentation for important changes
   - Inaccurate or outdated information
   - Broken links or references
   - Unnecessary documentation bloat
4. Verify no conflicts with existing documentation

Output:
- PASS: Documentation is complete and high quality ✅
- ISSUES: List specific problems that need to be fixed
```

## 核心文档理念

### 文档层级体系

```text
CRITICAL: Documentation must justify its existence
├── Does it help users accomplish real tasks? → Keep
├── Is it discoverable when needed? → Improve or remove  
├── Will it be maintained? → Keep simple or automate
└── Does it duplicate existing docs? → Remove or consolidate
```

### 应该记录什么 ✅

**面向用户的文档：**

- **入门指南**：快速设置，在 5 分钟内首次成功运行
- **操作指南**：以任务为导向、以解决问题为目标的文档  
- **API 参考**：当手动编写的文档比自动生成的文档更有价值时
- **故障排除**：常见的实际问题及经过验证的解决方案
- **架构决策**：当其影响用户体验时

**开发者文档：**

- **贡献指南**：实际工作流程，而非理想中的流程
- **模块 README**：提供简短用途说明的导航辅助
- **复杂业务逻辑**：为不直观的代码编写 JSDoc
- **集成模式**：针对常见任务的可复用示例

### 不应该记录什么 ❌

**产生文档债务的内容：**

- 不针对具体任务的通用“入门指南”
- 与自动生成的文档或 schema 文档重复的 API 文档  
- 解释代码显而易见行为的注释
- 为并不存在的流程编写的流程文档
- 为简单且不言自明的结构编写的架构文档
- 与 git 历史记录重复的变更日志
- 临时解决方法的文档
- 多个内容相同的 README

**危险信号——停下来重新考虑：**

- “本文档说明……” → 它能帮助完成什么任务？
- “如你所见……” → 如果显而易见，为什么还要记录？
- “TODO: Update this...” → 它真的会被更新吗？
- “更多详情请参阅……” → 信息是否位于用户预期的位置？

## 文档发现流程

### 代码库分析

<mcp_usage>
使用 Context7 MCP 获取以下方面的准确信息：

- 项目使用的框架、库和工具
- 现有 API 端点和 schema  
- 文档生成能力
- 技术栈的标准模式
</mcp_usage>

**盘点现有文档：**

```bash
# Find all documentation files
find . -name "*.md" -o -name "*.rst" -o -name "*.txt" | grep -E "(README|CHANGELOG|CONTRIBUTING|docs/)"

# Find index documents specifically
find . -name "index.md" -o -name "SUMMARY.md" -o -name "_sidebar.md" -o -name "getting-started.md"
find . -name "mkdocs.yml" -o -name "docusaurus.config.js"

# Check for generated docs
find . -name "openapi.*" -o -name "*.graphql" -o -name "swagger.*"

# Look for JSDoc/similar
grep -r "@param\|@returns\|@example" --include="*.js" --include="*.ts"
```

### 用户旅程映射

识别关键用户路径：

- **开发者上手**：克隆 → 设置 → 首次贡献
- **API 使用**：发现 → 身份验证 → 集成
- **功能使用**：问题 → 解决方案 → 实现
- **故障排除**：错误 → 诊断 → 解决

### 文档缺口分析

**高影响缺口**（优先处理）：

- 缺少主要用例的设置说明
- API 端点缺少示例
- 错误消息缺少解决方案
- 复杂模块缺少用途说明

**低影响缺口**（通常跳过）：

- 次要工具函数缺少注释
- 仅由单个模块使用的内部 API
- 临时实现
- 不言自明的配置

## 智能文档策略

### 何时自动生成，何时手动编写

**以下内容使用自动生成：**

- **OpenAPI/Swagger**：根据代码注解生成 API 文档
- **GraphQL Schema**：类型定义和查询
- **JSDoc**：函数签名和基本参数文档
- **数据库模式**：Prisma、TypeORM、Sequelize 模型
- **CLI 帮助**：根据参数解析库生成

**以下内容手动编写文档：**

- **集成示例**：真实使用模式
- **业务逻辑说明**：解释为何做出这些决策
- **故障排除指南**：实际问题的解决方案
- **入门工作流**：精心设计的理想路径
- **架构决策**：影响 API 设计的决策

### 文档工具及其适用场景

**OpenAPI/Swagger：**

- ✅ 非常适合：REST API 参考、请求/响应示例
- ❌ 不适合：集成指南、身份验证流程
- **局限性**：需要严格遵守规范，确保注解保持最新

**GraphQL 内省：**

- ✅ 非常适合：模式探索、类型定义
- ❌ 不适合：查询示例、业务上下文
- **局限性**：不包含使用模式或业务逻辑

**Prisma Schema：**

- ✅ 非常适合：数据库关系、模型定义  
- ❌ 不适合：查询模式、性能考量
- **局限性**：无法体现业务规则

**JSDoc/TSDoc：**

- ✅ 非常适合：函数契约、参数类型
- ❌ 不适合：模块架构、集成示例  
- **局限性**：缺乏强制执行机制时很容易过时

## 文档审计指南

### 质量评估

对于每份现有文档，请考虑：

1. 该文档上次更新是什么时候？（>6 个月 = 存疑）
2. 这些信息是否也存在于其他地方？（重复检查）
3. 它是否有助于完成实际任务？（实用性检查）  
4. 需要时能否找到它？（可发现性检查）
5. 删除它是否会破坏某人的工作流？（影响检查）

### 战略性更新

**高影响、低投入的更新：**

- 修复失效链接和过时的代码示例
- 补充缺失且会导致常见故障的设置步骤
- 创建模块级 README 导航辅助内容
- 记录身份验证/配置模式

**尽可能实现自动化：**

- 设置从代码生成 API 文档
- 配置 JSDoc 构建  
- 添加模式文档生成功能
- 创建文档规范检查/时效性检查

## 文档模式参考

### README.md 最佳实践

**项目根目录 README：**

```markdown
# Project Name

Brief description (1-2 sentences max).

## Quick Start
[Fastest path to success - must work in <5 minutes]

## Documentation
- [API Reference](./docs/api/) - if complex APIs
- [Guides](./docs/guides/) - if complex workflows  
- [Contributing](./CONTRIBUTING.md) - if accepting contributions

## Status
[Current state, known limitations]
```

**模块 README 模式：**

```markdown
# Module Name

**Purpose**: One sentence describing why this module exists.

**Key exports**: Primary functions/classes users need.

**Usage**: One minimal example.

See: [Main documentation](../docs/) for detailed guides.
```

### 索引文档

索引文档是文档的导航辅助工具和入口点。更新文档时，务必检查是否还需要更新相关的索引文档。

**需要更新的常见索引文档：**

| 文档 | 位置 | 更新时机 |
|----------|----------|-------------|
| `README.md` | 项目根目录 | 新增功能、模块或发生重大变更时 |
| `README.md` | 模块目录 | 模块 API、导出项或用途发生变化时 |
| `index.md` | `docs/` 根目录 | 新增文档页面或结构发生变化时 |
| `getting-started.md` | `docs/` | 设置步骤、先决条件或快速入门发生变化时 |
| `guides.md` | `docs/` | 新增指南或指南分类发生变化时 |
| `reference.md` | `docs/` | 新增 API 参考文档或参考文档结构发生变化时 |
| `resources.md` | `docs/` | 新增工具、链接或资源时 |
| `SUMMARY.md` | `docs/`（GitBook） | 文档结构发生任何变化时 |
| `_sidebar.md` | `docs/`（Docsify） | 导航结构发生变化时 |
| `mkdocs.yml` | 项目根目录（MkDocs） | 文档导航发生变化时 |

**索引文档更新检查清单：**

当文档变更影响某个模块或功能时：

1. **模块级索引** - 更新模块的 `README.md`：
   - 添加/移除导出的函数或类
   - 如果 API 发生变化，则更新用法示例
   - 如果范围发生变化，则更新用途说明

2. **章节级索引** - 更新相关的 `docs/` 索引文件：
   - `docs/guides.md` - 如果新增指南
   - `docs/reference.md` - 如果新增 API 文档
   - `docs/tutorials.md` - 如果新增教程

3. **项目级索引** - 更新根目录的 `README.md`：
   - 将新功能添加到功能列表
   - 如果入口点发生变化，则更新快速入门
   - 将新模块添加到项目结构

4. **导航索引** - 更新站点导航（如果存在）：
   - GitBook 项目的 `SUMMARY.md`
   - Docsify 项目的 `_sidebar.md`
   - MkDocs 项目的 `mkdocs.yml` nav 部分

**示例：添加新功能**

向报告模块添加新的“导出”功能时：

```text
Files to update:
├── src/reporting/README.md      → Add export to key exports
├── docs/guides/index.md         → Link to new export guide
├── docs/guides/exporting.md     → Create new guide (main content)
├── docs/reference/index.md      → Link to export API reference
├── README.md                    → Mention export in features list
└── SUMMARY.md                   → Add navigation entries
```

### JSDoc 最佳实践

**应记录以下内容：**

```typescript  
/**
 * Processes payment with retry logic and fraud detection.
 * 
 * @param payment - Payment details including amount and method
 * @param options - Configuration for retries and validation  
 * @returns Promise resolving to transaction result with ID
 * @throws PaymentError when payment fails after retries
 * 
 * @example
 * ```typescript
 * const result = await processPayment({
 *   amount: 100,
 *   currency: 'USD', 
 *   method: 'card'
 * });
 * ```
 */
async function processPayment(payment: PaymentRequest, options?: PaymentOptions): Promise<PaymentResult>
```

**不应记录以下内容：**

```typescript
// ❌ Obvious functionality
getName(): string

// ❌ Simple CRUD
save(user: User): Promise<void>

// ❌ Self-explanatory utilities  
toLowerCase(str: string): string
```

## 质量门禁

**发布前：**

- [ ] 所有代码示例均已测试且可正常运行
- [ ] 链接已验证（无 404）  
- [ ] 已明确说明文档用途
- [ ] 已确定受众和先决条件
- [ ] 未与生成的文档重复
- [ ] 已制定维护计划

**防止文档债务：**

- [ ] 自动检查失效链接
- [ ] 在适用情况下，优先采用生成的文档而非手动编写的文档  
- [ ] 每个主要文档领域都有明确的负责人
- [ ] 定期清理过时内容

## 文档更新摘要模板

```markdown
## Documentation Updates Completed

### Files Updated
- [ ] README.md (root)
- [ ] Module README.md files
- [ ] docs/ directory organization
- [ ] API documentation (generated/manual)
- [ ] JSDoc comments for complex logic

### Index Documents Updated
- [ ] Root README.md - features list, quick start
- [ ] Module README.md files - exports, usage
- [ ] docs/index.md or SUMMARY.md - navigation
- [ ] docs/tutorials.md or getting-started.md - tutorials
- [ ] docs/guides.md - guides
- [ ] docs/reference.md - API reference
- [ ] Other index files: [list any others]

### Changes Documented
- [List code changes that were documented]
- [New documentation created]
- [Existing documentation updated]

### Quality Review
- [ ] All examples tested and working
- [ ] Links verified
- [ ] Index documents link to new content
- [ ] Follows project conventions

### Next Steps
- [Any follow-up documentation tasks]
- [Maintenance notes]
```