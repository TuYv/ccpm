---
name: enhance-skills
description: "Use when reviewing SKILL.md files for structure and trigger quality."
version: 5.1.0
argument-hint: "[path] [--fix]"
---
# enhance-skills

分析技能定义的触发质量、结构和可发现性。

## 工作流程

1. **发现** - 查找所有 SKILL.md 文件
2. **解析** - 提取 frontmatter 和内容
3. **检查** - 根据下方知识运行所有模式检查
4. **筛选** - 应用确定性筛选
5. **报告** - 生成 Markdown 输出
6. **修复** - 如果存在 `--fix` 标志，则应用自动修复

---

## 技能知识参考

### Frontmatter 字段（完整参考）

| 字段 | 必需 | 描述 | 验证 |
|-------|----------|-------------|------------|
| `name` | 否 | 显示名称，默认为目录名称 | 小写，最多 64 个字符 |
| `description` | 推荐 | 技能的作用及使用时机 | 最多 1024 个字符，应包含触发条件 |
| `argument-hint` | 否 | 自动补全提示，例如 `[file-path]` | 保持在 30 个字符以内 |
| `disable-model-invocation` | 否 | `true` = 仅手动调用（适用于有副作用的操作） | 布尔值，默认为 false |
| `user-invocable` | 否 | `false` = 在 `/` 菜单中隐藏（仅自动调用） | 布尔值，默认为 true |
| `allowed-tools` | 否 | Claude 无需权限即可使用的工具 | 逗号分隔的列表 |
| `model` | 否 | 技能激活时使用的特定模型 | opus、sonnet、haiku |
| `context` | 否 | `fork` = 在隔离的子代理上下文中运行 | fork 或省略 |
| `agent` | 否 | 用于执行的子代理类型 | Explore、Plan、general-purpose |
| `hooks` | 否 | 技能作用域内的生命周期钩子 | PreToolUse、PostToolUse |

### 目录结构

```
skills/my-skill/
├── SKILL.md           # Required - core definition (under 500 lines)
├── reference.md       # Optional - detailed documentation
├── examples.md        # Optional - usage examples
└── scripts/           # Optional - helper scripts
    └── helper.py
```

**存储位置：**
- 企业：托管设置
- 个人：`~/.claude/skills/<name>/SKILL.md`
- 项目：`.claude/skills/<name>/SKILL.md`

### 调用控制模式

**仅手动调用（适用于有副作用的技能）：**
```yaml
---
name: deploy
description: Deploy to production
disable-model-invocation: true
---
```

**背景知识（仅自动调用，在菜单中隐藏）：**
```yaml
---
name: legacy-context
description: How the legacy payment system works
user-invocable: false
---
```

**完全访问（默认——支持自动和手动调用）：**
```yaml
---
name: review
description: Use when user asks to review code. Checks quality and security.
---
```

### 触发短语

描述中应包含用于自动发现的触发上下文：
- "Use when user asks..."
- "Use when..."
- "Invoke when..."

**良好：** `"Use when user asks to 'review code', 'check PR', or 'code review'"`
**不佳：** `"Reviews code"`（没有触发上下文）

### 动态上下文注入

技能可以使用反引号语法注入动态内容：

```yaml
---
name: pr-summary
description: Summarize PR changes
context: fork
agent: Explore
allowed-tools: Bash(gh:*)
---

## Pull request context
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`
- Changed files: !`gh pr diff --name-only`
```

**规则：**
- 使用 `!`，后跟由反引号包裹的命令
- 每个技能最多注入 3 次
- 每次注入都会占用上下文预算

### 字符串替换

| 变量 | 描述 |
|----------|-------------|
| `$ARGUMENTS` | 调用时传入的所有参数 |
| `${CLAUDE_SESSION_ID}` | 当前会话 ID |

### 上下文预算

- 技能描述的默认限制约为 15,000 个字符
- 超出限制的内容将被截断
- 使用 `/context` 命令检查
- 可通过以下方式增加：`SLASH_COMMAND_TOOL_CHAR_BUDGET=30000`

### 子代理执行

使用 `context: fork` 时：

```yaml
---
name: deep-research
description: Research a topic thoroughly
context: fork
agent: Explore
allowed-tools: Read, Grep, Glob
---

