---
name: promo-reviewer
description: Reviews and iterates on social media copy in album promo/ files. Use after populating promo templates and before release to polish platform-specific posts.
argument-hint: <album-name> [platform]
model: sonnet
effort: medium
allowed-tools:
  - Read
  - Edit
  - Glob
  - Grep
  - bitwize-music-mcp
---
# 推广文案审核技能

以交互方式审核和润色专辑 `promo/` 文件中的社交媒体文案。逐条检查每篇帖子，批准或修改，并将润色后的结果写回文件。

## 目的

在推广模板填充特定平台的文案后，此技能会在发布前提供结构化审核。每篇帖子都会连同字符数、话题标签数以及是否符合平台限制一起呈现。用户可以选择操作（批准、修改、缩短、增强感染力等），润色后的文案将被写回文件。

## 何时使用

- 在 `/bitwize-music:promo-writer` 生成初始文案后
- 在填充 promo/ 模板后（手动填充或在发布准备期间填充）
- 发布前——对社交媒体文案进行最终润色
- 用户提出“审核推广文案”或“润色 [album] 的 Twitter 帖子”
- 已有推广文案但尚未经过审核时

## 工作流中的位置

```
Promo Videos (optional) → [Promo Writer] (or manual) → **[Promo Review]** → Release
```

位于填充推广模板与 release-director 之间。

## 支持文件

- **[platform-rules.md](platform-rules.md)** — 各平台的字符限制、话题标签规则和语气指南

---

## 工作流

### 1. 解析专辑

**根据参数解析专辑：**

使用 MCP `find_album`，并传入 `$ARGUMENTS` 中的专辑名称。如果未指定专辑，则检查 `get_session` 以获取最近使用的专辑上下文。

**定位推广目录：**
```
{content_root}/artists/{artist}/albums/{genre}/{album}/promo/
```

**检查存在哪些推广文件以及其中是否有内容：**

在专辑目录中使用 Glob 查找 `promo/*.md`。对于每个文件，检查其是否包含已填充的内容（而不只是模板占位符）。如果文件包含模板标记以外的文本，则视为“已填充”——检查代码块中是否存在并非 `[placeholder text]` 的内容。

**报告状态：**
```
## Promo Copy Status

| Platform | File | Status |
|----------|------|--------|
| Campaign | campaign.md | Populated |
| Twitter/X | twitter.md | Populated |
| Instagram | instagram.md | Template only |
| TikTok | tiktok.md | Not found |
| Facebook | facebook.md | Populated |
| YouTube | youtube.md | Template only |

3 of 6 platforms have copy ready for review.
```

如果没有任何推广文件已填充：
```
No promo copy found to review.

Options:
1. Generate promo copy: /bitwize-music:promo-writer <album-name>
2. Populate promo templates manually (fill in promo/ files)
3. Skip promo review and proceed to release
```

### 2. 选择平台

**如果参数中指定了平台**，则仅审核该平台。

**否则，询问：**
```
Which platforms to review?

[A] All populated platforms (campaign, twitter, facebook)
[1] Campaign strategy
[2] Twitter/X posts
[3] Facebook posts
```

仅将已填充的平台列为编号选项。

### 3. 解析章节

对于每个选定的平台文件：

1. **读取完整文件**：使用 Read 工具
2. **按标题边界拆分**——`##` 和 `###` 标题用于划分章节
3. **提取代码块**——``` 围栏内的内容是实际的帖子文案
4. **识别可审核章节**——包含具有非占位符文本的代码块的章节
5. **统计每篇帖子的指标**：
   - 字符数（在所有平台上，话题标签均计入限制）
   - 话题标签数
   - 行数
   - 是否符合平台限制（来自 platform-rules.md）
6. **检测帖子串**——如果代码块包含带编号的推文（1/、2/、3/），则将其拆分为单独的推文，并分别审核，同时给出每条推文的字符数

### 4. 逐篇帖子审阅循环

对于每个可审阅的部分，结合上下文展示帖子：

```
## Twitter/X — Track 01: Track Title
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Track one tells the story of [concept].

Listen now: [link]

#NewMusic #HipHop

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Chars: 87/280 | Hashtags: 2 | Status: Within limits
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Actions:
  [A] Approve — keep as-is
  [R] Revise — give feedback for rewrite
  [S] Shorten — make more concise
  [P] Punch up — make more engaging/attention-grabbing
  [H] Add hashtags — suggest relevant hashtags
  [T] Rewrite tone — specify tone (casual, professional, hype, etc.)
  [K] Skip — move to next without changes
```

**执行任何修改操作（R、S、P、H、T）后：**

1. 生成修改后的版本
2. 展示该版本及更新后的指标
3. 提供后续操作：
```
Revised version:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[revised copy here]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Chars: 142/280 | Hashtags: 3 | Status: Within limits
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  [A] Approve this version
  [R] Revise again — more feedback
  [D] Discard — revert to original
