---
name: promo-writer
description: Generates platform-specific social media copy from album themes, track concepts, and lyrics. Use when promo/ templates need to be populated before release.
argument-hint: <album-name> [platform]
model: sonnet
effort: high
prerequisites:
  - lyric-writer
allowed-tools:
  - Read
  - Edit
  - Write
  - Glob
  - Grep
  - bitwize-music-mcp
---
# 推广文案撰写 Skill

为 Twitter/X、Instagram、TikTok、Facebook 和 YouTube 生成用于专辑推广的社交媒体文案。根据专辑背景信息（包括主题、曲目概念和流媒体歌词），为每个平台创作符合其原生风格的内容。

## 目的

在 `promo/` 目录中填充可供审核的各平台专属文案。每个平台的内容都应根据其形式、语气和惯例量身打造，而不是在所有平台上交叉发布相同文本。

## 使用时机

- 曲目概念和歌词编写完成后（需要从中提取素材）
- 发行前——生成文案以填充 promo/ 模板
- 用户说“撰写推广文案”“创建社交媒体帖子”或“填写推广模板”时
- promo/ 文件已存在，但仍是模板占位内容时

## 在工作流中的位置

```
Lyrics Written → Promo Videos (optional) → **[Promo Writer]** → [Promo Review] → Release
```

位于内容制作完成与 promo-reviewer 之间。promo-reviewer 会润色此 Skill 生成的内容。

## 支持文件

- **[文案公式](copy-formulas.md)** — 钩子公式、CTA 模板、帖子结构、标签组合方法
- **[社交媒体最佳实践](/reference/promotion/social-media-best-practices.md)** — 平台策略与内容指南
- **[平台规则](/skills/promo-reviewer/platform-rules.md)** — 字符数限制与标签规则

---

## 工作流

### 1. 确定专辑

**根据参数确定专辑：**

使用 MCP `find_album`，并传入 `$ARGUMENTS` 中的专辑名称。如果未指定专辑，则检查 `get_session` 中最近使用的专辑上下文。

**验证准备情况：**
- 专辑必须已编写曲目概念
- 至少部分曲目应有流媒体歌词（用于提取可引用的钩子）
- 如果不存在流媒体歌词，则发出警告：“未找到流媒体歌词——将仅使用曲目概念。钩子的具体性会有所降低。”

### 2. 收集数据

批量收集专辑上下文，以尽量减少往返调用次数：

1. **专辑数据**：`get_album_full(album_slug, "concept,streaming,musical-direction")` — 专辑叙事 + 曲目内容
2. **曲目列表**：来自专辑数据 — 所有曲目名称、概念和状态
3. **流媒体歌词**：来自专辑数据的相关部分 — 从流媒体歌词中提取可引用的钩子（不要使用 Suno 歌词，其中包含语音化拼写）
4. **用户偏好**：`load_override("promotion-preferences.md")` — 语气、平台优先级、传播主题、标签偏好、AI 定位

**关键要求**：使用**流媒体歌词**提取可引用的钩子。Suno 歌词包含语音化拼写（`bit-wize`、`Luh-rock-uh`），绝不能出现在面向公众的文案中。

### 3. 生成推广活动策略（campaign.md）

首先生成 `campaign.md`——它是指导所有平台文案的策略基础。

**需要生成的内容：**

| 部分 | 撰写内容 |
|---------|---------------|
| 推广活动概述 | 专辑名称、发行日期（或待定）、主要平台、推广活动持续时间 |
| 关键信息 | 从专辑主题中提炼出的 3 条核心信息——“为什么有人会在意” |
| 目标受众 | 根据音乐类型和主题划分的 2 至 3 个受众群体 |
| 时间表 | 包含具体内容类型的发行前、发行周和发行后日程 |
| 标签 | 主要标签（发现 + 音乐类型）和次要标签（专辑专属标签、AI 相关标签，如适用） |

**从专辑数据中提炼关键信息：**
- 这张专辑讲述了什么？→ 信息 1（概念钩子）
- 它有何不同之处？→ 信息 2（独特视角）
- 为什么现在就该听？→ 信息 3（紧迫性/相关性）

**在继续撰写平台文案之前，先提交给用户审批。**

### 4. 语言选择

**在生成任何文案之前，确定输出语言。**

**如果存在覆盖配置**，且 `promotion-preferences.md` 中包含 `## Language` 部分，则直接使用该偏好，无需询问。

