---
name: apply
description: Fill out a job application on Greenhouse, Lever, or Workday
argument-hint: "job URL, 'last' to use most recent job, or 'current' to fill the active browser tab"
---
# 应用职位技能

> **优先级层次结构**：有关冲突解决，请参阅 `references/priority-hierarchy.md`。

使用浏览器自动化填写 Greenhouse、Lever 和 Workday 上的职位申请表。

## 文件结构

```
scripts/
  fill-page.md              # Form-filling subagent prompt
```

## 数据目录

使用 `references/data-directory.md` 确定数据目录。

---

## 工作流程

### 第 0 步：检查前置条件

确定数据目录，然后按照 `references/prerequisites.md` 检查前置条件。必须提供简历文件。如果 `DATA_DIR/application-data.md` 存在（若不存在，将在第 2 步创建），则加载该文件。

### 第 1 步：确定目标职位

解析 `$ARGUMENTS`：

**如果是 URL：**
- 检查 `DATA_DIR/jobs/` 中是否存在匹配的职位文件夹（通过文件夹名称中的公司 slug 或 URL 进行匹配）。如果找到，则从该文件夹加载 `posting.md`、`resume.md`、`cover-letter.md`。
- 如果没有匹配项，则按照 `references/browser-setup.md` 设置浏览器，获取职位发布信息，并将其保存到新文件夹 `DATA_DIR/jobs/[company-slug]-[date]/posting.md`。

**如果是 "last" 或为空：**
- 在 `DATA_DIR/jobs/` 中查找最近修改的职位文件夹
- 加载其中的 `posting.md`、`resume.md`、`cover-letter.md`
- 向用户确认这是申请哪个职位

**如果是 "current"：**
- 跳过导航——直接按原样使用当前浏览器标签页
- 如果可能，将标签页的 URL 与已保存的职位文件夹进行匹配，以加载上下文

报告已加载的内容：

```
Applying to [Role] at [Company].
```

### 第 2 步：构建/加载申请数据

如果 `DATA_DIR/application-data.md` 存在，请读取该文件并加载其中的值。

如果该文件不存在：
1. 从简历中提取可用信息：姓名、电子邮箱、电话、LinkedIn、所在地
2. 向用户展示提取的数据。请用户确认并补充缺失信息：工作授权、签证担保、EEO 偏好（所有 EEO 项默认为 "Decline to self-identify"）
3. 使用以下格式保存到 `DATA_DIR/application-data.md`：

```markdown
# Application Data

## Personal Information
- First Name: ...
- Last Name: ...
- Email: ...
- Phone: ...
- City: ...
- Country: United States

## Online Profiles
- LinkedIn: ...
- GitHub: ...
- Portfolio: ...

## Standard Answers
- How did you hear about us: Job Board
- Previously worked at this company: No
- Authorized to work in the US: Yes
- Requires visa sponsorship: No

## EEO / Voluntary Disclosures
- Gender: Decline to self-identify
- Race/Ethnicity: Decline to self-identify
- Veteran status: I am not a veteran
- Disability: I don't wish to answer
```

### 第 3 步：导航至申请表并检查要求

按照 `references/browser-setup.md` 设置浏览器（`tabs_context` → `tabs_create` → `navigate`）。

**如果 `$ARGUMENTS` 是 "current"**：跳过导航。调用 `tabs_context_mcp` 获取当前活动标签页。

**否则**，根据 URL 模式检测 ATS 类型（请参阅 `references/ats-patterns.md`），并执行相应导航：

**Lever**（`jobs.lever.co/...`）：
- 导航至在职位发布 URL 后附加 `/apply` 的地址，或导航至职位发布页面并点击 "APPLY FOR THIS JOB"

**Greenhouse**（`boards.greenhouse.io/...` 或包含 `grnhse_iframe` 的页面）：
- 导航至职位发布 URL
- 通过 `javascript_tool` 提取 iframe 令牌：
  ```javascript
  const iframe = document.getElementById('grnhse_iframe');
  const url = new URL(iframe.src);
  JSON.stringify({
    boardToken: url.searchParams.get('for'),
    jobToken: url.searchParams.get('token')
  });
  ```
- 导航至直接表单 URL：`https://job-boards.greenhouse.io/embed/job_app?for={boardToken}&token={jobToken}`

**Workday**（`*.myworkdayjobs.com/...`）：
- 导航至职位发布页面。点击“立即申请”。
- 如果出现包含自动填充/手动填写选项的着陆页，请点击“手动申请”。
- 如果出现身份验证关卡，**请让用户登录，并在准备好后说“继续”**。创建账户属于禁止操作——用户必须自行完成身份验证。

**未知 ATS**：
- 导航至该 URL，并截取屏幕截图
- 尝试识别表单。如果无法识别，请告知用户并请求指导。

