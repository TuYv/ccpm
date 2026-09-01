---
name: claude-skill-builder
description: Interactive skill creator for Claude Code and generated Codex/Cursor targets. Use when user mentions creating skills, updating skills, skill frontmatter, skill triggers/descriptions, bundled references/scripts/assets, allowed-tools, or wants to scaffold a project-local skill.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
model: sonnet
---
# Claude Code 技能构建器

构建或修订紧凑、面向特定任务的技能操作指南。保持入口文件简洁，将详细材料放在一层深度的 `references/` 中，并验证生成的代理目标是否保留预期行为。

## 首选方案

在此仓库中，规范源文件位于 `templates/.claude/skills/<skill-id>/skill.md`。

不要维护独立手写的 Codex 或 Cursor 副本。Codex `SKILL.md` 文件和 Cursor `.mdc` 规则由 `src/utils/copy.js` 生成。

## 工作流

1. 明确技能边界：
   - 你希望代理在哪项任务上变得更出色？
   - 技能应在何时触发？
   - 哪些工具或随附文件确实有必要？
   - 这是一个单一工作流，还是应拆分为几个更小的技能？

2. 选择文件夹和名称：
   - 使用小写 kebab-case，最长 63 个字符。
   - 让 frontmatter 中的 `name` 与文件夹基名一致。
   - 对于连贯的领域，优先使用一个顶层技能；只有在嵌套技能可独立触发时，才使用嵌套技能。

3. 编写 frontmatter：
   - `name`：必须与文件夹基名完全一致。
   - `description`：同时包含技能的功能和使用时机。这是触发表面，因此应包含用户可能使用的自然表达和重要领域术语。
   - `allowed-tools`：仅适用于确实需要工具的 Claude Code 源技能。
   - `model`：可选；只有在查阅当前 Claude Code 模型文档后，才使用别名或当前模型 ID。

4. 保持入口文件精简：
   - 说明用途和快速工作流。
   - 仅包含必要的决策规则和安全检查。
   - 对于较长的示例、API 详情或特定变体的指导，链接到 `references/<topic>.md`。
   - 仅针对重复的确定性操作添加脚本。
   - 不要在技能载荷中加入 README、安装指南、变更日志和流程说明。

5. 确保生成的目标安全：
   - 不要在可复用的说明中依赖 `.claude/skills/...` 路径。
   - 从技能根目录使用 `references/...` 引用本地技能资源。
   - 当输出也会安装到 Codex 或 Cursor 时，避免使用仅 Claude 支持的运行时术语。
   - 除非需要特定目标行为，否则保持说明与代理无关。

6. 验证：
   - 修改模板后，运行此仓库的技能质量测试。
   - 对于安装行为，将真实 CLI 运行到临时目录中，分别验证 Codex 和 Cursor，而不仅仅是运行辅助函数级别的测试。

## 文件结构

简单技能：

```text
skill-id/
├── skill.md
└── skill.json
```

包含详细支持内容的技能：

```text
skill-id/
├── skill.md
├── skill.json
├── references/
│   └── full-guide.md
├── scripts/
│   └── helper.js
└── assets/
    └── template.txt
```

## Frontmatter 模式

```markdown
---
name: skill-id
description: What the skill helps with, when to use it, and important trigger phrases the user is likely to say.
allowed-tools: Read, Grep, Glob
model: sonnet
---

# Skill Title

One or two sentences explaining the operating mode.

## Fast Workflow

1. Inspect the target context.
2. Choose the relevant branch of the workflow.
3. Make the smallest useful change or answer.
4. Verify with the repo's real commands or artifacts.

## References

Read `references/full-guide.md` only when the task needs the longer details.
```

## 质量标准

- 该 skill 应教授特定领域的操作流程，而不是泛泛的“提供帮助”建议。
- 触发描述应足够清晰，使人无需阅读正文即可选择该 skill。
- 示例应使用稳定的占位符，或基于当前源代码进行检查，避免使用过时的日期、软件包版本、文档数量或模型 ID。
- 较长的参考资料应包含目录。
- 脚本应可执行、具有确定性，并且比手动重新输入更易于运行。
- 已安装的 Codex/Cursor 输出不得提及用户无法获得的仅存在于源代码中的路径。

## 仓库验证

```bash
npm test
npm run lint
cd site && npm run typecheck
cd site && npm run lint
```

实际安装检查：

```bash
tmpdir="$(mktemp -d)"
node bin/cli.js init "$tmpdir" --yes --agent codex --profile all
node bin/cli.js init "$tmpdir" --yes --agent cursor --profile all --force
find "$tmpdir/.codex/skills" -maxdepth 2 -name 'SKILL.md' | sort
find "$tmpdir/.cursor/rules" -maxdepth 2 -name '*.mdc' | sort
```