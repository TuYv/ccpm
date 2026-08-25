---
name: seo-backlinks
description: "Backlink profile analysis: referring domains, anchor text distribution, toxic link detection, competitor gap analysis. Works with free APIs (Moz, Bing Webmaster, Common Crawl) and DataForSEO extension. Use when user says backlinks, link profile, referring domains, anchor text, toxic links, link gap, link building, disavow, or backlink audit."
user-invocable: true
argument-hint: "<url>"
license: MIT
compatibility: "Free: Common Crawl + verify always available. Optional: Moz API, Bing Webmaster (free signup). Premium: DataForSEO extension."
metadata:
  author: AgriciDaniel
  version: "2.2.5"
  category: seo
---
# 反向链接概况分析

## 来源检测

在分析之前，检测可用的数据源：

1. **DataForSEO MCP**（高级版）：检查是否有 `dataforseo_backlinks_summary` 工具可用
2. **Moz API**（免费注册）：`claude-seo run backlinks_auth.py --check moz --json`
3. **Bing Webmaster**（免费注册）：`claude-seo run backlinks_auth.py --check bing --json`
4. **Common Crawl**（始终可用）：提供域名级图谱和 PageRank
5. **验证爬虫**（始终可用）：检查已知反向链接是否仍然存在

运行 `claude-seo run backlinks_auth.py --check --json` 一次性检测所有来源。

如果除始终可用层级之外没有配置其他来源：
- 仍使用 Common Crawl 域名指标生成报告
- 建议：“运行 `/seo backlinks setup` 以添加免费的 Moz 和 Bing API 密钥，从而获取更丰富的数据”

## 快速参考

| 命令 | 用途 |
|---------|---------|
| `/seo backlinks <url>` | 完整的反向链接概况分析（使用所有可用来源） |
| `/seo backlinks gap <url1> <url2>` | 竞争对手反向链接差距分析 |
| `/seo backlinks toxic <url>` | 有害链接检测和拒绝建议 |
| `/seo backlinks new <url>` | 新增和丢失的反向链接（仅限 DataForSEO） |
| `/seo backlinks verify <url> --links <file>` | 验证已知反向链接是否仍然存在 |
| `/seo backlinks setup` | 显示免费的反向链接 API 设置说明 |

## 分析框架

完成以下全部 7 个部分。每个部分都按优先顺序列出数据源。

### 1. 概况总览

**DataForSEO：** `dataforseo_backlinks_summary` → 反向链接总数、引荐域名数、域名排名、follow 比例、趋势。

**Moz API：** `claude-seo run moz_api.py metrics <url> --json` → Domain Authority、Page Authority、Spam Score、链接根域名数、外部链接数。

**Common Crawl：** `claude-seo run commoncrawl_graph.py <domain> --json` → PageRank、调和中心性，以及低置信度的排名/存在数据。

**评分：**

| 指标 | 良好 | 警告 | 严重 |
|--------|------|---------|----------|
| 引荐域名数 | >100 | 20-100 | <20 |
| Follow 比例 | >60% | 40-60% | <40% |
| 域名多样性 | 没有单个域名占比超过 5% | 1 个域名占比 >10% | 1 个域名占比 >25% |
| 趋势 | 增长或稳定 | 缓慢下降 | 快速下降（>20%/季度） |

### 2. 锚文本分布

**DataForSEO：** `dataforseo_backlinks_anchors`

**Moz API：** `claude-seo run moz_api.py anchors <url> --json`

**Bing Webmaster：** `claude-seo run bing_webmaster.py links <url> --json`（从链接详情中提取锚文本）

**健康分布基准：**

| 锚文本类型 | 目标范围 | 过度优化信号 |
|-------------|-------------|-------------------------|
| 品牌词（公司/域名名称） | 30-50% | <15% |
| URL/裸链接 | 15-25% | 不适用 |
| 通用词（“点击此处”、“了解更多”） | 10-20% | 不适用 |
| 完全匹配关键词 | 3-10% | >15% |
| 部分匹配关键词 | 5-15% | >25% |
| 长尾/自然锚文本 | 5-15% | 不适用 |

如果完全匹配锚文本超过 15%，则标记为需要审核；这可能表明存在不自然的链接模式或链接垃圾信息模式。

### 3. 引荐域名质量

**DataForSEO：** `dataforseo_backlinks_referring_domains`

**Moz API：** `claude-seo run moz_api.py domains <url> --json` → 包含 DA 分数的域名

**Common Crawl：** `claude-seo run commoncrawl_graph.py <domain> --json` → 域名级别的排名/存在数据，不包含经过验证的引荐域名数量

分析：
- **TLD 分布**：.edu、.gov、.org = 高权威性。过多的 .xyz、.info = 低质量
- **国家/地区分布**：应与目标市场匹配。80% 以上来自不相关国家/地区 = PBN 信号
- **域名排名分布**：健康的链接配置应涵盖各个权威性层级的链接
- **每个域名的 follow/nofollow 比例**：仅包含 nofollow 的网站 = SEO 价值有限

