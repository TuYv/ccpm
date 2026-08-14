---
name: docs-search
description: Search auto-generated codebase documentation for function signatures, API docs, class definitions, and code comments. Use when the user asks to "search docs", "find documentation", "look up a function", "check the API", or before implementing changes to verify correct signatures and patterns.
---
# AI Maestro 文档搜索

在代码库自动生成的文档中搜索函数签名、类定义、API 文档和代码注释。在编写代码之前验证正确的模式。属于 [AI Maestro](https://github.com/23blocks-OS/ai-maestro) 套件的一部分。

## 前置条件

需要在本地运行 [AI Maestro](https://github.com/23blocks-OS/ai-maestro)，并且文档已建立索引。

```bash
# Install doc tools
git clone https://github.com/23blocks-OS/ai-maestro-plugins.git
cd ai-maestro-plugins && ./install-doc-tools.sh
```

## 核心行为

在实现任何代码更改之前，先搜索文档：

```
Receive instruction -> Search docs -> Then implement
```

## 命令

### 搜索
| 命令 | 描述 |
|---------|-------------|
| `docs-search.sh <query>` | 语义文档搜索 |
| `docs-search.sh --keyword <term>` | 精确关键字匹配 |
| `docs-find-by-type.sh <type>` | 按类型查找（函数、类、模块） |
| `docs-get.sh <doc-id>` | 获取完整文档内容 |

### 索引
| 命令 | 描述 |
|---------|-------------|
| `docs-index.sh [path]` | 从项目创建完整索引 |
| `docs-index-delta.sh [path]` | 增量索引（仅新增或修改的文件） |
| `docs-list.sh` | 列出所有已索引的文档 |
| `docs-stats.sh` | 索引统计信息 |

## 文档类型

| 类型 | 来源 |
|------|---------|
| `function` | JSDoc、RDoc、文档字符串 |
| `class` | 类级注释 |
| `module` | 模块/命名空间注释 |
| `interface` | TypeScript 接口 |
| `component` | React/Vue 组件注释 |
| `readme` | README 文件 |
| `guide` | docs/ 文件夹内容 |

## 使用示例

```bash
# Semantic search
docs-search.sh "authentication flow"

# Keyword search for specific identifier
docs-search.sh --keyword "UserController"

# Find all class documentation
docs-find-by-type.sh class

# Get full document details
docs-get.sh doc-abc123

# Index your codebase (first time)
docs-index.sh /path/to/project

# Update index after changes
docs-index-delta.sh
```

## 完整的 AI Maestro 体验

此技能是 [AI Maestro](https://github.com/23blocks-OS/ai-maestro) 平台的一部分。该平台为 AI 智能体编排提供 **6 项技能**：消息传递、记忆、文档、图谱、规划和智能体管理。