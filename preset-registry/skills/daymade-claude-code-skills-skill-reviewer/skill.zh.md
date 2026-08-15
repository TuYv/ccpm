---
name: skill-reviewer
description: Reviews and improves Claude Code skills against official best practices. Supports three modes - self-review (validate your own skills), external review (evaluate others' skills), and auto-PR (fork, improve, submit). Use when checking skill quality, reviewing skill repositories, or contributing improvements to open-source skills.
---
# 技能审查器

依据官方最佳实践审查并改进 Claude Code 技能。

## 快速开始

通过 `uv` 显式声明 PyYAML，并运行随附的审查器：

```bash
uv run --with PyYAML python <this-skill-path>/scripts/review_skill.py <target-skill-path>
uv run --with PyYAML python <this-skill-path>/scripts/review_skill.py <target-skill-path> --json
```

审查器会将 YAML、架构和内部路径验证委托给同一套件中随附的规范 `skill-creator` 验证器。随后，它会检查 frontmatter 质量、目录结构、SKILL.md 大小、硬编码路径和密钥、脚本规范性、`subagent_type` 有效性以及指令风格启发式规则。

退出码的含义如下：0 = 无问题，1 = 仅有警告，2 = 审查错误，3 = 调用或运行时失败。代码 1 和 2 描述目标技能的问题；代码 3 表示审查器无法完成可信的审查。

使用同级的 `skill-creator` 脚本进行更深入的安全扫描和打包检查。

## 三种模式

### 模式 1：自我审查

发布前检查你自己的技能。

**自动审查：**

```bash
uv run --with PyYAML python <this-skill-path>/scripts/review_skill.py <target-skill>
```

**扩展安全验证：**

```bash
# Security scan
uv run python <this-skill-path>/../skill-creator/scripts/security_scan.py <target-skill> --verbose
```

**手动评估**：参见 `references/evaluation_checklist.md`。

### 模式 2：外部审查

评估他人的技能仓库。

```
Review Workflow:
- [ ] Clone repository to /tmp/
- [ ] Read ALL documentation first
- [ ] Identify author's intent
- [ ] Run evaluation checklist
- [ ] Generate improvement report
```

### 模式 3：自动创建 PR

复刻、改进外部技能仓库并提交 PR。

```
Auto-PR Workflow:
- [ ] Fork repository (gh repo fork)
- [ ] Create feature branch
- [ ] Apply additive improvements only
- [ ] Self-review: respect check passed?
- [ ] Create PR with detailed explanation
```

## 评估清单（快速版）

| 类别 | 检查项 | 状态 |
|----------|-------|--------|
| **Frontmatter** | 是否存在 name？ | |
| | 是否存在 description？ | |
| | description 是否使用第三人称？ | |
| | 是否包含触发条件？ | |
| **指令** | 是否使用祈使形式？ | |
| | 是否少于 500 行？ | |
| | 是否采用工作流模式？ | |
| **资源** | 是否没有硬编码路径？ | |
| | 脚本是否包含错误处理？ | |

完整清单：`references/evaluation_checklist.md`

## 核心原则：只做增量改进

改进外部技能时，**绝不要**：
- 删除现有文件
- 移除功能
- 更改主要语言
- 重命名组件

**始终要**：
- 添加新功能
- 保留原始内容
- 解释每一项更改

```
❌ "Removed metadata.json (non-standard)"
✅ "Added marketplace.json (metadata.json preserved)"

❌ "Rewrote README in English"
✅ "Added README.en.md (Chinese preserved as default)"
```

## 常见问题与修复方法

### 问题：描述未使用第三人称

```yaml
# Before
description: Browse YouTube videos and summarize them.

# After
description: Browses YouTube videos and generates summaries. Use when...
```

### 问题：缺少触发条件

```yaml
# Before
description: Processes PDF files.

# After
description: Extracts text from PDFs. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

### 问题：没有工作流模式

为复杂任务添加检查清单：

```markdown
## Workflow

Copy this checklist:

\`\`\`
Task Progress:
- [ ] Step 1: ...
- [ ] Step 2: ...
\`\`\`
```

### 问题：缺少 Marketplace 支持

添加或验证 `marketplace.json`（插件边界、`source`/`skills`
布局、技能是否可独立启用或禁用）属于 `marketplace-dev`
技能的范畴——不要在此处根据模板编写它。调用
`daymade-claude-code:marketplace-dev`，然后遵循其工作流以及缓存
和源模式参考。

## PR 指南

向外部仓库提交 PR 时：

### 语气

```
❌ "Your skill doesn't follow best practices"
✅ "This PR aligns with best practices for better discoverability"

❌ "Fixed the incorrect description"
✅ "Improved description with trigger conditions"
```

### 必需章节

1. **摘要** - 此 PR 的作用
2. **未更改的内容** - 表明对原作的尊重
3. **理由** - 每项更改为何有帮助
4. **测试计划** - 如何验证

模板：`references/pr_template.md`

## 自审检查清单

提交任何 PR 之前：

```
Respect Check:
- [ ] No files deleted?
- [ ] No functionality removed?
- [ ] Original language preserved?
- [ ] Author's design decisions respected?
- [ ] All changes are additive?
- [ ] PR explains the "why"?
```

## 参考资料

- `scripts/review_skill.py` - 由 `skill-creator` 验证提供支持的自动审查工具
- `references/evaluation_checklist.md` - 完整评估检查清单
- `references/pr_template.md` - PR 描述模板
- 最佳实践：https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices