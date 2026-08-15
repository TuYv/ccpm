---
name: user-story
argument-hint: "[feature or user need]"
description: Create user stories with Mike Cohn format and Gherkin acceptance criteria. Use when turning user needs into development-ready work with clear outcomes and testable conditions.
intent: >-
  Create clear, concise user stories that combine Mike Cohn's user story format with Gherkin-style acceptance criteria. Use this to translate user needs into actionable development work that focuses on outcomes, ensures shared understanding between product and engineering, and provides testable success criteria.
type: component
theme: pm-artifacts
best_for:
  - "Writing user stories with proper acceptance criteria"
  - "Converting requirements into development-ready stories"
  - "Establishing story quality standards across your team"
scenarios:
  - "I need to write a user story for a new notification system in our B2B SaaS app"
  - "Convert this PRD requirement into a properly formatted user story with Gherkin acceptance criteria"
estimated_time: "5-10 min"
---
## 目的
创建清晰、简洁的用户故事，将 Mike Cohn 的用户故事格式与 Gherkin 风格的验收标准相结合。使用此方法将用户需求转化为可执行的开发工作，聚焦成果，确保产品与工程团队形成共同理解，并提供可测试的成功标准。

这不是功能规格说明，而是对话的起点，用于说明*谁*将从中受益、他们试图完成*什么*、这件事*为什么*重要，以及你将*如何*判断它是否有效。

## 输入

**最适合提供：** 此故事所描述的功能或用户需求。
**其他有用信息：** 用户角色、他们期望的成果，以及验收标准必须涵盖的边界情况。

调用时一并提供的任何内容——技能名称之后的文本、粘贴的上下文信息，或附加的 `ARGUMENTS:` 行——都视为已经给出的答案。使用这些信息，并跳过它们已涵盖的问题；不要重复询问。

**什么都没准备？也没问题。** 该技能会先询问用户是谁以及他们试图完成什么，然后再起草故事和 Gherkin 验收标准。

**调用示例：** `Write user stories for password reset via SMS for our banking app — include the lockout edge case.`

## 核心概念

### Mike Cohn + Gherkin 格式
用户故事由以下部分组成：

**用例（Mike Cohn 格式）：**
- **作为** [用户画像/角色]
- **我希望** [为实现成果而执行的操作]
- **以便** [期望的成果]

**验收标准（Gherkin 格式）：**
- **场景：** [场景的简要描述]
- **假如：** [初始上下文或前置条件]
- **并且假如：** [其他前置条件]
- **当：** [触发操作的事件]
- **那么：** [预期结果]

### 为什么这种结构有效
- **以用户为中心：** 强制聚焦谁将从中受益以及为什么
- **聚焦成果：** “以便”强调所交付的价值，而不只是操作本身
- **可测试：** Gherkin 验收标准具体且可验证
- **对话式：** 故事是讨论的起点，而不是最终规格说明
- **共享语言：** 产品、工程和 QA 团队都能理解这种格式

### 反模式（这不是什么）
- **不是任务：** “作为开发者，我希望重构数据库”（这是技术任务，而不是用户价值）
- **不是功能列表：** “我想要仪表板、报告和分析功能”（范围太大——需要拆分）
- **不能含糊：** “我想要更好的体验”（无法衡量，也没有明确成果）
- **不是契约：** 故事是用于展开对话的占位内容，而不是锁定不变的规格说明

### 何时使用
- 将用户需求转化为开发工作
- 待办事项梳理和迭代规划
- 向工程和设计团队传达价值
- 确保开发开始前已有可测试的验收标准

### 何时不应使用
- 用于纯技术债务或重构时（应改用工程任务）
- 当故事范围过大时（应先拆分——参见 `skills/user-story-splitting/SKILL.md`）
- 在理解用户问题之前（应先编写问题陈述）

---

## 应用

### 第 1 步：收集上下文
在编写故事之前，请确保你已掌握以下信息：
- **用户画像：** 这是为谁设计的？（参考 `skills/proto-persona/SKILL.md`）
- **问题理解：** 这解决了什么需求？（参考 `skills/problem-statement/SKILL.md`）
- **期望成果：** 成功是什么样的？
- **约束条件：** 技术、时间或范围限制

**如果缺少上下文：** 请先开展探索性访谈或问题验证工作。

---

### 可选辅助脚本（模板生成器）

如果你希望使用格式一致的 Markdown 框架，可以根据 CLI 输入生成一个。此脚本是确定性的，不会获取数据或写入文件。

```bash
python3 scripts/user-story-template.py --persona \"trial user\" --action \"log in with Google\" --outcome \"access the app without creating a new password\"
```

---

### 第 2 步：编写用例

完整的填充结构请参阅 `template.md`。

填写模板：

```markdown
### User Story [ID]:

- **Summary:** [Brief, memorable title focused on value to the user]

#### Use Case:
- **As a** [user name if available, otherwise persona, otherwise role]
- **I want to** [action user takes to get to outcome]
- **so that** [desired outcome]
```

**质量检查：**
- **“作为”是否具体：** 这是一个具体的用户画像（例如“试用用户”），还是泛泛的角色（“用户”）？
- **“我想要”是否清晰：** 这是用户执行的操作，还是你正在构建的功能？
- **“以便”是否体现结果：** 这是否解释了用户的动机？还是仅仅换种说法重复该操作？

**常见错误：**
- ❌“作为一名用户，我想要一个登录按钮，以便我可以登录”（重复描述操作）
- ✅“作为一名试用用户，我想使用 Google 登录，以便无需创建新密码即可访问应用”

---

### 第 3 步：编写验收标准

填写模板：

