---
name: seo-backlinks
description: "Backlink profile analysis: referring domains, anchor text distribution, toxic link detection, competitor gap analysis. Works with free APIs (Moz, Bing Webmaster, Common Crawl) and DataForSEO extension. Use when user says backlinks, link profile, referring domains, anchor text, toxic links, link gap, link building, disavow, or backlink audit."
user-invocable: true
argument-hint: "<url>"
license: MIT
compatibility: "Free: Common Crawl + verify always available. Optional: Moz API, Bing Webmaster, Keywords Everywhere (free signup). Premium: DataForSEO extension."
metadata:
  author: AgriciDaniel
  version: "2.3.1"
  category: seo
---
# 反向链接概况分析

## 来源检测

分析前，检测可用的数据源：

1. **DataForSEO MCP**（高级版）：检查是否有 `dataforseo_backlinks_summary` 工具可用
2. **Moz API**（免费注册）：`"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run backlinks_auth.py --check moz --json`
3. **Bing Webmaster**（免费注册）：`"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run backlinks_auth.py --check bing --json`
4. **Keywords Everywhere**（免费注册，单指标）：`"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run backlinks_auth.py --check keywordseverywhere --json`
5. **Common Crawl**（始终可用）：提供带有 PageRank 的域名级图谱
6. **Verification Crawler**（始终可用）：检查已知反向链接是否仍然存在

运行 `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run backlinks_auth.py --check --json` 一次性检测所有来源。

如果除始终可用层级外没有配置其他来源：
- 仍然使用 Common Crawl 域名指标生成报告
- 建议：“运行 `/seo backlinks setup` 添加免费的 Moz 和 Bing API 密钥，以获取更丰富的数据”

## 快速参考

| 命令 | 用途 |
|---------|---------|
| `/seo backlinks <url>` | 完整的反向链接概况分析（使用所有可用来源） |
| `/seo backlinks gap <url1> <url2>` | 竞争对手反向链接差距分析 |
| `/seo backlinks toxic <url>` | 有害链接检测和拒绝建议 |
| `/seo backlinks new <url>` | 新增和丢失的反向链接（仅限 DataForSEO） |
| `/seo backlinks verify <url> --links <file>` | 验证已知反向链接是否仍然存在 |
| `/seo backlinks setup` | 显示免费反向链接 API 的设置说明 |

## 分析框架

生成以下全部 7 个部分。每个部分按优先级顺序列出数据源。

### 1. 概况概览

**DataForSEO：** `dataforseo_backlinks_summary` → 反向链接总数、引荐域名数量、域名排名、follow 比例、趋势。

**Moz API：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run moz_api.py metrics <url> --json` → Domain Authority、Page Authority、Spam Score、链接根域名数量、外部链接数量。

**Keywords Everywhere：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run keywordseverywhere_api.py rank <domain> --json` → 仅提供 0-10 的域名排名（不提供链接数量）。在未配置 Moz 时将其作为备用数据源；如果两者均已配置，不要用它替代 Moz。

**Common Crawl：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run commoncrawl_graph.py <domain> --json` → PageRank、调和中心性，以及低置信度的排名/存在性数据。

**评分：**

| 指标 | 良好 | 警告 | 严重 |
|--------|------|---------|----------|
| 引荐域名数量 | >100 | 20-100 | <20 |
| Follow 比例 | >60% | 40-60% | <40% |
| 域名多样性 | 没有单个域名占比超过 5% | 1 个域名占比 >10% | 1 个域名占比 >25% |
| 趋势 | 增长或稳定 | 缓慢下降 | 快速下降（>20%/季度） |

### 2. 锚文本分布

**DataForSEO：** `dataforseo_backlinks_anchors`

**Moz API：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run moz_api.py anchors <url> --json`

