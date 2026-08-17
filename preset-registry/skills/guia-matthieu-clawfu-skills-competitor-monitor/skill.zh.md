---
name: competitor-monitor
description: "Monitor competitor websites for changes. Use when: tracking competitor pricing changes; monitoring new features; watching for content updates; alerting on website changes; competitive intelligence"
license: MIT
metadata:
  author: ClawFu
  version: 1.0.0
  mcp-server: "@clawfu/mcp-skills"
---
# 竞争对手监控

> 跟踪竞争对手网站的变化并获取提醒——及时掌握定价、功能和内容更新。

## 何时使用此技能

- **定价情报** - 跟踪竞争对手的价格变化
- **功能跟踪** - 监控新功能公告
- **内容监控** - 跟踪新的博客文章或页面
- **变更提醒** - 在网站更新时收到通知
- **竞争分析** - 定期进行竞争对手审查


## Claude 做什么与你决定什么

| Claude 做什么 | 你决定什么 |
|-------------|------------|
| 构建分析框架 | 战略优先级 |
| 汇总市场数据 | 竞争定位 |
| 识别机会 | 资源分配 |
| 创建战略选项 | 最终战略选择 |
| 建议实施方法 | 执行决策 |

## 依赖项

```bash
pip install beautifulsoup4 requests click
# For diff comparison:
pip install diff-match-patch
```

## 命令

### 监控 URL
```bash
python scripts/main.py watch https://competitor.com/pricing
python scripts/main.py watch https://competitor.com/pricing --selector ".price"
```

### 检查变更
```bash
python scripts/main.py diff https://competitor.com/pricing --baseline cache.html
```

### 监控定价
```bash
python scripts/main.py pricing https://competitor.com/pricing
```

### 批量监控
```bash
python scripts/main.py batch competitors.txt --output changes/
```

## 示例

### 示例 1：跟踪定价变化
```bash
# First, capture baseline
python scripts/main.py watch https://competitor.com/pricing --save baseline.html

# Later, check for changes
python scripts/main.py diff https://competitor.com/pricing --baseline baseline.html

# Output:
# Changes Detected!
# ─────────────────────
# - Starter: $29/mo → $39/mo (+34%)
# - Pro: $99/mo (unchanged)
# + New: Enterprise tier added
```

### 示例 2：监控多个竞争对手
```bash
# Create competitor list
cat > competitors.txt << EOF
https://competitor1.com/pricing
https://competitor2.com/pricing
https://competitor3.com/features
EOF

# Run batch monitor
python scripts/main.py batch competitors.txt --output ./snapshots/

# Output: Creates timestamped snapshots for each URL
```

## 技能边界

### 此技能擅长的方面
- 构建战略分析
- 识别市场机会
- 创建战略框架
- 汇总竞争数据

### 此技能无法做到的方面
- 取代市场调研
- 保证战略成功
- 获知竞争对手的专有信息
- 代替高管做出决策

## 相关技能

- [网页抓取工具](../web-scraper/) - 提取详细数据
- [Lighthouse 审计](../../seo-tools/lighthouse-audit/) - 审计竞争对手的性能

## 技能元数据


- **模式**：centaur
```yaml
category: automation
subcategory: competitive-intelligence
dependencies: [beautifulsoup4, requests]
difficulty: intermediate
time_saved: 4+ hours/week
```