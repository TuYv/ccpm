---
name: content-repurposer
description: "Transform long-form content into multiple short-form pieces. Use when: converting podcast to social posts; extracting Twitter threads from blog posts; pulling quotes from transcripts; creating content variants from single source"
license: MIT
metadata:
  author: ClawFu
  version: 1.0.0
  mcp-server: "@clawfu/mcp-skills"
---
# 内容再利用器

> 使用 AI 驱动的内容提取和格式重构，将一份内容转化为 10 多份内容——实现“一次创作，随处发布”的工作流。

## 何时使用此 Skill

- **播客内容再利用** - 将单集文字稿转换为推文串、帖子和引语
- **博客内容分发** - 将文章转换为 LinkedIn 帖子和 Twitter 推文串
- **视频内容再利用** - 提取适合引用的精彩片段和洞见
- **新闻简报内容** - 从每周新闻简报中生成社交媒体短内容
- **网络研讨会后续跟进** - 根据录制内容创建会后内容


## Claude 负责什么，您决定什么

| Claude 负责 | 您决定 |
|-------------|------------|
| 构建制作工作流 | 最终创意方向 |
| 建议技术方案 | 设备和工具选择 |
| 创建模板和检查清单 | 质量标准 |
| 确定最佳实践 | 品牌和语言风格决策 |
| 生成脚本大纲 | 最终脚本审批 |

## 依赖项

```bash
pip install anthropic jinja2 click pyyaml
# Requires ANTHROPIC_API_KEY environment variable
```

## 命令

### 多格式内容再利用
```bash
python scripts/main.py repurpose transcript.txt --formats "twitter,linkedin,instagram"
python scripts/main.py repurpose blog-post.md --formats all
```

### Twitter 推文串
```bash
python scripts/main.py thread article.md --max-tweets 10
python scripts/main.py thread transcript.txt --style educational
```

### 引语提取
```bash
python scripts/main.py quotes podcast-transcript.txt --count 5
python scripts/main.py quotes interview.txt --style inspirational
```

### 开场钩子生成
```bash
python scripts/main.py hooks content.txt --count 10
python scripts/main.py hooks product-page.txt --style curiosity
```

## 示例

### 示例 1：播客单集 → 完整内容套件
```bash
# Input: 45-minute podcast transcript
python scripts/main.py repurpose episode-42-transcript.txt --formats all

# Output directory: episode-42-transcript_repurposed/
# ├── twitter_thread.md (10-tweet thread)
# ├── linkedin_post.md (long-form post)
# ├── instagram_carousel.md (10 slides)
# ├── quotes.md (5 quotable moments)
# └── hooks.md (5 attention grabbers)
```

### 示例 2：博客文章 → Twitter 推文串
```bash
# Convert 2000-word article to thread
python scripts/main.py thread positioning-strategy.md --max-tweets 12 --style educational

# Output: positioning-strategy_thread.md
# 1/ Here's how the best B2B companies position themselves (thread)
# 2/ First, they identify their competitive alternatives...
# ...
# 12/ TL;DR: Position for differentiation, not features. Link in bio.
```

### 示例 3：提取适合引用的精彩片段
```bash
# Pull shareable quotes from interview
python scripts/main.py quotes founder-interview.txt --count 10 --style inspirational

# Output: founder-interview_quotes.md
# 1. "We didn't build a product, we built a belief system."
# 2. "Your first 100 customers should feel like co-founders."
# ...
```

## 输出格式

| 格式 | 最适合 | 典型长度 |
|--------|----------|----------------|
| `twitter` | 带编号推文的推文串 | 8-15 条推文 |
| `linkedin` | 长篇专业帖子 | 1,200-1,500 个字符 |
| `instagram` | 轮播幻灯片内容 | 10 张幻灯片 |
| `quotes` | 可分享的引语图片 | 5-10 条引语 |
| `hooks` | 帖子的开场语句 | 10 个开场钩子 |
| `summary` | 执行摘要 | 200-300 个单词 |
| `newsletter` | 适合电子邮件的摘要 | 500-800 个单词 |

## 内容风格

| 风格 | 语气 | 使用场景 |
|-------|------|----------|
| `educational` | 教学、讲解 | 教程、操作指南 |
| `inspirational` | 激励、鼓舞 | 创始人故事 |
| `provocative` | 挑战固有认知 | 思想领导力内容 |
| `conversational` | 轻松、贴近日常 | 个人品牌 |
| `professional` | 正式、权威 | B2B、企业 |

## 工作原理

1. **内容分析** - AI 阅读完整内容，识别关键主题
2. **格式适配** - 根据各平台的限制重构内容
3. **钩子生成** - 创作吸引注意力的开场
4. **引语提取** - 提取最值得分享的精彩片段
5. **一致性检查** - 确保不同格式之间传达的信息保持一致

## 最佳实践

1. **从转录稿开始** - 原始转录稿比润色后的内容效果更好
2. **审查钩子** - AI 生成的钩子需要人工判断
3. **编辑推文串** - 检查推文之间的衔接
4. **补充背景信息** - AI 无法了解只有你的受众才懂的内部笑话
5. **测试不同版本** - 生成多个版本，并从中选择最佳版本

## Skill 边界

### 此 Skill 擅长的工作
- 构建音频制作工作流
- 提供技术指导
- 创建质量检查清单
- 提出创意方法建议

### 此 Skill 无法完成的工作
- 取代音频工程专业知识
- 做出主观的创意决策
- 直接访问或编辑音频文件
- 保证商业成功

## 相关 Skill

- [whisper-transcription](../whisper-transcription/) - 创建可供再利用的转录稿
- [youtube-downloader](../youtube-downloader/) - 获取可供再利用的视频内容
- [copywriting-schwartz](../../content/copywriting-schwartz/) - 改进再利用后的文案

## Skill 元数据


- **模式**：cyborg
```yaml
category: automation
subcategory: content-automation
dependencies: [anthropic, jinja2]
difficulty: beginner
time_saved: 8+ hours/week
api_cost: ~$0.02-0.10 per repurpose
```