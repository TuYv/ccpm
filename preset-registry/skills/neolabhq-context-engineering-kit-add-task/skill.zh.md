---
name: add-task
description: creates draft task file in .specs/tasks/draft/ with original user intent
---
# 创建草稿任务文件

## 角色

你的角色是创建一个与用户请求完全匹配的草稿任务文件。

## 目标

在 `.specs/tasks/draft/` 中创建一个任务文件，其中包含：

- 清晰、以行动为导向的标题（动词 + 具体描述）
- 适当的类型分类（feature/bug/refactor/test/docs/chore/ci）
- 正确的依赖项（如有）
- 保留用户意图的实用描述
- 正确的文件名

## 输入

- **用户输入**：用户提供的任务描述/标题（作为参数传入）
- **目标目录**：默认为 `.specs/tasks/draft/`

## 指令

### 1. 确保目录结构

运行文件夹创建脚本以创建任务目录并配置 gitignore：

```bash
bash ${CLAUDE_PLUGIN_ROOT}/scripts/create-folders.sh
```

这会创建：

- `.specs/tasks/draft/` - 等待分析的新任务
- `.specs/tasks/todo/` - 准备实现的任务
- `.specs/tasks/in-progress/` - 当前正在处理的任务
- `.specs/tasks/done/` - 已完成的任务
- `.specs/scratchpad/` - 临时工作文件（已加入 gitignore）
- `.specs/analysis/` - 任务分析
- `.specs/reports/` - 任务报告

备用方案：如果找不到脚本，或存在其他问题，则手动创建目录结构，并将 `.specs/scratchpad/` 添加到 `.gitignore`

### 2. 分析输入

1. **解析用户请求**：
   - 提取核心任务目标
   - 识别隐含的类型（bug、feature、task）
   - 列出此任务所依赖的任务文件

2. **在存在歧义时进行澄清**（仅在确实不清楚时）：
   - 这是 bug 修复还是新功能？
   - 是否存在相关任务或依赖项？（如果未提供，则假设没有）

### 3. 组织任务结构

1. **创建以行动为导向的标题**：
   - 以动词开头：Add、Fix、Update、Implement、Remove、Refactor
   - 具体但简洁
   - 示例：
     - "为登录表单添加验证"
     - "修复用户服务中的空指针"
     - "为 API 响应实现缓存"

2. **确定类型**：

   | 类型 | 使用场景 |
   |------|----------|
   | `feature` | 新功能或新能力 |
   | `bug` | 某些内容损坏或无法正常工作 |
   | `refactor` | 不改变行为的代码重构 |
   | `test` | 添加或更新测试 |
   | `docs` | 仅文档变更 |
   | `chore` | 维护任务、依赖更新 |
   | `ci` | CI/CD 配置变更 |

### 4. 生成文件名

1. **根据任务标题创建简短名称**：
   - 将标题转换为小写
   - 将空格替换为连字符
   - 删除特殊字符
   - 保持简洁（最多 3-5 个单词）
   - 示例："为登录表单添加验证" -> `add-validation-login-form`

2. **构成文件名**：`<short-name>.<issue-type>.md`
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
- **不要**填写描述，只在任务文件中按指定内容放置 `// ...` 占位符。
- 如果未提供依赖项，**不要**写入 depends_on 部分。

## 预期输出

返回给编排器：

1. **任务文件路径**：所创建文件的完整路径（例如：`.specs/tasks/todo/add-validation-login-form.feature.md`）
2. **生成的标题**：所创建的面向操作的标题
3. **问题类型**：`task`、`bug` 或 `feature`

格式：

```
Created task file: .specs/tasks/draft/<name>.<type>.md
Title: <action-oriented title>
Type: <task|bug|feature>
Depends on: <list of task files that this task depends on>
```

## 成功标准

- [ ] 目录 `.specs/tasks/draft/`、`.specs/tasks/todo/`、`.specs/tasks/in-progress/`、`.specs/tasks/done/` 存在
- [ ] 任务文件创建于 `.specs/tasks/draft/`，并使用正确的命名约定（`<name>.<type>.md`）
- [ ] 文件名在所有状态文件夹中唯一（不得覆盖现有文件）
- [ ] 如果提供了依赖项，Depends on 部分正确
- [ ] 标题以动作动词开头（Add、Fix、Implement、Update、Remove、Refactor）
- [ ] 类型分类正确，并反映在文件扩展名中（`.feature.md`、`.bug.md`、`.refactor.md`、`.test.md`、`.docs.md`、`.chore.md`、`.ci.md`）
- [ ] “Initial User Prompt”部分保留原始用户输入
- [ ] 描述为空占位符 `// Will be filled in future stages by business analyst`

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

**带上下文的错误**（`.specs/tasks/draft/fix-login-timeout.bug.md`）：

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