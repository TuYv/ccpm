---
name: podcast-pipeline
description: >-
  Podcast-to-Everything content pipeline. Takes a podcast RSS feed or raw
  transcript and generates a full cross-platform content calendar: short-form
  video clips, Twitter/X threads, LinkedIn articles, newsletter sections, quote
  cards, blog outlines with SEO keywords, and YouTube Shorts/TikTok scripts.
  Scores each piece by viral potential (novelty × controversy × utility) and
  deduplicates against recent output. Use when asked to: "repurpose this podcast",
  "turn this episode into content", "podcast content calendar", "extract clips
  from this episode", "podcast to social", "content from RSS feed", "batch
  process episodes", or any request to turn podcast/audio content into a
  multi-platform content plan.
---
## 前置步骤（技能启动时运行）

```bash
# Version check (silent if up to date)
python3 telemetry/version_check.py 2>/dev/null || true

# Telemetry opt-in (first run only, then remembers your choice)
python3 telemetry/telemetry_init.py 2>/dev/null || true
```

> **隐私：** 此技能会将使用情况记录在本地的 `~/.ai-marketing-skills/analytics/` 中。远程遥测仅在选择加入后启用。绝不会收集任何代码、文件路径或仓库内容。请参阅 `telemetry/README.md`。

---

# 播客全内容转化流水线

将播客单集转化为覆盖各个平台的完整内容日历。
输入一集，输出 15-20 项内容——经过评分、去重和排期。

---

## 第 1 步：摄取——获取转录文本

确定输入来源并获取干净的转录文本。

### 选项 A：RSS 订阅源（`--rss <url>`）
1. 获取 RSS 订阅源 XML
2. 提取最新一集的音频 URL（或使用 `--episodes N` 进行批量处理）
3. 下载音频文件
4. 通过 OpenAI Whisper API 进行转录（包含时间戳）
5. 将转录文本与单集元数据（标题、日期、描述、时长）一起存储

### 选项 B：原始转录文本（`--transcript <file>`）
1. 读取转录文件（纯文本、SRT 或 VTT）
2. 解析已有的时间戳
3. 从文件名中提取单集元数据，或提示用户提供

### 选项 C：批量模式（`--batch <rss_url> --episodes N`）
1. 获取 RSS 订阅源
2. 提取最近 N 集
3. 通过完整流水线处理每一集
4. 对批次中的所有单集进行跨集去重

### 转录文本清理
- 为书面内容移除填充词（um、uh、like、you know）
- 保留带时间戳的原始版本，用于生成视频片段建议
- 根据话题变化拆分为逻辑片段

---

## 第 2 步：编辑大脑——深度分析

使用以下提取框架，将完整转录文本提供给 LLM：

### 提取以下内容原子：

1. **叙事弧线**——具有铺垫 → 张力 → 解决这一完整结构的故事片段。
   标注开始/结束时间戳。

2. **金句时刻**——有力、易于分享的陈述。能够独立成立的短句。
   必须通过“会有人截图分享这句话吗？”测试。

3. **争议观点**——与传统认知相悖的观点。
   会让人回复“强烈反对”或“终于有人说出来了”的内容。

4. **数据点**——具体的数字、百分比、金额和时间范围。
   能够增强可信度的具体佐证。

5. **故事**——个人轶事、案例研究、客户示例。
   必须包含人物、问题和结果。

6. **框架**——分步流程、思维模型、决策矩阵。
   任何人们会保存或添加书签的结构化内容。

7. **预测**——关于趋势、市场和技术的前瞻性论断。
   对未来发展方向的犀利观点。

### 每个内容原子的输出格式：
```
- Type: [narrative_arc | quote | controversial_take | data_point | story | framework | prediction]
- Content: [extracted text]
- Timestamp: [start - end, if available]
- Context: [what was being discussed]
- Viral Score: [0-100, see Step 4]
- Suggested platforms: [where this atom works best]
```