**Bing Webmaster：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run bing_webmaster.py links <url> --json`（从链接详情中提取锚文本）

**健康分布基准：**

| 锚文本类型 | 目标范围 | 过度优化信号 |
|-------------|-------------|-------------------------|
| 品牌词（公司名/域名） | 30-50% | <15% |
| URL/裸链接 | 15-25% | N/A |
| 通用词（“点击这里”“了解更多”） | 10-20% | N/A |
| 完全匹配关键词 | 3-10% | >15% |
| 部分匹配关键词 | 5-15% | >25% |
| 长尾/自然锚文本 | 5-15% | N/A |

如果完全匹配锚文本超过 15%，请将其标记为审核启发式指标；这可能表明存在不自然的链接模式或链接垃圾行为。

### 3. 引用域名质量

**DataForSEO：** `dataforseo_backlinks_referring_domains`

**Moz API：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run moz_api.py domains <url> --json` → 包含 DA 分数的域名

**Common Crawl：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run commoncrawl_graph.py <domain> --json` → 域名级别的排名/存在数据，不包含经验证的引用域名数量

分析：
- **顶级域名分布**：.edu、.gov、.org 具有较高权威性。.xyz、.info 过多则表示质量较低
- **国家/地区分布**：应与目标市场匹配。80% 以上来自不相关国家/地区可能是 PBN 信号
- **域名排名分布**：健康的链接配置应包含来自各个权威等级的链接
- **每个域名的 follow/nofollow 分布**：仅使用 nofollow 的网站 SEO 价值有限

### 4. 有害链接检测

**DataForSEO：** `dataforseo_backlinks_bulk_spam_score` + 参考资料中的有害模式

**Moz API：** 来自 `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run moz_api.py metrics <url> --json` 的原始供应商 spam_score（标注数据来源；仅在根据当前 Moz 文档完成验证后应用阈值）

**验证爬虫：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run verify_backlinks.py --target <url> --links <file> --json`（验证可疑链接是否仍然存在）

**高风险指标（立即标记）：**
- 来自已知 PBN（私有博客网络）域名的链接
- 不自然的锚文本模式（某个域名的锚文本 100% 为完全匹配）
- 来自受到处罚或已从索引中移除的域名的链接
- 大规模目录提交（50 个以上目录链接）
- 链接农场（每页包含 10K 以上出站链接的网站）
- 付费链接模式（某个域名的所有页面都包含页脚/侧边栏链接）

**中风险指标（人工审核）：**
- 来自不相关行业的链接
- 互惠链接模式
- 来自内容单薄页面（少于 100 个单词）的链接
- 来自单个域名的链接过多（同一域名有超过 50 个反向链接）

加载 `../seo/references/backlink-quality.md`，获取完整的 30 种有害模式和拒绝链接标准。

### 5. 按反向链接数量排名的热门页面

**DataForSEO：** `dataforseo_backlinks_backlinks`，目标类型为 "page"

**Moz API：** `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run moz_api.py pages <domain> --json`

查找：
- 哪些页面吸引了最多的反向链接
- 包含高权威链接的页面（链接磁铁）
- 没有反向链接的页面（内部链接机会）
- 包含反向链接的 404 页面（可通过重定向回收链接权益）

### 6. 竞争对手差距分析

**DataForSEO：** 对两个域名使用 `dataforseo_backlinks_referring_domains`，然后进行比较

**Bing Webmaster：** 仅当两个属性都已注册，且可由同一个 Bing API 账户访问时，使用 `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run bing_webmaster.py compare <url1> <url2> --json`
对于任意竞争对手，使用 DataForSEO、Moz 或 Common Crawl。

**Moz API：** 对每个域名使用 `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run moz_api.py metrics <url> --json`，比较域名的 DA/PA

输出：
- 链接到竞争对手但未链接到目标网站的域名 = 外链建设机会
- 同时链接到双方的域名 = 验证现有关系
- 仅链接到目标网站的域名 = 竞争优势
- 按域名权威度列出排名前 20 的外链建设机会

### 7. 新增和丢失的外链

**仅限 DataForSEO：** 使用带日期筛选条件的 `dataforseo_backlinks_backlinks`，分析 30/60/90 天的变化

**验证爬虫：** 对已知链接，使用 `"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run verify_backlinks.py --target <url> --links <file> --json` 验证当前状态

**注意：** 免费数据源无法跟踪一段时间内新增和丢失的链接。如果在没有 DataForSEO 的情况下请求此部分，请告知用户：“链接增长速度跟踪需要 DataForSEO 扩展。免费数据源只能提供时间点快照。”

