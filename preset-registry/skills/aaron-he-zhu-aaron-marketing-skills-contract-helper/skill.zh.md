---
name: contract-helper
slug: contract-helper
displayName: "Contract Helper · 合作合同助手"
summary: "红人合作协议要点:交付物、授权、独家与披露条款清单及谈判要点"
description: 'Use when the user asks to "draft an influencer contract", "review these agreement terms", or "build a partnership template"; produces a full influencer agreement framework (scope, compensation, usage rights, exclusivity, FTC disclosure), a clause-by-clause review with red flags, and a negotiation cheat sheet. Not for outreach negotiation before a deal exists — use outreach-manager. 达人合同/合作协议条款审查'
version: "20.0.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use when drafting a new influencer or creator agreement, reviewing an incoming contract or agency paper, negotiating terms such as usage rights or exclusivity, explaining standard clauses, or building a reusable partnership template. Auto-activate once a partnership is agreed in principle and the deal needs paperwork."
argument-hint: "<deliverables and compensation> [platform] | review <pasted terms>"
metadata: {"author": "aaron-he-zhu", "version": "20.0.0", "discipline": "influencer", "phase": "activate", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "activate"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 合同助手

创建和审查网红合作协议。清晰的合同能够保护品牌和创作者双方，并明确合作预期。

⚠️ 此技能提供一般性指导和模板。合同签署前，务必交由法律顾问审查。

## 快速开始

```
Draft an influencer agreement for [deliverables] with [compensation terms]
```
```
Review these contract terms from an influencer agency: [paste terms]
```

## 技能契约

- **读取**：营销活动简报、商定的交付内容、报酬金额、平台列表、使用权和排他性需求，以及粘贴的任何传入协议。如果 `memory-management` 处于激活状态，则从热缓存加载先前的外联条款和预算上限。对于名册中的创作者，在起草或审查之前，读取 `memory/creators/<handle-slug>.md`——即 [creator-registry](../../../protocol/creator-registry/SKILL.md) 名册记录——以了解现有的排他期、合同状态、使用权历史记录和标准区间基准。
- **写入**：将起草的协议或审查备忘录写入 `memory/influencer/contract-helper/YYYY-MM-DD-<topic>.md`。已签署的条款（使用权期限、排他范围、最终费率）也会通过向 `registry-events.py` 发出经授权的 `operation: propose` 请求，以单行更新的形式写入 `memory/events/creators.ndjson`——只有 `creator-registry` 可以写入规范名册记录。
- **提升**：将持久性事实（已签署条款、使用权期限、排他范围、付款时间表）提升至 `memory/hot-cache.md`。
- **完成条件**：
  - 每一项必需条款均已填写，或明确标记为待定（双方、交付内容、报酬、付款时间线、使用权、排他性、终止）。
  - 对于任何审查，均列出风险信号，并在签署前附上法律顾问审查说明。
  - 谈判速查表将每一项待定条款映射至标准区间。
- **主要后续技能**：[content-amplifier](../content-amplifier/SKILL.md)——合同签署后，推广已获许可的内容。

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../../references/skill-contract.md) 中规定的标准结构。

## 数据源

此系列无需实时集成（第 1 级）。此技能通过直接向你询问输入信息来运作：双方、交付内容、报酬、平台，以及任何需要审查的传入条款。粘贴代理机构的草案后，即可根据检查清单进行审查，无需任何设置。

可选择使用以下连接器来加快特定步骤：

- `~~CRM` / 交易记录——提取商定的范围和费率，避免重复输入。
- `~~influencer database`——确认创作者的法定姓名、实体和受众真实性信号，以用于保证条款。
- `~~e-signature`——将完成的协议发送以供签署。

有关每个类别的免费/无密钥方案，请参阅 [CONNECTORS.md](../../../CONNECTORS.md)。这些连接器均非必需。

## 说明

当用户请求合同协助时：

