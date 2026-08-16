---
name: creating-skills
description: Guide for creating Claude Code skills following Anthropic's official best practices. Use when user wants to create a new skill, build a skill, write SKILL.md, update an existing skill, or needs skill creation guidelines. Provides structure, frontmatter fields, naming conventions, and new features like dynamic context injection and subagent execution.
---
# 创建技能

遵循 Anthropic 官方最佳实践创建 Claude Code 技能的指南。

## 快速开始

```bash
# 1. Create skill directory
mkdir -p ~/.claude/skills/<skill-name>

# 2. Create SKILL.md with frontmatter
cat > ~/.claude/skills/<skill-name>/SKILL.md << 'EOF'
---
name: <skill-name>
description: <What it does>. Use when <trigger phrases>. <Key capabilities>.
---

# <Skill title>

<Instructions for the skill workflow>
EOF

# 3. Add optional resources as needed
mkdir -p ~/.claude/skills/<skill-name>/{scripts,references,assets}
```

## SKILL.md 结构

### Frontmatter（位于 `---` 标记之间的 YAML）

| 字段 | 必需 | 描述 |
|-------|----------|-------------|
| `name` | 否 | 显示名称。默认为目录名称。使用小写字母和连字符，最多 64 个字符。 |
| `description` | 推荐 | 功能 + 使用时机 + 能力。最多 1024 个字符。决定 Claude 何时激活该技能。 |
| `allowed-tools` | 否 | 技能激活时，Claude 无需请求权限即可使用的工具。 |
| `argument-hint` | 否 | 参数的自动补全提示。示例：`[issue-number]` |
| `disable-model-invocation` | 否 | 设为 `true` 可阻止自动调用（只能手动使用 `/name`）。 |
| `user-invocable` | 否 | 设为 `false` 可从 `/` 菜单中隐藏（仅作为背景知识）。 |
| `model` | 否 | 技能激活时使用的模型覆盖设置。 |
| `context` | 否 | 设为 `fork` 可在隔离的子代理上下文中运行。 |
| `agent` | 否 | `context: fork` 时使用的子代理类型。内置类型：`Explore`、`Plan`、`general-purpose`。 |
| `hooks` | 否 | 作用域限定于此技能的生命周期钩子。 |

### 调用控制矩阵

| 配置 | 用户可以调用 | Claude 可以调用 |
|---------------|-----------------|-------------------|
| （默认值） | 是 | 是 |
| `disable-model-invocation: true` | 是 | 否 |
| `user-invocable: false` | 否 | 是 |

### 描述公式

```
<What it does>. Use when <trigger phrases>. <Key capabilities>.
```

应包含动作动词（“create”“handle”）、用户意图（“wants to”“needs to”），以及用户会说出的领域关键词。

## 目录结构

```
skill-name/
├── SKILL.md              # Required: instructions (keep under 500 lines)
├── scripts/              # Optional: executable code (deterministic, token-efficient)
├── references/           # Optional: docs loaded into context on demand
└── assets/               # Optional: files used in output, NOT loaded into context
                          #   (templates, images, fonts, boilerplate)
```

### 渐进式披露（3 级加载）

1. **元数据**（名称 + 描述）- 始终位于上下文中（每个技能约 100 个 token）
2. **SKILL.md 正文** - 技能触发时加载（保持在 5000 字以内）
3. **捆绑资源** - 由 Claude 根据需要加载

在 SKILL.md 中引用支持文件，以便 Claude 知道它们的存在。将引用层级保持为一层。对于超过 100 行的文件，应包含目录。

### 脚本、参考资料与资产

| 类型 | 用途 | 是否加载到上下文中？ |
|------|---------|---------------------|
| `scripts/` | 确定性操作、复杂处理 | 否（通过 bash 执行） |
| `references/` | Claude 工作时阅读的文档 | 是，按需加载 |
| `assets/` | 用于输出的模板、图像和字体 | 否（复制到输出中或用于输出） |

仅在脚本能够带来价值时才创建脚本：复杂的多步骤处理、重复的代码生成、确定性的可靠性。不要为单条命令创建包装脚本。

## 动态功能

### 上下文注入

在加载技能之前，将 shell 命令的输出注入技能内容：

```markdown
## Recent commits
!`git log --oneline -5 2>/dev/null`
```

技能加载时，输出会替换该指令。

### 字符串替换

向通过 `/skill-name arg1 arg2` 调用的技能传递参数：

| 变量 | 值 |
|----------|-------|
| `$ARGUMENTS` | 完整的参数字符串 |
| `$ARGUMENTS[0]`, `$ARGUMENTS[1]` | 单个参数 |
| `$1`, `$2` | `$ARGUMENTS[N]` 的简写形式 |

### 子智能体执行

使用 `context: fork` 在隔离的上下文中运行技能：

```yaml
---
name: deep-research
description: Research a topic thoroughly.
context: fork
agent: Explore
---
```

## 自由度

根据任务的脆弱程度调整具体程度：

| 级别 | 适用场景 | 示例 |
|-------|-------------|---------|
| **高**（文本指令） | 存在多种有效方法，取决于上下文 | “分析代码并提出改进建议” |
| **中**（带参数的伪代码/脚本） | 存在首选模式，允许一定变化 | 带有可配置参数的脚本 |
| **低**（具体脚本、参数很少） | 操作脆弱，一致性至关重要 | API 调用的确切顺序 |

## 命名约定

- 使用小写字母，单词之间用连字符分隔，最多 64 个字符
- 风格：动名词形式（`processing-pdfs`）、名词短语（`github-pr-creation`）、带前缀的分组（`github-pr-*`）

## 重要规则

- **始终**编写包含“做什么”+“何时触发”+“具备哪些能力”的描述
- **始终**将 SKILL.md 控制在 500 行以内，接近上限时拆分到参考文件中
- **始终**从 SKILL.md 引用捆绑的文件，以便 Claude 能够发现它们
- **绝不**在 SKILL.md 和参考文件之间重复信息
- **绝不**为单条命令创建包装脚本
- **绝不**包含无关文件（README.md、CHANGELOG.md、INSTALLATION_GUIDE.md、QUICK_REFERENCE.md）
- **绝不**解释 Claude 已经知道的内容（标准库、常用工具、基本模式）

## 参考资料

- `references/official_best_practices.md` - 原则、反模式、质量检查清单、测试
- `references/skill_examples.md` - 包含新功能的具体技能示例