**危险信号：**
- 新增链接突然激增（可能是负面 SEO 攻击）
- 大量链接突然丢失（网站受到处罚或内容被移除）
- 连续 3 个月以上增长速度下降（内容未能吸引链接）

## 外链健康评分

计算 0-100 分的评分。混合使用多个数据源时，应用置信度权重：

| 因素 | 权重 | 数据源（优先顺序） | 置信度 |
|--------|--------|---------------------------|------------|
| 引荐域名数量 | 20% | DataForSEO > Moz | 1.0 / 0.85 |
| 域名质量分布 | 20% | DataForSEO > Moz DA 分布 | 1.0 / 0.85 |
| 锚文本自然度 | 15% | DataForSEO > Moz > Bing 锚文本 | 1.0 / 0.85 / 0.70 |
| 有毒链接比例 | 20% | DataForSEO > Moz 垃圾评分 | 1.0 / 0.85 |
| 链接增长速度趋势 | 10% | 仅限 DataForSEO | 1.0 |
| Follow/nofollow 比例 | 5% | DataForSEO > Bing 详细信息 | 1.0 / 0.70 |
| 地理相关性 | 10% | DataForSEO > Bing 国家/地区 | 1.0 / 0.70 |

**数据充足性门槛：** 统计 7 个因素中至少有一个可用数据源的因素数量。
- **有 4 个或更多因素具备数据：** 生成 0-100 的数值评分（按比例重新分配缺失因素的权重）
- **少于 4 个因素：** 不要生成数值评分。改为显示：
  ```
  Backlink Health Score: INSUFFICIENT DATA (X/7 factors scored)
  ```
  显示已有数据的单项因素评分，并注明其数据源和置信度。
  建议：“配置 Moz API（免费）以获得可评分的档案。运行 `/seo backlinks setup`”

### 必须做到：不要为未测量的内容评分

**当 Common Crawl 是唯一可用的数据源时，绝对不能生成任何形式的数值评分**——既不能生成健康评分，也不能生成单项因素评分，更不能生成“近似”或“估算”数值。Common Crawl 仅提供排名和存在性信号。报告低置信度的排名/存在性数据，并在每个数字的位置使用字面字符串
`Not Assessed`。

**使用 `source: not-assessed` 编写的 finding MUST NOT 携带数值评分。**

少于 4 个数据源时使用数值评分具有**误导性**：这会暗示网站健康状况不佳，而实际情况只是我们缺少数据。

### 验证门禁（必需，不可选）

该规则此前已在此 skill 中说明，但仍然被违反，因此现在可以通过检查发现。**在写入任何 backlink 输出之前，运行验证器：**

```bash
"${CLAUDE_PLUGIN_ROOT}/scripts/claude-seo" run validate_backlink_report.py --report <report>.json --json
```

传入你实际收集的数据源（`cc_data`、`moz_data`、`bing_data`、`dataforseo_data`、`scoring_factors` 以及你的 `findings` 列表）。`source_score_consistency` 检查会在以下情况下以 `status: FAIL` 使报告失败：

- 存在数值评分，但没有任何可评分的数据源（Moz、Bing 或 DataForSEO）提供数据，即仅有 Common-Crawl 的情况；以及
- 任何标记为 `source: not-assessed` 的 finding 携带数值 `score`、`value` 或 `health_score`。

**如果验证器返回 `status: FAIL`，不要呈现报告。** 修复 findings，将违规数字替换为 `Not Assessed`，然后重新运行验证器，直到通过。

## 输出格式

### Backlink Health Score: XX/100（或 INSUFFICIENT DATA）

| Section | Status | Score | Data Source |
|---------|--------|-------|-------------|
| Profile Overview | pass/warn/fail | XX/100 | Moz (0.85) |
| Anchor Distribution | pass/warn/fail | XX/100 | Moz (0.85) |
| Referring Domain Quality | pass/warn/fail | XX/100 | CC (0.50) |
| Toxic Links | pass/warn/fail | XX/100 | Moz Spam (0.85) |
| Top Pages | info | N/A | Moz (0.85) |
| Link Velocity | pass/warn/fail | XX/100 | DataForSEO only |

