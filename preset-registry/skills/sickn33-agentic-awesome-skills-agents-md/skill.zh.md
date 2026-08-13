---
name: agents-md
description: This skill should be used when the user asks to "create AGENTS.md", "update AGENTS.md", "maintain agent docs", "set up CLAUDE.md", or needs to keep agent instructions concise. Enforces research-backed best practices for minimal, high-signal agent documentation.
risk: critical
source: community
---
# 维护 AGENTS.md

AGENTS.md 是权威的面向代理文档。保持精简——代理能力足够，无需额外手把手指导。目标少于 60 行；绝不超过 100 行。文档越长，指令执行质量越容易下降。

## 使用场景
- 用户要求创建、更新或审核 `AGENTS.md` 或 `CLAUDE.md`。
- 项目需要从实际工具链和仓库结构中提炼出简洁且高信号的代理指令。
- 现有代理文档过长、重复，或与真实项目惯例偏离。

## 文件设置

1. 在项目根目录创建 `AGENTS.md`
2. 创建符号链接：`ln -s AGENTS.md CLAUDE.md`

## 编写前准备

分析项目以了解文档应包含哪些内容：

1. **包管理器** — 检查锁文件（`pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`, `uv.lock`, `poetry.lock`）
2. **Linter/formatter 配置** — 查找 `.eslintrc`、`biome.json`、`ruff.toml`、`.prettierrc` 等（不要在 AGENTS.md 中重复这些内容）
3. **CI/构建命令** — 查看 `Makefile`、`package.json` 脚本、CI 配置中的标准命令
4. **Monorepo 标识** — 检查 `pnpm-workspace.yaml`、`nx.json`、Cargo workspace，或子目录中的 `package.json` 文件
5. **现有约定** — 检查现有 `CONTRIBUTING.md`、`docs/` 或 `README` 的模式

## 编写规则

- **标题 + 列表** — 不使用段落
- **代码块** — 用于命令和模板
- **引用，不内嵌** — 指向现有文档：「查看 `CONTRIBUTING.md` 进行设置」或「遵循 `src/api/routes/` 中的模式」
- **无冗余内容** — 不写开场、总结或客套语
- **信任能力** — 省略显而易见的上下文
- **优先使用文件级命令** — 采用按文件的 test/lint/typecheck 命令，优于全项目构建
- **不要重复定义 linters** — 代码风格应写在 linter 配置中，而非 AGENTS.md

## 必要章节

### 包管理器
只保留工具和关键命令：
```markdown
## Package Manager
Use **pnpm**: `pnpm install`, `pnpm dev`, `pnpm test`
```

### 文件范围命令
按文件执行的命令比完整项目构建更快、更省。可用时始终包含：
```markdown
## File-Scoped Commands
| Task | Command |
|------|---------|
| Typecheck | `pnpm tsc --noEmit path/to/file.ts` |
| Lint | `pnpm eslint path/to/file.ts` |
| Test | `pnpm jest path/to/file.test.ts` |
```

### 提交归属
始终包含该章节。代理应使用自己的身份：
```markdown
## Commit Attribution
AI commits MUST include:
```
Co-Authored-By: (the agent model's name and attribution byline)
```
Example: `Co-Authored-By: Claude Sonnet 4 <noreply@example.com>`
```

### 关键约定
项目特定模式，代理必须遵循。保持简洁。

## 可选章节

仅在确实需要时添加：
- API 路由模式（展示模板，不做解释）
- CLI 命令（表格格式）
- 文件命名约定
- 项目结构提示（指向关键文件，标注需避免的遗留代码）
- Monorepo 覆盖策略（子目录 `AGENTS.md` 覆盖根目录）

## 反模式

省略以下内容：
- “Welcome to...” 或 “This document explains...”
- “You should...” 或 “Remember to...”
- 已在配置文件中的 Linter/formatter 规则（如 `.eslintrc`、`biome.json`、`ruff.toml`）
- 列出已安装的 skills 或 plugins（代理会自动发现）
- 在存在按文件替代方案时，列出完整项目构建命令
- 明显指令（如“运行测试”、“编写干净代码”）
- 解释原因（只说明要做什么）
- 长篇说明性段落

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
- 仅在任务明确符合上述范围时使用此 skill。
- 不要将该输出当作环境特定校验、测试或专家评审的替代品。
- 如果缺少必要输入、权限、安全边界或成功标准，请停止并寻求澄清。
