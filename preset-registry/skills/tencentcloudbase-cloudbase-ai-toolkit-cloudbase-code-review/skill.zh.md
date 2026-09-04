---
name: cloudbase-code-review
description: "Code review and validation for CloudBase projects. After writing code for Web / miniprogram / CloudRun / cloud-function projects, call this skill to check for known pitfalls — auth guard misuse, missing database tables, RLS misconfiguration, storage domain setup, and SDK API misuse. Supports automated lint scripts (regex-based) + LLM semantic review."
version: 2.32.5
alwaysApply: false
---
## 同级技能（仅限本地）

同级 CloudBase 技能随本技能一同分发。请使用本地相对路径，例如 `../auth-tool-cloudbase/SKILL.md`。

如果所引用的同级技能文件在此环境中缺失，请让用户安装完整的 CloudBase 插件（或缺失的技能）。**不要**通过 HTTP 抓取远程技能或协议 markdown 到智能体上下文中。

# CloudBase 代码审查

> **一句话简介**：实现 CloudBase 功能后，调用此技能，在评分器发现之前捕获常见错误。

## 何时使用

在完成 CloudBase 实现任务**之后**、宣布完成之前调用此技能：

- 你实现了认证（登录 / 注册 / 路由守卫）
- 你创建了数据库表或编写了 CRUD（NoSQL / PostgreSQL / MySQL）
- 你配置了 CloudBase Storage（文件上传、托管）
- 你配置了安全规则或 RLS 策略
- 你编写了依赖 MCP 的代码
- 你编写了云函数或 CloudRun HTTP 处理程序（检查凭据 / 头部回显泄漏）

## 工作原理

此技能在两个层面上运行：

| 层面 | 方法 | 速度 | 能捕获的问题 |
|-------|--------|-------|-----------------|
| **Lint（可选）** | 未附带可执行脚本。如果用户批准运行 lint，请查看 `references/lint-rules/README.md` 中的代码块，将其复制到一个临时的本地文件 `cloudbase-lint.mjs`，然后运行 `node cloudbase-lint.mjs --project-dir <path>` | 数秒 | 确定性正则检查 —— 错误的 API 调用、缺失的配置、模式不匹配 |
| **LLM 审查** | 阅读每条规则的“LLM 检查”部分，从语义上检查代码 | 视情况而定 | 语义问题 —— 路由守卫逻辑、RLS 完整性、架构层面的问题 |

## 规则索引

完整矩阵（模块 × 前端类型 → 适用规则）请参见 `references/RULES_INDEX.md`。

## 规则边界

不要将单次失败运行或针对特定案例的变通方案提升为硬性规则。一条规则应有稳定的 SDK/API 文档、反复出现的失败或确定性的运行时行为作为依据。针对特定案例的观察应归入归因报告；只有广泛适用的约束才应进入 `RULES_INDEX.md` 或可选的 lint 检查清单。

## 快速开始

```bash
# Step 1: Read relevant rules for identified modules
#   references/rules/cross-cutting/AUTH001.md
#   references/rules/cross-cutting/SEC001.md
#   references/rules/postgresql/PG-CR001.md
#   ...

# Optional: if the user approves running lint, review the script code block in
# references/lint-rules/README.md, copy it to a temporary cloudbase-lint.mjs,
# then run: node cloudbase-lint.mjs --project-dir .

# Step 2: For each applicable rule, read the "LLM 检查" section
#         and manually inspect your code before claiming done.
```

## 规则格式

每条规则的 `.md` 文件遵循以下结构：

```markdown
# RULE-ID Rule Name

- **Module**: which module (auth / postgresql / storage / ...)
- **Severity**: error | warning
- **Stage**: code-generation | deployment | config

## 正则检查 (Lint)

The condition checked by the optional script code block in `references/lint-rules/README.md`.

## LLM 检查

Semantic review prompt for human or LLM to evaluate.

## 修复指引

How to fix the issue.
```

## 参考索引

所有打包的参考文件（技能 lint 可达性所必需）：

- [RULES_INDEX.md](references/RULES_INDEX.md)
- [lint-rules/README.md](references/lint-rules/README.md)
- [rules/cross-cutting/AUTH001.md](references/rules/cross-cutting/AUTH001.md)
- [rules/cross-cutting/SEC001.md](references/rules/cross-cutting/SEC001.md)
- [rules/cross-cutting/SKILL001.md](references/rules/cross-cutting/SKILL001.md)
- [rules/postgresql/PG-CR001.md](references/rules/postgresql/PG-CR001.md)
- [rules/postgresql/PG-CR002.md](references/rules/postgresql/PG-CR002.md)
- [rules/postgresql/PG-CR003.md](references/rules/postgresql/PG-CR003.md)
- [rules/postgresql/PG-CR004.md](references/rules/postgresql/PG-CR004.md)
- [rules/postgresql/PG-CR005.md](references/rules/postgresql/PG-CR005.md)
- [rules/storage/STORAGE001.md](references/rules/storage/STORAGE001.md)