### Critical Issues (立即修复)
### High Priority (在 1 个月内修复)
### Medium Priority (持续改进)
### Link Building Opportunities (前 10 项)

## 错误处理

| Error | Cause | Resolution |
|-------|--------|-----------|
| No sources configured | 未配置 API 密钥，也未配置 DataForSEO | 运行 `/seo backlinks setup` |
| Moz rate limit | 免费层级：每 10 秒 1 次请求 | 等待 10 秒后重试。脚本已内置此机制。 |
| Bing site not verified | 网站未在 Bing 中验证 | 在 https://www.bing.com/webmasters 验证 |
| CC download timeout | 图文件较大，连接速度较慢 | 使用 `--timeout 180` 标志 |
| DataForSEO unavailable | 未安装扩展 | 运行 `./extensions/dataforseo/install.sh` |
| No backlink data returned | 域名过新或规模过小 | 注意：小型网站的 backlink 数量可能少于 10 个 |

**回退级联：**
1. DataForSEO 可用？→ 将其用作主要数据源（置信度：1.0）
2. 已配置 Moz？→ 用于 DA/PA/垃圾链接/锚文本（置信度：0.85）
3. 已配置 Bing？→ 仅在两个属性都可访问时，用于已注册属性的链接和对比
   （置信度：0.70）
4. 未配置 Moz，但已配置 Keywords Everywhere？→ 用于仅包含排名的 Profile Overview
   回退方案（置信度：0.60；单一指标，不包含链接数量/锚文本）
5. 始终使用：Common Crawl 获取域名级指标（置信度：0.50）
6. 始终使用：Verification crawler 执行已知链接检查（置信度：0.95）
7. 所有方案均不可用？→“运行 `/seo backlinks setup` 以配置免费 API”

## 交付前审查（强制）

在向用户展示任何反向链接分析之前，必须在内部运行此检查清单。
不要跳过此步骤。发现任何问题时，先修复，再展示报告。

### 核查每一项声明
- [ ] **Schema 声明**：`parse_html` 是否为每个区块返回了 `@type`？如果任何 `@type` 缺失，请重新检查，它可能使用了 `@graph` 包装器（这是有效的 JSON-LD，并非格式错误）。
- [ ] **`link_removed` 发现**：页面是否由 JS 渲染？如果是 `unverifiable_js`，请明确说明，绝不要将 JS 渲染页面报告为“链接已移除”（这会造成误报）。
- [ ] **H1 发现**：是否有任何 H1 位于 `h1_suspicious` 列表中？如果有，请注明它们可能是计数器/统计数据，而非语义标题。
- [ ] **互惠链接**：如果站点 A 链接到站点 B，同时 B 也链接回 A，请将其标记为互惠链接模式。对照已验证的入站来源检查出站链接。
- [ ] **健康评分**：是否至少对 7 个因素中的 4 个进行了评分？如果没有，请报告“数据不足”，绝不要显示具有误导性的数字评分。

### 验证数据源标签
- [ ] 报告中的每项指标都有来源标签（例如“已解析（0.95）”、“CC（0.50）”）
- [ ] 每个“未找到”结果都能区分“未抓取”“低于阈值”和“错误”
- [ ] 社交媒体页面应标记为 `unverifiable_js`（而非 `link_removed`）

### 交叉检查一致性
- [ ] 平台检测结果与实际信号相符（检查 `wp-content`、Shopify CDN 等）
- [ ] 摘要中的引用域名数量与已验证链接列表中的实际数量一致
- [ ] 没有任何声明是在缺乏数据源支持的情况下提出的

如果任何检查失败，请在展示前修正该发现。绝不要将推断数据作为事实展示。

## 分析后

完成任何反向链接分析命令后，始终提供：
“生成专业 PDF 报告？使用 `/seo google report`”

## 参考文档

按需加载（启动时不要加载）：
- `skills/seo/references/backlink-quality.md` -- 详细的有害链接模式与评分方法（分析有害链接或垃圾评分时加载）
- `skills/seo/references/free-backlink-sources.md` -- 来源比较、置信度权重和配置指南（配置免费反向链接 API 时加载）