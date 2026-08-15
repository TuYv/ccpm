---
name: Create New Skills
description: Creates new Agent Skills for Claude Code following best practices and documentation. Use when the user wants to create a new skill, extend Claude's capabilities, or package domain expertise into a reusable skill.
---
# 创建新技能

## 说明

此技能可帮助你为 Claude Code 创建新的 Agent Skills。开始之前，请阅读 [docs/](docs/) 目录中的完整文档文件，以全面了解相关背景。

### 前置条件

**必读材料** - 创建技能之前，请按顺序阅读以下文件：
1. [docs/claude_code_agent_skills.md](docs/claude_code_agent_skills.md) - 创建和管理技能的完整指南
2. [docs/claude_code_agent_skills_overview.md](docs/claude_code_agent_skills_overview.md) - 架构以及技能的工作方式
3. [docs/blog_equipping_agents_with_skills.md](docs/blog_equipping_agents_with_skills.md) - 设计原则和最佳实践

### 理解技能

**什么是技能？**
- 一个包含具有 YAML frontmatter 的 `SKILL.md` 文件的目录
- Claude 会在相关时按需加载的指令
- 可选的支持文件（脚本、文档、模板）
- 就像为新团队成员准备的入职指南

**渐进式披露（3 个层级）：**
1. **元数据**（始终加载）：YAML frontmatter 中的 `name` 和 `description`
2. **指令**（触发时加载）：SKILL.md 的正文
3. **资源**（按需加载）：其他文件、脚本、模板

**关键原则：**任何时候都只有相关内容会进入上下文窗口。

### 技能创建工作流

#### 第 1 步：定义技能的用途

向用户询问以下问题：
1. 此技能应涵盖什么任务或领域？
2. Claude 应在什么时候使用此技能？（触发条件）
3. 需要记录哪些专业知识或工作流？
4. 是否需要脚本、模板或其他资源？

记录答案以供参考。

#### 第 2 步：创建技能目录结构

在项目的 `.claude/skills/` 目录中创建技能，以便团队共享：

```bash
mkdir -p .claude/skills/<skill-name>
```

**命名约定：**
- 使用小写字母和连字符（例如 `pdf-processing`、`data-analysis`）
- 名称应具有描述性，但要简洁
- 避免使用宽泛的名称

**注意：**项目技能（`.claude/skills/`）会通过 git 自动与你的团队共享。对于仅供你个人使用的技能，请改为在 `~/.claude/skills/` 中创建。

#### 第 3 步：设计 SKILL.md 结构

每个技能都必须包含：
```yaml
---
name: Your Skill Name
description: Brief description of what this Skill does and when to use it
---

# Your Skill Name

## Instructions
[Clear, step-by-step guidance for Claude]

## Examples
[Concrete examples of using this Skill]
```

**Frontmatter 要求：**
- `name`：必填，最多 64 个字符
- `description`：必填，最多 1024 个字符
  - 同时包含技能的作用以及何时使用
  - 提及关键触发词或短语
  - 要具体，不要含糊

**可选 Frontmatter（仅限 Claude Code）：**
- `allowed-tools`：限制 Claude 可以使用的工具（例如 `Read, Grep, Glob`）

#### 第 4 步：编写指令部分

**按以下结构组织指令：**
1. **前置条件** - 所需的依赖项、工具和环境设置
2. **工作流** - 分步骤的流程（编号步骤）
3. **支持性细节** - 补充背景、脚本用法和错误处理

**最佳实践：**
- 使用清晰、可执行的语言
- 为连续步骤编号
- 使用项目符号列出选项/列表
- 包含带有 bash 命令的代码块
- 使用相对链接引用支持文件：`[reference.md](reference.md)`
- 聚焦于单一能力

**工作流格式示例：**
```markdown
### Workflow

1. **First step description**:
   ```bash
   command to run
   ```
   - Additional context
   - Options or variations

2. **Second step description**:
   - Detailed instructions
   - What to look for
   - Expected outcomes

3. **Third step**...
```

#### 第 5 步：编写示例部分

提供 2-4 个具体示例，展示：
- 不同的使用场景
- 各种输入格式
- 分步执行过程
- 预期结果

