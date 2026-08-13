---
name: agnix
description: "Use when user asks to 'lint agent configs', 'validate skills', 'check CLAUDE.md', 'validate hooks', 'lint MCP'. Validates agent configuration files against 447 rules."
allowed-tools: Bash(agnix:*), Bash(cargo:*), Read, Glob, Grep
---
# agnix

在代理配置破坏你的工作流之前对其进行检查。可验证 Claude Code、Cursor、GitHub Copilot 和 Codex CLI 中的 Skills、Hooks、MCP、Memory 及 Plugins。

## 使用时机

当用户提出以下请求时调用：
- “检查我的代理配置”
- “验证我的 Skills”
- “检查我的 CLAUDE.md”
- “验证 Hooks”
- “检查 MCP 配置”
- “修复代理配置问题”

## 支持的文件

| 文件类型 | 示例 |
|-----------|----------|
| Skills | `SKILL.md` |
| Memory | `CLAUDE.md`, `AGENTS.md` |
| Hooks | `.claude/settings.json` |
| MCP | `*.mcp.json` |
| Cursor | `.cursor/rules/*.mdc` |
| Copilot | `.github/copilot-instructions.md` |

## 执行步骤

### 1. 检查是否已安装 agnix

```bash
agnix --version
```

如果未找到，请安装：
```bash
cargo install agnix-cli
```

### 2. 验证

```bash
agnix .
```

### 3. 如果发现问题且请求了 --fix

```bash
agnix --fix .
```

### 4. 重新验证以确认

```bash
agnix .
```

## CLI 参考

| 命令 | 说明 |
|---------|-------------|
| `agnix .` | 验证当前项目 |
| `agnix --fix .` | 自动修复问题 |
| `agnix --strict .` | 将警告视为错误 |
| `agnix --target claude-code .` | 仅应用 Claude Code 规则 |
| `agnix --target cursor .` | 仅应用 Cursor 规则 |
| `agnix --watch .` | 监视模式 |
| `agnix --format json .` | JSON 输出 |

## 输出格式

```
CLAUDE.md:15:1 warning: Generic instruction 'Be helpful' [fixable]
  help: Remove generic instructions. Claude already knows this.

skills/review/SKILL.md:3:1 error: Invalid name [fixable]
  help: Use lowercase letters and hyphens only

Found 1 error, 1 warning (2 fixable)
```

## 常见问题与修复方法

| 问题 | 解决方案 |
|-------|----------|
| 无效的 Skill 名称 | 使用小写字母和连字符：`my-skill` |
| 通用指令 | 删除“be helpful”“be accurate” |
| 缺少触发短语 | 在描述中添加“Use when...” |
| 目录与名称不匹配 | 重命名目录，使其与 `name:` 字段匹配 |

## 链接

- [GitHub](https://github.com/agent-sh/agnix)
- [规则参考](https://agent-sh.github.io/agnix/docs/rules/)