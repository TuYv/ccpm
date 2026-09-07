---
name: codebase-analyzer
description: This skill should be used when the user asks to "initialize auto-memory", "create CLAUDE.md", "set up project memory", or runs the /auto-memory:init command. Analyzes codebase structure and generates CLAUDE.md files using the exact template format with AUTO-MANAGED markers.
---
# 代码库分析器

以交互方式分析项目结构并生成 CLAUDE.md 文件。

## 指南

**强制要求**：必须严格遵循以下所有规则。违反规则会导致 CLAUDE.md 内容不正确。

@../shared/references/guidelines.md

## 算法

### 1. 检查现有的 CLAUDE.md

如果 CLAUDE.md 已存在，询问用户如何处理：
- **迁移**：转换为自动管理格式（添加标记）
- **备份**：创建 CLAUDE.md.backup 并全新生成
- **合并**：保留手动章节，添加自动管理章节
- **取消**：中止初始化

### 2. 扫描目录结构

检测框架和构建系统：
- `package.json` - Node.js/JavaScript
- `pyproject.toml`, `setup.py` - Python
- `Cargo.toml` - Rust
- `go.mod` - Go
- `Makefile` - 基于 Make 的构建
- `Dockerfile` - 容器构建

从配置文件中提取构建/测试/lint 命令。

### 3. 识别子树候选

寻找值得为其创建单独 CLAUDE.md 文件的框架边界：
- 包含 10 个以上源文件的 `src/`
- `lib/` 目录
- `packages/*`（monorepo 软件包）
- `apps/*`（monorepo 应用）

### 4. 检测代码模式

分析源文件以识别约定：
- **命名**：PascalCase、camelCase、snake_case 的使用情况
- **导入**：ES6 模块、CommonJS、导入顺序模式
- **架构**：基于功能、分层、MVC 模式
- **风格**：缩进、引号、分号

### 5. 获取记忆指南（可选）

如果网络可用，从 `https://code.claude.com/docs/en/memory` 获取：
- 使用 WebFetch 工具
- 提取相关章节作为上下文
- 以上述官方指南为主要参考来源

### 6. 呈现分析结果

使用 AskUserQuestion 进行确认：
- 检测到的框架和命令
- 建议的子树位置
- 检测到的模式

### 7. 生成记忆文件

读取 `.claude/auto-memory/config.json`，根据 `memoryFiles` 确定要生成哪些文件：

| `memoryFiles` 值 | 要生成的文件 |
|---|---|
| 缺失或 `["CLAUDE.md"]` | 仅 `CLAUDE.md`（完整内容） |
| `["AGENTS.md"]` | 仅 `AGENTS.md`（完整内容） |
| `["CLAUDE.md", "AGENTS.md"]` | `AGENTS.md`（完整内容）+ `CLAUDE.md`（重定向） |

使用完全一致的模板结构生成完整内容文件。请严格按以下步骤操作：

1. **复制模板骨架** - 使用合适的模板（CLAUDE 或 AGENTS）作为基础结构
2. **使用精确的标记格式** - 参见下文的标记语法章节
3. **替换占位符** - 将 `{{PLACEHOLDER}}` 替换为检测到的内容
4. **包含所有必需章节** - 即使内容很少，也要包含相应章节
5. **添加 MANUAL 章节**，置于末尾供用户记录备注
6. **大小限制**：根目录 150-200 行，子树 50-75 行

当 `CLAUDE.md` 和 `AGENTS.md` 同时配置时，还需生成重定向文件：
- 在根目录：使用 `CLAUDE.redirect.md.template` 写入 `CLAUDE.md`（静态指针，不含标记）
- 对于每个生成了 `AGENTS.md` 的子树：在其旁边写入对应的 `CLAUDE.md` 重定向文件

## 标记语法

**关键**：必须使用下方完全一致的标记格式。切勿使用任何变体。

```markdown
<!-- AUTO-MANAGED: section-name -->
## Section Heading

Content goes here

<!-- END AUTO-MANAGED -->
```

对于用户可编辑的内容：

```markdown
<!-- MANUAL -->
## Custom Notes

Add project-specific notes here. This section is never auto-modified.

<!-- END MANUAL -->
```

**应避免的常见错误**：
- `<!-- BEGIN AUTO-MANAGED: name -->` - 错误（不应有 BEGIN 前缀）
- `<!-- END AUTO-MANAGED: name -->` - 错误（闭合标签中不应包含名称）
- `<!-- AUTO-MANAGED section-name -->` - 错误（缺少冒号）

## 章节定义

### 根目录 CLAUDE.md 章节

按以下顺序生成这些章节：

| 章节名称 | 标题 | 是否必需 | 占位符 | 内容 |
|--------------|---------|----------|-------------|---------|
| `project-description` | ## Overview | 是 | `{{DESCRIPTION}}` | 项目名称、标语、关键特性 |
| `build-commands` | ## Build & Development Commands | 是 | `{{BUILD_COMMANDS}}` | 构建、测试、lint、运行命令 |
| `architecture` | ## Architecture | 是 | `{{ARCHITECTURE}}` | 目录树、关键文件、数据流 |
| `conventions` | ## Code Conventions | 是 | `{{CONVENTIONS}}` | 命名、导入、格式化规则 |
| `patterns` | ## Detected Patterns | 是 | `{{PATTERNS}}` | AI 检测到的重复出现的代码模式 |
| `git-insights` | ## Git Insights | 否 | `{{GIT_INSIGHTS}}` | 关键提交、设计决策 |
| `best-practices` | ## Best Practices | 否 | `{{BEST_PRACTICES}}` | 来自 Claude Code 官方文档的最佳实践 |

### 子树 CLAUDE.md 章节

按以下顺序生成这些章节：

| 章节名称 | 标题 | 是否必需 | 占位符 | 内容 |
|--------------|---------|----------|-------------|---------|
| `module-description` | ## Purpose | 是 | `{{DESCRIPTION}}` | 模块用途与职责 |
| `architecture` | ## Module Architecture | 是 | `{{ARCHITECTURE}}` | 模块结构、关键文件 |
| `conventions` | ## Module-Specific Conventions | 是 | `{{CONVENTIONS}}` | 模块特有规则 |
| `dependencies` | ## Key Dependencies | 是 | `{{DEPENDENCIES}}` | 模块依赖 |

## 模板

请参考模板文件以了解确切结构：

### CLAUDE.md 根模板
@templates/CLAUDE.root.md.template

### CLAUDE.md 子树模板
@templates/CLAUDE.subtree.md.template

### AGENTS.md 根模板
@templates/AGENTS.root.md.template

### AGENTS.md 子树模板
@templates/AGENTS.subtree.md.template

### CLAUDE.md 重定向模板（当两个文件均已配置时）
@templates/CLAUDE.redirect.md.template

## 用户交互

在以下情况使用 AskUserQuestion：
1. 已有 CLAUDE.md 的处理方式（迁移/备份/合并/取消）
2. 子树位置确认
3. 写入文件前的最终批准

## 输出

生成文件后，报告以下内容：
- 已创建/修改的文件
- 已填充的章节
- 任何警告或建议
