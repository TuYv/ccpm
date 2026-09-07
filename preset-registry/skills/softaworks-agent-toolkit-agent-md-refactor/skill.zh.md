---
name: agent-md-refactor
description: Refactor bloated AGENTS.md, CLAUDE.md, or similar agent instruction files to follow progressive disclosure principles. Splits monolithic files into organized, linked documentation.
license: MIT
---
# Agent MD 重构

重构臃肿的 agent 指令文件（AGENTS.md、CLAUDE.md、COPILOT.md 等），使其遵循**渐进式披露原则** - 将核心内容保留在根文件中，并将其余内容整理为相互链接、分类清晰的文件。

---

## 触发条件

在以下情况使用此技能：
- "重构我的 AGENTS.md" / "重构我的 CLAUDE.md"
- "拆分我的 agent 指令”
- “整理我的 CLAUDE.md 文件”
- “我的 AGENTS.md 太长了”
- “为我的指令实现渐进式披露”
- “清理我的 agent 配置”

---

## 快速参考

| 阶段 | 操作 | 输出 |
|-------|--------|--------|
| 1. 分析 | 查找矛盾 | 待解决的冲突列表 |
| 2. 提取 | 识别核心内容 | 用于根文件的核心指令 |
| 3. 分类 | 对剩余指令进行分组 | 逻辑类别 |
| 4. 构建结构 | 创建文件层级 | 根文件 + 链接文件 |
| 5. 精简 | 标记为待删除 | 冗余/含糊的指令 |

---

## 流程

### 阶段 1：查找矛盾

识别任何相互冲突的指令。

**查找：**
- 相互矛盾的风格规范（例如 “使用分号” 与 “不使用分号”）
- 相互冲突的工作流指令
- 不兼容的工具偏好
- 互斥的模式

**对于发现的每个矛盾：**
```markdown
## Contradiction Found

**Instruction A:** [quote]
**Instruction B:** [quote]

**Question:** Which should take precedence, or should both be conditional?
```

请用户解决矛盾后再继续。

---

### 阶段 2：识别核心内容

只提取属于根 agent 文件的内容。根文件应当保持极简 - 只包含适用于**每一个任务**的信息。

**核心内容（保留在根文件中）：**
| 类别 | 示例 |
|----------|---------|
| 项目描述 | 一句话：“一个用于数据分析的 React 仪表盘” |
| 包管理器 | 仅在不是 npm 时（例如 “使用 pnpm”） |
| 非标准命令 | 自定义的构建/测试/类型检查命令 |
| 关键覆盖项 | 必须覆盖默认行为的事项 |
| 通用规则 | 适用于 100% 任务的规则 |

**非核心内容（移入链接文件）：**
- 特定语言的规范
- 测试指南
- 代码风格细节
- 框架模式
- 文档标准
- Git 工作流细节

---

### 阶段 3：对其余内容分组

将剩余指令整理为逻辑类别。

**常见类别：**
| 类别 | 内容 |
|----------|----------|
| `typescript.md` | TS 规范、类型模式、严格模式规则 |
| `testing.md` | 测试框架、覆盖率、mock 模式 |
| `code-style.md` | 格式化、命名、注释、结构 |
| `git-workflow.md` | 提交、分支、PR、代码评审 |
| `architecture.md` | 模式、目录结构、依赖 |
| `api-design.md` | REST/GraphQL 规范、错误处理 |
| `security.md` | 认证模式、输入校验、密钥管理 |
| `performance.md` | 优化规则、缓存、懒加载 |

**分组规则：**
1. 每个文件应在其主题上自成一体
2. 目标为 3-8 个文件（不要过于细碎，也不要过于宽泛）
3. 文件命名要清晰：`{topic}.md`
4. 只包含可执行的指令

---

### 阶段 4：创建文件结构

**输出结构：**
```
project-root/
├── CLAUDE.md (or AGENTS.md)     # Minimal root with links
└── .claude/                      # Or docs/agent-instructions/
    ├── typescript.md
    ├── testing.md
    ├── code-style.md
    ├── git-workflow.md
    └── architecture.md
```

