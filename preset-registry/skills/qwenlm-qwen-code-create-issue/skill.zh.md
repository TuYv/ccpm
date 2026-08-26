---
name: create-issue
description: Draft and submit a GitHub issue from a user idea or bug description, with bilingual body and correct labels.
argument-hint: '<feature idea or bug description>'
allowedTools:
  - run_shell_command
  - read_file
  - write_file
  - glob
  - grep_search
---
# 创建 Issue

获取用户的想法或 bug 描述，调查代码库以了解上下文，起草 issue 供用户审核，并在获得批准后提交。

## 输入

用户通过 skill 参数提供一段简短的功能请求或 bug 报告描述。

## 步骤

### 1. 分类

确定请求属于**功能请求**还是**bug 报告**。

### 2. 调查代码库

搜索与请求相关的代码、文件和现有行为。全面了解当前系统的工作方式。通过
`gh issue list --search` 查找并记录任何相关的现有 issue。

### 3. 阅读模板

- 功能请求 → 读取 `.github/ISSUE_TEMPLATE/feature_request.yml`
- bug 报告 → 读取 `.github/ISSUE_TEMPLATE/bug_report.yml`

使用模板中的字段标签和描述来组织草稿。

### 4. 起草 issue

将 Markdown 草稿写入 `.qwen/issues/draft-<slug>.md`，供用户审核。

规则：

- 从用户的角度撰写，而不是写成实现规范。
- 语言清晰简洁；**避免内部实现细节**。
- 标题仅使用**英文**。
- **正文双语呈现**：先写英文内容，最后附上包裹在可折叠区块中的中文翻译：

  ```markdown
  <details>
  <summary>中文</summary>

  (Chinese translation here)

  </details>
  ```

### 5. 与用户一起审核

展示草稿。根据用户反馈持续修改，直到用户满意为止。
**在用户明确批准之前，不要提交。**

### 6. 提交

用户确认后，使用 `gh issue create` 创建 issue：

```bash
gh issue create --title "..." --body-file .qwen/issues/draft-<slug>.md
```

根据类型应用标签：

- 功能请求 → `type/feature-request`、`status/needs-triage`
- bug 报告 → `type/bug`、`status/needs-triage`

将 issue URL 返回给用户。