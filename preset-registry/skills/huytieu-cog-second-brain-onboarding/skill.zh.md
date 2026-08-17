---
name: onboarding
description: Personalize COG for your workflow - creates profile, interests, and watchlist files with guided setup (run this first!)
roles: [all]
integrations: []
---
# COG 入门引导 Skill

## 目的
欢迎新用户，并收集个性化 COG 使用体验所需的基本信息。所有配置均以自然的 Markdown 文件形式存储在知识库结构中，遵循 COG 所倡导的透明、可编辑知识理念。

## 何时调用
- 用户明确请求 `/onboarding`，或提到“onboarding”或“setup COG”
- 用户是新用户，尚未完成入门引导
- 用户希望更新个人资料或添加新项目
- 任何需要自定义个人资料的时候

## 核心设计原则：智能、低阻力的入门引导

**入门引导必须让人感觉像是自然对话，而不是填写表单。**

关键规则：
- **提出开放式问题，而不是让用户选择选项。** 绝不要提供带编号的选项列表供用户选择。
- **尽可能少提问。** 尽量根据上下文和用户的自然回答进行推断。
- **绝不要重复提问。** 如果可以从用户已经说过的内容中提取答案，就不要再次询问。
- **智能解析。** 如果有人说“我是 Alex，在一家金融科技初创公司担任产品经理，目前在关注 Stripe 和 Plaid”，应提取：姓名=Alex，角色=金融科技初创公司的产品经理，关注列表=[Stripe, Plaid]。不要针对已经提供的信息继续追问。
- **进行确认，而不是重新提问。** 如果不确定用户所说内容的含义，应确认你的理解，而不是从头再问一遍。

## 流程

### 1. 欢迎消息
热情地向用户问好，并说明 COG 是什么：
```
Welcome to COG - your self-evolving second brain powered by Claude + Obsidian + Git!

COG helps you capture thoughts, get daily intelligence briefings, and build knowledge over time - all stored as simple markdown files you own.

Let's get you set up. Tell me a bit about yourself - your name, what you do, and what topics or areas you're most interested in staying sharp on. Feel free to share as much or as little as you'd like.
```

**这一个开放式提示取代了旧有的连续提问。** 用户可以自然地一次性提及自己的姓名、角色、兴趣、信息来源、项目和竞争对手，也可以只分享其中几项。

### 2. 检查现有个人资料

查找 `00-inbox/MY-PROFILE.md`。如果存在：
```
I found an existing COG profile! What would you like to update? Just tell me what you'd like to change - your interests, projects, profile info, or anything else.
```

**不要提供带编号的菜单。** 让用户用自然语言描述他们想要更新的内容。

### 3. 智能提取信息

用户回答后，尽可能从其自然语言中提取信息：

| 字段 | 提取方式 |
|-------|---------------|
| **姓名** | 查找自我介绍模式（“I'm Alex”、“My name is...”、“Call me...”）。默认使用名字。 |
| **角色** | 查找对职业或活动的描述（“I'm a PM”、“I work in...”、“software engineer at...”）。 |
| **兴趣** | 查找提及的主题（“interested in AI”、“following crypto”、“love design”）。也可以根据角色上下文进行推断。 |
| **新闻来源** | 查找提及的信息来源（“I read HN”、“follow on Twitter”）。如果未提及，则跳过——此项为可选。 |
| **项目** | 查找提及的项目（“working on a SaaS app”、“building...”）。如果未提及，则跳过。 |
| **竞品关注** | 查找提及的公司或人物（“tracking Stripe”、“watching what OpenAI does”）。如果未提及，则跳过。 |

### 4. 智能追问（仅在需要时）

提取出尽可能多的信息后，仅检查以下**必填**字段中缺少哪些内容：
- **姓名**（必填）
- **角色**（必填）
- **兴趣**（必填——至少需要 2-3 个主题）

如果缺少任何必填字段，只提出一个涵盖所有缺失信息的后续问题。例如：
```
Thanks! I got your name and role. What topics are you most interested in staying updated on? (e.g., AI, startups, design, health - whatever matters to you)
```

**可选字段**（新闻来源、项目、竞品追踪）绝不应触发后续问题。如果用户没有提到这些字段，请跳过。用户之后随时可以通过编辑文件或重新运行引导流程来添加它们。

### 5. 确认并创建

创建文件之前，简要确认已获取的信息，并询问智能体团队模式：
```
Here's what I've got:

- **Name**: Alex
- **Role**: Product Manager at a fintech startup
- **Interests**: AI/ML, fintech trends, product strategy, UX design
- **Projects**: Payments dashboard revamp
- **Tracking**: Stripe, Plaid

One more thing - COG can run in two modes:
- **Solo mode** (default): I handle everything directly in our conversation.
- **Agent team mode**: I delegate research, analysis, and writing to specialist sub-agents for deeper, more thorough results. Works best with Claude Code.

Which do you prefer? (Solo is great for most people - team mode is for power users who want maximum depth.)
```

