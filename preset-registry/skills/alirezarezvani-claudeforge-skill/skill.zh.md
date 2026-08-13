---
name: claude-md-enhancer
description: Analyzes, generates, and enhances CLAUDE.md files for any project type using best practices, modular architecture support, and tech stack customization. Use when setting up new projects, improving existing CLAUDE.md files, or establishing AI-assisted development standards.
model: haiku
effort: medium
paths:
  - "**/CLAUDE.md"
  - "**/CLAUDE.local.md"
  - "**/AGENTS.md"
  - "**/.cursorrules"
  - "**/.windsurfrules"
  - "**/.claude/rules/*.md"
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - "Bash(ls:*)"
  - "Bash(find:*)"
  - "Bash(git:*)"
  - "Bash(wc:*)"
permissions:
  allow:
    - Read
    - Write
    - Edit
    - Glob
    - Grep
    - "Bash(ls:*)"
    - "Bash(find:*)"
    - "Bash(git:*)"
---
# CLAUDE.md 文件增强器

此技能为 Claude Code 项目提供全面的 CLAUDE.md 文件生成与增强功能。它会分析现有文件，依据最佳实践进行验证，并根据你的项目类型、技术栈和团队规模生成定制化指南。

## 功能

- **🆕 交互式初始化**：智能工作流，可探索你的代码仓库、检测项目类型和技术栈、请求确认，然后创建定制化的 CLAUDE.md 文件
- **✨ 100% 符合原生格式**：所有生成的文件均遵循 Claude Code 官方格式，包含项目结构图、设置说明、架构章节和文件结构说明（与 `/update-claude-md` 斜杠命令一致）
- **分析现有文件**：扫描并评估当前 CLAUDE.md 文件的结构、完整性和质量
- **验证最佳实践**：依据 Anthropic 指南（文件长度、必需章节、格式标准）进行检查
- **生成新文件**：为新项目从头创建完整的 CLAUDE.md 文件
- **增强现有文件**：补充缺失章节、改进结构，并更新至最新最佳实践
- **模块化架构**：支持在子目录（backend/、frontend/、docs/）中使用特定上下文的 CLAUDE.md 文件
- **技术栈定制**：针对特定技术（TypeScript、Python、Go、React、Vue 等）定制指南
- **团队规模适配**：根据团队规模（个人、小型 <10、大型 10+）调整复杂度
- **模板选择**：根据项目复杂度和开发阶段选择合适的模板

## 输入要求

### 用于分析和增强

提供现有 CLAUDE.md 文件内容或文件路径：

```json
{
  "mode": "enhance",
  "file_path": "CLAUDE.md",
  "content": "[existing CLAUDE.md content]",
  "project_context": {
    "type": "web_app",
    "tech_stack": ["typescript", "react", "node", "postgresql"],
    "team_size": "small",
    "phase": "mvp"
  }
}
```

### 用于生成新文件

提供项目上下文：

```json
{
  "mode": "create",
  "project_context": {
    "type": "api",
    "tech_stack": ["python", "fastapi", "postgresql", "docker"],
    "team_size": "medium",
    "phase": "production",
    "workflows": ["tdd", "cicd", "documentation_first"]
  },
  "modular": true,
  "subdirectories": ["backend", "database", "docs"]
}
```

### 上下文参数

- **type**：项目类型（`web_app`、`api`、`fullstack`、`cli`、`library`、`mobile`、`desktop`）
- **tech_stack**：技术数组（例如，`["typescript", "react", "node"]`）
- **team_size**：`solo`、`small`（<10）、`medium`（10-50）、`large`（50+）
- **phase**：开发阶段（`prototype`、`mvp`、`production`、`enterprise`）
- **workflows**：关键工作流（`tdd`、`cicd`、`documentation_first`、`agile` 等）

## 输出格式

### 分析报告

```json
{
  "analysis": {
    "file_size": 450,
    "line_count": 320,
    "sections_found": [
      "Quick Navigation",
      "Core Principles",
      "Tech Stack",
      "Workflow Instructions"
    ],
    "missing_sections": [
      "Testing Requirements",
      "Error Handling Patterns"
    ],
    "issues": [
      {
        "type": "length_warning",
        "severity": "medium",
        "message": "File exceeds recommended 300 lines (320 lines)"
      },
      {
        "type": "missing_section",
        "severity": "low",
        "message": "Consider adding 'Testing Requirements' section"
      }
    ],
    "quality_score": 75,
    "recommendations": [
      "Split into modular files (backend/CLAUDE.md, frontend/CLAUDE.md)",
      "Add testing requirements section",
      "Reduce root file to <150 lines"
    ]
  }
}
```

