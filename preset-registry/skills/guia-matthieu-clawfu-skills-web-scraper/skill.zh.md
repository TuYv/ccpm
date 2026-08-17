---
name: web-scraper
description: "Extract structured data from websites. Use when: collecting competitor pricing; scraping product listings; extracting contact information; gathering research data; monitoring website changes"
license: MIT
metadata:
  author: ClawFu
  version: 1.0.0
  mcp-server: "@clawfu/mcp-skills"
---
# 网页抓取器

> 使用 BeautifulSoup 和 requests 从网站提取结构化数据——将任何网页转换为可用数据。

## 何时使用此技能

- **竞争对手研究** - 抓取定价、功能和市场定位
- **潜在客户开发** - 从目录中提取联系信息
- **内容审计** - 提取标题、链接和元数据
- **价格监控** - 跟踪竞争对手的价格变化
- **数据收集** - 从多个来源收集研究数据


## Claude 负责什么，您决定什么

| Claude 负责 | 您决定 |
|-------------|------------|
| 构建分析框架 | 战略优先级 |
| 综合市场数据 | 竞争定位 |
| 识别机会 | 资源分配 |
| 制定战略选项 | 最终战略选择 |
| 建议实施方法 | 执行决策 |

## 依赖项

```bash
pip install beautifulsoup4 requests pandas click lxml
```

## 命令

### 抓取元素
```bash
python scripts/main.py scrape https://example.com --selector "h1,h2,p"
python scripts/main.py scrape https://example.com --selector ".product-price"
```

### 提取链接
```bash
python scripts/main.py links https://example.com
python scripts/main.py links https://example.com --internal-only
```

### 提取电子邮件地址
```bash
python scripts/main.py emails https://example.com
python scripts/main.py emails https://example.com --depth 2
```

### 提取结构化数据
```bash
python scripts/main.py structured https://example.com/article --schema article
python scripts/main.py structured https://example.com/product --schema product
```

## 示例

### 示例 1：抓取竞争对手定价
```bash
python scripts/main.py scrape https://competitor.com/pricing --selector ".price,.plan-name"

# Output:
# Extracted 6 elements
# 1. Starter - $29/mo
# 2. Pro - $99/mo
# 3. Enterprise - Contact us
```

### 示例 2：提取文章内容
```bash
python scripts/main.py structured https://blog.example.com/post --schema article

# Output: article_data.json
# {
#   "title": "How to Scale Your Startup",
#   "author": "Jane Doe",
#   "date": "2024-01-15",
#   "content": "...",
#   "word_count": 1523
# }
```

## CSS 选择器参考

| 选择器 | 说明 | 示例 |
|----------|-------------|---------|
| `tag` | 元素类型 | `h1`, `p`, `div` |
| `.class` | 类名 | `.price`, `.title` |
| `#id` | 元素 ID | `#main-content` |
| `tag.class` | 带有类的标签 | `div.product` |
| `tag[attr]` | 具有属性 | `a[href]` |
| `parent > child` | 直接子元素 | `ul > li` |
| `tag1, tag2` | 多个选择器 | `h1, h2, h3` |

## 符合道德规范的抓取指南

1. **检查 robots.txt** - 遵守网站的抓取政策
2. **限制请求速率** - 不要让服务器过载（每秒 1-2 个请求）
3. **表明身份** - 使用描述明确的 User-Agent
4. **缓存请求** - 不要重复抓取未发生变化的页面
5. **服务条款** - 检查是否允许抓取

## 技能边界

### 此技能擅长的方面
- 构建战略分析
- 识别市场机会
- 创建战略框架
- 综合竞争数据

### 此技能无法做到什么
- 替代市场调研
- 保证战略成功
- 获知竞争对手的专有信息
- 代替高管做出决策

## 相关技能

- [competitor-monitor](../competitor-monitor/) - 监控竞争对手的变化
- [pdf-extractor](../pdf-extractor/) - 从 PDF 中提取内容

## 技能元数据


- **模式**：centaur
```yaml
category: automation
subcategory: data-extraction
dependencies: [beautifulsoup4, requests, pandas]
difficulty: intermediate
time_saved: 5+ hours/week
```