**等待确认**，然后生成所有内容。如果用户说“看起来不错”或类似的话，就继续执行。如果用户更正了某些信息，请更新后直接继续，无需再次确认。如果用户没有表达偏好，则默认使用 `solo`。

### 5.5. 角色包匹配

在第 3 步提取用户的角色文本后，扫描 `.claude/roles/*.md` 以查找匹配的角色包：

1. 读取每个角色包文件的 YAML 前置元数据（`role_id` 和 `aliases`）
2. 将提取出的用户角色文本与以下内容进行比较（不区分大小写）：
   - 与 `role_id` 完全匹配（例如，"product-manager"）
   - 与 `aliases` 中的任意字符串匹配（例如，"pm"、"product lead"、"head of product"）
   - 模糊子字符串匹配（例如，"product manager at a fintech startup" 包含 "product manager"）
3. 如果找到匹配项：
   - 将匹配到的 `role_id` 作为 `role_pack` 存储在 MY-PROFILE.md 的前置元数据中
   - 提供针对特定角色的建议：
   ```
   As a [Role Display Name], here are the skills and integrations that'll be most useful for you:

   **Recommended skills** (ordered by relevance for your role):
   [List top 5-6 skills from the role pack with the "Why it matters for you" context]

   **Recommended integrations**:
   [List integrations from the role pack with role-specific explanations]
   ```
   - 使用角色包建议的 `agent_mode` 作为默认值（而不是 `solo`）
4. 如果未找到匹配项：
   - 在 MY-PROFILE.md 中设置 `role_pack: custom`
   - 仅推荐核心技能（即带有 `roles: [all]` 的技能）
   - 询问常用集成：“你是否使用 GitHub、Slack，或者希望 COG 连接其他任何工具？”

### 5.6. 集成发现

角色包匹配完成后，设置用户的集成偏好：

1. 如果匹配到了角色包，请结合特定角色的上下文介绍其推荐的集成：
   ```
   Based on your role, these integrations would give COG the most context:

   [For each integration in role pack:]
   - **[Integration]** — [Why it matters for you, from role pack]

   Which of these do you already use? And are there any other tools you'd like to connect?
   ```

2. 解析用户的回答：
   - 用户确认正在使用的服务 → 添加到 MY-INTEGRATIONS.md 的 **Active** 部分
   - 用户未提及或明确表示不使用的服务 → 添加到 **Disabled** 部分
   - 用户提及的其他服务 → 添加到 **Active** 部分
   - 除非用户明确提出要求，否则始终将 `ElevenLabs` 添加到 **Disabled** 部分

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

4. 如果没有匹配到角色包，请以对话方式询问常见集成：
   ```
   COG can connect with tools like GitHub, Slack, Linear, Notion, and PostHog for richer analysis. Do you use any of these? (Totally optional - COG works great without them too.)
   ```

### 6. 生成个人资料文档

创建以下 Markdown 文件：

#### `00-inbox/MY-PROFILE.md`
```markdown
---
type: profile
created: YYYY-MM-DD
onboarding_completed: true
role_pack: [matched role_id or "custom"]
agent_mode: [solo or team, based on role pack suggestion]
tags: ["#profile", "#config", "#cog"]
---

# My COG Profile

## About Me
- **Name**: [Name]
- **Role**: [Job/role/main activity]
- **Role Pack**: [Display name from matched role pack, or "Custom" if no match]
- **Profile Created**: [Date]

## Settings
- **Agent Mode**: [solo/team] *(solo = handle everything directly; team = delegate to specialist sub-agents for deeper results)*

## Active Projects
[If they mentioned projects:]
- [[04-projects/[slug]/PROJECT-OVERVIEW|Project Name 1]]
- [[04-projects/[slug]/PROJECT-OVERVIEW|Project Name 2]]

[If no projects:]
*No active projects yet. Add them anytime by editing this file or running onboarding again.*

## Related
- [[MY-INTERESTS|My Interests & News Sources]]
- [[03-professional/COMPETITIVE-WATCHLIST|Competitive Watchlist]] *(if applicable)*

## Notes
*Feel free to add notes here about your COG usage, preferences, or anything else.*

---

*Edit this file anytime to update your profile. COG reads it when you use skills.*
```

