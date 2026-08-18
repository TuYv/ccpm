---
name: onboarding
description: Personalize COG for your workflow - creates profile, interests, and watchlist files with guided setup (run this first!)
roles: [all]
integrations: []
---
# COG 入门技能

## 目的
欢迎新用户，并收集必要信息，以个性化其 COG 体验。所有配置都以自然 Markdown 文件的形式存储在 vault 结构中，遵循 COG 透明且可编辑的知识理念。

## 调用时机
- 用户明确请求 `/onboarding`，或提到 "onboarding" 或 "setup COG"
- 用户是新用户，尚未完成入门设置
- 用户希望更新个人资料或添加新项目
- 任何需要进行个人资料定制的时候

## 核心设计原则：智能、低摩擦的入门流程

**入门流程必须让人感觉像自然对话，而不是填写表单。**

关键规则：
- **提出开放式问题，而不是选项选择题。** 绝不要向用户提供编号选项让其选择。
- **尽可能少提问题。** 根据上下文和用户自然表达的内容，能推断的就直接推断。
- **绝不要重复提问。** 如果可以从用户已经说过的话中提取答案，就不要再次询问。
- **智能解析。** 如果有人说“我是 Alex，一家金融科技初创公司的产品经理，正在关注 Stripe 和 Plaid”，则提取：name=Alex，role=金融科技初创公司的产品经理，watchlist=[Stripe, Plaid]。不要再针对已经提供的信息提出后续问题。
- **确认，而不是重新询问。** 如果不确定用户所说的内容，请确认你的理解，而不是重新完整地提问。

## 流程

### 1. 欢迎消息
热情地问候用户，并解释 COG 是什么：
```
Welcome to COG - your self-evolving second brain powered by Claude + Obsidian + Git!

COG helps you capture thoughts, get daily intelligence briefings, and build knowledge over time - all stored as simple markdown files you own.

Let's get you set up. Tell me a bit about yourself - your name, what you do, and what topics or areas you're most interested in staying sharp on. Feel free to share as much or as little as you'd like.
```

**这条开放式提示取代了旧版的连续提问。** 用户可以自然地一次提到自己的姓名、职位、兴趣、信息来源、项目和竞争对手，也可以只分享其中一部分。

### 2. 检查现有个人资料

查找 `00-inbox/MY-PROFILE.md`。如果存在：
```
I found an existing COG profile! What would you like to update? Just tell me what you'd like to change - your interests, projects, profile info, or anything else.
```

**不要提供编号菜单。** 让用户用自然语言描述他们想要更改的内容。

### 3. 智能提取信息

用户回复后，尽可能多地从其自然语言中提取信息：

| 字段 | 提取方式 |
|-------|----------|
| **姓名** | 查找自我介绍模式（“I'm Alex”“My name is...”“Call me...”）。默认使用名字。 |
| **职位** | 查找工作或活动相关的表述（“I'm a PM”“I work in...”“software engineer at...”）。 |
| **兴趣** | 查找主题相关的表述（“interested in AI”“following crypto”“love design”）。同时根据职位背景进行推断。 |
| **新闻来源** | 查找信息来源相关的表述（“I read HN”“follow on Twitter”）。如果未提及则跳过——这是可选信息。 |
| **项目** | 查找项目相关的表述（“working on a SaaS app”“building...”）。如果未提及则跳过。 |
| **竞争关注** | 查找公司或个人相关的表述（“tracking Stripe”“watching what OpenAI does”）。如果未提及则跳过。 |

### 4. 智能追问（仅在需要时）

在提取到尽可能多的信息后，仅检查 **必填** 字段中缺少的内容：
- **姓名**（必填）
- **角色**（必填）
- **兴趣**（必填 - 至少需要 2-3 个主题）

如果缺少任何必填字段，提出一个涵盖所有缺失项的追问。例如：
```
谢谢！我已获取你的姓名和角色。你最感兴趣、希望持续了解哪些主题？（例如，AI、创业公司、设计、健康等，任何对你重要的内容）
```

**可选字段**（新闻来源、项目、竞争动态）绝不能引发追问。如果用户未提及这些内容，请跳过。用户之后随时可以通过编辑文件或再次运行引导流程来添加它们。

### 5. 确认并创建

