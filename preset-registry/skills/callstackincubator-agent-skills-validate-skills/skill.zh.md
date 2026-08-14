---
name: validate-skills
description: Validates skills in this repo against agentskills.io spec and Claude Code best practices. Use via /validate-skills command.
license: MIT
metadata:
  author: Callstack
  tags: validation, linting, skill-authoring
---
# 验证 Skills

根据 agentskills.io 规范和 Claude Code 最佳实践验证 `skills/` 中的所有 skill。

## 验证清单

对每个 skill 目录进行以下检查：

### 规范合规性（agentskills.io）

| 检查项 | 规则 |
|-------|------|
| `name` 格式 | 1-64 个字符，仅包含小写字母数字和连字符，不能以连字符开头或结尾，也不能包含连续的连字符 |
| `name` 与目录匹配 | 目录名称必须与 `name` 字段相同 |
| `description` 长度 | 1-1024 个字符，不能为空 |
| 可选字段有效 | 如果存在 `license`、`metadata`、`compatibility`，则必须有效 |

### 最佳实践（Claude Code）

| 检查项 | 规则 |
|-------|------|
| 描述格式 | 使用第三人称，说明做什么以及何时使用 |
| 正文长度 | 少于 500 行 |
| 加载深度为一层 | `SKILL.md` 是唯一的渐进式披露入口：每个参考文件都必须可从 `SKILL.md` 直接访问。参考文件之间可以相互交叉链接以便导航（请参阅下方说明）。 |
| 链接采用 Markdown 格式 | 使用 `[text](path)`，而不是裸文件名 |
| 无冗余 | 不要在正文中重复描述 |
| 简洁 | 仅添加 Claude 尚不了解的上下文 |

> **一层深度与交叉链接。** 一层深度规则针对的是*渐进式披露加载链*——某个参考文件只有在加载另一个参考文件后才能被发现（`SKILL.md` → `a.md` → `b.md`，其中 `b.md` 未从 `SKILL.md` 链接）。这是一项缺陷：它向加载器隐藏了内容。
>
> 此规则**并不**禁止用于*导航*的交叉链接。根据 [AGENTS.md](../../../AGENTS.md)，参考文件末尾需包含一个链接到同级参考文件的“Related Skills”页脚，这是必需的。只要两个端点都能从 `SKILL.md` 直接访问，交叉链接就是允许的。仅标记那些*只能*通过另一个参考文件访问的参考文件。

## 如何运行

1. 查找所有 skill 目录：
   ```bash
   fd -t d -d 1 . skills/
   ```

2. 对于每个 skill，读取 `SKILL.md` 并根据上述规则进行检查

3. 按以下格式报告问题：
   ```
   ## Validation Results

   ### skills/example-skill
   - [PASS] name format valid
   - [FAIL] name "example" doesn't match directory "example-skill"
   - [PASS] description length OK (156 chars)
   ```

## 参考资料

- [agentskills.io 规范](https://agentskills.io/specification)
- [Claude Code 最佳实践](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)