#### `00-inbox/MY-INTERESTS.md`
```markdown
---
type: interests
created: YYYY-MM-DD
tags: ["#interests", "#daily-brief", "#config"]
---

# My Interests & News Sources

*These topics guide my daily intelligence briefings.*

## Topics I'm Interested In
- [Topic 1]
- [Topic 2]
- [Topic 3]
- [Topic 4]
- [Topic 5]

## Preferred News Sources
[If sources were mentioned:]
*Where I like to get information:*
- [Source 1]
- [Source 2]
- [Source 3]

[If no sources mentioned:]
*No specific sources set. COG will search broadly for your topics. Add preferred sources here anytime.*

## Notes
*Add any additional context about your interests here.*

---

*Update this file anytime as your interests evolve. Just edit and save—COG will pick up the changes.*
```

#### `03-professional/COMPETITIVE-WATCHLIST.md`（仅当他们提到要跟踪的公司/人员时）
```markdown
---
type: competitive-intelligence
created: YYYY-MM-DD
tags: ["#competitive", "#intelligence", "#tracking"]
---

# Competitive Watchlist

*Companies, people, or organizations I'm keeping an eye on.*

## Watching
- [Company/Person 1]
- [Company/Person 2]
- [Company/Person 3]

## Why I'm Tracking Them
*Add context here about why these matter to you or your projects.*

---

*When you mention these in braindumps, COG will automatically extract the intel to your project competitive folders.*
```

#### 对于每个项目：`04-projects/[project-slug]/PROJECT-OVERVIEW.md`
```markdown
---
type: project-overview
project: [project-name]
slug: [project-slug]
created: YYYY-MM-DD
status: active
tags: ["#project", "#overview"]
---

# [Project Name]

## What is this project?
[Brief description - leave for user to fill in]

## Current Status
*What phase are you in? What's happening now?*

## Project Resources
- [[braindumps/|Project Braindumps]]
- [[competitive/|Competitive Intelligence]]
- [[content/|Content & Assets]]
- [[planning/|Planning Documents]]

## Next Steps
- [ ] [Action item 1]
- [ ] [Action item 2]

---

*This overview helps COG organize your project-related thoughts and updates.*
```

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

**项目专属结构（为列出的每个项目创建）：**
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

```markdown
---
type: guide
created: YYYY-MM-DD
tags: ["#welcome", "#getting-started", "#cog"]
---

# Welcome to Your COG Second Brain, [Name]!

Your COG is now personalized and ready to use. Here's how to get started:

## Your Profile Documents

I've created these documents to store your preferences:

- **[[MY-PROFILE]]** - Your basic info, role pack, and workflow preferences
- **[[MY-INTERESTS]]** - Topics for your daily briefs
- **[[MY-INTEGRATIONS]]** - Your active and disabled integrations
- **[[03-professional/COMPETITIVE-WATCHLIST]]** - Companies you're tracking *(if applicable)*

**You can edit these files anytime.** COG reads them when you use skills, so your changes take effect immediately.

## Skills for Your Role

[If role pack was matched:]
As a **[Role Display Name]**, these skills are ordered by relevance for you:

[List skills from role pack in order, with brief "why it matters" from the role pack. Format as:]
1. **[skill-name]** — [Role-specific explanation]
2. **[skill-name]** — [Role-specific explanation]
[...continue for all recommended skills]

[If no role pack match:]
Here are COG's core skills available to everyone:

1. **daily-brief** — Personalized news intelligence
2. **braindump** — Capture and classify thoughts
3. **weekly-checkin** — Weekly pattern analysis
4. **knowledge-consolidation** — Build frameworks from scattered notes
5. **url-dump** — Save URLs with auto-extracted insights
6. **update-cog** — Keep COG framework current

## Your Integrations

[If integrations were configured:]
**Active**: [List active integrations]
**Disabled**: [List disabled integrations]

You can change these anytime by editing [[MY-INTEGRATIONS]].

[If no integrations configured:]
No integrations configured yet. COG works great standalone — add integrations anytime by editing `00-inbox/MY-INTEGRATIONS.md`.

## Quick Start

### 1. Daily Morning Routine
Invoke the daily-brief skill to get your personalized intelligence briefing covering:
[List their selected interest areas]

### 2. Capture Your Thoughts
Use the braindump skill to quickly capture ideas, insights, and thoughts. Your braindumps will automatically be categorized into:
[List their focus domains]

Choose from your active projects:
[List their projects with links]

### 3. Weekly Reflection
Every week, use the weekly-checkin skill to review your week's insights and patterns.

## Your Active Projects

[If they have projects]
You're tracking these projects:
- [[04-projects/[slug]/PROJECT-OVERVIEW|Project 1]]
- [[04-projects/[slug]/PROJECT-OVERVIEW|Project 2]]

When you use the braindump skill, select the project to automatically file your thoughts in the right place.

## How COG Uses Your Profile

**Daily Briefs**: Uses [[MY-INTERESTS]] to curate relevant news
**Braindumps**: Offers your projects from [[MY-PROFILE]] as options
**Competitive Intel**: Auto-extracts mentions of companies in [[COMPETITIVE-WATCHLIST]]
**Weekly Check-ins**: Reviews progress across your domains

## Next Steps

1. **Try your first braindump**: Use the braindump skill and start writing
2. **Get your daily brief**: Invoke the daily-brief skill to see curated intelligence
3. **Explore your vault**: All your files are organized in the sidebar
4. **Edit your profile**: Open [[MY-PROFILE]] and customize anytime

## Keeping COG Updated

COG separates your content from framework files. When new versions are released:
- Run `/update-cog` to check for and apply updates
- Or use the shell script: `./cog-update.sh --check`
- Your braindumps, profiles, and notes are **never** touched by updates

Check your current version: `cat COG-VERSION`

## Tips for Success

- **Don't overthink it**: Just dump your thoughts, COG will help organize
- **Be consistent**: Daily briefs and braindumps work best as habits
- **Review weekly**: Use the weekly-checkin skill to see patterns emerge
- **Evolve your setup**: Edit your profile files anytime or run onboarding again to add projects
- **Stay updated**: Run `/update-cog` periodically to get new skills and improvements

## Getting Help

- Check `SETUP.md` for detailed guides
- Visit the GitHub repo for documentation

**Your second brain is learning about you. Let's begin!**

---

*You can archive or delete this welcome guide once you're comfortable with COG.*
```