**示例格式：**
```markdown
### Example 1: Descriptive Title

User request:
```
User's exact request text
```

You would:
1. First action
2. Second action with command:
   ```bash
   actual command
   ```
3. Next steps...
4. Final result
```

#### 第 6 步：添加支持文件（可选）

如果该技能需要额外的上下文：
1. 在 SKILL.md 旁创建文件
2. 从说明中引用这些文件：`[forms.md](forms.md)`
3. 使用渐进式披露——按主题/场景拆分

**常见的支持文件类型：**
- 附加说明（例如 `advanced_usage.md`）
- 参考文档（例如 `api_reference.md`）
- `scripts/` 目录中的脚本
- `templates/` 目录中的模板
- 配置示例

**脚本指南：**
- 设置为可执行：`chmod +x scripts/*.py`
- 为 Python 脚本添加 PEP 723 内联依赖项
- 在 SKILL.md 中包含使用说明
- 返回清晰的输出，以便 Claude 解析

#### 第 7 步：测试技能

1. 验证文件结构：
   ```bash
   ls -la .claude/skills/<skill-name>/
   ```

2. 检查 YAML frontmatter 是否有效：
   ```bash
   head -10 .claude/skills/<skill-name>/SKILL.md
   ```

3. 使用相关查询进行测试：
   - 提出与技能描述相匹配的问题
   - 验证 Claude 是否加载并使用该技能
   - 检查说明是否清晰且可执行

4. 根据测试结果进行迭代：
   - 如果技能未触发，则优化描述
   - 如果 Claude 难以执行，则澄清说明
   - 为常见的边界情况添加示例

#### 第 8 步：提交到版本控制

由于项目技能会自动与团队共享，因此请将其提交到 git：

```bash
git add .claude/skills/<skill-name>
git commit -m "Add <skill-name> skill"
git push
```

**注意：** 团队成员拉取最新更改后，将自动获得该技能。

### 最佳实践总结

**描述编写：**
- ✅ “使用 Fireworks API 将音频/视频文件转录为文本。当用户要求转录、将语音转换为文本或需要文字稿时使用。”
- ❌ “帮助处理音频”

**说明组织：**
- 保持主要说明聚焦（最好不超过 5k tokens）
- 将复杂内容拆分到链接文件中
- 对可选/高级内容使用渐进式披露

**技能范围：**
- 一个技能 = 一项能力或一个工作流
- 不要合并不相关的任务
- 创建聚焦且可组合的技能

**文件引用：**
- 使用相对路径：`[file.md](file.md)`，而不是绝对路径
- 使用相对于技能根目录的完整路径引用脚本
- 明确说明 Claude 应读取文件还是执行文件

### 现有技能中的常见模式

**模式 1：转录技能**
- 包含环境设置的前置条件部分
- 清晰的编号工作流
- 展示不同格式的多个示例
- 用于更正/映射的支持文件

**模式 2：晨间简报技能**
- 两步流程（转录、扩展）
- 引用单独文件中的详细提示词
- 文件整理步骤
- 清晰的输出结构规范

**模式 3：元技能（本技能）**
- 大量预读文档
- 分步创建工作流
- 包含不同变体的多个示例
- 最佳实践和常见模式

## 示例

### 示例 1：创建简单的代码审查技能

用户请求：
```
Create a skill that reviews Python code for best practices
```

你需要：
1. 阅读 [docs/](docs/) 中的文档文件
2. 提出澄清问题：
   - 具体是哪些最佳实践？（PEP 8、安全性、性能？）
   - 应该只检查，还是也建议修复方案？
   - 是否涉及特定的框架或库？
3. 创建技能目录：
   ```bash
   mkdir -p .claude/skills/python-code-review
   ```
4. 编写 SKILL.md，包含：
   ```yaml
   ---
   name: Python Code Review
   description: Reviews Python code for PEP 8 compliance, security issues, and performance. Use when reviewing Python code, checking code quality, or analyzing Python files.
   allowed-tools: Read, Grep, Glob
   ---
   ```
5. 添加说明部分，包含：
   - 前置条件（无需任何前置条件，使用内置工具）
   - 工作流：
     1. 读取 Python 文件
     2. 检查是否符合 PEP 8
     3. 识别安全问题
     4. 提出性能改进建议
     5. 提供包含具体行引用的摘要