**根文件模板：**
```markdown
# Project Name

One-sentence description of the project.

## Quick Reference

- **Package Manager:** pnpm
- **Build:** `pnpm build`
- **Test:** `pnpm test`
- **Typecheck:** `pnpm typecheck`

## Detailed Instructions

For specific guidelines, see:
- [TypeScript Conventions](.claude/typescript.md)
- [Testing Guidelines](.claude/testing.md)
- [Code Style](.claude/code-style.md)
- [Git Workflow](.claude/git-workflow.md)
- [Architecture Patterns](.claude/architecture.md)
```

**每个链接文件的模板：**
```markdown
# {Topic} Guidelines

## Overview
Brief context for when these guidelines apply.

## Rules

### Rule Category 1
- Specific, actionable instruction
- Another specific instruction

### Rule Category 2
- Specific, actionable instruction

## Examples

### Good
\`\`\`typescript
// Example of correct pattern
\`\`\`

### Avoid
\`\`\`typescript
// Example of what not to do
\`\`\`
```

---

### 阶段 5：标记待删除

识别应当完全移除的指令。

**删除条件：**
| 判断标准 | 示例 | 删除理由 |
|-----------|---------|------------|
| 冗余 | “使用 TypeScript”（在 .ts 项目中） | Agent 已经知道 |
| 过于含糊 | “编写干净的代码” | 无法执行 |
| 过于显而易见 | “不要引入 bug” | 浪费上下文 |
| 默认行为 | “使用描述性的变量名” | 标准做法 |
| 已过时 | 引用已弃用的 API | 不再适用 |

**输出格式：**
```markdown
## Flagged for Deletion

| Instruction | Reason |
|-------------|--------|
| "Write clean, maintainable code" | Too vague to be actionable |
| "Use TypeScript" | Redundant - project is already TS |
| "Don't commit secrets" | Agent already knows this |
| "Follow best practices" | Meaningless without specifics |
```

---

## 执行清单

```
[ ] Phase 1: All contradictions identified and resolved
[ ] Phase 2: Root file contains ONLY essentials
[ ] Phase 3: All remaining instructions categorized
[ ] Phase 4: File structure created with proper links
[ ] Phase 5: Redundant/vague instructions removed
[ ] Verify: Each linked file is self-contained
[ ] Verify: Root file is under 50 lines
[ ] Verify: All links work correctly
```

---

## 反模式

| 避免 | 原因 | 替代做法 |
|-------|-----|---------|
| 把所有内容都留在根文件中 | 臃肿、难以维护 | 拆分为相互链接的文件 |
| 类别过多 | 碎片化 | 合并相关主题 |
| 含糊的指令 | 浪费 token、没有价值 | 写具体或删除 |
| 重复默认行为 | Agent 已经知道 | 仅在需要时覆盖 |
| 嵌套过深 | 难以导航 | 使用带链接的扁平结构 |

---

## 示例

### 之前（臃肿的根文件）
```markdown
# CLAUDE.md

This is a React project.

## Code Style
- Use 2 spaces
- Use semicolons
- Prefer const over let
- Use arrow functions
... (200 more lines)

## Testing
- Use Jest
- Coverage > 80%
... (100 more lines)

## TypeScript
- Enable strict mode
... (150 more lines)
```

### 之后（渐进式披露）
```markdown
# CLAUDE.md

React dashboard for real-time analytics visualization.

## Commands
- `pnpm dev` - Start development server
- `pnpm test` - Run tests with coverage
- `pnpm build` - Production build

## Guidelines
- [Code Style](.claude/code-style.md)
- [Testing](.claude/testing.md)
- [TypeScript](.claude/typescript.md)
```

---

## 验证

重构之后，请验证：

1. **根文件保持极简** - 少于 50 行，仅包含通用信息
2. **链接有效** - 所有被引用的文件都存在
3. **没有矛盾** - 指令前后一致
4. **内容可执行** - 每条指令都具体明确
5. **覆盖完整** - 没有指令丢失（除非已被标记为删除）
6. **文件自成一体** - 每个链接文件都能独立成立

---
