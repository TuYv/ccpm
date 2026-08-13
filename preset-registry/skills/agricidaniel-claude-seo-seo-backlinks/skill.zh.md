---
name: seo-backlinks
description: "Backlink profile analysis: referring domains, anchor text distribution, toxic link detection, competitor gap analysis. Works with free APIs (Moz, Bing Webmaster, Common Crawl) and DataForSEO extension. Use when user says backlinks, link profile, referring domains, anchor text, toxic links, link gap, link building, disavow, or backlink audit."
user-invocable: true
argument-hint: "<url>"
license: MIT
compatibility: "Free: Common Crawl + verify always available. Optional: Moz API, Bing Webmaster (free signup). Premium: DataForSEO extension."
metadata:
  author: AgriciDaniel
  version: "2.2.4"
  category: seo
---
# 反向链接资料分析

## 数据源检测

分析前，检测可用的数据源：

1. **DataForSEO MCP**（付费）：检查 `dataforseo_backlinks_summary` 工具是否可用
2. **Moz API**（免费注册）：`claude-seo run backlinks_auth.py --check moz --json`
3. **Bing Webmaster**（免费注册）：`claude-seo run backlinks_auth.py --check bing --json`
4. **Common Crawl**（始终可用）：提供带有 PageRank 的域名级图谱
5. **验证爬虫**（始终可用）：检查已知反向链接是否仍然存在

运行 `claude-seo run backlinks_auth.py --check --json` 可一次性检测所有数据源。

如果除了始终可用的层级之外未配置其他数据源：
- 仍然使用 Common Crawl 域名指标生成报告
- 建议：“运行 `/seo backlinks setup`，添加免费的 Moz 和 Bing API 密钥，以获取更丰富的数据”

## 快速参考

| 命令 | 用途 |
|---------|---------|
| `/seo backlinks <url>` | 完整的反向链接资料分析（使用所有可用数据源） |
| `/seo backlinks gap <url1> <url2>` | 竞争对手反向链接差距分析 |
| `/seo backlinks toxic <url>` | 有害链接检测和拒绝建议 |
| `/seo backlinks new <url>` | 新增和丢失的反向链接（仅限 DataForSEO） |
| `/seo backlinks verify <url> --links <file>` | 验证已知反向链接是否仍然存在 |
| `/seo backlinks setup` | 显示免费反向链接 API 的设置说明 |

## 分析框架

生成以下全部 7 个部分。每个部分均按优先顺序列出数据源。

### 1. 资料概览

**DataForSEO：** `dataforseo_backlinks_summary` → 反向链接总数、引荐域名数、域名排名、follow 链接比例、趋势。

**Moz API：** `claude-seo run moz_api.py metrics <url> --json` → 域名权威度、页面权威度、垃圾评分、链接根域名数、外部链接数。

**Common Crawl：** `claude-seo run commoncrawl_graph.py <domain> --json` → PageRank、调和中心性，以及低置信度的排名/存在性数据。

**评分：**

| 指标 | 良好 | 警告 | 严重 |
|--------|------|---------|----------|
| 引荐域名数 | >100 | 20-100 | <20 |
| Follow 链接比例 | >60% | 40-60% | <40% |
| 域名多样性 | 没有单个域名占比 >5% | 1 个域名占比 >10% | 1 个域名占比 >25% |
| 趋势 | 增长或稳定 | 缓慢下降 | 快速下降（>20%/季度） |

### 2. 锚文本分布

**DataForSEO：** `dataforseo_backlinks_anchors`

**Moz API：** `claude-seo run moz_api.py anchors <url> --json`

**Bing Webmaster：** `claude-seo run bing_webmaster.py links <url> --json`（从链接详情中提取锚文本）

**健康分布基准：**

| 锚文本类型 | 目标范围 | 过度优化信号 |
|-------------|-------------|-------------------------|
| 品牌型（公司名/域名） | 30-50% | <15% |
| URL/裸链接 | 15-25% | 不适用 |
| 通用型（“点击此处”、“了解更多”） | 10-20% | 不适用 |
| 完全匹配关键词 | 3-10% | >15% |
| 部分匹配关键词 | 5-15% | >25% |
| 长尾/自然型 | 5-15% | 不适用 |

如果完全匹配锚文本超过 15%，则将其标记为需要审查的启发式信号；这可能表明存在不自然或链接垃圾模式。

### 3. 引荐域名质量

**DataForSEO：** `dataforseo_backlinks_referring_domains`

**Moz API：** `claude-seo run moz_api.py domains <url> --json` → 包含 DA 评分的域名

**Common Crawl：** `claude-seo run commoncrawl_graph.py <domain> --json` → 域名级排名/存在情况数据，不提供经过验证的引荐域名数量

分析：
- **TLD 分布**：.edu、.gov、.org = 高权威性。.xyz、.info 过多 = 低质量
- **国家/地区分布**：应与目标市场匹配。80% 以上来自不相关国家/地区 = PBN 信号
- **域名排名分布**：健康的链接资料应包含来自各个权威等级的链接
- **每个域名的 follow/nofollow 情况**：仅提供 nofollow 链接的网站 = SEO 价值有限

