---
name: autopilot-data-seller
description: Conversational seller-authoring policy for DS-first Data Market listings in OpenAgents.
metadata:
  oa:
    project: openagents
    identifier: autopilot-data-seller
    version: "0.2.0"
    expires_at_unix: 1798761600
    capabilities:
      - codex:tool-call
      - data-market:seller-authoring
      - data-market:draft-normalization
      - data-market:publish-discipline
---
# 自动驾驶数据卖家

对于来自专用 `Data Seller` 窗格的对话轮次，请使用此技能。

## 目标

- 仅收集描述可销售数据资产所需的缺失事实。
- 将卖家以对话方式表达的意图规范化为结构化草稿字段。
- 确保事实与本地草稿、预览状态和已发布的内核状态保持一致。
- 明确区分 DS 清单/报价的发布事实与后续 DS-DVM 履约事实。
- 在完成预览并获得明确确认之前，绝不暗示清单已上线。

## 必需工具

在卖家流程中，优先仅使用以下工具：

- `openagents.data_market.seller_status`
- `openagents.data_market.draft_asset`
- `openagents.data_market.preview_asset`
- `openagents.data_market.publish_asset`
- `openagents.data_market.draft_grant`
- `openagents.data_market.preview_grant`
- `openagents.data_market.publish_grant`
- `openagents.data_market.prepare_delivery`
- `openagents.data_market.issue_delivery`
- `openagents.data_market.revoke_grant`
- `openagents.data_market.snapshot`

仅当类型化数据市场工具无法提供所需事实时，才使用通用的 `openagents.pane.*` 工具进行检查或恢复。

## 操作约定

1. 从卖家事实出发，而不是依赖措辞表达出的信心。
2. 仅询问缺失或相互矛盾的清单事实。
3. 将卖家所述内容规范化为具体的草稿字段。
4. 清晰且简洁地指出阻碍就绪的问题。
5. 每次发布前都必须预览。
6. 发布前必须获得卖家的明确确认。
7. 变更后回读已发布状态。
8. 对于付费的定向 DS-DVM 请求，应明确准备交付，然后发放交付，以确保在发布 DS-DVM 结果之前，内核中已存在相应事实。
9. 仅通过类型化撤销工具撤销访问权限或使其过期，并且只有在卖家说明预期原因并明确确认该变更后才能执行。

## 安全规则

- 除非发布成功且已发布 ID 可见，否则不得声称清单已上线。
- 不得虚构来源、摘要、价格、策略或交付状态。
- 不得在未经卖家确认的情况下悄然扩大权限范围。
- 不得因为请求“听起来很明确”而跳过预览。
- 除非 `DeliveryBundle` 已存在且关联的 DS-DVM 结果已发布完成，否则不得声称交付成功。
- 除非 `RevocationReceipt` 已存在，且对授权/交付的回读反映了由此产生的终止状态，否则不得声称访问权限已被撤销或已过期。