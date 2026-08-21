---
name: add-task
description: creates draft task file in .specs/tasks/draft/ with original user intent
argument-hint: Task title or description (e.g., "Add validation to form inputs") [list of task files that this task depends on]
---
# 创建草稿任务文件

## 角色

你的职责是创建一个与用户请求完全匹配的草稿任务文件。

## 目标

在 `.specs/tasks/draft/` 中创建一个任务文件，并确保：

- 标题清晰、以行动为导向（动词 + 具体描述）
- 类型分类恰当（feature/bug/refactor/test/docs/chore/ci）
- 依赖关系正确（如有）
- 描述实用，并保留用户意图
- 文件名正确

## 输入

- **用户输入**：用户提供的任务描述/标题（作为参数传入）
- **目标目录**：默认为 `.specs/tasks/draft/`

## 说明

### 1. 确保目录结构存在

运行文件夹创建脚本，以创建任务目录并配置 gitignore：

```bash
bash ${CLAUDE_PLUGIN_ROOT}/scripts/create-folders.sh
```

该脚本会创建：

- `.specs/tasks/draft/` - 等待分析的新任务
- `.specs/tasks/todo/` - 已准备好实施的任务
- `.specs/tasks/in-progress/` - 当前正在处理的任务
- `.specs/tasks/done/` - 已完成的任务
- `.specs/scratchpad/` - 临时工作文件（被 git 忽略）
- `.specs/analysis/` - 任务分析
- `.specs/reports/` - 任务报告

备用方案：如果找不到脚本或存在其他问题，请手动创建文件夹结构，并将 `.specs/scratchpad/` 添加到 .gitignore

### 2. 分析输入

1. **解析用户请求**：
   - 提取任务的核心目标
   - 识别隐含的类型（bug、feature、task）
   - 列出此任务所依赖的任务文件

2. **存在歧义时进行澄清**（仅当确实不明确时）：
   - 这是错误修复还是新功能？
   - 是否存在相关任务或依赖项？（如果未提供，则假定没有）

### 3. 构建任务结构

1. **创建以行动为导向的标题**：
   - 以动词开头：Add、Fix、Update、Implement、Remove、Refactor
   - 具体但简洁
   - 示例：
     - "Add validation to login form"
     - "Fix null pointer in user service"
     - "Implement caching for API responses"

2. **确定类型**：

   | 类型 | 适用情形 |
   |------|----------|
   | `feature` | 新功能或新能力 |
   | `bug` | 某些内容已损坏或无法正常工作 |
   | `refactor` | 在不改变行为的情况下重构代码 |
   | `test` | 添加或更新测试 |
   | `docs` | 仅更改文档 |
   | `chore` | 维护任务、依赖项更新 |
   | `ci` | CI/CD 配置更改 |

### 4. 生成文件名

1. **根据任务标题创建短名称**：
   - 将标题转换为小写
   - 将空格替换为连字符
   - 删除特殊字符
   - 保持简洁（最多 3-5 个单词）
   - 示例："Add validation to login form" -> `add-validation-login-form`

2. **组成文件名**：`<short-name>.<issue-type>.md`
   - 示例：
     - `add-validation-login-form.feature.md`
     - `fix-null-pointer-user-service.bug.md`
     - `restructure-auth-module.refactor.md`
     - `add-unit-tests-api.test.md`
     - `update-readme.docs.md`
     - `upgrade-dependencies.chore.md`
     - `add-github-actions.ci.md`

3. **验证唯一性**：检查 `.specs/tasks/draft/`、`.specs/tasks/todo/`、`.specs/tasks/in-progress/` 和 `.specs/tasks/done/` 中是否存在同名文件

### 5. 创建任务文件

**使用 Write 工具**创建 `.specs/tasks/todo/<short-name>.<issue-type>.md`：

```markdown
---
title: <ACTION-ORIENTED TITLE>
depends_on: <list of task files that this task depends on>
---

## Initial User Prompt

{EXACT user input as provided}

## Description

// Will be filled in future stages by business analyst
```

## 约束

- **不要**调用 plan skill——工作流会处理后续阶段
- **不要**在 `.specs/tasks/draft/` 之外创建文件
- **不要**修改现有任务文件
- **不要**编写描述，只能按照任务文件中的规定填写 `// ...` 占位符。
- 如果未提供依赖项，**不要**编写 depends_on 部分。

## 预期输出

向编排器返回：

1. **任务文件路径**：已创建文件的完整路径（例如 `.specs/tasks/todo/add-validation-login-form.feature.md`）
2. **生成的标题**：所创建的行动导向型标题
3. **问题类型**：`task`、`bug` 或 `feature`

格式：

```
Created task file: .specs/tasks/draft/<name>.<type>.md
Title: <action-oriented title>
Type: <task|bug|feature>
Depends on: <list of task files that this task depends on>
```

## 成功标准

- [ ] 目录 `.specs/tasks/draft/`、`.specs/tasks/todo/`、`.specs/tasks/in-progress/`、`.specs/tasks/done/` 均存在
- [ ] 任务文件已在 `.specs/tasks/draft/` 中创建，并遵循正确的命名约定（`<name>.<type>.md`）
- [ ] 文件名在所有状态文件夹中唯一（不覆盖现有文件）
- [ ] 如果提供了依赖项，Depends on 部分正确无误
- [ ] 标题以动作动词开头（Add、Fix、Implement、Update、Remove、Refactor）
- [ ] 类型分类正确，并在文件扩展名中体现（`.feature.md`、`.bug.md`、`.refactor.md`、`.test.md`、`.docs.md`、`.chore.md`、`.ci.md`）
- [ ] 原始用户输入保留在 "Initial User Prompt" 部分中
- [ ] Description 为空占位符 `// Will be filled in future stages by business analyst`

## 示例

**测试任务**（`.specs/tasks/draft/add-unit-tests-auth.test.md`）：

```markdown
---
title: Add unit tests for auth module
---

## Initial User Prompt

add tests for auth

## Description

// Will be filled in future stages by business analyst
```

**包含上下文的 Bug**（`.specs/tasks/draft/fix-login-timeout.bug.md`）：

```markdown
---
title: Fix login timeout on slow connections
---

## Initial User Prompt

users getting 504 errors on slow wifi

## Description

// Will be filled in future stages by business analyst
```

**功能请求**（`.specs/tasks/draft/implement-dark-mode.feature.md`）：

```markdown
---
title: Implement dark mode toggle
---

## Initial User Prompt

add dark mode to settings page

## Description

// Will be filled in future stages by business analyst
```