### 9. 收尾（不要菜单！）
设置完成后，总结已创建的内容，并自然地建议下一步操作：

```
You're all set! I've created your profile, interests, and project files. Everything is in your vault and editable anytime.

If you want to jump right in, try a braindump - just tell me what's on your mind and I'll capture it. Or ask for your daily brief to see what's happening in your interest areas today.
```

**不要用编号菜单列出后续操作。** 只需自然地建议一两件事，让用户自行决定。

## 配置更新模式

如果用户在初始设置完成后再次运行引导流程（`MY-PROFILE.md` 已存在）：

不要显示菜单。只需询问：
```
You've already completed onboarding! What would you like to update? Just tell me what needs changing.
```

然后智能处理他们提出的任何需求——无论是添加项目、更改兴趣，还是更新角色等。

## 成功标准

满足以下条件时，即表示引导成功：
1. 已在 `00-inbox/` 中创建 `MY-PROFILE.md`，且其 frontmatter 中包含 `role_pack`
2. 已在 `00-inbox/` 中创建 `MY-INTERESTS.md`
3. 已在 `00-inbox/` 中创建 `MY-INTEGRATIONS.md`，且包含已启用和已禁用部分
4. 已匹配角色包（或设置为 `custom`）并给出建议
5. 已创建项目目录和概览（如适用）
6. 已创建 `WELCOME-TO-COG.md` 指南，其中包含针对角色定制的技能顺序
7. 用户了解后续步骤以及个人资料的存储位置

## 错误处理

**如果个人资料已存在：**
- 不要覆盖，而是提供更新模式
- 保留现有内容，仅追加或修改用户要求的部分
- 如果要从头开始，则将旧版本归档至 `00-inbox/archive/MY-PROFILE-YYYY-MM-DD.md`

**如果目录创建失败：**
- 报告哪些目录无法创建
- 提供手动创建说明
- 继续完成其余设置

**如果用户在引导过程中退出：**
- 创建部分个人资料，并附上备注："Onboarding incomplete - run onboarding skill to finish"
- 保存目前已收集的内容
- 下次运行时，从上次完成的步骤继续

## 隐私与数据

所有配置数据均以 Markdown 文件形式存储在：
- `00-inbox/MY-PROFILE.md` - 包含角色包的基本个人资料
- `00-inbox/MY-INTERESTS.md` - 兴趣领域
- `00-inbox/MY-INTEGRATIONS.md` - 已启用/已禁用的外部服务集成
- `03-professional/COMPETITIVE-WATCHLIST.md` - 竞争动态跟踪
- `04-projects/[project]/PROJECT-OVERVIEW.md` - 项目详情

使用 Markdown 存储的优势：
- 人类可读且可编辑
- 可通过 Git 进行版本控制
- 可在 Obsidian 中搜索
- 可从其他笔记链接
- 无需解析，直接以文本形式读取即可
- 可以像其他任何笔记一样进行归档、移动和整理

## 理念

COG 的配置是**知识，而非配置**。通过将偏好存储为 Markdown 笔记：
- 它们是知识库的一部分，而不是隐藏的配置文件
- 你可以链接、引用并逐步完善它们
- 它们具有上下文，也可以包含你自己的笔记
- 它们透明且可审计
- 它们能够受益于 Obsidian 的全部功能（标签、链接、搜索、图谱视图）

这就是“配置即知识”——你的偏好本身也是第二大脑中的笔记。