```

### 5. Campaign.md 的特殊处理

Campaign 文件包含策略表格和消息文案，而不是代码块形式的帖子。请相应调整审阅方式：

- **将每个部分单独展示**（Overview、Key Messages、Schedule 等），作为可审阅单元
- **将 "Punch up" 替换为** **"[M] Strengthen messaging"** — 精炼策略性语言
- **跳过字符数限制** — Campaign 文档没有平台限制
- **重点关注**：清晰度、与专辑主题的一致性、可执行的日程条目、完整的元数据字段

### 6. 写回

审阅完某个平台的所有部分后：

1. **重新构建文件**，将已批准或修改的内容放回相应位置
2. **使用 Edit 工具**将更改应用到 promo 文件
3. **确认写入：**
```
Updated twitter.md — 4 posts revised, 2 approved as-is, 1 skipped
```

仅当至少有一个部分经过修改时才写回。如果所有部分均按原样批准或跳过，则跳过写入步骤。

### 7. 进度跟踪

在不同平台之间，显示持续更新的摘要：

```
## Review Progress

| Platform | Approved | Revised | Skipped | Limit Issues |
|----------|----------|---------|---------|--------------|
| Twitter  | 4        | 2       | 1       | 0            |
| Facebook | —        | —       | —       | —            |

Next: Facebook (5 sections to review)
Continue? [Y/n]
```

### 8. 会话摘要

审阅完所有平台后：

```
## Promo Review Complete

| Platform | Approved | Revised | Skipped |
|----------|----------|---------|---------|
| Campaign | 3        | 1       | 0       |
| Twitter  | 4        | 2       | 1       |
| Facebook | 3        | 2       | 0       |
| **Total** | **10** | **5** | **1** |

Char limit compliance: All posts within platform limits

Files updated:
  - promo/campaign.md (1 revision)
  - promo/twitter.md (2 revisions)
  - promo/facebook.md (2 revisions)

Next steps:
  1. Review any skipped posts if needed
  2. Add streaming links when available (replace [Streaming Link] placeholders)
  3. Ready for release: /bitwize-music:release-director <album>
```

---

## 修订指南

修订帖子时，请遵循以下原则：

### 精简 (S)
- 删除填充词（“really”、“very”、“just”）
- 尽可能合并句子
- 优先突出吸引点——以最具吸引力的元素开篇
- 遵守平台限制（参见 platform-rules.md）

### 增强感染力 (P)
- 使用更有力的动词和更生动的语言
- 增加紧迫感或激发好奇心
- 以吸引点开篇，而不是从描述开始
- 保留核心信息——只需让表达更有冲击力

### 添加话题标签 (H)
- 根据音乐类型、专辑主题和平台惯例，建议 3-5 个相关话题标签
- 提供多个选项——由用户选择要使用的标签
- 遵循各平台特定的话题标签惯例（参见 platform-rules.md）
- 绝不超过平台上限

### 改写语气 (T)
- 改写前先询问用户期望的语气
- 常见语气：随意、专业、热烈、神秘、叙事、紧迫
- 保留事实内容——只改变语态和风格
- 使语气符合平台预期

### 强化信息表达 (M) — 仅限宣传活动
- 精简策略性语言
- 让关键信息更令人印象深刻、更便于引用
- 确保日程条目具体且可执行
- 验证信息表达与专辑主题是否一致

---

## 各平台的审查重点

### Twitter/X
- 每篇帖子不得超过 280 个字符（硬性限制）
- 帖子串中的每篇帖子既要能够独立表达，又要彼此关联
- 最多使用 1-2 个话题标签（更多会显得像垃圾信息）
- 在发布类帖子中加入流媒体链接

### Instagram
- 帖子说明可以很长（2,200 个字符），但“更多”之前仅显示前 125 个字符
- 在第一行设置吸引点——这是用户唯一能直接看到的内容
- 将话题标签作为末尾的独立区块
- 15-20 个话题标签为最佳数量（最多 30 个）

### TikTok
- 理想长度为 150 个字符以内（无需点击即可看到）
- 上限为 4,000 个字符，但越短越好
- 使用 3-5 个话题标签；如适用，使用热门标签
- 采用随意、真实的语气

### Facebook
- 较长的叙事内容效果很好
- “查看更多”之前会显示前 2-3 行
- 使用 3-5 个话题标签（该平台对话题标签的依赖较低）
- 加入行动号召

### YouTube
- 说明中支持时间戳、演职人员信息和链接
- 折叠视图中会显示前 2-3 行
- 加入流媒体链接、社交媒体链接和演职人员信息
- 使用 3-5 个话题标签（显示在标题上方）

---

## 请记住

1. **读取 platform-rules.md**：每次调用开始时读取，以获取当前限制
2. **每次展示一篇帖子**——不要批量审查
3. **为每篇帖子显示指标**——字符数、话题标签数、是否符合限制
4. **绝不自动批准**——每篇帖子都要经过用户审查
5. **仅写回已更改的文件**——不要修改未经修订的文件
6. **跟踪进度**——在不同平台之间持续统计数量
7. **宣传活动有所不同**——它是策略文档，不是社交媒体帖子
8. **保留用户的表达风格**——修订应增强而非取代用户的风格
9. **标记超出限制的情况**——突出显示超过平台字符限制的帖子
10. **检测占位符**——标记仍需替换为实际内容的 `[placeholder]` 文本