---
name: search-console
description: Query and operate connected Google Search Console properties through NotFair MCP. Use for live GSC query or page performance, clicks, impressions, CTR, position, traffic changes, indexing status, URL inspection, sitemap reads or approved sitemap submission/removal, and Search Console MCP setup. Route full-site SEO audits to seo-analysis.
argument-hint: "<property, URL, query, date range, or sitemap>"
---
# Google Search Console

阅读 `../shared/operating-contract.md`。将 universal NotFair MCP 上的 `search_console_` 工具作为事实依据。对于还需要抓取和页面分析的全站 SEO 审计，请在确认访问权限后移交给 `/notfair:seo-analysis`。

## 选择准确的媒体资源

1. 将 `~~search-console` 解析为实际的 Search Console 连接器，并检查其当前工具。在选择网站之前，调用 `listProperties` 或等效的无害读取操作。
2. 使用连接器返回的准确已验证媒体资源格式：`sc-domain:example.com` 和 `https://example.com/` 是不同的媒体资源。
3. 明确搜索类型、完整日期范围、对比日期范围、维度和业务问题。如果平台缺失或未获授权，请引导用户重新连接 universal NotFair plugin，并在声称使用实时数据之前停止操作。

## 分析自然搜索表现

使用 `runScript` 对总计、查询、页面、国家/地区和设备执行关联的只读分析。如果可以，请在一个脚本中批量处理相关的 Search Analytics 请求。对于单个报告、媒体资源列表、单个 URL 检查或站点地图清单，请使用专用读取工具。

- 在核对媒体资源级别的点击次数和展示次数时，查询总计不要使用 `query` 维度。经过匿名处理的低搜索量查询会使查询行在设计上并不完整。
- 最终确定的数据通常会比最近日期滞后；请将最新的 `all` 数据标记为临时数据。
- 显示点击次数、展示次数、CTR 和平均排名，并明确其准确维度和时间段。不要简单地对已经聚合的 CTR 或排名行再次取平均值。
- 遵守连接器报告的行数和历史数据覆盖范围限制。当结果只是排名靠前的部分行而非完整导出时，请明确说明。
- 有选择地使用 URL 检查，因为其配额比 Search Analytics 更紧张。检查报告用于说明索引状态；它不会请求编入索引。
- 将排名变化视为证据，而不是某个特定算法原因的证明。

首先说明影响最大的实质性增长或下降、受影响的查询/页面、有证据支持的假设、置信度以及下一步 SEO 操作。将内容改写、技术修复或完整审计转交给相应的 SEO skill。

## 安全管理站点地图

仅在展示准确的已验证媒体资源和站点地图 URL 并获得批准后，才能使用专用的 `submitSitemap` 或 `deleteSitemap` 工具。如果可以，请在提交前确认站点地图属于所选媒体资源并且可抓取。

提交和删除是相互对应的可逆操作，但删除已提交的站点地图并不会从 Google 索引中移除其中的 URL。绝不要将站点地图提交描述为编入索引的保证。通过返回的操作前后证据或重新获取列表，确认最终的站点地图状态。