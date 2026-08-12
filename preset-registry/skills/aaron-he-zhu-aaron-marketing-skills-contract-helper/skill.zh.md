---
name: contract-helper
slug: contract-helper
displayName: "Contract Helper · 合作合同助手"
summary: "红人合作协议要点:交付物、授权、独家与披露条款清单及谈判要点"
description: 'Use when the user asks to "draft an influencer contract", "review these agreement terms", or "build a partnership template"; produces a full influencer agreement framework (scope, compensation, usage rights, exclusivity, FTC disclosure), a clause-by-clause review with red flags, and a negotiation cheat sheet. Not for outreach negotiation before a deal exists — use outreach-manager. 达人合同/合作协议条款审查'
version: "19.2.0"
license: Apache-2.0
compatibility: "Claude Code and compatible agent-skill hosts"
homepage: "https://github.com/aaron-he-zhu/aaron-marketing-skills"
when_to_use: "Use when drafting a new influencer or creator agreement, reviewing an incoming contract or agency paper, negotiating terms such as usage rights or exclusivity, explaining standard clauses, or building a reusable partnership template. Auto-activate once a partnership is agreed in principle and the deal needs paperwork."
argument-hint: "<deliverables and compensation> [platform] | review <pasted terms>"
metadata: {"author": "aaron-he-zhu", "version": "19.2.0", "discipline": "influencer", "phase": "activate", "geo-relevance": "low", "hermes": {"tags": ["marketing", "influencer", "activate"], "category": "influencer"}, "openclaw": {"emoji": "📣", "homepage": "https://github.com/aaron-he-zhu/aaron-marketing-skills"}}
---
# 合同助手

创建和审查网红合作协议。清晰的合同能够保护品牌和创作者双方，并明确合作预期。

⚠️ 此技能提供一般性指导和模板。在签署执行前，务必由法律顾问审查合同。

## 快速开始

```
Draft an influencer agreement for [deliverables] with [compensation terms]
```
```
Review these contract terms from an influencer agency: [paste terms]
```

## 技能契约

- **读取**：活动简报、约定的交付内容、报酬金额、平台列表、使用权和排他性需求，以及任何粘贴进来的协议。如果 `memory-management` 已启用，则从热缓存加载先前的外联条款和预算上限。对于已列入名册的创作者，在起草或审查前，读取 `memory/creators/<handle-slug>.md`（即 [creator-registry](../../../protocol/creator-registry/SKILL.md) 名册记录），以了解现有的排他期限、合同状态、使用权历史记录和标准范围基准。
- **写入**：将起草的协议或审查备忘录写入 `memory/influencer/contract-helper/YYYY-MM-DD-<topic>.md`。已签署的条款（使用权期限、排他范围、最终费率）还会通过向 `registry-events.py` 发出经授权的 `operation: propose` 请求，以单行更新的形式写入 `memory/events/creators.ndjson`——只有 `creator-registry` 才能写入规范名册记录。
- **提升**：将长期有效的信息（已签署条款、使用权期限、排他范围、付款计划）提升至 `memory/hot-cache.md`。
- **完成条件**：
  - 每个必需条款均已填写，或明确标记为 TBD（合同双方、交付内容、报酬、付款时间表、使用权、排他性、终止条款）。
  - 对于任何审查，均已列出风险警示，并在签署执行前附上法律顾问审查说明。
  - 谈判速查表将每个待定条款对应至标准范围。
- **主要后续技能**：[content-amplifier](../content-amplifier/SKILL.md)——合同签署后，推广获得许可的内容。

### 交接摘要

> 输出 [skill-contract.md §交接摘要格式](../../../references/skill-contract.md) 中规定的标准结构。

## 数据源

此系列无需实时集成（第 1 层）。该技能通过直接向你询问输入信息来工作：合同双方、交付内容、报酬、平台，以及任何需要审查的传入条款。粘贴代理机构的草案后，它无需任何设置即可按照检查清单进行审查。

可选择使用以下连接器来加速特定步骤：

- `~~CRM` / 交易记录——提取已商定的范围和费率，避免重复输入。
- `~~influencer database`——确认创作者的法定姓名、实体和受众真实性信号，以用于保证条款。
- `~~e-signature`——发送已完成的协议以供签署。