---

## 步骤 3：内容生成——单集，多种素材

针对每一集，使用提取出的内容原子生成以下所有内容：

### 3a. 短视频片段（每集 3-5 个）
```
- Hook: [First 3 seconds — pattern interrupt or bold claim]
- Clip segment: [Timestamp range from transcript]
- Caption overlay: [Text for the screen]
- Platform: [YouTube Shorts / TikTok / Instagram Reels]
- Why it works: [What makes this clippable]
```
优先级：争议性观点 > 有结果揭晓的故事 > 令人惊讶的数据点

### 3b. Twitter/X 帖子串（每集 2-3 个）
```
- Thread hook (tweet 1): [Curiosity gap or bold opener]
- Thread body (5-10 tweets): [Each tweet is one complete thought]
- Thread closer: [CTA — follow, reply, retweet trigger]
- Source atoms: [Which content atoms feed this thread]
```
规则：任何帖子都不得超过 280 个字符。每条帖子都必须能够独立成立。使用数据点作为论据。

### 3c. LinkedIn 文章草稿（每集 1 篇）
```
- Headline: [Specific, benefit-driven]
- Hook paragraph: [Before the "see more" fold — must earn the click]
- Body: [3-5 sections with headers, 800-1200 words]
- CTA: [Engagement driver — question, not link]
- Hashtags: [3-5 relevant, not spammy]
```
语气：专业但不官腔。使用第一人称。以故事驱动。

### 3d. 新闻简报板块（每集 1 个）
```
- Section headline: [Scannable, specific]
- TL;DR: [One sentence, the core insight]
- Body: [3-5 bullet points, each with a takeaway]
- Pull quote: [The most shareable line from the episode]
- Link: [Back to full episode]
```

### 3e. 引语卡片（每集 3-5 张）
```
- Quote text: [Max 20 words — must work as text overlay]
- Attribution: [Speaker name]
- Background suggestion: [Color/mood that matches the tone]
- Platform sizing: [1080x1080 for IG, 1200x675 for Twitter, 1080x1920 for Stories]
```

### 3f. 博客文章大纲（每集 1 份）
```
- Title: [SEO-optimized, includes primary keyword]
- Primary keyword: [Search volume + difficulty estimate]
- Secondary keywords: [3-5 related terms]
- Meta description: [155 chars max]
- H2 sections: [5-7, each maps to a content atom]
- Internal linking opportunities: [Topics that connect to existing content]
- Estimated word count: [1500-2500]
```

### 3g. YouTube Shorts / TikTok 脚本（每集 1 份）
```
- HOOK (0-3s): [Pattern interrupt — question, bold claim, or visual]
- SETUP (3-15s): [Context — why should they care]
- PAYOFF (15-45s): [The insight, data, or story resolution]
- CTA (45-60s): [Follow, comment prompt, or part 2 tease]
- On-screen text: [Key phrases to overlay]
- B-roll suggestions: [Visual ideas if not talking-head]
```

---

## 步骤 4：内容评分——病毒式传播潜力

从三个维度对生成的每项内容进行评分（每项 0-100 分）：

| 维度 | 衡量内容 | 信号 |
|-----------|-----------------|---------|
| **新颖性** | 内容是否新鲜或令人惊讶？ | 反主流观点、意外数据、率先提出 |
| **争议性** | 人们会为此争论吗？ | 强烈观点、挑战常规、明确站队 |
| **实用性** | 人们能否立即应用？ | 框架、操作方法、模板、具体数字 |

**Viral Score = (Novelty × 0.4) + (Controversy × 0.3) + (Utility × 0.3)**

### 分数阈值：
- **80+** → 优先发布。安排在互动高峰时段发布。
- **60-79** → 优质内容。用于填充发布日历。
- **40-59** → 填充内容。仅在发布日历有空缺时使用。
- **低于 40** → 舍弃。不值得占用发布时段。

