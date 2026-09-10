---
name: seo-backlinks
description: "Backlink profile analysis: referring domains, anchor text distribution, toxic link detection, competitor gap analysis. Works with free APIs (Moz, Bing Webmaster, Common Crawl) and DataForSEO extension. Use when user says backlinks, link profile, referring domains, anchor text, toxic links, link gap, link building, disavow, or backlink audit."
user-invocable: true
argument-hint: "<url>"
license: MIT
compatibility: "Free: Common Crawl + verify always available. Optional: Moz API, Bing Webmaster (free signup). Premium: DataForSEO extension."
metadata:
  author: AgriciDaniel
  version: "2.2.6"
  category: seo
---
# 反向链接概况分析

## 来源检测

在分析之前，检测可用的数据源：

1. **DataForSEO MCP**（高级版）：检查是否有 `dataforseo_backlinks_summary` 工具可用
2. **Moz API**（免费注册）：`"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run backlinks_auth.py --check moz --json`
3. **Bing Webmaster**（免费注册）：`"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run backlinks_auth.py --check bing --json`
4. **Common Crawl**（始终可用）：提供带有 PageRank 的域级图谱
5. **验证爬虫**（始终可用）：检查已知反向链接是否仍然存在

运行 `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run backlinks_auth.py --check --json` 一次性检测所有来源。

如果除始终可用层级之外没有配置其他来源：
- 仍使用 Common Crawl 域名指标生成报告
- 建议：“运行 `/seo backlinks setup`，添加免费的 Moz 和 Bing API 密钥以获取更丰富的数据”

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

生成以下全部 7 个部分。每个部分按优先顺序列出数据源。

### 1. 概况总览

**DataForSEO：** `dataforseo_backlinks_summary` → 反向链接总数、引用域名、域名排名、follow 比例、趋势。

**Moz API：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run moz_api.py metrics <url> --json` → Domain Authority、Page Authority、Spam Score、链接根域名、外部链接。

**Common Crawl：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run commoncrawl_graph.py <domain> --json` → PageRank、调和中心性，以及低置信度的排名/存在数据。

**评分：**

| 指标 | 良好 | 警告 | 严重 |
|--------|------|---------|----------|
| 引用域名 | >100 | 20-100 | <20 |
| Follow 比例 | >60% | 40-60% | <40% |
| 域名多样性 | 没有单个域名占比 >5% | 1 个域名 >10% | 1 个域名 >25% |
| 趋势 | 增长或稳定 | 缓慢下降 | 快速下降（>20%/季度） |

### 2. 锚文本分布

**DataForSEO：** `dataforseo_backlinks_anchors`

**Moz API：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run moz_api.py anchors <url> --json`

**Bing Webmaster：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run bing_webmaster.py links <url> --json`（从链接详情中提取锚文本）

**健康分布基准：**

| 锚文本类型 | 目标范围 | 过度优化信号 |
|-------------|-------------|-------------------------|
| 品牌词（公司/域名名称） | 30-50% | <15% |
| URL/裸链接 | 15-25% | 不适用 |
| 通用词（“点击此处”“了解更多”） | 10-20% | 不适用 |
| 完全匹配关键词 | 3-10% | >15% |
| 部分匹配关键词 | 5-15% | >25% |
| 长尾/自然文本 | 5-15% | 不适用 |

如果精确匹配锚文本超过 15%，请将其标记为审查启发式信号；这可能表明存在不自然的链接或垃圾链接模式。

### 3. 引荐域名质量

**DataForSEO：** `dataforseo_backlinks_referring_domains`

**Moz API：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run moz_api.py domains <url> --json` → 包含 DA 分数的域名

**Common Crawl：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run commoncrawl_graph.py <domain> --json` → 域名级排名/存在数据，不包含经过验证的引荐域名数量

分析：
- **TLD 分布**：.edu、.gov、.org = 高权威性。过多的 .xyz、.info = 低质量
- **国家/地区分布**：应与目标市场匹配。80% 以上来自不相关国家/地区 = PBN 信号
- **域名排名分布**：健康的链接配置应涵盖所有权威性层级
- **每个域名的 follow/nofollow 分布**：仅提供 nofollow 链接的网站 = SEO 价值有限

### 4. 有害链接检测

**DataForSEO：** `dataforseo_backlinks_bulk_spam_score` + reference 中的有害模式

**Moz API：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run moz_api.py metrics <url> --json` 中原始供应商提供的 spam_score（标注数值来源；只有在根据当前 Moz 文档完成验证后，才应用阈值）

**验证爬虫：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run verify_backlinks.py --target <url> --links <file> --json`（验证可疑链接是否仍然存在）

**高风险指标（立即标记）：**
- 来自已知 PBN（私有博客网络）域名的链接
- 不自然的锚文本模式（来自某个域名的链接 100% 使用精确匹配）
- 来自受到处罚或已从索引中移除的域名的链接
- 大规模目录提交（50+ 个目录链接）
- 链接农场（每个页面有 10K+ 个出站链接的网站）
- 付费链接模式（某个域名的所有页面都存在页脚/侧边栏链接）