有关各类别的免费/无密钥配置方案，请参阅 [CONNECTORS.md](../../../CONNECTORS.md)。这些连接器均非必需。

## 说明

当用户请求合同方面的帮助时：

1. **收集合同参数**——合同双方、合作详情（活动、期限、交付内容、报酬）以及附加条款（使用权、排他性、审批、平台）。使用 [references/templates.md §1](references/templates.md) 中的信息收集表。
2. **起草协议**——填写包含 11 个部分的框架（范围、报酬、使用权、排他性、审批、合规/FTC、保证、保密、赔偿、终止、其他条款及签名）。完整模板见 [references/templates.md §2](references/templates.md)。根据交易规模调整各部分——对于小型交易，移除白名单投放/广泛排他性条款。
3. **解释关键条款**——针对每项重要条款，说明其涵盖的内容、重要性以及需要注意的事项。条款指南见 [references/templates.md §3](references/templates.md)。
4. **审查并标记问题**——对于任何传入的合同文件，按照检查清单进行审查：必要条款是否齐全、风险警示，以及逐条款的谈判范围。检查清单和表格见 [references/templates.md §4-5](references/templates.md)。

将起草的协议或审查备忘录保存到 `memory/influencer/contract-helper/YYYY-MM-DD-<topic>.md`，并将具有长期效力的已签署条款提升至热缓存。条款签署后，还应通过向 `registry-events.py` 发出经授权的 `operation: propose` 请求，将这些条款（使用权期限、排他范围、最终费率）作为单行更新提交到 `memory/events/creators.ndjson`，以便 [creator-registry](../../../protocol/creator-registry/SKILL.md) 将其同步到名册记录中。

## 示例

**用户**："为一位微型网红起草一份简单协议，由其发布 2 篇 Instagram 帖子，报酬为 500 美元"

**输出**：一份针对该合作范围的简化协议——2 篇 IG 帖子、500 美元及付款计划、自有渠道上非排他的 12 个月使用权、#ad 披露要求，以及简短的时间表。较复杂的条款（白名单授权、宽泛的排他性、多轮审批）均被移除。完整演练参见 [references/templates.md §7](references/templates.md)。

## 参考资料

- [references/templates.md](references/templates.md) — 信息收集表、完整的 11 节协议模板、条款说明、审查清单、谈判表格、提示和完整示例。
- [skill-contract.md](../../../references/skill-contract.md) — 共享契约与交接摘要格式。
- [state-model.md](../../../references/state-model.md) — 记忆层级和保存路径约定。
- [CONNECTORS.md](../../../CONNECTORS.md) — 各类别的免费/免密钥连接器方案。
- 同级技能：[outreach-manager](../outreach-manager/SKILL.md)（在签订合同前进行谈判）、[creator-content-auditor](../creator-content-auditor/SKILL.md)（执行审批条款）、[budget-optimizer](../../target/budget-optimizer/SKILL.md)（确定报酬）、[brief-generator](../../target/brief-generator/SKILL.md)（将简报作为附件附上）。

## 下一最佳技能

**首选**：[content-amplifier](../content-amplifier/SKILL.md) — 协议签署且使用权确定后，将获得许可的内容推广至付费渠道和自有渠道。

**备选（同属 Activate 系列）**：
- [creator-content-auditor](../creator-content-auditor/SKILL.md) — 执行合同中规定的审批工作流。
- [outreach-manager](../outreach-manager/SKILL.md) — 如果条款谈判陷入停滞，则在重新起草前返回谈判阶段。

**终止条件**：为本次会话维护一个已访问集合。如果上方某个技能已经被调用，则停止并报告链路已完成，而不是再次运行该技能。最大链路深度为 3 跳；达到上限后，进行总结并将控制权交还给用户。

## 相关技能

- [outreach-manager](../outreach-manager/SKILL.md) - 在签订合同前进行谈判
- [brief-generator](../../target/brief-generator/SKILL.md) - 将简报作为附件附上
- [creator-content-auditor](../creator-content-auditor/SKILL.md) - 执行审批流程
- [budget-optimizer](../../target/budget-optimizer/SKILL.md) - 确定报酬条款