在创建文件之前，简要确认你捕获到的信息，并询问代理团队模式：
```
以下是我目前获取的信息：

- **姓名**：Alex
- **角色**：一家金融科技创业公司的产品经理
- **兴趣**：AI/ML、金融科技趋势、产品策略、UX 设计
- **项目**：支付仪表盘改版
- **跟踪对象**：Stripe、Plaid

还有一件事 - COG 可以在两种模式下运行：
- **单人模式**（默认）：我会在我们的对话中直接处理所有事情。
- **代理团队模式**：我会将研究、分析和写作委派给专业子代理，以获得更深入、更全面的结果。最适合与 Claude Code 配合使用。

你更倾向于哪一种？（单人模式很适合大多数人 - 团队模式面向希望获得最大深度的高级用户。）
```

**等待确认**，然后再生成所有内容。如果他们说“看起来不错”或类似的话，则继续。如果他们更正了某些内容，更新后直接继续，无需再次确认。如果他们没有表达偏好，默认使用 `solo`。

### 5.5. 角色包匹配

在第 3 步提取用户的角色文本后，扫描 `.claude/roles/*.md`，寻找匹配的角色包：

1. 读取每个角色包文件的 YAML 前置元数据（`role_id` 和 `aliases`）
2. 将用户提取出的角色文本（不区分大小写）与以下内容进行比较：
   - 精确匹配 `role_id`（例如，`"product-manager"`）
   - 匹配 `aliases` 中的任意字符串（例如，`"pm"`、`"product lead"`、`"head of product"`）
   - 模糊子字符串匹配（例如，`"product manager at a fintech startup"` 包含 `"product manager"`）
3. 如果找到匹配：
   - 将匹配的 `role_id` 作为 `role_pack` 存储在 MY-PROFILE.md 前置元数据中
   - 展示针对该角色的推荐：
   ```
   作为一名 [Role Display Name]，以下是对你最有帮助的技能和集成：

   **推荐技能**（按与你的角色的相关性排序）：
   [从角色包中列出最相关的 5-6 项技能，并附上“为什么这对你很重要”的背景说明]

   **推荐集成**：
   [列出角色包中的集成，并附上针对该角色的说明]
   ```
   - 使用角色包建议的 `agent_mode` 作为默认值（替代 `solo`）
4. 如果未找到匹配：
   - 在 MY-PROFILE.md 中设置 `role_pack: custom`
   - 仅推荐核心技能（即 `roles: [all]` 的技能）
   - 询问常见集成：“你是否使用 GitHub、Slack，或任何希望 COG 连接的其他工具？”

### 5.6. 集成发现

在角色包匹配后，设置用户的集成偏好：

1. 如果匹配到了角色包，结合角色特定的上下文展示其推荐集成：
   ```
   Based on your role, these integrations would give COG the most context:

   [For each integration in role pack:]
   - **[Integration]** — [Why it matters for you, from role pack]

   Which of these do you already use? And are there any other tools you'd like to connect?
   ```

2. 解析用户的回复：
   - 用户确认正在使用的服务 → 添加到 MY-INTEGRATIONS.md 的 **Active** 部分
   - 用户未提及或表示不使用的服务 → 添加到 **Disabled** 部分
   - 用户提到的额外服务 → 添加到 **Active** 部分
   - 除非用户明确请求，否则始终将 `ElevenLabs` 添加到 **Disabled**

3. 生成 `00-inbox/MY-INTEGRATIONS.md`：
   ```markdown
   ---
   type: integrations
   created: YYYY-MM-DD
   tags: ["#integrations", "#config", "#cog"]
   ---

   # My Integrations

   *COG checks this file before using any external service. Edit anytime.*

   ## Active
   [For each confirmed integration:]
   - **[Service]**: [Brief description of how COG uses it]

   ## Disabled
   [For each declined/unmentioned integration:]
   - **[Service]**: Skipped during onboarding. Enable anytime by moving to Active section.

   ---

   *Move services between Active and Disabled sections to control what COG connects to.*
   ```

4. 如果没有匹配到角色包，以对话方式询问常见集成：
   ```
   COG can connect with tools like GitHub, Slack, Linear, Notion, and PostHog for richer analysis. Do you use any of these? (Totally optional - COG works great without them too.)
   ```

### 6. 生成个人资料文档

使用 `references/profile-templates.md` 中的模板创建四份个人资料文档。

#### `00-inbox/MY-PROFILE.md`

#### `00-inbox/MY-INTERESTS.md`

