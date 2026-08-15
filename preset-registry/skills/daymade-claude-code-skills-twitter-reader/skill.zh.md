---
name: twitter-reader
description: Fetch Twitter/X post content including long-form Articles with full images and metadata. Use when Claude needs to retrieve tweet/article content, author info, engagement metrics, and embedded media. Supports individual posts and X Articles (long-form content). Automatically downloads all images to local attachments folder and generates complete Markdown with proper image references. Preferred over Jina for X Articles with images.
---
# Twitter 阅读器

获取 Twitter/X 帖子和文章内容，并完整支持媒体资源。

## 快速开始（推荐）

对于包含图片的 X 文章，请使用新的 fetch_article.py 脚本：

```bash
uv run --with pyyaml python scripts/fetch_article.py <article_url> [output_dir]
```

示例：
```bash
uv run --with pyyaml python scripts/fetch_article.py \
  https://x.com/HiTw93/status/2040047268221608281 \
  ./Clippings
```

这将：
- 通过 `twitter-cli` 获取结构化数据（点赞、转发、书签）
- 通过 `jina.ai` API 获取包含图片的内容
- 将所有图片下载到 `attachments/YYYY-MM-DD-AUTHOR-TITLE/`
- 生成包含嵌入式图片引用的完整 Markdown
- 包含带元数据的 YAML 前置元数据

### 输出示例

```
Fetching: https://x.com/HiTw93/status/2040047268221608281
--------------------------------------------------
Getting metadata...
Title: 你不知道的大模型训练：原理、路径与新实践
Author: Tw93
Likes: 1648

Getting content and images...
Images: 15

Downloading 15 images...
  ✓ 01-image.jpg
  ✓ 02-image.jpg
  ...

✓ Saved: ./Clippings/2026-04-03-文章标题.md
✓ Images: ./Clippings/attachments/2026-04-03-HiTw93-.../ (15 downloaded)
```

## 替代方案：Jina API（仅文本）

无需身份验证即可进行简单的纯文本获取：

```bash
# Single tweet
curl "https://r.jina.ai/https://x.com/USER/status/TWEET_ID" \
  -H "Authorization: Bearer ${JINA_API_KEY}"

# Batch fetching
scripts/fetch_tweets.sh url1 url2 url3
```

## 功能

### 完整文章模式（fetch_article.py）
- ✅ 结构化元数据（作者、日期、互动指标）
- ✅ 自动下载图片（所有嵌入式媒体）
- ✅ 包含本地图片引用的完整 Markdown
- ✅ 面向 PKM 系统的 YAML 前置元数据
- ✅ 支持 X 文章（长篇内容）

### 简单模式（Jina API）
- 纯文本内容
- 除 Jina API 密钥外，无需其他身份验证
- 适合快速提取文本

## 前置条件

### 完整文章模式
- `uv`（Python 包管理器）
- 无需额外设置（自动安装 twitter-cli）

### 简单模式（Jina）
```bash
export JINA_API_KEY="your_api_key_here"
# Get from https://jina.ai/
```

## 输出结构

```
output_dir/
├── YYYY-MM-DD-article-title.md       # Main Markdown file
└── attachments/
    └── YYYY-MM-DD-author-title/
        ├── 01-image.jpg
        ├── 02-image.jpg
        └── ...
```

## 返回内容

### 完整文章模式
- **YAML 前置元数据**：source、author、date、likes、retweets、bookmarks
- **Markdown 内容**：包含本地图片引用的完整文章文本
- **附件**：下载到专用文件夹中的所有图片

### 简单模式
- **标题**：帖子作者和内容预览
- **来源 URL**：原始推文链接
- **发布时间**：GMT 时间戳
- **Markdown 内容**：包含远程媒体 URL 的文本

## 支持的 URL 格式

- `https://x.com/USER/status/ID`（帖子）
- `https://x.com/USER/article/ID`（长篇文章）
- `https://twitter.com/USER/status/ID`（旧版）

## 脚本

### fetch_article.py
支持图片下载的全功能文章获取器：
```bash
uv run --with pyyaml python scripts/fetch_article.py <url> [output_dir]
```

### fetch_tweet.py
使用 Jina API 的简单纯文本抓取工具：
```bash
python scripts/fetch_tweet.py <tweet_url> [output_file]
```

### fetch_tweets.sh
批量抓取多条推文（Jina API）：
```bash
scripts/fetch_tweets.sh <url1> <url2> ...
```

## 从 Jina API 迁移

旧工作流：
```bash
curl "https://r.jina.ai/https://x.com/..."
# Manual image extraction and download
```

新工作流：
```bash
uv run --with pyyaml python scripts/fetch_article.py <url>
# Automatic image download, complete Markdown
```