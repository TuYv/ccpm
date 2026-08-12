---
name: everything-claude-code-conventions
description: Development conventions and patterns for everything-claude-code. JavaScript project with conventional commits.
---
# Everything Claude Code 约定

> 于 2026-03-20 根据 [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) 生成

## 概述

此技能向 Claude 介绍 everything-claude-code 中使用的开发模式和约定。

## 技术栈

- **主要语言**：JavaScript
- **架构**：混合模块组织
- **测试位置**：独立目录

## 何时使用此技能

在以下情况下激活此技能：
- 修改此仓库
- 按照既有模式添加新功能
- 编写符合项目约定的测试
- 使用正确的消息格式创建提交

## 提交约定

请遵循基于对 500 个提交的分析得出的以下提交消息约定。

### 提交风格：约定式提交

### 使用的前缀

- `fix`
- `test`
- `feat`
- `docs`

### 消息准则

- 消息平均长度：约 65 个字符
- 第一行应简洁且具有描述性
- 使用祈使语气（使用 "Add feature" 而不是 "Added feature"）


*提交消息示例*

```text
feat(rules): add C# language support
```

*提交消息示例*

```text
chore(deps-dev): bump flatted (#675)
```

*提交消息示例*

```text
fix: auto-detect ECC root from plugin cache when CLAUDE_PLUGIN_ROOT is unset (#547) (#691)
```

*提交消息示例*

```text
docs: add Antigravity setup and usage guide (#552)
```

*提交消息示例*

```text
merge: PR #529 — feat(skills): add documentation-lookup, bun-runtime, nextjs-turbopack; feat(agents): add rust-reviewer
```

*提交消息示例*

```text
Revert "Add Kiro IDE support (.kiro/) (#548)"
```

*提交消息示例*

```text
Add Kiro IDE support (.kiro/) (#548)
```

*提交消息示例*

```text
feat: add block-no-verify hook for Claude Code and Cursor (#649)
```

## 架构

### 项目结构：单包

此项目采用**混合**模块组织方式。

### 配置文件

- `.github/workflows/ci.yml`
- `.github/workflows/maintenance.yml`
- `.github/workflows/monthly-metrics.yml`
- `.github/workflows/release.yml`
- `.github/workflows/reusable-release.yml`
- `.github/workflows/reusable-test.yml`
- `.github/workflows/reusable-validate.yml`
- `.opencode/package.json`
- `.opencode/tsconfig.json`
- `.prettierrc`
- `eslint.config.js`
- `package.json`

### 准则

- 此项目采用混合组织方式
- 添加新代码时遵循既有模式

## 代码风格

### 语言：JavaScript

### 命名约定

| 元素 | 约定 |
|---------|------------|
| 文件 | camelCase |
| 函数 | camelCase |
| 类 | PascalCase |
| 常量 | SCREAMING_SNAKE_CASE |

### 导入风格：相对导入

### 导出风格：混合风格


*首选导入风格*

```typescript
// Use relative imports
import { Button } from '../components/Button'
import { useAuth } from './hooks/useAuth'
```

## 测试

### 测试框架

未检测到特定的测试框架——请使用仓库中既有的测试模式。

### 文件模式：`*.test.js`

### 测试类型

- **单元测试**：独立测试各个函数和组件
- **集成测试**：测试多个组件/服务之间的交互

### 覆盖率

本项目已配置覆盖率报告。目标是达到 80% 以上的覆盖率。


## 错误处理

### 错误处理风格：Try-Catch 块


