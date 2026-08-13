---
name: agent-factory
description: Claude Code agent generation system that creates custom agents and sub-agents with enhanced YAML frontmatter, tool access patterns, and MCP integration support following proven production patterns
---
# Agent 工厂

一个用于生成生产就绪的 Claude Code 智能体和子智能体的综合系统。此技能提供模板、标准和生成工具，用于创建可与 Claude Code 智能体系统无缝集成的自定义智能体。

## 此技能的作用

此技能可帮助你为任何领域或工作流创建自定义 Claude Code 智能体。它会生成格式正确的智能体文件，使 Claude Code 能够在相关场景中自动发现并调用这些智能体。

### 功能

1. **生成自定义智能体** - 为任何领域（前端、后端、测试、产品等）创建专用智能体
2. **增强型 YAML Frontmatter** - 丰富的元数据，包括颜色编码、领域分类、专业水平
3. **工具访问指导** - 根据智能体类型推荐最佳工具配置
4. **MCP 集成** - 推荐相关的 MCP 服务器工具以增强功能
5. **执行模式分配** - 确保采用适当的并行或顺序执行方式以保障安全
6. **验证** - 根据最佳实践检查智能体配置

## 支持的智能体类型

### 战略型智能体（轻量级、可安全并行）
- **用途**：规划、研究、分析
- **工具**：Read、Write、Grep
- **执行方式**：可并行运行 4-5 个智能体
- **颜色**：蓝色
- **示例**：product-planner、market-researcher、architect

### 实现型智能体（完整工具、协调执行）
- **用途**：编写代码、构建功能
- **工具**：Read、Write、Edit、Bash、Grep、Glob
- **执行方式**：协调运行 2-3 个智能体
- **颜色**：绿色
- **示例**：frontend-developer、backend-developer、api-builder

### 质量型智能体（大量使用 Bash、仅限顺序执行）
- **用途**：测试、验证、审查
- **工具**：Read、Write、Edit、Bash、Grep、Glob
- **执行方式**：一次运行 1 个智能体（绝不并行）
- **颜色**：红色
- **示例**：test-runner、code-reviewer、security-auditor

### 协调型智能体（轻量级、负责统筹）
- **用途**：管理其他智能体、验证集成情况
- **工具**：Read、Write、Grep
- **执行方式**：统筹其他智能体
- **颜色**：紫色
- **示例**：fullstack-coordinator、workflow-manager

## 增强型 YAML Frontmatter

每个生成的智能体都包含丰富的元数据：

```yaml
---
name: agent-name-kebab-case
description: When to invoke this agent
tools: Read, Write, Edit  # Comma-separated
model: sonnet  # sonnet|opus|haiku|inherit
color: green  # Visual categorization
field: frontend  # Domain area
expertise: expert  # beginner|intermediate|expert
mcp_tools: mcp__playwright  # MCP integrations
---
```

### 领域类别

**开发**：`frontend`、`backend`、`fullstack`、`mobile`、`devops`  
**质量**：`testing`、`security`、`performance`  
**战略**：`product`、`architecture`、`research`、`design`  
**领域**：`data`、`ai`、`content`、`finance`、`infrastructure`

### 颜色编码

- **蓝色**：战略/规划型智能体
- **绿色**：实现/开发型智能体
- **红色**：质量/测试型智能体
- **紫色**：协调/统筹型智能体
- **橙色**：特定领域专家

### 专业水平

- **初级**：简单、专注的任务
- **中级**：复杂度适中的工作流
- **专家级**：高级、复杂的操作

## 使用方法

### 快速开始

1. **打开提示词模板**：[documentation/templates/AGENTS_FACTORY_PROMPT.md](../../documentation/templates/AGENTS_FACTORY_PROMPT.md)
2. **滚动到底部** - 找到模板变量
3. **填写你的详细信息**：
   ```
   AGENT_NAME: my-custom-agent
   DESCRIPTION: What this agent does and when to invoke it
   DOMAIN_FIELD: frontend
   TOOLS_NEEDED: Read, Write, Edit, Bash
   ```
4. **复制完整提示词** - 包括已填写的变量
5. **粘贴到 Claude 中** - Claude.ai、Claude Code 或 API
6. **接收智能体文件** - 可直接使用的完整 .md 文件
7. **安装智能体** - 复制到 `.claude/agents/` 或 `~/.claude/agents/`

