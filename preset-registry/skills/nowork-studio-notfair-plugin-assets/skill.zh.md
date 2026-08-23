---
name: google-ads-assets
description: Plan, validate, and safely publish Google Ads assets, including sitelinks, callouts, structured snippets, image assets, and Performance Max asset briefs. Use when asked for Google Ads assets, ad extensions, sitelinks, callouts, snippets, image assets, Performance Max assets, PMax creative, or an asset audit.
argument-hint: "<campaign, asset group, or 'build an asset brief'>"
---
# Google Ads 素材规划器

将已获批准的业务证据转化为可供审核的素材清单，并且仅在已连接的 MCP 支持的情况下安全发布。

## 设置

阅读并遵循 `../shared/preamble.md` 和 `../shared/analysis-principles.md`。在提出素材建议之前，阅读 `{data_dir}/business-context.json` 和 `{data_dir}/personas/{accountId}.json`。如果其中任一文件缺失或已过期，请移交给 `/google-ads-audit`；缺乏依据的素材包只是一套通用素材库。

在开展 PMax 或政策敏感型工作之前，阅读 `../shared/policy-registry.json`。如果其中的 PMax 条目已过期，请先核实相关的 Google 政策或平台要求，再陈述当前规则。

## 基于证据构建，而非填充内容

在推荐新素材之前，使用 `runScript` 拉取现有广告系列、广告组和素材覆盖情况。将搜索字词、产生转化的广告、着陆页内容、已批准的优惠和客户用语作为素材来源。不得推断评分、定价、保证、供应情况或产品属性。

对于每项拟议素材，请生成以下可审核的清单：

| 字段 | 必填内容 |
|---|---|
| 素材系列 | 宣传信息、附加链接、结构化摘要、图片或 PMax 简报 |
| 范围 | 账号、广告系列、广告组或指定的 PMax 素材资源组 |
| 概念 ID | 用户画像 × 动机 × 切入角度 |
| 文案或创意方向 | 已获批准的确切文本，或可直接投入制作的视觉简报 |
| 证据和声明状态 | 每项事实性声明的来源；将无支持依据的声明标记为 `needs_substantiation` |
| 着陆目标 | 最终 URL，以及适用时的消息匹配说明 |
| 状态 | `ready_for_review`、`blocked` 或 `approved_to_publish` |

有意保持简报内容多样化：每个概念都应测试不同的动机或视觉吸引点，而不是仅做表面上的改写。对于缺失的证明材料，应主动索取，而不是自行编造。

## 平台感知型执行

- 在创建任何内容之前，根据当前已连接工具的元数据验证文案和目标字段。不得依赖记忆中的限制，也不得在不作说明的情况下截断素材。
- 只有在用户批准确切的素材清单后，才能创建或关联宣传信息、附加链接、结构化摘要或图片素材。使用专用的变更工具，记录返回的 `changeId`，并回读生成的实体。
- 上传图片素材前，应核实图片所有权、着陆页使用权和政策敏感型声明。生成的图片是制作输入，而不能证明其中的声明符合规定。
- 当前 NotFair MCP 接口可以创建或关联受支持的素材库类型，也可以启用或暂停 PMax 素材资源组。它并**不能**证明自身能够编排或编辑 PMax 素材资源组。在承诺执行该操作前检查 `tools/list`；否则，应交付 PMax 简报，以便在 Google Ads 中完成后续操作。

## PMax 简报

对于 PMax 请求，应生成一份适用于多个广告展示位置的制作简报，而不是一份通用口号列表：

1. 说明产品或 Feed 范围、转化目标、受众群体信号和着陆目标。
2. 提供 3–5 张概念卡片，每张都应包含视觉吸引点、屏幕显示信息、证明来源、CTA 和适配不同广告展示位置的安全调整说明。
3. 明确指出缺失的输入：已批准的徽标、图片/视频源文件、Feed 就绪情况、相关权利或证明材料。
4. 确保搜索广告 RSA 的语言与 PMax 文字素材形成互补；避免无理由地重复相同承诺。
5. 在扩大投放规模之前，为 `/google-ads` 标记 PMax/搜索广告重叠问题和品牌排除问题。

## 防护规则

1. 绝不发布未经支持的声明、未经验证的目标地址或权利归属不明的素材。
2. 绝不将制作简报称为已上传素材。明确区分 `ready_for_review` 和 `published`。
3. 每次写入前都要确认范围和确切的素材数量；在支持的情况下，变更必须可通过 `undoChange` 撤销。
4. 将出价、预算、关键字和广告系列结构的更改交由 `/google-ads` 处理；将 RSA 测试交由 `/google-ads-copy` 处理。