1. **收集合同参数**——双方、合作详情（营销活动、持续时间、交付内容、报酬）和附加条款（使用权、排他性、审批、平台）。使用 [references/templates.md §1](references/templates.md) 中的收集表单。
2. **起草协议**——填写包含 11 个部分的框架（范围、报酬、使用权、排他性、审批、合规/FTC、保证、保密、赔偿、终止、其他条款 + 签名）。完整模板位于 [references/templates.md §2](references/templates.md)。根据交易规模调整各部分——对于小额交易，删除白名单授权/广泛排他性条款块。
3. **解释关键条款**——对于每一项实质性条款，说明其涵盖的内容、重要性以及需要注意的事项。条款指南位于 [references/templates.md §3](references/templates.md)。
4. **审查并标记**——对于任何传入文件，按照检查清单进行审查：必要条款是否齐全、风险信号，以及逐条款的谈判区间。检查清单和表格位于 [references/templates.md §4-5](references/templates.md)。

将起草的协议或审查备忘录保存到 `memory/influencer/contract-helper/YYYY-MM-DD-<topic>.md`，并将持久有效的已签署条款提升到热缓存。条款签署后，还应通过向 `registry-events.py` 发出经授权的 `operation: propose` 请求，将这些条款（使用权期限、排他范围、最终费率）作为单行更新提交到 `memory/events/creators.ndjson`，以便 [creator-registry](../../../protocol/creator-registry/SKILL.md) 将其协调写入名册记录。

## 示例

**用户**：“为一位微型影响者起草一份简单协议，由其以 $500 的价格创作 2 篇 Instagram 帖子”

**输出**：一份范围限定于该合作的简化协议——2 篇 IG 帖子、$500 及付款时间表、自有渠道上为期 12 个月的非排他性使用权、#ad 披露以及简短的时间安排。省略较繁重的条款（白名单授权、宽泛的排他性、多轮审批）。有关完整演练，请参阅 [references/templates.md §7](references/templates.md)。

## 参考资料

- [references/templates.md](references/templates.md) — 信息收集表、完整的 11 节协议模板、条款说明、审查清单、谈判表格、技巧和完整示例。
- [skill-contract.md](../../../references/skill-contract.md) — 共享契约和交接摘要格式。
- [state-model.md](../../../references/state-model.md) — 记忆层级和保存路径约定。
- [CONNECTORS.md](../../../CONNECTORS.md) — 各类别的免费/无需密钥连接器方案。
- 同级技能：[outreach-manager](../outreach-manager/SKILL.md)（在签订合同前进行谈判）、[creator-content-auditor](../creator-content-auditor/SKILL.md)（执行审批条款）、[budget-optimizer](../../target/budget-optimizer/SKILL.md)（确定报酬）、[brief-generator](../../target/brief-generator/SKILL.md)（将简报作为附件附上）。

## 下一最佳技能

**首选**：[content-amplifier](../content-amplifier/SKILL.md) — 协议签署且使用权确定后，将获得许可的内容扩展到付费渠道和自有渠道。

**备选（同属 Activate 家族）**：
- [creator-content-auditor](../creator-content-auditor/SKILL.md) — 运行合同所定义的审批工作流。
- [outreach-manager](../outreach-manager/SKILL.md) — 如果条款协商陷入停滞，则先返回谈判阶段，再重新起草。

**终止条件**：为本次会话维护一个已访问集合。如果上述某项技能已被调用，请停止并报告 chain-complete，而不是再次运行该技能。链的最大深度为 3 跳；达到上限后，进行总结并将控制权交还给用户。

## 相关技能

- [outreach-manager](../outreach-manager/SKILL.md) - 在签订合同前进行谈判
- [brief-generator](../../target/brief-generator/SKILL.md) - 将简报作为附件附上
- [creator-content-auditor](../creator-content-auditor/SKILL.md) - 执行审批流程
- [budget-optimizer](../../target/budget-optimizer/SKILL.md) - 确定报酬条款