**否则，询问：**
```
What language(s) should the promo copy be written in?

[1] English (default)
[2] German (Deutsch)
[3] French (Français)
[4] Spanish (Español)
[5] Bilingual — two languages per post (e.g., DE + EN, FR + EN)
[6] Other — tell me which language(s)
```

**双语模式**：选择两种语言时，每篇帖子都在同一个代码块中依次提供两个版本，并使用 `---` 分隔。主要语言在前，次要语言在后。话题标签保持英文（便于全球发现）。

**覆盖文件新增内容**（`{overrides}/promotion-preferences.md`）：
```markdown
## Language
- Primary: de
- Secondary: en
- Mode: bilingual
```

存储所选语言，并将其应用于本次会话生成的所有文案。

### 5. 平台选择

**如果参数中指定了平台**，则仅为该平台生成文案。

**如果存在覆盖配置**，则遵循 `promotion-preferences.md` 中的平台优先级列表和跳过列表。

**否则，询问：**
```
Which platforms should I generate copy for?

[A] All platforms (Twitter, Instagram, TikTok, Facebook, YouTube)
[1] Twitter/X
[2] Instagram
[3] TikTok
[4] Facebook
[5] YouTube
```

### 6. 按平台生成

对于每个选定的平台，按照 [copy-formulas.md](copy-formulas.md) 中的结构和参考指南中的最佳实践，生成平台原生内容。

**首先读取该平台的推广模板**（`templates/promo/{platform}.md` 或现有的 `promo/{platform}.md`），以匹配预期的标题结构。

**各平台需要生成的内容：**

#### Twitter/X（`twitter.md`）
- 专辑发行公告推文（1-2 条推文或推文串）
- 单曲推广推文（每首曲目一条——钩子 + 概念 + 链接占位符）
- 幕后推文（创作过程/制作花絮视角）
- 互动推文（问题或投票）
- 每条推文：显示字符数，并确认不超过 280 个字符
- 每条推文使用 1-2 个话题标签，且绝不以话题标签开头

#### Instagram（`instagram.md`）
- 专辑发行公告文案（前 125 个字符内包含钩子）
- 2-3 条曲目亮点文案（故事化视角、个人化表达）
- 幕后文案
- 话题标签块（15-20 个标签，与文案分隔）
- 显示每条文案的字符数

#### TikTok（`tiktok.md`）
- 专辑发行公告文案（少于 150 个字符）
- 单曲文案（简短、随意、少于 150 个字符）
- 幕后文案
- 每篇帖子使用 3-5 个话题标签
- 注意：视频内容承担主要的信息传达作用——文案居于次要地位

#### Facebook（`facebook.md`）
- 专辑发行公告（较长的故事化形式，150-300 个单词）
- 曲目亮点帖子（2-3 篇，采用个人化视角）
- 幕后故事帖
- 每篇帖子使用 3-5 个话题标签，置于末尾

#### YouTube（`youtube.md`）
- 专辑/曲目描述模板（在前 2-3 行设置吸引点）
- 制作人员名单部分
- 社交链接部分
- 3-5 个话题标签

### 7. 提交审批

展示为每个平台生成的文案及其指标：

```
## Twitter/X — Generated Copy

### Release Announcement
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Generated tweet text]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Chars: 187/280 | Hashtags: 2 | Status: Within limits
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Track 01: [Track Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Generated tweet text]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Chars: 214/280 | Hashtags: 2 | Status: Within limits
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[... more posts ...]

Actions:
  [A] Approve all — write to promo/twitter.md
  [R] Revise specific posts — tell me which ones and what to change
  [N] Next platform — skip this platform
```

### 8. 写入已批准的文案

将已批准的文案写入专辑路径下的 `promo/` 目录：

```
{content_root}/artists/{artist}/albums/{genre}/{album}/promo/
```

**匹配 promo-reviewer 所要求的文件结构：**
- 使用 `##` 和 `###` 标题划分各部分
- 将帖子文案放在 ``` 代码块中
- 包含所有平台特定的元数据（字符数不写入文件）

**如果 promo/ 目录不存在**，则创建该目录。
**如果文件已存在**，覆盖前先询问：
```
promo/twitter.md already has content. Overwrite? [Y/n]
```

### 9. 总结与后续步骤

写入所有平台的文案后：

```
## Promo Copy Generated

| Platform | Posts | Status |
|----------|-------|--------|
| Campaign | 1 | Written |
| Twitter  | 8 | Written |
| Instagram | 5 | Written |
| TikTok | 6 | Written |
| Facebook | 4 | Written |
| YouTube | 1 | Written |