### 生成的内容

完整的 CLAUDE.md 文件内容或需要添加的特定章节：

```markdown
# CLAUDE.md

This file provides guidance for Claude Code when working with this project.

## Quick Navigation

- [Backend Guidelines](backend/CLAUDE.md)
- [Frontend Guidelines](frontend/CLAUDE.md)
- [Database Operations](database/CLAUDE.md)
- [CI/CD Workflows](.github/CLAUDE.md)

## Core Principles

1. **Test-Driven Development**: Write tests before implementation
2. **Type Safety First**: Use TypeScript strict mode throughout
3. **Component Composition**: Favor small, reusable components
4. **Error Handling**: Always handle errors with proper logging
5. **Documentation Updates**: Keep docs in sync with code changes

[... additional sections based on template ...]
```

## 使用方法

### 示例 1：为新项目初始化 CLAUDE.md（交互式）

```
Hey Claude—I just added the "claude-md-enhancer" skill. I don't have a CLAUDE.md file yet. Can you help me create one for this project?
```

**执行过程**：
1. Claude 检查 CLAUDE.md 是否存在（不存在）
2. Claude 使用内置命令探索你的代码仓库
3. Claude 分析：项目类型、技术栈、团队规模和工作流
4. Claude 展示发现结果并请求确认
5. 你确认相关设置
6. Claude 创建定制的 CLAUDE.md 文件
7. Claude 使用最佳实践进行增强

**交互流程**：
- ✋ 创建前必须由用户确认
- 🔍 完整展示所发现的信息
- ⚙️ 可在继续之前调整设置

### 示例 2：分析现有的 CLAUDE.md

```
Hey Claude—I just added the "claude-md-enhancer" skill. Can you analyze my current CLAUDE.md file and tell me what's missing or could be improved?
```

### 示例 2：为 TypeScript 项目生成新的 CLAUDE.md

```
Hey Claude—I just added the "claude-md-enhancer" skill. Can you create a CLAUDE.md file for my TypeScript React project with a team of 5 developers? We use PostgreSQL, Docker, and follow TDD practices.
```

### 示例 3：增强现有文件

```
Hey Claude—I just added the "claude-md-enhancer" skill. Can you enhance my existing CLAUDE.md by adding missing sections and improving the structure? Here's my current file: [paste content]
```

### 示例 4：生成模块化架构

```
Hey Claude—I just added the "claude-md-enhancer" skill. Can you create a modular CLAUDE.md setup for my full-stack project? I need separate files for backend (Python/FastAPI), frontend (React), and database (PostgreSQL).
```

## 初始化工作流（新项目）

当项目中不存在 CLAUDE.md 时，此技能会提供智能初始化工作流：

### 工作流步骤

**步骤 1：检测**
- 技能检查项目根目录中是否存在 CLAUDE.md
- 如果未找到，则启动初始化工作流

**步骤 2：代码仓库探索**
- 使用 Claude Code 的内置 `explore` 命令
- 分析项目结构、文件和目录
- 检查配置文件（package.json、requirements.txt、go.mod 等）
- 查阅现有文档

**步骤 3：智能分析**
- **项目类型检测**：web_app、api、fullstack、cli、library、mobile、desktop
- **技术栈检测**：TypeScript、Python、React、FastAPI、PostgreSQL、Docker 等
- **团队规模估算**：根据项目复杂度判断（solo、small、medium、large）
- **开发阶段**：prototype、mvp、production、enterprise
- **工作流检测**：TDD、CI/CD、documentation-first、agile
- **结构建议**：单文件架构与模块化架构

**步骤 4：用户确认** ✋
- 以清晰的格式展示所有发现
- 展示推荐的 CLAUDE.md 结构
- 请用户确认或调整设置
- 继续之前，**用户必须明确批准**

**步骤 5：文件创建**
- 根据已确认的设置生成定制的 CLAUDE.md
- 如果建议采用模块化结构，则创建模块化文件（backend/、frontend/ 等）
- 应用特定技术的最佳实践

