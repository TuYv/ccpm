---
name: seo-audit
description: "Full website SEO audit with parallel subagent delegation. Crawls up to 500 pages, detects business type, delegates to up to 15 specialists (8 always + 7 conditional), generates health score. Use when user says audit, full SEO check, analyze my site, or website health check."
user-invocable: true
argument-hint: "[url]"
license: MIT
metadata:
  author: AgriciDaniel
  version: "2.2.5"
  category: seo
---
# 完整网站 SEO 审计

## 流程

1. **渲染首页**：使用 `claude-seo run render_page.py <url> --mode auto --json` 捕获原始 HTML、渲染后的 HTML、提取的文本、SPA 状态，以及需要时的无障碍数据
2. **检测业务类型**：根据 SEO 编排器分析首页信号
3. **抓取网站**：遵循内部链接，最多抓取 500 个页面，并遵守 robots.txt
4. **委派给子代理**（如果可用；否则按顺序以内联方式运行）：
   - `seo-technical` -- robots.txt、站点地图、规范链接、核心网页指标、安全响应头
   - `seo-content` -- E-E-A-T、可读性、单薄内容、AI 引用就绪度
   - `seo-schema` -- 检测、验证、生成建议
   - `seo-sitemap` -- 结构分析、质量门禁、缺失页面
   - `seo-performance` -- LCP、INP、CLS 测量
   - `seo-visual` -- 截图、移动端测试、首屏分析
   - `seo-geo` -- AI 爬虫访问、llms.txt、可引用性、品牌提及信号
   - `seo-local` -- GBP 信号、NAP 一致性、评论、本地 Schema、特定行业的本地因素（检测到本地服务行业时启动：实体店、SAB 或混合型业务）
   - `seo-maps` -- 地理网格排名跟踪、GBP 审计、评论情报、竞争对手半径映射（检测到本地服务且 DataForSEO MCP 可用时启动）
   - `seo-google` -- CWV 字段数据（CrUX）、URL 收录情况（GSC）、自然流量（GA4）（通过 `claude-seo run google_auth.py --check` 检测到 Google API 凭据时启动）
   - `seo-backlinks` -- 反向链接资料数据：DA/PA、引用域、锚文本、有害链接（通过 `claude-seo run backlinks_auth.py --check` 检测到 Moz 或 Bing API 凭据时启动，或始终包含 Common Crawl 的域级指标）
   - `seo-cluster` -- 语义聚类分析（检测到内容策略信号时启动：博客、支柱页面、主题集群）
   - `seo-sxo` -- 搜索体验分析：页面类型不匹配、用户故事、用户画像评分（完整审计中始终包含）
   - `seo-drift` -- 漂移分析：与存储的基线进行比较（通过 `claude-seo run drift_history.py <url>` 发现该 URL 存在漂移基线时启动）
   - `seo-ecommerce` -- 产品 Schema、市场情报（检测到电子商务行业时启动）
5. **评分** -- 汇总为 SEO 健康度评分（0-100）
6. **持久化审计产物** -- 将所有输出写入 `{domain}-audit/`
7. **报告** -- 生成按优先级排序的行动计划，以及可选的 PDF/HTML 报告

## 抓取配置

```
最大页面数：500
遵守 robots.txt：是
遵循重定向：是（最多 3 次跳转）
每页超时时间：30 秒
并发请求数：5
请求之间的延迟：1 秒
```

## 输出文件

- `{domain}-audit/FULL-AUDIT-REPORT.md`：综合调查结果
- `{domain}-audit/ACTION-PLAN.md`：按优先级排列的建议（严重 > 高 > 中 > 低）
- `{domain}-audit/audit-data.json`：用于生成报告的结构化审计封装
- `{domain}-audit/findings/*.md`：按类别划分的专业调查结果（`technical.md`、`content.md`、`schema.md`、`performance.md`、`visual.md` 等）
- `{domain}-audit/screenshots/`：桌面端 + 移动端截图（如果 Playwright 可用）
- **PDF 报告**（推荐）：使用 `claude-seo run google_report.py --type full --data {domain}-audit/audit-data.json --domain <domain> --output-dir {domain}-audit/` 生成专业的 A4 PDF。该报告包含白色封面的企业级报告、目录、执行摘要、图表（Lighthouse 仪表盘、查询词柱状图、收录情况环形图）、指标卡片、阈值表格、包含工作量估算的优先级建议，以及实施路线图。完成审计后始终提供 PDF 生成选项。