```markdown
#### Acceptance Criteria:

- **Scenario:** [Brief, human-readable scenario describing value]
- **Given:** [Initial context or precondition]
- **and Given:** [Additional context or preconditions]
- **and Given:** [Additional context as needed]
- **and Given:** [UI-focused context ensuring 'When' can happen]
- **and Given:** [Outcomes-focused context ensuring 'Then' is delivered]
- **When:** [Event that triggers the action—aligns with 'I want to']
- **Then:** [Expected outcome—aligns with 'so that']
```

**质量检查：**
- **可以有多个 Given：** 前置条件可以叠加（例如，“Given 我已登录”+“Given 我的购物车中有商品”）
- **只能有一个 When：** 如果需要多个“When”语句，你很可能有多个故事——请将它们拆分
- **只能有一个 Then：** 如果需要多个“Then”语句，你很可能有多个故事——请将它们拆分
- **一致性：** “When”是否与“I want to”一致？“Then”是否与“so that”一致？

**危险信号：**
- **多个 When/Then：** 这是范围蔓延的迹象——请拆分故事（参阅 `skills/user-story-splitting/SKILL.md`）
- **模糊的 Then：** “Then 我看到性能有所改善”（不可衡量——请使其具体明确）

---

### 第 4 步：添加摘要

编写一个简短、易记且能体现故事价值的摘要：

```markdown
- **Summary:** [Brief, human-readable title]
```

**示例：**
- ✅“为试用用户启用 Google 登录，以减少注册阻力”
- ✅“批量删除项目，为高级用户节省时间”
- ❌“添加删除按钮”（以功能为中心，而非以价值为中心）

---

### 第 5 步：验证并完善

- **向团队朗读：** 每个人都理解是谁、要做什么、为什么吗？
- **检验验收标准：** QA 能据此编写测试用例吗？
- **检查是否需要拆分：** 如果故事显得过大，请使用 `skills/user-story-splitting/SKILL.md`
- **确保可测试性：** 你能证明 "Then" 已经发生吗？

---

## 示例

完整示例（包括优秀、糟糕以及需要拆分的故事）请参阅 `examples/sample.md`。

迷你示例节选：

```markdown
### User Story 042:

- **Summary:** Enable Google login for trial users to reduce signup friction

#### Use Case:
- **As a** trial user visiting the app for the first time
- **I want to** log in using my Google account
- **so that** I can access the app without creating and remembering a new password

#### Acceptance Criteria:
- **Scenario:** First-time trial user logs in via Google OAuth
- **Given:** I am on the login page
- **and Given:** I have a login account
- **When:** I click the "Sign in with Google" button and authorize the app
- **Then:** I am logged into the app and redirected to the onboarding flow
```

---

## 常见误区

### 误区 1：伪装成用户故事的技术任务
**表现：** “作为开发者，我想重构 API，以便让代码更整洁”

**后果：** 这是工程任务，而不是用户故事。它没有交付任何用户价值。

**修正：** 如果没有用户成果，它就不是用户故事——应改用工程任务或技术债工单。

---

### 误区 2："As a User"（过于笼统）
**表现：** 每个故事都以“As a user”开头

**后果：** 角色定位不清晰。不同用户有不同的需求。

**修正：** 使用具体角色：“作为试用用户”“作为付费订阅者”“作为管理员”等。（参阅 `skills/proto-persona/SKILL.md`）

---

### 误区 3："So That" 只是重复 "I Want To"
**表现：** “我想点击保存按钮，以便保存我的工作”

**后果：** 没有说明用户*为什么*在意，只是重复描述操作。

**修正：** 深入挖掘动机：“以便在页面崩溃时不会丢失进度”（真实成果）。

---

### 误区 4：存在多个 When/Then 语句
**表现：** 验收标准中包含 5 个 "When" 语句和 5 个 "Then" 语句

**后果：** 故事过大，很可能将多个功能捆绑在了一起。

**修正：** 使用 `skills/user-story-splitting/SKILL.md` 拆分故事。每一组 When/Then 都应该成为独立的故事（或至少应评估是否需要拆分）。

---

### 误区 5：无法测试的验收标准
**表现：** “Then 用户获得了更好的体验”或“Then 它更快了”

**后果：** QA 无法验证是否成功。“完成”的定义含糊不清。

**修正：** 使其可衡量：“Then 页面在 2 秒内加载完成”或“Then 用户看到成功确认消息”。

---

## 参考资料

### 相关技能
- `skills/user-story-splitting/SKILL.md` — 如何将大型故事拆分成较小的故事
- `skills/proto-persona/SKILL.md` — 定义 "As a [persona]" 部分
- `skills/problem-statement/SKILL.md` — 故事应解决经过验证的问题
- `skills/epic-hypothesis/SKILL.md` — 史诗可分解为用户故事

### 可选辅助工具
- `skills/user-story/scripts/user-story-template.py` — 确定性的 Markdown 框架生成器（无需网络访问）

### 外部框架
- Mike Cohn，*User Stories Applied*（2004）—“As a / I want / so that”格式的起源
- Gherkin（Cucumber）—“Given/When/Then”验收标准格式
- INVEST 标准（独立、可协商、有价值、可估算、小型、可测试）

### Dean 的工作成果
- [如适用，请链接到 Dean Peters 的相关 Substack 文章]

### 来源
- 改编自 `https://github.com/deanpeters/product-manager-prompts` 仓库中的 `prompts/user-story-prompt-template.md`。

---

**技能类型：** 组件
**建议的文件名：** `user-story.md`
**建议的存放位置：** `/skills/components/`
**依赖项：** 引用 `skills/proto-persona/SKILL.md`、`skills/problem-statement/SKILL.md`
**使用方：** `skills/user-story-splitting/SKILL.md`、`skills/epic-hypothesis/SKILL.md`