### 4. 有毒链接检测

**DataForSEO：** `dataforseo_backlinks_bulk_spam_score` + 参考资料中的有毒链接模式

**Moz API：** 来自 `claude-seo run moz_api.py metrics <url> --json` 的原始供应商 spam_score（标注该数值的来源；仅在依据当前 Moz 文档完成验证后应用阈值）

**验证爬虫：** `claude-seo run verify_backlinks.py --target <url> --links <file> --json`（验证可疑链接是否仍然存在）

**高风险指标（立即标记）：**
- 来自已知 PBN（私有博客网络）域名的链接
- 非自然的锚文本模式（来自某个域名的锚文本 100% 完全匹配）
- 来自受惩罚或已从索引中移除的域名的链接
- 批量提交目录（50 个以上的目录链接）
- 链接农场（每个页面包含 10K 个以上出站链接的网站）
- 付费链接模式（出现在某个域名所有页面页脚/侧边栏中的链接）

**中等风险指标（人工审查）：**
- 来自不相关细分领域的链接
- 互惠链接模式
- 来自内容单薄页面（少于 100 个单词）的链接
- 来自单一域名的链接过多（1 个域名提供 50 个以上反向链接）

加载 `../seo/references/backlink-quality.md`，查看全部 30 种有毒链接模式及拒绝链接标准。

### 5. 按反向链接数排名的热门页面

**DataForSEO：** `dataforseo_backlinks_backlinks`，目标类型设为 "page"

**Moz API：** `claude-seo run moz_api.py pages <domain> --json`

找出：
- 哪些页面吸引了最多反向链接
- 拥有高权威链接的页面（链接磁石）
- 零反向链接的页面（内部链接机会）
- 拥有反向链接的 404 页面（通过重定向回收链接权益的机会）

### 6. 竞争对手差距分析

**DataForSEO：** 对两个域名分别使用 `dataforseo_backlinks_referring_domains`，然后进行比较

**Bing Webmaster：** 仅当两个站点资源均已注册，且同一个 Bing API
账户能够访问它们时，使用 `claude-seo run bing_webmaster.py compare <url1> <url2> --json`。
对于任意竞争对手，请使用 DataForSEO、Moz 或 Common Crawl。

**Moz API：** 分别通过 `claude-seo run moz_api.py metrics <url> --json` 比较各域名之间的 DA/PA

输出：
- 链接到竞争对手但未链接到目标站点的域名 = 链接建设机会
- 同时链接到两者的域名 = 验证现有关系
- 仅链接到目标站点的域名 = 竞争优势
- 按域名权威度列出的前 20 个链接建设机会

### 7. 新增和丢失的反向链接

**仅限 DataForSEO：** 使用 `dataforseo_backlinks_backlinks`，通过日期筛选器查看 30/60/90 天内的变化

**验证爬虫：** 对于已知链接，使用 `claude-seo run verify_backlinks.py --target <url> --links <file> --json` 验证其当前状态

**注意：** 免费数据源无法跟踪链接随时间推移的新增/丢失情况。如果用户在没有 DataForSEO 的情况下请求本节内容，请告知用户：“链接增长速度跟踪需要 DataForSEO 扩展。免费数据源只能提供特定时间点的快照。”

**危险信号：**
- 新链接突然激增（可能是负面 SEO 攻击）
- 大量链接突然丢失（网站受到惩罚或内容被删除）
- 连续 3 个月以上增长速度下降（内容未能吸引链接）

## 反向链接健康评分

计算一个 0-100 分的评分。混合使用多个数据源时，应用置信度加权：

| 因素 | 权重 | 数据源（按优先顺序） | 置信度 |
|--------|--------|---------------------------|------------|
| 引用域名数量 | 20% | DataForSEO > Moz | 1.0 / 0.85 |
| 域名质量分布 | 20% | DataForSEO > Moz DA 分布 | 1.0 / 0.85 |
| 锚文本自然度 | 15% | DataForSEO > Moz > Bing 锚文本 | 1.0 / 0.85 / 0.70 |
| 有害链接比例 | 20% | DataForSEO > Moz 垃圾评分 | 1.0 / 0.85 |
| 链接增长速度趋势 | 10% | 仅 DataForSEO | 1.0 |
| Follow/nofollow 比例 | 5% | DataForSEO > Bing 详细信息 | 1.0 / 0.70 |
| 地理相关性 | 10% | DataForSEO > Bing 国家/地区 | 1.0 / 0.70 |

**数据充足性门槛：** 统计 7 个因素中至少有一个可用数据源的因素数量。
- **有数据的因素达到 4 个或以上：** 生成 0-100 的数字评分（按比例重新分配缺失因素的权重）
- **少于 4 个因素：** 不要生成数字评分。改为显示：
  ```
  Backlink Health Score: INSUFFICIENT DATA (X/7 factors scored)
  ```
  显示已有数据的各项因素评分及其数据源和置信度。
  建议：“配置 Moz API（免费）以获得可评分的资料。运行 `/seo backlinks setup`”