**步骤 6：增强**
- 验证生成的内容
- 添加质量改进
- 确保完整性

**步骤 7：总结**
- 展示已创建的文件
- 提供后续步骤
- 可立即投入使用

### 交互示例

```
User: "I need a CLAUDE.md for this project"

Claude: "I'll explore your repository first to understand the project.
        [Explores using built-in commands]

        Based on my exploration, here's what I discovered:

        Project Type: Full-Stack Application
        Tech Stack: TypeScript, React, Node.js, PostgreSQL, Docker
        Team Size: Small (2-9 developers)
        Development Phase: MVP
        Workflows: TDD, CI/CD

        Recommended Structure: Modular architecture
        - Root CLAUDE.md (navigation hub)
        - backend/CLAUDE.md (API guidelines)
        - frontend/CLAUDE.md (React guidelines)

        Would you like me to create these files?"

User: "Yes, please proceed"

Claude: "Creating customized CLAUDE.md files...
        ✅ Created CLAUDE.md (100 lines)
        ✅ Created backend/CLAUDE.md (150 lines)
        ✅ Created frontend/CLAUDE.md (175 lines)

        Your project is ready for AI-assisted development!"
```

## 脚本

### workflow.py
管理新项目的交互式初始化工作流。

**关键函数**：
- `check_claude_md_exists()` - 检测 CLAUDE.md 是否存在
- `generate_exploration_prompt()` - 引导 Claude 探索代码仓库
- `analyze_discoveries()` - 分析探索结果
- `generate_confirmation_prompt()` - 创建用户确认提示
- `get_workflow_steps()` - 获取完整的工作流步骤

### analyzer.py
分析现有 CLAUDE.md 文件，以识别其结构、章节和质量问题。

**关键函数**：
- `analyze_file()` - 解析并分析 CLAUDE.md 结构
- `detect_sections()` - 识别已有和缺失的章节
- `calculate_quality_score()` - 评估文件质量（0-100）
- `generate_recommendations()` - 提供可执行的改进建议

### validator.py
根据最佳实践和 Anthropic 指南验证 CLAUDE.md 文件。

**关键函数**：
- `validate_length()` - 检查文件长度（硬性上限：150 行；从 120 行开始警告）
- `validate_structure()` - 验证是否包含必需章节
- `validate_formatting()` - 检查 Markdown 格式质量
- `validate_completeness()` - 确保包含关键信息

### generator.py
基于模板生成新的 CLAUDE.md 内容或缺失的章节。

**关键函数**：
- `generate_root_file()` - 创建主 CLAUDE.md 编排文件
- `generate_context_file()` - 创建特定上下文的文件（backend、frontend 等）
- `generate_section()` - 生成各个章节（技术栈、工作流等）
- `merge_with_existing()` - 向现有文件添加新章节

### template_selector.py
根据项目上下文选择合适的模板。

**关键函数**：
- `select_template()` - 根据项目类型和团队规模选择模板
- `customize_template()` - 根据技术栈调整模板
- `determine_complexity()` - 计算合适的详细程度
- `recommend_modular_structure()` - 建议子目录组织结构

## 最佳实践

### 关键验证规则 ⚠️

**“在宣布完成之前，始终根据官方原生示例验证你的输出。”**

在完成任何 CLAUDE.md 生成工作之前：
1. 将输出与 `/update-claude-md` 斜杠命令格式进行比较
2. 查阅 Claude Code 官方文档中的必需章节
3. 验证是否包含所有原生格式章节（概述、项目结构、文件结构、设置与安装、架构等）
4. 与 `examples/` 文件夹中的参考示例进行交叉核对

### 对于新项目
1. 从最小模板（50-100 行）开始，并根据需要逐步扩展
2. 对包含 >3 个主要组件的项目使用模块化架构
3. 立即包含技术栈参考信息
4. 在团队规模增长到 5 人以上之前添加工作流说明

### 对于增强
1. 修改前先分析——首先了解当前结构
2. 保留自定义内容——只进行增强，不要替换
3. 更改后进行验证——确保改进不会破坏现有模式
4. 使用 Claude Code 进行测试——验证指南是否按预期工作

### 通用指南
1. **保持根文件简洁**——最多 150 行，将其用作导航中心
2. **使用特定上下文的文件**——backend/CLAUDE.md、frontend/CLAUDE.md 等
3. **避免重复**——每条指南只应出现一次
4. **链接到外部文档**——不要复制官方文档
5. **定期更新**——每季度或在技术栈发生变化时审查指南