6. 添加 3 个示例：
   - 示例 1：单文件审查
   - 示例 2：多文件项目审查
   - 示例 3：重点安全审查
7. 使用示例 Python 文件进行测试

### 示例 2：创建带脚本的数据分析技能

用户请求：
```
Build a skill for analyzing CSV data with statistics and visualizations
```

你需要：
1. 阅读文档文件
2. 与用户确定范围：
   - 需要哪些统计数据？（均值、中位数、相关性？）
   - 需要哪些可视化？（图表、绘图？）
   - 输出格式是什么？（Markdown 报告、图片？）
3. 创建结构：
   ```bash
   mkdir -p .claude/skills/csv-analysis/scripts
   mkdir -p .claude/skills/csv-analysis/templates
   ```
4. 编写 SKILL.md，并引用：
   - `scripts/analyze.py` - 统计分析脚本
   - `scripts/visualize.py` - 图表生成脚本
   - `templates/report_template.md` - 输出模板
5. 创建包含内联依赖项的 Python 脚本：
   ```python
   # /// script
   # requires-python = ">=3.10"
   # dependencies = ["pandas", "matplotlib", "seaborn"]
   # ///
   ```
6. 编写清晰的说明，涵盖：
   - 何时运行哪个脚本
   - 如何解读输出
   - 如何自定义分析
7. 添加示例，展示：
   - 基础统计
   - 可视化生成
   - 自定义报告创建
8. 使用示例 CSV 文件进行测试

### 示例 3：创建多文件文档技能

用户请求：
```
Create a skill for writing technical documentation with our company's style guide
```

你需要：
1. 阅读文档文件
2. 收集需求：
   - 获取公司风格指南文档
   - 文档有哪些类型？（API、用户指南、架构？）
   - 是否有模板或示例？
3. 创建完整的结构：
   ```bash
   mkdir -p .claude/skills/tech-docs/{templates,examples,guidelines}
   ```
4. 组织内容：
   - `SKILL.md` - 概述和工作流
   - `guidelines/style_guide.md` - 公司风格规则
   - `guidelines/api_docs.md` - API 文档具体规范
   - `guidelines/user_guides.md` - 用户指南标准
   - `templates/api_template.md` - API 文档模板
   - `templates/guide_template.md` - 用户指南模板
   - `examples/` - 示例文档
5. 编写 SKILL.md，使其：
   - 按文档类型引用指南
   - 使用渐进式披露（仅加载所需的指南）
   - 为每种文档类型提供工作流
6. 添加以下内容的示例：
   - API 端点文档
   - 用户指南创建
   - 架构决策记录
7. 使用各种文档请求进行测试

### 示例 4：扩展现有技能

用户请求：
```
Add spell correction to our transcribe skill
```

你需要：
1. 阅读当前技能：
   ```bash
   cat .claude/skills/transcribe/SKILL.md
   ```
2. 确定添加该功能的位置：
   - 在转录步骤之后
   - 在最终输出之前
3. 创建支持文件：
   ```bash
   touch .claude/skills/transcribe/spell_corrections.md
   ```
4. 在新文件中编写纠正映射：
   ```markdown
   # Spell Corrections
   - "cloud code" → "claude code"
   - "API" → "API" (ensure caps)
   ...
   ```
5. 更新 SKILL.md 工作流：
   - 添加步骤："应用 [spell_corrections.md](spell_corrections.md) 中的拼写纠正"
   - 引用纠正文件
6. 更新示例以展示纠正步骤
7. 使用包含常见错误的音频进行测试

## 总结

创建技能就是将专业知识打包成可发现、可组合的能力。请遵循以下原则：

1. **首先阅读文档** - 理解渐进式披露和技能架构
2. **编写清晰的描述** - 包含做什么以及何时做
3. **保持指令聚焦** - 使用支持文件提供额外上下文
4. **全面测试** - 验证 Claude 能否正确发现并使用该技能
5. **根据反馈迭代** - 根据实际使用情况进行改进

技能可以将通用型 Claude 转变为你所在领域的专家。从小处着手，尽早测试，并根据需要进行扩展。