*标准错误处理模式*

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('User-friendly message')
}
```

## 常见工作流

这些工作流是通过分析提交模式识别出来的。

### 数据库迁移

通过迁移文件变更数据库模式

**频率**：每月约 2 次

**步骤**：
1. 创建迁移文件
2. 更新模式定义
3. 生成/更新类型

**通常涉及的文件**：
- `**/schema.*`
- `migrations/*`

**示例提交序列**：
```
feat: implement --with/--without selective install flags (#679)
fix: sync catalog counts with filesystem (27 agents, 113 skills, 58 commands) (#693)
feat(rules): add Rust language rules (rebased #660) (#686)
```

### 功能开发

标准功能实现工作流

**频率**：每月约 22 次

**步骤**：
1. 添加功能实现
2. 为功能添加测试
3. 更新文档

**通常涉及的文件**：
- `manifests/*`
- `schemas/*`
- `**/*.test.*`
- `**/api/**`

**示例提交序列**：
```
feat(skills): add documentation-lookup, bun-runtime, nextjs-turbopack; feat(agents): add rust-reviewer
docs(skills): align documentation-lookup with CONTRIBUTING template; add cross-harness (Codex/Cursor) skill copies
fix: address PR review — skill template (When to use, How it works, Examples), bun.lock, next build note, rust-reviewer CI note, doc-lookup privacy/uncertainty
```

### 添加语言规则

向规则系统添加一种新的编程语言，包括编码风格、钩子、模式、安全性和测试指南。

**频率**：每月约 2 次

**步骤**：
1. 在 rules/{language}/ 下创建新目录
2. 添加包含特定语言内容的 coding-style.md、hooks.md、patterns.md、security.md 和 testing.md 文件
3. 可选择引用或链接到相关技能

**通常涉及的文件**：
- `rules/*/coding-style.md`
- `rules/*/hooks.md`
- `rules/*/patterns.md`
- `rules/*/security.md`
- `rules/*/testing.md`

**示例提交序列**：
```
Create a new directory under rules/{language}/
Add coding-style.md, hooks.md, patterns.md, security.md, and testing.md files with language-specific content
Optionally reference or link to related skills
```

### 添加新技能

向系统添加一项新技能，记录其工作流、触发条件和用法，通常还会包含配套脚本。

**频率**：每月约 4 次

**步骤**：
1. 在 skills/{skill-name}/ 下创建新目录
2. 添加包含文档（When to Use、How It Works、Examples 等）的 SKILL.md
3. 可选择在 skills/{skill-name}/scripts/ 下添加脚本或支持文件
4. 处理评审反馈并迭代完善文档

**通常涉及的文件**：
- `skills/*/SKILL.md`
- `skills/*/scripts/*.sh`
- `skills/*/scripts/*.js`

**示例提交序列**：
```
Create a new directory under skills/{skill-name}/
Add SKILL.md with documentation (When to Use, How It Works, Examples, etc.)
Optionally add scripts or supporting files under skills/{skill-name}/scripts/
Address review feedback and iterate on documentation
```

### 添加新 Agent

向系统中添加一个新的 Agent，用于代码审查、构建问题解决或其他自动化任务。

**频率**：约每月 2 次

**步骤**：
1. 在 agents/{agent-name}.md 下创建新的 Agent Markdown 文件
2. 在 AGENTS.md 中注册该 Agent
3. 可选择更新 README.md 和 docs/COMMAND-AGENT-MAP.md

**通常涉及的文件**：
- `agents/*.md`
- `AGENTS.md`
- `README.md`
- `docs/COMMAND-AGENT-MAP.md`

**示例提交序列**：
```
Create a new agent markdown file under agents/{agent-name}.md
Register the agent in AGENTS.md
Optionally update README.md and docs/COMMAND-AGENT-MAP.md
```

### 添加新命令

向系统中添加一个新命令，通常会配套一个作为支撑的 Skill。

**频率**：约每月 1 次

**步骤**：
1. 在 commands/{command-name}.md 下创建新的 Markdown 文件
2. 可选择在 skills/{skill-name}/SKILL.md 下添加或更新作为支撑的 Skill

**通常涉及的文件**：
- `commands/*.md`
- `skills/*/SKILL.md`

**示例提交序列**：
```
Create a new markdown file under commands/{command-name}.md
Optionally add or update a backing skill under skills/{skill-name}/SKILL.md
```

### 同步目录计数

同步 AGENTS.md 和 README.md 中记录的 Agent、Skill 和命令数量，使其与仓库的实际状态保持一致。

**频率**：约每月 3 次

**步骤**：
1. 更新 AGENTS.md 中的 Agent、Skill 和命令数量
2. 更新 README.md 中的相同数量（快速入门、对比表等）
3. 可选择更新其他文档文件

**通常涉及的文件**：
- `AGENTS.md`
- `README.md`

**示例提交序列**：
```
Update agent, skill, and command counts in AGENTS.md
Update the same counts in README.md (quick-start, comparison table, etc.)
Optionally update other documentation files
```

### 添加跨 Harness 的 Skill 副本

为不同的 Agent Harness（例如 Codex、Cursor、Antigravity）添加 Skill 副本，以确保跨平台兼容性。

**频率**：约每月 2 次

**步骤**：
1. 将 SKILL.md 复制或调整到 .agents/skills/{skill}/SKILL.md 和/或 .cursor/skills/{skill}/SKILL.md
2. 可选择添加 Harness 专用的 openai.yaml 或配置文件
3. 根据审查反馈进行修改，以符合 CONTRIBUTING 模板

**通常涉及的文件**：
- `.agents/skills/*/SKILL.md`
- `.cursor/skills/*/SKILL.md`
- `.agents/skills/*/agents/openai.yaml`

**示例提交序列**：
```
Copy or adapt SKILL.md to .agents/skills/{skill}/SKILL.md and/or .cursor/skills/{skill}/SKILL.md
Optionally add harness-specific openai.yaml or config files
Address review feedback to align with CONTRIBUTING template
```

### 添加或更新 Hook

添加或更新 Git 或 Bash Hook，以强制执行工作流、质量或安全策略。

**频率**：约每月 1 次

**步骤**：
1. 在 hooks/ 或 scripts/hooks/ 中添加或更新 Hook 脚本
2. 在 hooks/hooks.json 或类似配置中注册 Hook
3. 可选择在 tests/hooks/ 中添加或更新测试

**通常涉及的文件**：
- `hooks/*.hook`
- `hooks/hooks.json`
- `scripts/hooks/*.js`
- `tests/hooks/*.test.js`
- `.cursor/hooks.json`

**提交序列示例**：
```
Add or update hook scripts in hooks/ or scripts/hooks/
Register the hook in hooks/hooks.json or similar config
Optionally add or update tests in tests/hooks/
```

### 处理评审反馈

通过更新文档、脚本或配置来处理代码评审反馈，以提高清晰度和正确性，或使其符合约定。

**频率**：约每月 4 次

**步骤**：
1. 编辑 SKILL.md、agent 或 command 文件，以处理评审者的意见
2. 根据要求更新示例、标题或配置
3. 持续迭代，直至解决所有评审反馈

**通常涉及的文件**：
- `skills/*/SKILL.md`
- `agents/*.md`
- `commands/*.md`
- `.agents/skills/*/SKILL.md`
- `.cursor/skills/*/SKILL.md`

**提交序列示例**：
```
Edit SKILL.md, agent, or command files to address reviewer comments
Update examples, headings, or configuration as requested
Iterate until all review feedback is resolved
```


## 最佳实践

根据对代码库的分析，请遵循以下实践：

### 应当

- 使用约定式提交格式（feat:、fix: 等）
- 遵循 *.test.js 命名模式
- 文件名使用 camelCase
- 优先使用混合导出

### 不应当

- 不要编写含糊的提交消息
- 不要跳过新功能的测试
- 未经讨论，不要偏离既有模式

---

*此 Skill 由 [ECC Tools](https://ecc.tools) 自动生成。请根据团队需要进行评审和自定义。*