## 局限性

### 技术约束
- 需要有效的项目上下文才能准确选择模板
- 技术栈检测基于关键字，可能需要手动优化
- 模块化文件生成假定使用标准目录结构

### 范围边界
- 专注于 CLAUDE.md 结构，而非项目特定的业务逻辑
- 最佳实践建议具有通用性，可能需要针对特定行业进行定制
- 验证基于指南，而非强制执行（未经批准不会自动修复）

### 不应使用的情况
- 用于非 Claude AI 工具时（此功能专用于 Claude Code）
- 用于不使用 Claude Code 或类似 AI 助手的项目时
- 当你需要高度专业化的领域指南时（法律、医疗合规）

## 模板类别

### 按规模划分（单个 CLAUDE.md 上限：150 行）
- **最小型**（≤ 75 行）——独立开发者、原型、黑客松
- **核心型**（≤ 100 行）——小型团队、MVP、标准项目
- **详细型**（≤ 125 行）——中型团队、生产系统
- **综合型**（≤ 150 行 + 模块化子文件）——大型团队、企业；将详细内容分散到链式子 CLAUDE.md 文件中，而不是扩充根文件

### 按项目类型
- **Web 应用** - 以前端为重点（React、Vue、Angular）
- **API** - 后端服务（REST、GraphQL、微服务）
- **全栈** - 集成前端与后端
- **CLI** - 命令行工具和实用程序
- **库** - 可复用的软件包和框架
- **移动应用** - React Native、Flutter、原生 iOS/Android

### 按技术栈
- **TypeScript/Node** - 现代 JavaScript 生态系统
- **Python** - Django、FastAPI、Flask
- **Go** - Gin、Echo、原生服务
- **Java/Kotlin** - Spring Boot、企业级 Java
- **Ruby** - Rails、Sinatra

## 质量指标

### 文件质量评分（0-100）

根据以下因素计算：
- **长度适当性**（25 分）- 不过短或过长
- **章节完整性**（25 分）- 包含必需章节
- **格式质量**（20 分）- 使用正确的 Markdown 结构
- **内容针对性**（15 分）- 针对具体项目，而非泛泛而谈
- **模块化组织**（15 分）- 在适当情况下使用子目录文件

### 建议优先级

- **严重** - 缺少必需章节、文件过长（>400 行）
- **高** - 缺少重要章节、存在格式问题
- **中** - 可添加可选章节、存在少量改进空间
- **低** - 锦上添花式的增强、风格建议

## 高级功能

### 模块化架构支持

自动生成特定上下文的文件：

```
project-root/
├── CLAUDE.md                 # Root orchestrator (100-150 lines)
├── backend/
│   └── CLAUDE.md            # Backend-specific (150-200 lines)
├── frontend/
│   └── CLAUDE.md            # Frontend-specific (150-200 lines)
├── database/
│   └── CLAUDE.md            # Database operations (100-150 lines)
└── .github/
    └── CLAUDE.md            # CI/CD workflows (100-150 lines)
```

### 技术栈检测

自动从以下文件中检测技术：
- `package.json`（Node.js/TypeScript）
- `requirements.txt` 或 `pyproject.toml`（Python）
- `go.mod`（Go）
- `Cargo.toml`（Rust）
- `pom.xml` 或 `build.gradle`（Java）

### 团队规模适配

调整详细程度：
- **个人**：最精简的指南，注重效率
- **小型（<10）**：核心指南、基本工作流
- **中型（10-50）**：详细指南、团队协作
- **大型（50+）**：全面指南、流程执行

## 参考资料

- **Anthropic Claude Code 文档**：https://docs.claude.com/en/docs/claude-code
- **CLAUDE.md 最佳实践**：基于社区模式和 Anthropic 指南
- **CLAUDE.md 文件示例**：请参阅 `examples/` 文件夹，其中包含 6 个参考实现，涵盖不同的项目类型和团队规模

## 版本

**版本**：1.0.0
**最后更新**：2025 年 11 月
**兼容**：Claude Code 2.0+、Claude Apps、Claude API

请记住：目标是让 Claude 更高效、更具上下文感知能力，而不是制造官僚流程。从简单做起，根据实际使用情况持续迭代，并尽可能实现质量检查自动化。