Research $ARGUMENTS thoroughly:
1. Find relevant files
2. Analyze the code
3. Summarize findings
```

**代理类型：**
| 代理 | 用途 | 工具访问权限 |
|-------|---------|-------------|
| `Explore` | 以只读方式探索代码库 | 仅限 Read、Grep、Glob |
| `Plan` | 专注于规划的推理 | Read、分析工具 |
| `general-purpose` | 完整功能 | 所有工具 |

### 技能作用域钩子

```yaml
---
name: secure-operations
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "./scripts/security-check.sh"
---
```

### 工具限制

出于安全考虑，请使用限定作用域的工具模式：

| 模式 | 含义 |
|---------|---------|
| `Bash(git:*)` | 仅限 git 命令 |
| `Bash(npm:*)` | 仅限 npm 命令 |
| `Bash(gh:*)` | 仅限 GitHub CLI |
| `Read(src/**)` | 仅限 src/ 中的文件 |

---

## 检测模式

### 1. Frontmatter 验证（高确定性）

**必需：**
- 使用 `---` 分隔符的 YAML frontmatter
- `name` 字段（小写，最多 64 个字符）
- `description` 字段（最多 1024 个字符）

**建议：**
- 用于跟踪的 `version` 字段
- 用于接受输入的技能的 `argument-hint`
- 用于安全控制的 `allowed-tools`
- 需要特定模型时使用 `model`

**标记：**
- 缺少 frontmatter 分隔符
- 字段值无效（名称包含大写字母、描述超过 1024 个字符）

### 2. 触发质量（高确定性）

**检查：** 描述中包含触发短语  
**触发模式：** “Use when”、“Invoke when”、“Use when user asks”

**标记：**
- 描述中没有触发上下文
- 类似“Useful tool”或“Does stuff”的模糊描述

### 3. 调用控制（高确定性）

**检查：** 具有副作用的技能受到保护

**标记：**
- 名称中包含 deploy/ship/publish，但未设置 `disable-model-invocation` 的技能
- 可自动调用的危险技能（可能被意外触发）

### 4. 工具限制（高确定性）

**检查：** 工具的作用域已得到适当限制

**标记：**
- 不受限制的 `Bash`（应使用 `Bash(git:*)` 或类似模式）
- 具有 Write/Edit 权限的只读技能
- 使用 Task 工具的研究技能

### 5. 内容范围（中等确定性）

**指南：**
- SKILL.md 不超过 500 行
- 将大型内容放入 `references/` 子目录
- 最多 3 次动态注入

**标记：**
- SKILL.md 超过 500 行
- 超过 3 次 `!`backtick`` 注入
- 嵌入了大型示例（应移至 examples.md）

### 6. 结构质量（中等确定性）

**建议包含的章节：**
- 目的/概述
- 必需的检查项或工作流步骤
- 输出格式
- 示例（如果较复杂）

### 7. 上下文配置（中等确定性）

**检查：** 上下文设置是否恰当

**标记以下问题：**
- `context: fork` 未指定 `agent` 类型
- 指定了 `agent` 类型但未设置 `context: fork`
- agent 类型与 allowed-tools 不匹配

### 8. 反模式（低确定性）

- 描述模糊，没有具体的触发条件
- 职责过多（应拆分为多个 skill）
- 明显需要输入的 skill 缺少 `argument-hint`
- 多余的思维链指令（现代模型不需要“逐步思考”）

---

## 自动修复实现

### 1. 缺少 frontmatter
```yaml
---
name: skill-name
description: "Use when..."
version: 4.2.0
---
```

### 2. 缺少触发短语
在 description 前添加 "Use when user asks..."

### 3. 未受限的 Bash
将 `Bash` 替换为 `Bash(git:*)` 或适当的作用域

---

## 输出格式

```markdown
## Skill Analysis: {skill-name}

**File**: {path}

### Summary
- HIGH: {count} issues
- MEDIUM: {count} issues

### Frontmatter Issues ({n})
| Issue | Fix | Certainty |

### Trigger Issues ({n})
| Issue | Fix | Certainty |

### Invocation Issues ({n})
| Issue | Fix | Certainty |

### Tool Issues ({n})
| Issue | Fix | Certainty |

### Scope Issues ({n})
| Issue | Fix | Certainty |
```

---

## 模式统计

| 类别 | 模式数 | 可自动修复 |
|----------|----------|--------------|
| Frontmatter | 5 | 2 |
| 触发 | 2 | 1 |
| 调用 | 3 | 1 |
| 工具 | 3 | 1 |
| 作用域 | 3 | 0 |
| 结构 | 2 | 0 |
| 上下文 | 3 | 0 |
| 反模式 | 4 | 0 |
| **总计** | **25** | **5** |

---

<examples>
### 示例：缺少触发短语

<bad_example>
```yaml
name: code-review
description: "Reviews code for issues"
```
**问题所在**：没有用于自动发现的触发上下文。
</bad_example>

<good_example>
```yaml
name: code-review
description: "Use when user asks to 'review code', 'check this PR'. Reviews code for issues."
```
**优点所在**：清晰的触发短语可实现自动发现。
</good_example>

### 示例：危险的自动调用

<bad_example>
```yaml
name: deploy
description: "Deploys code to production"
```
**问题所在**：具有副作用的 skill 可能被意外自动调用。
</bad_example>

<good_example>
```yaml
name: deploy
description: "Deploy to production environment"
disable-model-invocation: true
```
**优点所在**：仅允许手动调用可防止意外部署。
</good_example>

### 示例：未受限的工具

<bad_example>
```yaml
name: git-helper
allowed-tools: Bash
```
**问题所在**：未受限的 Bash 允许执行任意命令。
</bad_example>

<good_example>
```yaml
name: git-helper
allowed-tools: Bash(git:*)
```
**优点所在**：作用域仅限于 git 命令。
</good_example>

### 示例：规模过大的 Skill

<bad_example>
```markdown
# Complex Analysis
[800 lines of detailed instructions]
```
**问题所在**：大型 skill 会消耗上下文预算（字符上限为 15K）。
</bad_example>

<good_example>
```markdown
# Complex Analysis
Core instructions here (under 500 lines).
For details, see `references/detailed-guide.md`.
```
**为什么好**：核心技能简洁；详细信息放在单独的文件中。
</good_example>

### 示例：上下文/智能体不匹配

<bad_example>
```yaml
name: researcher
context: fork
# Missing agent type
```
**为什么不好**：使用 fork 上下文却未指定智能体类型。
</bad_example>

<good_example>
```yaml
name: researcher
context: fork
agent: Explore
allowed-tools: Read, Grep, Glob
```
**为什么好**：智能体类型与允许使用的工具相匹配（Explore = 只读）。
</good_example>
</examples>

---

## 约束条件

- 仅对高置信度问题应用自动修复
- 评估触发质量时考虑技能上下文
- 切勿删除内容，只建议改进
- 根据上方嵌入的知识参考进行验证