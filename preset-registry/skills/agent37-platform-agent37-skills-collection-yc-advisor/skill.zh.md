---
name: yc-advisor
description: This skill should be used when the user asks questions about startups, founding decisions, co-founders, fundraising, product development, growth, hiring, or any entrepreneurial advice. It provides access to Y Combinator's complete library of 443 curated resources including essays by Paul Graham, founder interviews, and startup school lectures. Use this skill to give thorough, research-backed advice on startup decisions.
---
# YC 顾问

## 概述

此技能可访问 Y Combinator 内容全面的创业资源库，其中包含 443 份资源——包括 YC 合伙人、成功创始人和行业专家撰写的文章，以及播客和视频的文字稿。

## 如何使用此技能（分层检索）

**关键原则：** 使用 quick-index 发现资源，但在回答之前，务必加载完整的源内容。

### 第 1 步：了解背景（适用于宽泛问题）

对于宽泛问题，需要明确用户的背景：
- **阶段：** 尚无想法 | 已有想法 | 正在构建 MVP | 已发布 | 正在扩张
- **类型：** B2B | 消费级 | 硬件 | AI/ML | 市场平台
- **角色：** 技术创始人 | 非技术创始人 | 单人创业 | 有联合创始人

### 第 2 步：发现资源

1. 加载 `references/quick-index.md`，浏览可用资源（约 500 行，按主题分组）
2. 根据问题确定 3-5 份最相关的资源（行数有助于估算篇幅）
3. 如果用户正处于创业历程中，请查看 `references/learning-paths.md`
4. 对于决策类问题，请查看 `references/frameworks/`——使用 glob `references/frameworks/*.md` 列出文件，然后读取特定文件
5. 如需进行更深入的搜索，请对 `references/summaries.md` 使用 grep（文件过大，无法完整加载）

### 第 3 步：深入研究

1. **使用代码查找文件**——使用 glob 模式 `references/{CODE}-*.md`
   - 示例：对于代码 `DZ`，使用 glob `references/DZ-*.md` 查找文件
   - **警告：** 绝不要读取 `index.yaml`——它超出了 token 限制（64K tokens）
2. 加载最相关的 2-3 份资源的完整内容
3. 完整阅读——不要略读
4. 提取关键洞见、引文和可执行建议

### 第 4 步：综合回答

1. 整合多个来源的洞见
2. 在有价值时直接引用源材料
3. **每个要点都必须注明作者和标题**
4. 指出不同来源之间的权衡与矛盾
5. **绝不要仅依据摘要回答**——务必加载完整的源内容

## 主题分类

资源库涵盖以下主要领域（用于初步筛选）：

- **起步：** 是否应该创业？创业想法、行动顺序、学生创始人
- **联合创始人：** 寻找联合创始人、关系、股权分配、技术型与非技术型
- **产品：** MVP、产品市场契合度、设计、为用户构建产品
- **融资：** 种子轮、A 轮、向投资者推介、SAFE、投资条款清单
- **增长与指标：** 增长策略、KPI、转化率、留存率
- **客户与销售：** 与用户交流、首批客户、定价、企业销售
- **招聘与团队：** 首批员工、工程团队、股权、管理
- **文化与领导力：** 构建文化、CEO 的成长、董事会管理
- **常见错误：** 创业公司杀手、财务健康状况、何时放弃
- **转型与发布：** 转型策略、发布时间、媒体宣传
- **规模化：** 后期阶段建议、独角兽公司的特征
- **心态：** 善用资源、应对拒绝、设定目标
- **AI 创业公司：** AI 机会、护城河、垂直智能体、氛围编程
- **创始人访谈：** Airbnb、Stripe、Coinbase、Reddit、Twitch、DoorDash
- **专业领域：** 硬件、生物科技、开发者工具、加密货币、所在地
- **加入创业公司：** 选择创业公司、发展阶段、股权
- **YC 申请：** 申请技巧、流程、YC 效应
- **法律：** 创业公司运作机制、条款、协议

## 使用指南

### 对于复杂决策

例如“我应该独自创业，还是与他人共同创办公司？”这类问题：

1. 加载 quick-index.md 以确定相关资源
2. 阅读涵盖不同视角的 3-5 个完整源文件
3. 综合多个来源——寻找共识与矛盾之处
4. 提供承认各种权衡因素的平衡观点
5. 引用具体作者和标题
6. 针对用户的具体情况提出澄清问题

### 对于事实性问题

例如“导致初创公司失败的最常见错误有哪些？”这类问题：

1. 使用 quick-index.md 查找最权威的来源
2. 加载并阅读完整的源文件
3. 全面呈现——不要过度总结
4. 引用来源

### 对于系统性学习历程

当用户希望进行系统性学习时：

1. 查看 `references/learning-paths.md` 中精心编排的学习顺序
2. 引导他们按顺序学习这些资源
3. 总结每一步的关键要点

## 资源

### references/quick-index.md（主要发现入口）
按主题分组的轻量级索引（约 500 行）。每个条目包括：
- 代码、标题、作者、类型、行数、创始人阶段
- **优先使用此文件**——它足够小，可以完整加载
- 使用 glob 模式 `references/{CODE}-*.md` 按代码查找文件

### references/summaries.md（深度搜索）
包含内容预览的详细摘要（约 4300 行）。文件太大，不适合完整加载。
- 使用 grep 搜索特定关键词
- 在需要时提供比 quick-index 更丰富的上下文

### references/index.yaml（仅用于维护——请勿读取）
包含所有资源的结构化元数据。**对于运行时使用而言过大（64K tokens）。**
仅供维护脚本使用。如需查找文件名，请改用 quick-index.md。

### references/learning-paths.md
针对常见创始人历程精心编排的资源序列：
- 首次创业者路径
- AI 初创公司路径
- 融资路径
- 以及更多……

### references/frameworks/（使用 glob 列出，请勿读取）
适用于常见问题的决策框架。**使用 glob `references/frameworks/*.md` 列出文件。**
可用框架：
- should-i-start-a-startup.md
- solo-vs-cofounder.md
- bootstrap-vs-raise.md
- when-to-pivot.md
- when-to-quit.md
- technical-cofounder-needed.md

### references/*.md
443 个包含完整内容的源文件。每个文件均采用以下结构：

```markdown
# [Title]

**Author:** [Author Name]
**Type:** [Essay|Podcast|Video]
**URL:** https://www.ycombinator.com/library/[CODE]-[slug]

---

[Full content - essays, transcripts]
```

文件命名格式：`[CODE]-[descriptive-name].md`（例如 `8z-how-to-get-startup-ideas.md`）