## 结构化审计数据封装

写入 `{domain}-audit/audit-data.json`，使用以下结构，这样即使 Google API 数据不可用，`claude-seo run google_report.py --type full --data {domain}-audit/audit-data.json --domain <domain> --output-dir {domain}-audit/` 仍可生成报告：

```json
{
  "summary": {
    "health_score": 0,
    "business_type": "detected type",
    "top_findings": [],
    "quick_wins": []
  },
  "categories": [
    {
      "name": "Technical SEO",
      "score": 0,
      "what_works": [],
      "findings": [
        {
          "title": "Finding title",
          "severity": "Critical|High|Medium|Low|Info",
          "description": "Evidence-backed detail",
          "recommendation": "Specific fix"
        }
      ]
    }
  ],
  "action_plan": {
    "phases": [
      {"name": "Phase 1: Critical Fixes", "timeframe": "Week 1", "items": []},
      {"name": "Phase 2: High-Impact Improvements", "timeframe": "Weeks 2-3", "items": []},
      {"name": "Phase 3: Content & Authority", "timeframe": "Month 2", "items": []},
      {"name": "Phase 4: Monitoring & Iteration", "timeframe": "Ongoing", "items": []}
    ]
  },
  "artifacts": {
    "findings_dir": "findings/",
    "screenshots_dir": "screenshots/"
  }
}
```

## 评分权重

| 类别 | 权重 |
|----------|--------|
| 技术 SEO | 22% |
| 内容质量 | 23% |
| 页面 SEO | 20% |
| Schema / 结构化数据 | 10% |
| 性能（CWV） | 10% |
| AI 搜索准备度 | 10% |
| 图片 | 5% |

## 报告结构

### 执行摘要
- 整体 SEO 健康评分（0-100）
- 检测到的业务类型
- 5 个最重要的关键问题
- 5 个最值得快速修复的问题

### 技术 SEO
- 抓取问题
- 索引问题
- 安全隐患
- Core Web Vitals 状态

### 内容质量
- E-E-A-T 评估
- 内容单薄的页面
- 重复内容问题
- 可读性评分

### 页面 SEO
- Title 标签问题
- Meta description 问题
- 标题结构
- 内部链接缺口

### Schema 与结构化数据
- 当前实现情况
- 验证错误
- 缺失机会

### 性能
- LCP、INP、CLS 分数
- 资源优化需求
- 第三方脚本影响

### 图片
- 缺失的 alt 文本
- 图片尺寸过大
- 格式建议

### AI 搜索准备度
- 可引用性评分
- 结构改进
- 权威性信号

## 优先级定义

- **Critical**：阻碍索引或导致处罚（立即修复）
- **High**：显著影响排名（在 1 周内修复）
- **Medium**：优化机会（在 1 个月内修复）
- **Low**：有则更好（加入待办列表）

## DataForSEO 集成（可选）

如果 DataForSEO MCP 工具可用，请在现有子代理之外同时启动 `seo-dataforseo` 代理，以使用实时数据丰富审计结果：真实 SERP 排名、包含垃圾信息评分的反向链接概况、页面分析（Lighthouse）、商家信息，以及 AI 可见性检查（ChatGPT 抓取器、LLM 提及）。

## Google API 集成（可选）

如果已配置 Google API 凭据（`claude-seo run google_auth.py --check`），请启动 `seo-google` 代理，以使用真实的 Google 现场数据丰富审计结果：CrUX Core Web Vitals（替代仅基于实验室数据的估算）、GSC URL 索引状态、搜索表现（点击次数、展示次数、CTR），以及 GA4 自然流量趋势。性能（CWV）类别的评分从现场数据中获益最大。

## 错误处理

| 场景 | 操作 |
|----------|--------|
| URL 无法访问（DNS failure、connection refused） | 清楚地报告错误。不要猜测网站内容。建议用户验证 URL 后重试。 |
| robots.txt 阻止抓取 | 报告哪些路径被阻止。仅分析可访问的页面，并在报告中说明该限制。 |
| 速率限制（429 responses） | 降低请求速率并减少并发请求。报告部分结果，并注明哪些部分无法完成。 |
| 大型网站超时（500+ pages） | 在超时限制内停止抓取。报告已抓取页面的结果，并估算网站的总体规模。 |