### 调用示例

```
@agent-factory

Create a custom agent:
Name: api-integration-specialist
Type: Implementation
Domain: backend
Description: API integration expert for third-party services
Capabilities: OAuth, REST clients, error handling
Tools: Read, Write, Edit, Bash
MCP: mcp__github
```

**输出**：完整的 `.claude/agents/api-integration-specialist.md` 文件

## 生成的智能体结构

每个生成的智能体都是一个独立的 Markdown 文件：

```markdown
---
name: custom-agent
description: Triggers auto-invocation
tools: Read, Write, Edit
model: sonnet
color: green
field: backend
expertise: expert
mcp_tools: mcp__github
---

You are a [role] specializing in [domain].

When invoked:
1. [Step 1]
2. [Step 2]
3. [Step 3]

[Detailed instructions]
[Checklists]
[Best practices]
[Output format]
```

## 集成工作流

### 工作流 1：功能开发
```
1. product-planner → Creates requirements
2. frontend-developer + backend-developer → Build (parallel)
3. test-runner → Validates (sequential)
4. code-reviewer → Reviews (sequential)
```

### 工作流 2：错误修复
```
1. debugger → Analyzes issue
2. [appropriate-dev-agent] → Fixes
3. test-runner → Validates fix
```

### 工作流 3：代码审查
```
1. code-reviewer → Quality review (can run solo)
2. security-auditor → Security scan (can run solo)
```

## MCP 工具集成

常见的可集成 MCP 服务器：

- **mcp__github**：PR 审查、议题、仓库操作
- **mcp__playwright**：E2E 测试、截图、浏览器自动化
- **mcp__context7**：文档搜索、知识查询
- **mcp__filesystem**：高级文件操作
- **自定义 MCP 服务器**：任何用户配置的 MCP 工具

配置完成后，智能体会自动在其能力中引用 MCP 工具。

## 安全与性能

### 进程监控

智能体会消耗系统资源。使用以下命令进行监控：
```bash
ps aux | grep -E "mcp|npm|claude" | wc -l
```

**安全范围：**
- 15-20：策略智能体（并行）
- 20-30：实现智能体（协调运行）
- 12-18：质量智能体（顺序运行）

**警告：**
- >30：减少并行化
- >60：严重 - 重启系统

### 执行规则

✅ **安全**：4-5 个策略智能体并行运行
✅ **安全**：2-3 个实现智能体协调运行
❌ **不安全**：质量智能体并行运行（会导致系统崩溃）

## 最佳实践

1. **让代理保持专注** - 每个代理只承担一项明确的职责
2. **使用描述性说明** - 支持自动调用
3. **遵循工具访问模式** - 根据代理类型匹配工具
4. **指定执行模式** - 防止出现性能问题
5. **利用 MCP 工具** - 增强代理能力
6. **逐步测试代理** - 从简单功能开始，逐渐增加复杂度
7. **对代理进行版本控制** - 将项目代理签入 git

## 局限性

- 代理是模板 - 请根据具体需求进行自定义
- 工具建议仅供参考，并非强制要求
- MCP 工具需要配置相应的服务器
- 性能取决于系统资源
- 生成的代理需要在你的环境中进行测试

## 安装

**生成的代理文件：**

放置在以下位置之一：

**项目代理**（与团队共享）：
```bash
.claude/agents/custom-agent.md
```

**个人代理**（可在所有位置使用）：
```bash
~/.claude/agents/custom-agent.md
```

## 何时使用此 Skill

**为以下用途创建自定义代理：**
- 特定领域的工作流（数据科学、ML、金融）
- 团队特定的约定（代码风格、测试方法）
- 专用工具或框架（Shopify、AWS、Kubernetes）
- 自定义 MCP 服务器集成
- 快速构建代理创意的原型

**在以下情况下使用 AGENTS_FACTORY_PROMPT.md 模板：**
- 你需要多个相互关联的代理
- 你希望采用一致的代理模式
- 你正在构建代理式框架
- 你希望快速测试代理概念

---

**版本**：1.0.0
**最后更新**：2025 年 10 月 22 日
**兼容性**：Claude Code（代理系统）
**模板位置**：[documentation/templates/AGENTS_FACTORY_PROMPT.md](../../documentation/templates/AGENTS_FACTORY_PROMPT.md)