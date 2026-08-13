---
name: "c-level-agents"
description: "Founder-mode executive team. 13 cs-* C-suite agents (CFO, CMO, CRO, CPO, COO, CHRO, CISO, GC, CDO, CAIO, CCO, VPE, Chief of Staff) and 21 /cs:* slash commands for forcing-question office hours, multi-role boardroom deliberation, strategic sprint pipeline, and meta routing. Use when the founder needs a virtual executive team, when invoking /cs:* commands, or when orchestrating multi-role decisions."
license: MIT
metadata:
  version: 1.0.0
  author: Alireza Rezvani
  category: c-level
  domain: executive-orchestration
  updated: 2026-05-12
  agents: cs-cfo-advisor, cs-cmo-advisor, cs-cro-advisor, cs-cpo-advisor, cs-coo-advisor, cs-chro-advisor, cs-ciso-advisor, cs-general-counsel-advisor, cs-cdo-advisor, cs-caio-advisor, cs-cco-advisor, cs-vpe-advisor, cs-chief-of-staff
  commands: cs-office-hours, cs-cfo-review, cs-cmo-review, cs-cpo-review, cs-cro-review, cs-cto-review, cs-ciso-review, cs-gc-review, cs-cdo-review, cs-caio-review, cs-cco-review, cs-vpe-review, cs-brief, cs-boardroom, cs-decide, cs-execute, cs-post-mortem, cs-founder-mode, cs-onboard, cs-cross-eval, cs-freeze
---
# c-level-agents — 创始人模式高管团队

一个通过斜杠命令和角色代理提供服务的虚拟最高管理层。

## 关键词

创始人模式、虚拟最高管理层、高管团队、董事会议、办公时间、CFO 审查、CMO 审查、战略冲刺、决策记录、跨模型共识、角色代理、幕僚长、迫使深入思考的问题

## 此插件提供的功能

### 13 个 cs-* 代理（位于 `agents/` 中）

每个代理都封装了一个现有的高管技能，并添加了：
- 独特的认知风格（重数据的怀疑论者、叙事优先等）
- 特定于该角色的迫使深入思考的问题
- 与技能 Python 工具绑定的工作流编排
- 输出模板：结论 → 事项 → 原因 → 如何行动 → 你的决策

有关风格规范，请参阅 `../../references/persona-voices.md`。

### 21 个 /cs:* 斜杠命令（位于 `skills/` 中）

**迫使深入思考的问题式办公时间（12 个）：**
- `/cs:office-hours` — YC 风格的 6 问信息收集
- `/cs:cfo-review` — 单位经济效益、现金跑道、股权稀释
- `/cs:cmo-review` — ICP、CAC 回收期、市场定位
- `/cs:cpo-review` — RICE、JTBD、北极星指标、PMF
- `/cs:cro-review` — 销售管道覆盖率、赢单率、NRR
- `/cs:cto-review` — 架构风险、扩展瓶颈
- `/cs:ciso-review` — 威胁模型、爆炸半径、合规性
- `/cs:gc-review` — 合同、知识产权、监管、投资条款清单
- `/cs:cdo-review` — 训练数据权利、数据产品、数据资产
- `/cs:caio-review` — 模型选择、评估、AI 风险、AI 成本
- `/cs:cco-review` — GRR/NRR 拆解、客户流失根因、客户成功覆盖范围
- `/cs:vpe-review` — DORA 指标、周期时间、工程招聘漏斗、团队结构

**战略冲刺流程（5 个）：**
- `/cs:brief` → `/cs:boardroom` → `/cs:decide` → `/cs:execute` → `/cs:post-mortem`

**元功能 + 安全机制（4 个）：**
- `/cs:founder-mode` — 自动路由到合适的高管角色
- `/cs:onboard` — 创始人访谈 → `company-context.md`
- `/cs:cross-eval` — 多模型共识
- `/cs:freeze` — 对某项决策设置冷静期锁定

## 快速开始

```
/cs:onboard                          # populate company context first
/cs:office-hours "should we hire a VP Sales?"
/cs:founder-mode "runway pressure"   # auto-routes to CFO
/cs:boardroom briefs/pricing-v3.md   # full panel
```

## 架构

```
User question
   │
   ├─ Single-role? → cs-{role}-advisor agent
   │                     ↓
   │                  /cs:{role}-review command (forcing Qs)
   │                     ↓
   │                  Skill tools + references
   │                     ↓
   │                  Bottom Line + Memo
   │
   └─ Multi-role?  → /cs:boardroom
                        ↓
                     6-phase deliberation (Phase 2 isolation)
                        ↓
                     /cs:decide → decision-logger (two-layer memory)
                        ↓
                     /cs:execute → 90-day plan
```

## 集成点

- **现有的 33 个高管技能** — 对其进行封装，而非替换
- **decision-logger** — 每次执行 `/cs:decide` 都会写入此处
- **chief-of-staff** — 由代理编排的路由层
- **board-meeting** — `/cs:boardroom` 命令所运行的协议
- **llm-wiki** — 可选的持久化记忆桥接器（参见 `../../references/llm-wiki-bridge.md`）
- **executive-mentor** — 对抗式 `/em:*` 命令可以在其上无缝叠加

## 设计原则

1. **以角色声音开场和收尾，分析保持中立。**
2. **工件优先于聊天。** 每条命令都会生成一个 Markdown 工件，供下一条命令使用。
3. **董事会议的第 2 阶段相互隔离。** 在交叉质询前独立思考。
4. **优雅降级。** `/cs:cross-eval` 会回退为仅使用 Claude。
5. **无付费依赖。** 所有 Python 工具仅使用标准库。

## 参考资料

- [persona-voices.md](../../references/persona-voices.md)
- [llm-wiki-bridge.md](../../references/llm-wiki-bridge.md)
- [上级 c-level CLAUDE.md](../../../CLAUDE.md)
- [现有的同级 executive-mentor](../../../executive-mentor/)

---

**版本：** 1.0.0
**最后更新：** 2026-05-12
**状态：** 生产就绪