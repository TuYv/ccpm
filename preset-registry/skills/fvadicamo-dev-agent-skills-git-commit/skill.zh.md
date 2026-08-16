---
name: git-commit
description: Creates git commits following Conventional Commits format with type/scope/subject. Use when user wants to commit changes, create commit, save work, or stage and commit. Enforces project-specific conventions from CLAUDE.md.
---
# Git 提交

按照 Conventional Commits 格式创建 Git 提交。

## 最近的项目提交

!`git log --oneline -5 2>/dev/null`

## 快速开始

```bash
# 1. Stage changes
git add <files>

# 2. Create commit
git commit -m "type(scope): subject"
```

## 项目约定

- 作用域为**必填项**（kebab-case）：`validation`、`auth`、`cookie-service`、`api`
- 除标准 CC 类型外的其他类型：`security`（漏洞修复或安全加固）
- 多行提交使用 HEREDOC：

```bash
git commit -m "$(cat <<'EOF'
feat(validation): add URLValidator with domain whitelist

Implement URLValidator class supporting:
- Domain whitelist enforcement
- Dangerous scheme blocking

Addresses Requirement 31
Part of Task 5.1
EOF
)"
```

## 重要规则

- **始终**先检查 CLAUDE.md 中的约定——如果项目格式有所不同，则使用项目格式
- **始终**在括号中包含作用域
- **始终**在主题中使用一般现在时的祈使动词
- **绝不**在主题末尾添加句号
- **绝不**让主题行超过 50 个字符
- **绝不**使用笼统的消息（"update code"、"fix bug"、"changes"）
- 将相关更改归入一个专注于单一目的的提交中

## 参考资料

- `references/commit_examples.md` - 按类型扩展的示例，以及正确与错误示例的对比