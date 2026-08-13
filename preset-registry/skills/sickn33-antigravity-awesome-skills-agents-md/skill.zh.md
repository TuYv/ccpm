---
name: agents-md
description: This skill should be used when the user asks to "create AGENTS.md", "update AGENTS.md", "maintain agent docs", "set up CLAUDE.md", or needs to keep agent instructions concise. Enforces research-backed best practices for minimal, high-signal agent documentation.
risk: critical
source: community
---
# 维护 AGENTS.md

AGENTS.md 是面向代理的权威文档。保持简洁——代理本身有能力，不需要手把手指导。目标少于 60 行；切勿超过 100 行。文档越长，执行指令的质量就会下降。

## 使用场景
- 用户要求创建、更新或审计 `AGENTS.md` 或 `CLAUDE.md`。
- 项目需要基于实际工具链和仓库布局提炼出的简洁高信号代理指令。
- 现有代理文档过长、重复，或已偏离真实项目约定。

## 文件设置

1. 在项目根目录创建 `AGENTS.md`
2. 创建符号链接：`ln -s AGENTS.md CLAUDE.md`

## 开始编写前

分析项目以确定文档中应包含哪些内容：

1. **包管理器** — 检查锁文件（`pnpm-lock.yaml`、`yarn.lock`、`package-lock.json`、`uv.lock`、`poetry.lock`）
2. **Linter/formatter 配置** — 查找 `.eslintrc`、`biome.json`、`ruff.toml`、`.prettierrc` 等（不要在 AGENTS.md 中重复这些内容）
3. **CI/构建命令** — 查看 `Makefile`、`package.json` 脚本、CI 配置中的标准命令
4. **Monorepo 指示** — 检查 `pnpm-workspace.yaml`、`nx.json`、Cargo workspace 或子目录中的 `package.json` 文件
5. **现有约定** — 查找现有的 CONTRIBUTING.md、docs/ 或 README 模式

## 编写规则

- **标题 + 列表** — 不要有段落
- **代码块** — 用于命令和模板
- **引用，不要内嵌** — 指向现有文档：如“See `CONTRIBUTING.md` for setup”或“Follow patterns in `src/api/routes/`”
- **无填充内容** — 不写引言、结论或客套语
- **信任能力** — 省略显而易见的上下文
- **优先文件级命令** — 文件级测试/检查/类型检查命令通常比全项目构建更快更便宜
- **不要重复 Linter 规则** — 代码风格写在 Linter 配置文件中，不在 AGENTS.md 中

## 必需部分

### 包管理器
只包含工具及关键命令：
```markdown
## Package Manager
Use **pnpm**: `pnpm install`, `pnpm dev`, `pnpm test`
```

### 文件级命令
文件级命令比全项目构建更快更省资源，若可用请始终包含：
```markdown
## File-Scoped Commands
| Task | Command |
|------|---------|
| Typecheck | `pnpm tsc --noEmit path/to/file.ts` |
| Lint | `pnpm eslint path/to/file.ts` |
| Test | `pnpm jest path/to/file.test.ts` |
```

### 提交归属
始终包含此部分。代理应使用自己的身份：
```markdown
## Commit Attribution
AI commits MUST include:
```
Co-Authored-By: (the agent model's name and attribution byline)
``` 
示例：`Co-Authored-By: Claude Sonnet 4 <noreply@example.com>`
```

### 关键约定
项目特有的、代理必须遵守的模式。保持简短。

## 可选部分

仅在确有必要时添加：
- API 路由模式（展示模板，不做解释）
- CLI 命令（表格格式）
- 文件命名约定
- 项目结构提示（指向关键文件，标注避免触碰的遗留代码）
- Monorepo 覆盖规则（子目录 `AGENTS.md` 覆盖根目录）

## 反模式

省略以下内容：
- “Welcome to...” 或 “This document explains...”
- “You should...” 或 “Remember to...”
- 已在配置文件中的 Linter/formatter 规则（`.eslintrc`、`biome.json`、`ruff.toml`）
- 列出已安装的 skills 或 plugins（代理可自动发现）
- 当有文件级替代方案时列出全项目构建命令
- 显而易见的指令（如“run tests”、“write clean code”）
- 解释原因（只说明要做什么）
- 长篇连贯文字段落

## 示例结构

```markdown
# Agent Instructions

## Package Manager
Use **pnpm**: `pnpm install`, `pnpm dev`

## Commit Attribution
AI commits MUST include:
```
Co-Authored-By: (the agent model's name and attribution byline)
```

## File-Scoped Commands
| Task | Command |
|------|---------|
| Typecheck | `pnpm tsc --noEmit path/to/file.ts` |
| Lint | `pnpm eslint path/to/file.ts` |
| Test | `pnpm jest path/to/file.test.ts` |

## API Routes
[Template code block]

## CLI
| Command | Description |
|---------|-------------|
| `pnpm cli sync` | Sync data |
```

## 限制
- 仅在任务明显符合上述范围时使用该技能。
- 不要将本输出视为环境特定验证、测试或专家评审的替代品。
- 如果缺少必要输入、权限、安全边界或成功标准，应停止并请求澄清。
