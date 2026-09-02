---
name: contract-helper
slug: contract-helper
displayName: "Contract Helper · 合作合同助手"
summary: "红人合作协议要点:交付物、授权、独家与披露条款清单及谈判要点"
description: 'Use when the user asks to "draft an influencer contract", "review these agreement terms", or "build a partnership template"; produces a full influencer agreement framework (scope, compensation, usage rights, exclusivity, FTC disclosure), a clause-by-clause review with red flags, and a negotiation cheat sheet. Not for outreach negotiation before a deal exists — use outreach-manager. 达人合同/合作协议条款审查'
version: "20.1.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use when drafting a new influencer or creator agreement, reviewing an incoming contract or agency paper, negotiating terms such as usage rights or exclusivity, explaining standard clauses, or building a reusable partnership template. Auto-activate once a partnership is agreed in principle and the deal needs paperwork."
argument-hint: "<deliverables and compensation> [platform] | review <pasted terms>"
metadata: {"author": "aaron-he-zhu", "version": "20.1.0", "discipline": "influencer", "phase": "activate", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "activate"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 合同助手

创建和审阅网红合作协议。清晰的合同可以保护品牌方和创作者双方，并明确合作预期。

⚠️ 此技能提供一般性指导和模板。执行合同前，务必由法律顾问审阅。

## 快速开始

```
Draft an influencer agreement for [deliverables] with [compensation terms]
```
```
Review these contract terms from an influencer agency: [paste terms]
```

## 技能契约

- **读取**：campaign brief、已达成一致的交付内容、报酬金额、平台列表、使用权和排他性需求、任何粘贴进来的对方协议，以及在可用时读取稳定的 `party_ref`、`contact_ref`、`address_ref` 和 `signature_ref` 值。原始法律名称、实体标识符、电子邮件、电话号码、邮政地址、付款详情和签名仅作为临时执行输入。如果 `memory-management` 处于活动状态，则从热缓存加载此前的外联条款和预算上限。对于已登记的创作者，通过其授权工件或经验证的注册表链接解析所携带的不透明 `creator_ref`，然后读取 `memory/creators/<aggregate-id>.md` —— [creator-registry](../../../protocol/creator-registry/SKILL.md) 投影 —— 以获取现有排他性期限、合同状态、使用权历史记录和标准范围锚点，再进行起草或审阅。绝不能根据原始账号名推导路径。
- **写入**：默认以内联方式返回起草的协议或审阅备忘录。获得精确的 WARM 保存授权后，`memory/influencer/contract-helper/YYYY-MM-DD-<topic>.md` 仅存储 `party_ref`、`contact_ref`、`address_ref`、`signature_ref` 和非 PII 条款摘要；绝不存储原始当事方/联系人/地址/签名值、付款详情或可执行/已签署的文档字节。电子签署执行副本保留在经授权的外部文档/电子签名系统中。每次已签署条款更新都需要通过 `registry-events.py` 向 `memory/events/creators.ndjson` 发起 `operation: propose` 请求时的单独精确授权；只有 `creator-registry` 可以写入规范的名册记录。
- **提升**：仅凭单独的精确授权，将持久化的已签署条款（使用权期限、排他性范围、付款计划）提升至 `memory/hot-cache.md`。
- **完成标准**：
  - 每项必需条款都已填写或明确标记为 TBD（当事方、交付内容、报酬、付款时间表、使用权、排他性、终止）。
  - 对于任何审阅，都列出风险信号，并在执行前附上法律顾问审阅备注。
  - 谈判速查表中的每一项未决条款，都只对应用户提供的目标，或有来源日期且与司法管辖区/市场兼容的锚点；否则还价内容保持为 `TBD/NEEDS_INPUT`。
  - 任何 WARM 记录都仅作为参考，任何签名请求要么未发送，要么具有独立的精确授权，并绑定最终收件人、文档字节和渠道。
- **主要后续技能**：[brief-generator](../../target/brief-generator/SKILL.md) —— 签署后，创建或最终确定面向创作者的 brief，然后让创作者执行。仅有签名绝不足以将内容路由至放大推广。

### 交接摘要

> 按照 [skill-contract.md §Handoff Summary Format](../../../references/skill-contract.md) 中的标准格式输出。

## 数据来源

此系列无需实时集成（Tier 1）。该技能通过直接向你询问输入信息来工作：合作方、交付物、报酬、平台以及任何需要审查的待定条款。粘贴代理机构的草案后，它会在无需任何设置的情况下，根据检查清单进行审查。

可选连接器可以加快特定步骤：

- `~~CRM` / deal record — 提取已商定的范围和费率，避免重复输入。
- `~~influencer database` — 根据授权合作方引用，临时解析外部执行副本所需的法定姓名/实体信息；在 WARM 中仅保留不透明引用。
- `~~e-signature` — 将完整执行副本保存在 WARM 之外，并仅在下方所述的独立签署发送授权之后进行路由。

请参阅 [CONNECTORS.md](../../../CONNECTORS.md)，其中包含各类别的免费/无需密钥方案。所有连接器均非必需。

## 说明

当用户请求合同帮助时：

1. **收集合同参数** — 记录 `party_ref`、`contact_ref`、`address_ref` 和 `signature_ref`，以及合作详情（campaign、duration、deliverables、compensation）和附加条款（usage rights、exclusivity、approval、platforms）。原始身份/联系信息/地址/签名输入仅在临时状态中保留。使用 [references/templates.md §1](references/templates.md) 中的收集表单。
2. **起草协议** — 填写 11 个部分的框架（scope、compensation、usage rights、exclusivity、approval、compliance/FTC、warranties、confidentiality、indemnification、termination、miscellaneous + signatures）。参考安全的 WARM 摘要与仅供外部使用的执行副本模板已在 [references/templates.md §2](references/templates.md) 中分开。根据交易规模调整各部分内容 — 对于小型交易，删除 whitelisting/广泛排他性条款块。
3. **解释关键条款** — 对每项重要条款说明其涵盖内容、重要原因以及需要注意的事项。条款指南见 [references/templates.md §3](references/templates.md)。
4. **审查并标记问题** — 对任何收到的合同文件运行检查清单：必要条款是否齐全、风险信号以及针对各条款的反提议。绝不将内置的期限、修订次数、周转时间或付款条款用作默认值。数值型反提议必须由用户提供，或与具有来源日期且符合司法管辖区/市场要求的基准相关联；否则标记为 `TBD/NEEDS_INPUT`。检查清单和表格见 [references/templates.md §4-5](references/templates.md)。
5. **准备并授权电子签署执行** — 将完整的可执行协议保存在外部电子签名/文档系统中，针对最终文档的确切字节计算 SHA-256，并显示确切的 `recipient_ref`、文档哈希和交付渠道。发送签署请求属于外部变更操作，需要针对该元组进行独立且精确的授权；起草、法律审查、WARM 保存、HOT 提升或此前的发送批准均不涵盖该操作。仅在获得授权的提供商调用内部解析原始收件人/联系信息/地址。如果任何文档字节、收件人或渠道发生变化，则丢弃原授权并请求新的授权。元组或授权缺失时，不得上传、路由或发送。
6. **签署后路由** — 如果尚不存在最终的创作者可直接使用的 brief，则交接给 [brief-generator](../../target/brief-generator/SKILL.md)。如果 brief 已存在，则继续履行创作者交付；当收到提交内容时，将其冻结版本交给 [creator-content-auditor](../creator-content-auditor/SKILL.md) 进行修订/审批。仅当有效权利涵盖预期用途时，才将经审计员批准的冻结资产路由给 [content-amplifier](../content-amplifier/SKILL.md)；Spark/boost 路径还需要匹配的已发布帖子，而 dark-post 路径不需要。不得仅因协议已签署就跳过履行或内容审核关卡。

以内联方式返回起草的协议或审阅备忘录。在确切的 WARM 保存路径提供仅供参考的条款摘要；绝不将电子签署执行副本放在那里。进行任何 HOT 提升前，须单独征询确认。条款签署后，另行请求对一行 `operation: propose` 更新的明确授权（使用权期限、独占范围、最终费率），通过 `registry-events.py` 写入 `memory/events/creators.ndjson`，以供 [creator-registry](../../../protocol/creator-registry/SKILL.md) 协调。起草、签署、保存和签名交付是四个不同的授权界面；任何一个均不授权其他操作。

如果已存在获授权的轻量级营销活动追踪器，可提出在 `evidence_refs` 中附上已签署协议并记录 `stage: contracted`；该 WARM 更新需要其自身明确的保存授权，且并非规范记录。如果简报已最终确定，不要仅为了延长链路而调用其他规划技能：将已签约的简报交给创作者执行，在获得授权后记录后续提交内容，并且仅在内容提交后调用审计员。

## 示例

**用户**：“为 2 条 Instagram 帖子起草一份简单协议，费用为 $500，验收后 Net 30 付款，两轮修改，非独占的美国自有频道使用权，期限 12 个月，初稿截止日期为 9 月 15 日，上线日期为 9 月 22 日。”

**输出**：一份仅涵盖所提供条款的简化协议 —— 2 条 IG 帖子、$500 Net 30、两轮修改、非独占的 12 个月美国自有频道使用权、所提供的日期，以及 #ad 披露。交易范围之外的较重条款应省略或标记为 TBD，不得自行编造。任何获授权的 WARM 保存均为仅供参考的条款摘要；可执行协议保留在外部电子签署系统中，除非另行批准 `recipient_ref` + 文档 SHA-256 + 渠道元组，否则不得发送。有关完整演练，请参阅 [references/templates.md §7](references/templates.md)。

## 参考材料

- [references/templates.md](references/templates.md) —— 收集表单、完整的 11 节协议模板、条款说明、审阅清单、谈判表格、技巧、完整示例。
- [skill-contract.md](../../../references/skill-contract.md) —— 共享契约和 Handoff Summary 格式。
- [state-model.md](../../../references/state-model.md) —— 记忆层级和保存路径约定。
- [CONNECTORS.md](../../../CONNECTORS.md) —— 各类别的免费/免密钥连接器方案。
- 相关技能：[outreach-manager](../outreach-manager/SKILL.md)（在签订合同前进行谈判）、[creator-content-auditor](../creator-content-auditor/SKILL.md)（执行审批条款）、[budget-optimizer](../../target/budget-optimizer/SKILL.md)（设定报酬）、[brief-generator](../../target/brief-generator/SKILL.md)（将简报作为附件附上）。

## 下一最佳技能

**主要**：[brief-generator](../../target/brief-generator/SKILL.md) —— 签署后创建或最终确定供创作者使用的简报。

**条件性后续步骤**：
- **简报已最终确定**：继续由创作者执行；内容提交后，使用 [creator-content-auditor](../creator-content-auditor/SKILL.md) 运行合同定义的审批工作流程。
- **资产获准再利用**：仅在确认冻结资产已获审计员批准，且其现行权利覆盖预期用途后，才使用 [content-amplifier](../content-amplifier/SKILL.md)；仅对于 Spark/boost 或其他基于现有帖子的方式，才要求存在匹配的在线帖子。
- [outreach-manager](../outreach-manager/SKILL.md) —— 如果条款谈判停滞，请在重新起草前回到谈判阶段。

**终止**：为本次会话维护一个已访问集合。如果上面的某项技能已经被调用，则停止并报告链路已完成，而不是再次运行它。链路最大深度为 3 跳；达到该深度后，进行总结并交还给用户。

## 相关技能

- [outreach-manager](../outreach-manager/SKILL.md) - 在签订合同前进行协商
- [brief-generator](../../target/brief-generator/SKILL.md) - 将简报作为附件附上
- [creator-content-auditor](../creator-content-auditor/SKILL.md) - 执行审批流程
- [budget-optimizer](../../target/budget-optimizer/SKILL.md) - 确定报酬条款