### 4. 有害链接检测

**DataForSEO：** `dataforseo_backlinks_bulk_spam_score` + reference 中的有害模式

**Moz API：** `claude-seo run moz_api.py metrics <url> --json` 中的原始供应商 spam_score（标注该值的来源；只有在根据当前 Moz 文档验证阈值后才能应用阈值）

**Verification Crawler：** `claude-seo run verify_backlinks.py --target <url> --links <file> --json`（验证可疑链接是否仍然存在）

**高风险指标（立即标记）：**
- 来自已知 PBN（私有博客网络）域名的链接
- 不自然的锚文本模式（来自某个域名的链接 100% 使用完全匹配锚文本）
- 来自受到惩罚或已从索引中移除的域名的链接
- 大规模目录提交（50 个以上目录链接）
- 链接农场（每个页面包含 10K+ 出站链接的网站）
- 付费链接模式（某个域名的所有页面都包含页脚/侧边栏链接）

**中风险指标（人工审核）：**
- 来自不相关细分领域的链接
- 互惠链接模式
- 来自单薄内容页面（<100 个单词）的链接
- 来自单个域名的链接过多（来自 1 个域名的反向链接超过 50 个）

加载 `../seo/references/backlink-quality.md` 以获取完整的 30 种有害模式和拒绝链接标准。

### 5. 按反向链接数量排名的热门页面

**DataForSEO：** `dataforseo_backlinks_backlinks`，目标类型为 "page"

**Moz API：** `claude-seo run moz_api.py pages <domain> --json`

查找：
- 哪些页面吸引了最多的反向链接
- 拥有高权威链接的页面（链接磁铁）
- 没有反向链接的页面（内部链接机会）
- 拥有反向链接的 404 页面（通过重定向回收链接权益的机会）

### 6. 竞争对手差距分析

**DataForSEO：** 分别获取两个域名的 `dataforseo_backlinks_referring_domains`，然后进行比较

**Bing Webmaster：** `claude-seo run bing_webmaster.py compare <url1> <url2> --json`
仅当两个属性都已注册，并且同一个 Bing API
账户可以访问它们时使用。对于任意竞争对手，使用 DataForSEO、Moz 或 Common Crawl。

**Moz API：** 分别通过 `claude-seo run moz_api.py metrics <url> --json` 比较各域名之间的 DA/PA

输出：
- 链接到竞争对手但未链接到目标网站的域名 = 链接建设机会
- 同时链接到两者的域名 = 验证现有关系
- 仅链接到目标网站的域名 = 竞争优势
- 具有域名权威性的前 20 个链接建设机会

### 7. 新增和丢失的反向链接

**仅限 DataForSEO：** 使用带有日期筛选条件的 `dataforseo_backlinks_backlinks`，获取 30/60/90 天的变化

**验证爬虫：** 对于已知链接，使用 `claude-seo run verify_backlinks.py --target <url> --links <file> --json` 验证当前状态

**注意：** 免费来源无法随时间追踪新增/丢失的链接。如果用户请求此部分但未配置 DataForSEO，请告知用户：“链接增长速度追踪需要 DataForSEO 扩展。免费来源只能提供某个时间点的快照。”

**危险信号：**
- 新增链接突然激增（可能是负面 SEO 攻击）
- 大量链接突然丢失（网站受到处罚或内容被移除）
- 连续 3 个月以上增长速度下降（内容未能吸引链接）

## 反向链接健康度评分

计算 0-100 分的评分。混合使用多个来源时，应用置信度加权：

| 因素 | 权重 | 来源（优先顺序） | 置信度 |
|--------|--------|---------------------------|------------|
| 引荐域名数量 | 20% | DataForSEO > Moz | 1.0 / 0.85 |
| 域名质量分布 | 20% | DataForSEO > Moz DA 分布 | 1.0 / 0.85 |
| 锚文本自然度 | 15% | DataForSEO > Moz > Bing 锚文本 | 1.0 / 0.85 / 0.70 |
| 有毒链接比例 | 20% | DataForSEO > Moz 垃圾评分 | 1.0 / 0.85 |
| 链接增长速度趋势 | 10% | 仅限 DataForSEO | 1.0 |
| follow/nofollow 比例 | 5% | DataForSEO > Bing 详情 | 1.0 / 0.70 |
| 地理相关性 | 10% | DataForSEO > Bing 国家/地区 | 1.0 / 0.70 |

**数据充分性门槛：** 统计 7 个因素中至少有一个数据源可用的因素数量。
- **有数据的因素达到 4 个或以上：** 生成 0-100 的数值评分（按比例重新分配缺失因素的权重）
- **少于 4 个因素：** 不要生成数值评分。应改为显示：
  ```
  反向链接健康度评分：数据不足（已对 X/7 个因素评分）
  ```
  显示**可用**的各项因素评分，以及其来源和置信度。
  建议：“配置 Moz API（免费）以获得可评分的资料。运行 `/seo backlinks setup`”