**勘察表单。** 进入申请表单后，快速扫描（使用 `read_page(filter="interactive")`，对于 Workday 则滚动浏览）以确定：
- 表单是否有**简历/CV 上传**字段？
- 表单是否有**求职信**上传或文本字段？
- 是否有任何需要特别注意的**非常规必填字段**？

记录这些要求——它们将决定在步骤 4 中需要生成哪些材料。

### 步骤 4：生成缺失的材料

目标是在填写之前准备好所有内容，从而尽量减少用户需要完成的工作。

**始终针对职位定制简历。** 检查此职位是否存在 `DATA_DIR/jobs/[job-folder]/resume.md`：
- 如果存在：该简历已经针对该职位进行了定制。跳过。
- 如果不存在：以内联方式运行 tailor-resume skill。遵循 `skills/tailor-resume/SKILL.md` 中的工作流程——使用职位发布信息（已加载）、原始简历和工作经历资料来生成定制简历。保存到职位文件夹。在继续之前，将其呈现给用户以便快速审核。

**仅当表单要求时才生成求职信。** 如果步骤 3 中的勘察发现了求职信字段：
- 检查是否存在 `DATA_DIR/jobs/[job-folder]/cover-letter.md`
- 如果存在：已经完成。跳过。
- 如果不存在：以内联方式运行 cover-letter skill。遵循 `skills/cover-letter/SKILL.md` 中的工作流程——使用职位发布信息、定制简历和个人资料。保存到职位文件夹。将其呈现给用户以便快速审核。

**如果表单没有求职信字段**，则完全跳过求职信生成。

告知用户生成了哪些内容：

```
Prepared for [Role] at [Company]:
- Tailored resume: [generated / already existed]
- Cover letter: [generated / already existed / not required by form]

Ready to fill the application. Proceeding...
```

### 步骤 5：扫描所有字段

在填写任何内容之前，扫描整个表单以发现每个字段。在此步骤中请勿填写字段——只读取。

**对于 Lever/Greenhouse（单页表单）：**
- 调用 `read_page(tabId, filter="interactive")` 一次性获取所有字段

**对于 Workday（多步骤向导）：**
- 从上到下滚动扫描当前页面，在每个视口位置调用 `read_page`
- 收集所有字段的标签、类型及其是否必填
- 注意：到达每个向导页面时都需要对其进行扫描（参见步骤 7）

**对于发现的每个字段**，记录：
- 字段标签
- 字段类型（文本、下拉菜单、单选按钮、复选框、文件上传）
- 是否必填
- 元素引用，以便稍后填写

### 步骤 6：提出答案并获得批准

按照以下优先级为每个字段生成建议答案：
1. **申请数据** — 根据下方的字段匹配参考，从 `application-data.md` 中进行匹配
2. **合理默认值** — 对于申请数据中没有的常见字段：
   - 法定名字/姓氏 → 与名字/姓氏相同
   - 电子签名 → 全名
   - 仲裁/条款协议 → 接受（向用户注明）
   - 面试流程确认 → 接受
   - AI 转录同意书 → 接受
   - 合同工/临时工作问题 → “否”（除非申请数据另有说明）
3. **自定义答案** — 检查 `application-data.md` 的“Custom Answers”部分，查找此前缓存的答案
4. **最佳推测** — 对于任何剩余字段，根据字段标签和职位上下文生成合理答案
5. **无法确定** — 仅在确实存在歧义且没有合理默认值时使用

向用户呈现一份合并后的摘要：

```
Here's my plan for the [Company] application:

**Auto-fill from your data:**
- First Name: Jane
- Last Name: Doe
- Email: jane@example.com
- Phone: 555-0123
- LinkedIn: https://linkedin.com/in/janedoe
...

**Proposed answers (please review):**
- Legal First Name: Jane (same as first name)
- Electronic signature: Jane Doe
- Arbitration agreement: Accept
- Contract work: No
- [Any other non-obvious fields]: [proposed answer]

**Needs your input:**
- [Only truly ambiguous fields, if any]

**Manual upload needed:**
- Resume: [file path]
- Cover letter: [file path] (if applicable)

Approve and I'll fill everything in. Or tell me what to change.
```

**关键原则：** 一次询问，一次填写。不要针对每个字段逐一提问。与用户的唯一交互应当是这一次批准（以及步骤 8 中最终提交前的确认）。

用户批准后（包括任何修改），将所有新答案缓存在 `DATA_DIR/application-data.md` 的“Custom Answers”部分下，以便在未来的申请中重复使用。

### 步骤 7：填写表单

获得批准后，一次性填写所有内容。

**委派给子代理。** 调用 `scripts/fill-page.md`，并传入：
- ATS 类型（lever/greenhouse/workday/unknown）
- 已批准的字段→值映射（所有答案，而不仅仅是申请数据）
- 标签页 ID
- 简历和求职信上传文件的路径

