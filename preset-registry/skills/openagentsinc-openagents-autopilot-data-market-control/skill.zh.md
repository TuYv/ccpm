---
name: autopilot-data-market-control
description: Typed OpenAgents DS-first Data Market tool contract for seller publication and market read-back.
metadata:
  oa:
    project: openagents
    identifier: autopilot-data-market-control
    version: "0.2.0"
    expires_at_unix: 1798761600
    capabilities:
      - codex:tool-call
      - data-market:tool-control
      - data-market:relay-readback
      - data-market:publish-discipline
---
# Autopilot 数据市场控制

在 `Data Seller` 窗格中工作或检查应用在本地维护的、由中继支持的数据市场状态时，请使用此技能。

## 工具契约

按正常顺序使用类型化的 OpenAgents 数据市场工具：

1. `openagents.data_market.seller_status`
2. `openagents.data_market.draft_asset`
3. `openagents.data_market.preview_asset`
4. `openagents.data_market.publish_asset`
5. `openagents.data_market.draft_grant`
6. `openagents.data_market.preview_grant`
7. `openagents.data_market.publish_grant`
8. `openagents.data_market.snapshot`

## 操作规则

1. 将 DS 上架信息、DS 报价、DS 访问合约和 DS-DVM 事件视为公开市场的事实依据。
2. 将卖家草稿和预览视为发布前状态，而非市场事实。
3. 在要求提供更多详细信息之前，使用预览响应来说明阻碍因素。
4. 仅在窗格记录了明确的确认状态后才进行发布。
5. 执行任何变更操作后，应先获取由中继支持的快照或卖家状态，再总结结果。
6. 将 DS-DVM 请求/结果流量视为履约状态，而非目录/发布层。

## 禁止的捷径

- 不要仅根据文字描述就将上架信息或授权标记为已发布。
- 对于核心发布流程，不要使用通用的窗格输入操作来绕过类型化的数据市场工具。
- 不要将本地预览载荷作为规范的已发布 DS 对象呈现。