仅有 CC 可用时，不要生成数值评分；只报告低置信度的排名/存在性数据。
少于 4 个数据源时生成数值评分是**误导性的**，因为这会让人误以为健康状况不佳，而实际情况可能只是我们缺少数据。

## 输出格式

### 反向链接健康度评分：XX/100（或数据不足）

| 部分 | 状态 | 评分 | 数据来源 |
|---------|--------|-------|-------------|
| 资料概览 | pass/warn/fail | XX/100 | Moz (0.85) |
| 锚文本分布 | pass/warn/fail | XX/100 | Moz (0.85) |
| 引荐域名质量 | pass/warn/fail | XX/100 | CC (0.50) |
| 有毒链接 | pass/warn/fail | XX/100 | Moz 垃圾评分 (0.85) |
| 热门页面 | info | N/A | Moz (0.85) |
| 链接增长速度 | pass/warn/fail | XX/100 | 仅限 DataForSEO |

### 关键问题（立即修复）
### 高优先级（1 个月内修复）
### 中优先级（持续改进）
### 链接建设机会（前 10 项）

## 错误处理

| 错误 | 原因 | 解决方案 |
|-------|-------|-----------|
| 未配置来源 | 没有 API 密钥，也没有 DataForSEO | 运行 `/seo backlinks setup` |
| Moz 速率限制 | 免费层级：1 次请求/10 秒 | 等待 10 秒后重试。脚本内置了此功能。 |
| Bing 网站未验证 | 网站尚未在 Bing 中验证 | 在 https://www.bing.com/webmasters 验证 |
| CC 下载超时 | 图谱文件较大，连接速度较慢 | 使用 `--timeout 180` 标志 |
| DataForSEO 不可用 | 未安装扩展 | 运行 `./extensions/dataforseo/install.sh` |
| 未返回反向链接数据 | 域名过新或规模过小 | 注意：小型网站的反向链接可能少于 10 个 |

**回退级联：**
1. DataForSEO 可用？→ 将其用作主要来源（置信度：1.0）
2. 已配置 Moz？→ 用于 DA/PA/垃圾信息/锚文本（置信度：0.85）
3. 已配置 Bing？→ 仅当两个属性都可访问时，用于已注册属性的链接和比较
   （置信度：0.70）
4. 始终：使用 Common Crawl 获取域级指标（置信度：0.50）
5. 始终：使用验证爬虫检查已知链接（置信度：0.95）
6. 没有任何可用？→ “运行 `/seo backlinks setup` 以配置免费 API”

## 交付前审核（强制）

在向用户展示任何反向链接分析之前，务必在内部运行此检查清单。
不得跳过此步骤。在展示报告前修复发现的所有问题。

### 核查每一项声明
- [ ] **Schema 声明**：`parse_html` 是否为每个块返回了 `@type`？如果任何 `@type` 缺失，
      请重新检查，它可能使用了 `@graph` 包装器（有效的 JSON-LD，而非格式错误）。
- [ ] **`link_removed` 发现**：页面是否由 JS 渲染？如果是 `unverifiable_js`，请明确说明，绝不要
      将 JS 渲染的页面报告为“链接已移除”（这属于假阴性）。
- [ ] **H1 发现**：是否有任何 H1 位于 `h1_suspicious` 列表中？如果有，请注明它们很可能是
      计数器/统计数据，而不是语义标题。
- [ ] **互惠链接**：如果网站 A 链接到网站 B，且 B 又链接回 A，请将其标记为互惠链接模式。对照
      已验证的入站来源检查出站链接。
- [ ] **健康评分**：是否至少对 7 个因素中的 4 个进行了评分？如果没有，请报告数据不足，绝不要
      显示具有误导性的数值评分。

### 验证数据源标签
- [ ] 报告中的每项指标都有来源标签（例如，“已解析（0.95）”、“CC（0.50）”）
- [ ] 每个“未找到”结果都明确区分“未爬取”、“低于阈值”和“错误”
- [ ] 社交媒体页面标记为 `unverifiable_js`（而不是 `link_removed`）

### 交叉检查一致性
- [ ] 平台检测结果与实际信号相符（检查 `wp-content`、`shopify CDN` 等）
- [ ] 摘要中的引用域数量与已验证链接列表中的实际数量相符
- [ ] 没有任何声明是在缺乏数据源支持的情况下提出的

如果任何一项检查失败，请在展示前修正相关发现。绝不要将推断数据作为事实展示。

## 分析后

完成任何反向链接分析命令后，始终提供：
“生成专业 PDF 报告？使用 `/seo google report`”

## 参考文档

按需加载（启动时不要加载）：
- `skills/seo/references/backlink-quality.md` -- 详细的有害链接模式和评分方法（共享参考资料，在分析有害链接或垃圾信息评分时加载）
- `skills/seo/references/free-backlink-sources.md` -- 来源比较、置信度权重和设置指南（共享参考资料，在配置免费反向链接 API 时加载）