子代理填写当前页面上的所有字段，然后返回已填写的内容和仍未填写的内容。

**对于多页面表单（Workday）：**
1. 填写当前页面 → 点击“Save and Continue”
2. 如果出现验证错误：读取错误信息，修正字段，然后重试
3. 在新页面上：扫描字段（步骤 5 的逻辑），与已批准的答案匹配，填写并前进
4. 重复操作，直到到达审核页面

**文件上传处理：**
MCP 工具只能通过 `upload_image` 上传图片。对于 PDF/DOCX 格式的简历和求职信上传，请告知用户文件路径，并请其手动上传。这是一个已知限制——请在步骤 6 的摘要中包含该路径，以便用户在检查时上传。

### 步骤 8：提交前检查

当进入检查/确认页面，或单页表单上的所有字段均已填写完毕时：

1. 截取屏幕截图
2. 确认所有内容看起来都正确
3. **提交前请求用户明确确认**——根据浏览器自动化规则，这是必须获得明确许可的操作

在用户确认之前，请勿点击“提交/发送”。

### 步骤 9：记录申请

提交后（或者如果用户决定不提交）：

创建 `DATA_DIR/jobs/[company-slug]-[date]/applied.md`：

```markdown
# Application Log

- **Date**: YYYY-MM-DD
- **ATS**: Greenhouse/Lever/Workday
- **Status**: Submitted / Draft (not submitted)
- **Notes**: [any relevant notes]
```

更新 `DATA_DIR/job-history.md`——找到该职位对应的条目，并追加申请状态和日期。

向用户显示：

```
Applied to [Role] at [Company] on [date].
Files saved to: DATA_DIR/jobs/[folder]/

```

---

## 字段匹配参考

将表单字段标签（不区分大小写，模糊匹配）与申请数据进行匹配：

| 标签模式 | 数据来源 | 输入方式 |
|---------------|-------------|--------------|
| `first name` | Personal.FirstName | form_input / type |
| `last name` | Personal.LastName | form_input / type |
| `full name` | Personal.FirstName + LastName | form_input / type |
| `email` | Personal.Email | form_input / type |
| `phone` | Personal.Phone | form_input / type |
| `city`, `location`, `current location` | Personal.City | form_input / type / combobox |
| `country` | Personal.Country | 下拉选择 |
| `linkedin` | Profiles.LinkedIn | form_input / type |
| `github` | Profiles.GitHub | form_input / type |
| `portfolio`, `website` | Profiles.Portfolio | form_input / type |
| `resume`, `cv` | 文件上传：简历 PDF | 文件上传 |
| `cover letter` | 文件上传：求职信 | 文件上传 |
| `how did you hear` | StandardAnswers.HowHeard | 下拉选项："Job Board" |
| `previously worked` | StandardAnswers.PreviouslyWorked | 单选按钮/复选框："No" |
| `authorized to work`, `work authorization` | StandardAnswers.WorkAuth | 单选按钮/下拉选项 |
| `sponsorship` | StandardAnswers.Sponsorship | 单选按钮/下拉选项 |
| `gender` | EEO.Gender | 下拉选项："Decline" |
| `race`, `ethnicity` | EEO.Race | 下拉选项："Decline" |
| `veteran` | EEO.Veteran | 下拉选项/单选按钮：拒绝回答选项 |
| `disability` | EEO.Disability | 下拉选项/单选按钮：拒绝回答选项 |

**无法识别的字段**：检查该字段是否为必填项。如果是必填项，请询问用户。如果是可选项，则跳过。将用户的答案缓存在 `DATA_DIR/application-data.md` 的 "Custom Answers" 下，以便重复使用。

---

## ATS 特定交互说明

**Lever**：对于包括下拉选项在内的所有字段类型，使用 value 或 text 的 `form_input` 均可直接生效。

**Greenhouse**：导航至直接表单 URL（iframe 之外）后，使用 value 的 `form_input` 即可生效。

**Workday**：
- `read_page(filter="interactive")` 仅返回当前视口中可见的元素。必须从顶部滚动到底部，并在每个滚动位置调用 `read_page`。
- `read_page` 不会返回单选按钮——请使用 `find` 工具，或通过 `computer` 按坐标点击。
- 下拉菜单是打开弹出面板的 `button` 元素。点击按钮 → 使用 `find` 或 `read_page` 定位选项 → 点击该选项。对于分层下拉菜单（例如“How Did You Hear”），请使用 Search 文本框在弹出面板中搜索。

---

## 响应格式

面向用户的输出应包含以下部分：

1. **申请状态** — 已填写的内容、已跳过的内容，以及提交确认
2. **已保存的文件** — 所有已保存申请日志的路径
3. **后续步骤** — 如果缺少求职信，则建议撰写求职信；否则建议继续搜索下一个职位