Files written to: {album_path}/promo/

Next steps:
  1. Review and polish: /bitwize-music:promo-reviewer <album-name>
  2. Replace [Streaming Link] placeholders with actual URLs when available
  3. When ready to release: /bitwize-music:release-director <album-name>
```

---

## 内容规则

### 仅使用流媒体歌词
仅从**流媒体歌词**部分提取可引用的记忆点。切勿使用 Suno 歌词——其中包含供 AI 使用的注音拼写，并非供人类读者阅读。

### 活动策略优先
始终先于平台文案生成 `campaign.md`。该策略文档会确定关键信息、受众和发布时间表，为每个平台的内容提供指导。

### 原生内容
每个平台的内容都应符合其自身惯例：
- Twitter：简洁有力，少于 280 个字符，使用 1-2 个话题标签
- Instagram：视觉优先，前 125 个字符内设置吸引点，并附话题标签区块
- TikTok：极其随意，少于 150 个字符，主要由视频传达内容
- Facebook：注重叙事，采用较长的形式，促进社群建设
- YouTube：信息丰富、结构清晰，并兼顾 SEO

切勿在多个平台使用相同的文本。

### 匹配 Promo-Reviewer 结构
promo-reviewer skill 要求特定的文件结构：
- 使用 `##` 标题表示主要部分
- 使用 `###` 标题表示单篇帖子
- 将帖子文案放在 ``` 代码块中
- 此结构支持逐部分审核

### 话题标签规则
遵循调研得出的最佳实践：
- **Twitter**：每条推文使用 1-2 个，切勿以话题标签开头，轮换使用不同组合
- **Instagram**：每篇帖子使用 15-20 个，单独成块，混合不同热度级别
- **TikTok**：每篇帖子使用 3-5 个，适用时包含热门话题标签
- **Facebook**：使用 3-5 个，置于末尾，用于分类
- **YouTube**：使用 3-5 个，前 3 个会显示在标题上方
- **切勿使用**：#MusicPromotion、#SoundCloudPromotion、#FollowBack、#Like4Like

### 语言处理
- 使用步骤 4 中选择的语言编写所有文案
- **双语模式**：主要语言在前，使用 `---` 分隔，次要语言在后——两种语言均放在同一个代码块中
- **Twitter 例外**：双语模式下，每种语言使用单独的推文（每种语言一条推文，或使用推文串），不得将两种语言堆叠在同一条推文中——280 个字符的限制无法容纳两种语言
- **话题标签**：无论文案使用何种语言，始终使用英文，以便获得国际曝光
- **引用的歌词**：保留原始语言；如果文案语言与歌词语言不同，则在括号中附上简短翻译
- **平台备注**（每个文件底部的 Notes 部分）：始终使用英文，以保持一致性

### 遵循覆盖设置
如果存在 `promotion-preferences.md` 覆盖文件：
- 遵循语气和表达风格偏好
- 遵循平台跳过列表
- 应用信息主题偏好（始终提及/绝不提及）
- 使用话题标签偏好（始终包含的标签、应避免的标签列表）
- 遵循 AI 定位指导
- 遵循语言偏好（主要语言、次要语言、模式）

---

## 请牢记

1. **调用时读取 copy-formulas.md**——其中包含钩子公式和帖子结构
2. **仅使用流媒体版歌词**——切勿在公开文案中使用 Suno 音标歌词
3. **Campaign.md 优先**——先制定策略，再编写平台文案
4. **先确定语言，再处理平台**——生成任何文案之前，先确定输出语言
5. **先展示，再写入**——展示生成的文案及指标以供审批
6. **适配各平台特性**——每个平台采用不同的语气、长度和结构
7. **匹配 promo-reviewer 格式**——使用标题和代码块，以便逐部分审核
8. **检查覆盖设置**——加载 `promotion-preferences.md`，获取语气、平台、信息主题和语言设置
9. **建议下一步使用 promo-reviewer**——始终以审核建议结尾
10. **使用占位链接**——在实际 URL 的位置使用 `[Streaming Link]`
11. **保持专辑风格**——文案应与专辑的主题和基调保持一致
12. **使用英文话题标签**——即使文案使用其他语言，也始终使用英文话题标签，以便被发现

**你的交付成果**：填充完成的 `promo/` 目录，其中包含可供审核的各平台专属文案。

**工作流集成**：你负责填补内容制作完成与 promo-reviewer 之间的空缺——生成此前需要手动完成的创意内容。