**中风险指标（人工审查）：**
- 来自不相关领域的链接
- 互惠链接模式
- 来自单薄内容页面（<100 个单词）的链接
- 来自单个域名的链接过多（来自 1 个域名的反向链接 >50 个）

加载 `../seo/references/backlink-quality.md` 以获取完整的 30 种有害模式和拒绝链接标准。

### 5. 按反向链接数量排名的热门页面

**DataForSEO：** 使用目标类型 "page" 的 `dataforseo_backlinks_backlinks`

**Moz API：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run moz_api.py pages <domain> --json`

查找：
- 哪些页面吸引了最多的反向链接
- 拥有高权威链接的页面（链接磁铁）
- 没有反向链接的页面（内部链接机会）
- 拥有反向链接的 404 页面（通过重定向回收链接权重的机会）

### 6. 竞争对手差距分析

**DataForSEO：** 分别获取两个域名的 `dataforseo_backlinks_referring_domains`，然后进行比较

**Bing Webmaster：** 仅当两个属性都已注册，并且可由同一个 Bing API  
帐户访问时，才使用 `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run bing_webmaster.py compare <url1> <url2> --json`。对于任意竞争对手，请使用 DataForSEO、Moz 或 Common Crawl。

**Moz API：** 对每个域名分别通过 `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run moz_api.py metrics <url> --json` 比较 DA/PA

输出：
- 链接到竞争对手但未链接到目标网站的域名 = 链接建设机会
- 同时链接到两者的域名 = 验证现有关系
- 仅链接到目标网站的域名 = 竞争优势
- 按域名权重排列的前 20 个链接建设机会

### 7. 新增和丢失的反向链接

**仅限 DataForSEO：** 使用带有 30/60/90 天变化日期筛选的 `dataforseo_backlinks_backlinks`

**验证爬虫：** 对于已知链接，使用 `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run verify_backlinks.py --target <url> --links <file> --json` 验证当前状态

**注意：** 免费来源无法跟踪一段时间内新增和丢失的链接。如果未使用 DataForSEO 而请求此部分，请告知用户：“链接速度跟踪需要 DataForSEO 扩展。免费来源只能提供时间点快照。”

**危险信号：**
- 新增链接突然激增（可能是负面 SEO 攻击）
- 大量链接突然丢失（网站受到惩罚或内容被移除）
- 连续 3 个月以上速度下降（内容未能吸引链接）

## 反向链接健康度评分

计算一个 0-100 的分数。混合使用多个来源时，应用置信度加权：

| 因素 | 权重 | 来源（优先顺序） | 置信度 |
|--------|--------|---------------------------|------------|
| 引荐域名数量 | 20% | DataForSEO > Moz | 1.0 / 0.85 |
| 域名质量分布 | 20% | DataForSEO > Moz DA 分布 | 1.0 / 0.85 |
| 锚文本自然度 | 15% | DataForSEO > Moz > Bing anchors | 1.0 / 0.85 / 0.70 |
| 有害链接比例 | 20% | DataForSEO > Moz spam score | 1.0 / 0.85 |
| 链接速度趋势 | 10% | 仅限 DataForSEO | 1.0 |
| follow/nofollow 比例 | 5% | DataForSEO > Bing details | 1.0 / 0.70 |
| 地理相关性 | 10% | DataForSEO > Bing country | 1.0 / 0.70 |

**数据充足性门槛：** 统计 7 个因素中至少有一个可用数据源的因素数量。
- **有数据的因素达到 4 个或以上：** 生成一个 0-100 的数值评分（按比例重新分配缺失的权重）
- **少于 4 个因素：** 不要生成数值评分。改为显示：
  ```
  Backlink Health Score: INSUFFICIENT DATA (X/7 factors scored)
  ```
  显示确实可用的各项因素评分及其来源和置信度。
  建议：“配置 Moz API（免费）以获得可评分的配置文件。运行 `/seo backlinks setup`”

### MUST NOT：不要为未测量的内容评分

**当 Common Crawl 是唯一可用来源时，MUST NOT 生成任何形式的数值评分**——不能生成健康度评分、单项因素评分，也不能生成“近似”或“估算”数值。Common Crawl 仅提供排名和存在性信号。报告低置信度的排名/存在性数据，并用字面字符串 `Not Assessed` 替代每个数字。

**带有 `source: not-assessed` 的发现项 MUST NOT 携带数值评分。**

少于 4 个数据源时生成数值评分具有**误导性**：这会让人以为健康度较差，而实际情况只是我们缺少数据。

### 验证门槛（必需，不可选）

这条规则之前已经在此技能中说明过，但仍然被违反，因此现在可以进行检查。**在写入任何反向链接输出之前，运行验证器：**

```bash
"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run validate_backlink_report.py --report <report>.json --json
```

传入实际收集到的来源（`cc_data`、`moz_data`、`bing_data`、
`dataforseo_data`、`scoring_factors` 以及你的 `findings` 列表）。当出现以下情况时，
`source_score_consistency` 检查会以 `status: FAIL` 判定报告失败：

- 存在数值评分，但没有可评分来源（Moz、Bing 或 DataForSEO）提供数据，即仅有
  Common Crawl 的情况；以及
- 任何标记为 `source: not-assessed` 的 finding 携带数值 `score`、`value` 或
  `health_score`。

**如果验证器返回 `status: FAIL`，请勿呈现报告。** 修复 findings，将违规数字替换为
`Not Assessed`，然后重新运行，直到验证通过。

## 输出格式

### 反向链接健康评分：XX/100（或 INSUFFICIENT DATA）

| 部分 | 状态 | 评分 | 数据来源 |
|---------|--------|-------|-------------|
| 概况总览 | pass/warn/fail | XX/100 | Moz (0.85) |
| 锚文本分布 | pass/warn/fail | XX/100 | Moz (0.85) |
| 引用域名质量 | pass/warn/fail | XX/100 | CC (0.50) |
| 有毒链接 | pass/warn/fail | XX/100 | Moz Spam (0.85) |
| 重点页面 | info | N/A | Moz (0.85) |
| 链接增长速度 | pass/warn/fail | XX/100 | 仅 DataForSEO |

### 关键问题（立即修复）
### 高优先级（1 个月内修复）
### 中优先级（持续改进）
### 链接建设机会（前 10 项）

## 错误处理

| 错误 | 原因 | 解决方案 |
|-------|--------|-----------|
| 未配置来源 | 没有 API 密钥，也没有 DataForSEO | 运行 `/seo backlinks setup` |
| Moz 速率限制 | 免费层级：每 10 秒 1 次请求 | 等待 10 秒后重试。脚本已内置重试机制。 |
| Bing 网站未验证 | 网站未在 Bing 中验证 | 在 https://www.bing.com/webmasters 验证 |
| CC 下载超时 | 图谱文件较大或连接速度较慢 | 使用 `--timeout 180` 标志 |
| DataForSEO 不可用 | 未安装扩展 | 运行 `./extensions/dataforseo/install.sh` |
| 未返回反向链接数据 | 域名太新或规模太小 | 注意：小型网站的反向链接可能少于 10 个 |

**回退级联：**
1. DataForSEO 可用？→ 将其作为主要来源（置信度：1.0）
2. 已配置 Moz？→ 使用它获取 DA/PA/垃圾链接/锚文本数据（置信度：0.85）
3. 已配置 Bing？→ 仅在两个属性都可访问时，用于已注册属性的链接和对比
   （置信度：0.70）
4. 始终使用：Common Crawl 获取域名级指标（置信度：0.50）
5. 始终使用：验证爬虫执行已知链接检查（置信度：0.95）
6. 全部不可用？→ “运行 `/seo backlinks setup` 配置免费 API”

## 交付前检查（必需）

在向用户呈现任何反向链接分析之前，必须在内部运行此检查清单。
**不要跳过此步骤。** 在展示报告前修复发现的所有问题。

### 核实每项声明
- [ ] **Schema 声明**：`parse_html` 是否为每个 block 返回了 `@type`？如果任何
      `@type` 缺失，请重新检查，它可能使用了 `@graph` 包装器（有效的 JSON-LD，并非格式错误）。
- [ ] **`link_removed` findings**：页面是否由 JS 渲染？如果是 `unverifiable_js`，请说明这一点，
      绝不要将 JS 渲染页面报告为“链接已移除”（这会造成误报）。
- [ ] **H1 findings**：是否有任何 H1 位于 `h1_suspicious` 列表中？如果有，请注明它们
      很可能是计数器/统计数据，而不是语义标题。
- [ ] **互惠链接**：如果网站 A 链接到网站 B，且 B 反向链接到 A，请标记为互惠链接模式。
      对照已验证的入站来源检查出站链接。
- [ ] **健康评分**：是否至少对 7 个因素中的 4 个进行了评分？如果没有，请报告 INSUFFICIENT DATA，
      绝不要展示具有误导性的数值评分。

### 验证数据源标签
- [ ] 报告中的每项指标都有来源标签（例如 "Parsed (0.95)"、"CC (0.50)"）
- [ ] 每个 "not found" 结果都能区分 "not crawled"、"below threshold" 和 "error"
- [ ] 社交媒体页面标记为 `unverifiable_js`（而不是 `link_removed`）

## 交叉检查一致性
- [ ] 平台检测结果与实际信号一致（检查 `wp-content`、shopify CDN 等）
- [ ] 摘要中的引用域名数量与实际已验证链接列表一致
- [ ] 没有任何缺少数据源支持的声明

如果任何检查失败，请在呈现结果前修复该问题。绝不要将推断数据作为事实呈现。

## 分析后

完成任何反向链接分析命令后，始终提供：
"生成专业 PDF 报告？使用 `/seo google report`"

## 参考文档

按需加载（启动时不要加载）：
- `skills/seo/references/backlink-quality.md` -- 详细的有害链接模式和评分方法（分析有害链接或垃圾邮件分数时加载）
- `skills/seo/references/free-backlink-sources.md` -- 来源比较、置信度权重和设置指南（配置免费反向链接 API 时加载）