#### `03-professional/COMPETITIVE-WATCHLIST.md`（仅当用户提到要跟踪的公司/人员时）

#### 对于每个项目：`04-projects/[project-slug]/PROJECT-OVERVIEW.md`

### 7. 创建目录结构
根据配置创建个性化结构：

**基础结构（始终创建）：**
```
00-inbox/
01-daily/
  briefs/
  checkins/
02-personal/
  braindumps/
  development/
  wellness/
03-professional/
  braindumps/
  leadership/
  strategy/
  skills/
04-projects/
05-knowledge/
  consolidated/
  patterns/
  timeline/
  booklets/
06-templates/
```

**项目特定结构（针对每个列出的项目）：**
```
04-projects/[project-slug]/
  PROJECT-OVERVIEW.md
  braindumps/
  competitive/
  content/
  planning/
  resources/
```

### 8. 创建欢迎指南

生成：`00-inbox/WELCOME-TO-COG.md`

根据 `references/welcome-guide.md` 中的模板生成。

### 9. 收尾（不要菜单！）
设置完成后，总结已创建的内容，并建议一个自然的下一步操作：

```
You're all set! I've created your profile, interests, and project files. Everything is in your vault and editable anytime.

If you want to jump right in, try a braindump - just tell me what's on your mind and I'll capture it. Or ask for your daily brief to see what's happening in your interest areas today.
```

**不要列出编号的后续操作菜单。** 只需自然地建议一两件事，然后让用户自行决定。

## 配置更新模式

如果用户在初始设置完成后再次运行 onboarding（`MY-PROFILE.md` 已存在）：

不要显示菜单。只需询问：
```
You've already completed onboarding! What would you like to update? Just tell me what needs changing.
```

然后智能地处理他们提出的任何内容——无论是添加项目、修改兴趣、更新角色，还是其他事项。

## 成功标准

满足以下条件时，onboarding 即成功：
1. 在 `00-inbox/` 中创建包含 `role_pack` frontmatter 的 `MY-PROFILE.md`
2. 在 `00-inbox/` 中创建 `MY-INTERESTS.md`
3. 在 `00-inbox/` 中创建包含 active/disabled sections 的 `MY-INTEGRATIONS.md`
4. 匹配角色包（或设置为 `custom`），并展示建议
5. 创建项目目录和概览（如适用）
6. 创建包含特定角色技能排序的 `WELCOME-TO-COG.md` 指南
7. 用户了解后续步骤以及其个人资料的存储位置

## 错误处理

**如果个人资料已存在：**
- 不要覆盖，改为提供更新模式
- 保留现有内容，仅追加或修改用户要求的部分
- 如果重新开始，则将旧版本归档到 `00-inbox/archive/MY-PROFILE-YYYY-MM-DD.md`

**如果目录创建失败：**
- 报告哪些目录无法创建
- 提供手动创建说明
- 继续完成设置的其余部分

**如果用户在 onboarding 中途退出：**
- 创建包含以下备注的部分个人资料：“Onboarding incomplete - run onboarding skill to finish”
- 保存目前已收集的内容
- 下次运行时从上次完成的步骤继续

## 隐私与数据

所有配置数据均以 Markdown 文件的形式存储在：
- `00-inbox/MY-PROFILE.md` - 包含角色包的基本个人资料
- `00-inbox/MY-INTERESTS.md` - 兴趣领域
- `00-inbox/MY-INTEGRATIONS.md` - 已启用/已禁用的外部服务集成
- `03-professional/COMPETITIVE-WATCHLIST.md` - 竞争追踪
- `04-projects/[project]/PROJECT-OVERVIEW.md` - 项目详情

Markdown 存储的优势：
- 人类可读且可编辑
- 可使用 Git 进行版本控制
- 可在 Obsidian 中搜索
- 可从其他笔记链接到
- 无需解析，只需作为文本读取
- 可以像其他笔记一样归档、移动和整理

## 理念

COG 的配置是**知识，而非配置项**。通过将偏好存储为 Markdown 笔记：
- 它们是知识库的一部分，而不是隐藏的配置文件
- 你可以链接到它们、引用它们，并不断完善它们
- 它们包含上下文，也可以加入你自己的笔记
- 它们透明且可审计
- 它们受益于 Obsidian 的全部功能（标签、链接、搜索、关系图视图）

这就是“知识即配置”——你的偏好本身就是第二大脑中的笔记。