仅有 CC 可用时，不要生成数字评分；只报告低置信度的排名/存在性数据。
在数据源少于 4 个时给出数字评分会**产生误导**，因为这会暗示健康状况不佳，
而实际上只是缺少数据。

## 输出格式

### 反向链接健康评分：XX/100（或数据不足）

| 部分 | 状态 | 评分 | 数据源 |
|---------|--------|-------|-------------|
| 资料概览 | 通过/警告/失败 | XX/100 | Moz (0.85) |
| 锚文本分布 | 通过/警告/失败 | XX/100 | Moz (0.85) |
| 引用域名质量 | 通过/警告/失败 | XX/100 | CC (0.50) |
| 有害链接 | 通过/警告/失败 | XX/100 | Moz Spam (0.85) |
| 热门页面 | 信息 | N/A | Moz (0.85) |
| 链接增长速度 | 通过/警告/失败 | XX/100 | 仅 DataForSEO |

### 严重问题（立即修复）
### 高优先级（1 个月内修复）
### 中优先级（持续改进）
### 链接建设机会（前 10 项）

## 错误处理

| 错误 | 原因 | 解决方法 |
|-------|-------|-----------|
| 未配置任何数据源 | 没有 API 密钥，也没有 DataForSEO | 运行 `/seo backlinks setup` |
| Moz 达到速率限制 | 免费套餐：每 10 秒 1 个请求 | 等待 10 秒后重试。脚本已内置此机制。 |
| Bing 网站未验证 | 网站尚未在 Bing 中验证 | 前往 https://www.bing.com/webmasters 进行验证 |
| CC 下载超时 | 图文件较大，连接速度较慢 | 使用 `--timeout 180` 标志 |
| DataForSEO 不可用 | 扩展未安装 | 运行 `./extensions/dataforseo/install.sh` |
| 未返回反向链接数据 | 域名太新或规模很小 | 注意：小型网站的反向链接可能少于 10 个 |

**回退级联：**
1. DataForSEO 可用？→ 将其用作主要数据源（置信度：1.0）
2. 已配置 Moz？→ 将其用于 DA/PA/垃圾评分/锚文本（置信度：0.85）
3. 已配置 Bing？→ 仅当两个资源均可访问时，将其用于已注册资源的链接和比较
   （置信度：0.70）
4. 始终使用：Common Crawl，用于域名级指标（置信度：0.50）
5. 始终使用：验证爬虫，用于检查已知链接（置信度：0.95）
6. 均不可用？→“运行 `/seo backlinks setup` 以配置免费 API”

## 交付前审查（强制）

在向用户展示任何反向链接分析之前，请在内部运行此检查清单。
不得跳过此步骤。在展示报告之前修复发现的所有问题。

### 对每项结论进行事实核查
- [ ] **Schema 结论**：parse_html 是否为每个块返回了 `@type`？如果缺少任何 `@type`，
      请重新检查，它可能使用了 `@graph` 包装器（这是有效的 JSON-LD，并非格式错误）。
- [ ] **`link_removed` 发现**：页面是否由 JS 渲染？如果是 `unverifiable_js`，请明确说明，绝不要
      将 JS 渲染的页面报告为“链接已移除”（这是误判为阴性）。
- [ ] **H1 发现**：是否有任何 H1 位于 `h1_suspicious` 列表中？如果有，请注明它们很可能是
      计数器/统计数据，而非语义标题。
- [ ] **互惠链接**：如果站点 A 链接到站点 B，并且 B 也反向链接到 A，请将其标记为
      互惠链接模式。将出站链接与已验证的入站来源进行核对。
- [ ] **健康度评分**：7 个因素中是否有 4 个以上已评分？如果没有，请报告数据不足，绝不要
      展示具有误导性的数值评分。

### 验证数据源标签
- [ ] 报告中的每项指标都有来源标签（例如，“已解析 (0.95)”“CC (0.50)”）
- [ ] 每个“未找到”结果均区分“未抓取”“低于阈值”和“错误”
- [ ] 社交媒体页面标记为 `unverifiable_js`（而非 `link_removed`）

### 交叉检查一致性
- [ ] 平台检测与实际信号一致（检查 wp-content、shopify CDN 等）
- [ ] 摘要中的引用域名数量与实际已验证链接列表一致
- [ ] 不得在没有数据源支持的情况下提出任何结论

如果任何检查失败，请在展示前修复相应发现。绝不要将推断的数据作为事实展示。

## 分析后操作

完成任何反向链接分析命令后，始终提供：
“生成专业 PDF 报告？使用 `/seo google report`”

## 参考文档

按需加载（不得在启动时加载）：
- `skills/seo/references/backlink-quality.md` -- 详细的有害链接模式和评分方法（共享参考资料，在分析有害链接或垃圾评分时加载）
- `skills/seo/references/free-backlink-sources.md` -- 数据源比较、置信度权重、设置指南（共享参考资料，在配置免费反向链接 API 时加载）