---

## 步骤 5：去重引擎

在最终确定之前，根据以下范围检查所有生成的内容：
1. **当前批次** — 任意两篇内容都不应涵盖相同的角度
2. **近期历史记录** — 与过去 N 天的输出进行比较（默认：30）
3. **相似度阈值** — 标记语义重合度 >70% 的任意内容对

### 去重规则：
- 如果两篇内容的重合度 >70%：保留得分较高的一篇，舍弃另一篇
- 如果某篇内容与近期已发布的内容重合：使用 ⚠️ 标记，并建议一个差异化角度
- 在 `output/content_history.json` 中记录所有已发布内容的哈希值

---

## 步骤 6：生成日历（`--calendar`）

将已评分、已去重的内容编排到每周发布日历中。

### 排期规则：
- **Twitter/X：**每天 1-2 条，高峰时段（8-10am、12-1pm、5-7pm ET）
- **LinkedIn：**每天最多 1 条，安排在周二至周四上午
- **YouTube Shorts/TikTok：**每天 1 条，安排在晚间
- **Newsletter：**每周一期，每周固定在同一天
- **Blog：**每周 1-2 篇
- **语录卡片：**穿插安排在内容较少的日期

### 日历输出格式：
```json
{
  "week_of": "2024-01-15",
  "episode_source": "Episode Title - Guest Name",
  "content_pieces": [
    {
      "date": "2024-01-15",
      "time": "09:00 ET",
      "platform": "twitter",
      "type": "thread",
      "content": "...",
      "viral_score": 85,
      "status": "draft"
    }
  ],
  "total_pieces": 18,
  "avg_viral_score": 72,
  "coverage": {
    "twitter": 6,
    "linkedin": 3,
    "youtube_shorts": 3,
    "newsletter": 1,
    "blog": 1,
    "quote_cards": 4
  }
}
```

---

## 步骤 7：输出

所有输出均写入 `output/` 目录：

```
output/
├── episodes/
│   ├── YYYY-MM-DD-episode-slug/
│   │   ├── transcript.txt
│   │   ├── atoms.json          # Extracted content atoms
│   │   ├── content_pieces.json # All generated content
│   │   └── calendar.json       # Scheduled calendar
│   └── ...
├── calendar/
│   └── week-YYYY-WNN.json     # Aggregated weekly calendar
├── content_history.json        # Dedup tracking
└── pipeline_log.json           # Run history and stats
```

---

## CLI 参考

```bash
# Process latest episode from RSS feed
python podcast_pipeline.py --rss "https://feeds.example.com/podcast.xml"

# Process a local transcript
python podcast_pipeline.py --transcript episode-42.txt

# Batch process last 5 episodes
python podcast_pipeline.py --batch "https://feeds.example.com/podcast.xml" --episodes 5

# Generate weekly calendar from existing outputs
python podcast_pipeline.py --calendar

# Process with custom dedup window
python podcast_pipeline.py --rss "https://feeds.example.com/podcast.xml" --dedup-days 60

# Process and only keep 80+ viral score content
python podcast_pipeline.py --rss "https://feeds.example.com/podcast.xml" --min-score 80
```

---

## 环境变量

| 变量 | 是否必需 | 说明 |
|----------|----------|-------------|
| `OPENAI_API_KEY` | 是（用于 Whisper） | 用于音频转录的 OpenAI API 密钥 |
| `ANTHROPIC_API_KEY` | 是（用于生成） | 用于内容生成的 Anthropic API 密钥 |
| `OPENAI_LLM_KEY` | 可选 | 使用 GPT 进行生成时单独使用的 OpenAI 密钥 |

---

## 参考文件

| 文件 | 用途 |
|------|---------|
| `podcast_pipeline.py` | 主流程脚本 |
| `requirements.txt` | Python 依赖项 |
| `README.md` | 设置和使用指南 |