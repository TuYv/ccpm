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

通过斜杠命令和角色代理提供的虚拟 C-suite。

## 关键词

创始人模式、虚拟 C-suite、高管团队、董事会会议室、办公时间、CFO 评审、CMO 评审、战略冲刺、决策记录、跨模型共识、角色代理、幕僚长、强制性问题

## 此插件提供的功能

### 13 个 cs-* 代理（位于 `agents/` 中）

每个代理都封装了一个现有的 c-level 技能，并增加了：
- 独特的认知语调（重视数字的怀疑论者、叙事优先等）
- 针对该角色的强制性问题
- 与技能 Python 工具关联的工作流编排
- 输出模板：底线 → 具体内容 → 原因 → 如何行动 → 你的决策

有关语调规范，请参阅 `../../references/persona-voices.md`。

### 21 个 `/cs:*` 斜杠命令（位于 `skills/` 中）

**强制性问题办公时间（12 个）：**
- `/cs:office-hours` — YC 风格的 6 个问题初始信息收集
- `/cs:cfo-review` — 单位经济模型、现金 runway、股权稀释
- `/cs:cmo-review` — ICP、CAC 回收期、定位
- `/cs:cpo-review` — RICE、JTBD、北极星指标、PMF
- `/cs:cro-review` — 管道覆盖率、赢单率、NRR
- `/cs:cto-review` — 架构风险、扩展瓶颈
- `/cs:ciso-review` — 威胁模型、影响范围、合规
- `/cs:gc-review` — 合同、知识产权、监管、条款清单
- `/cs:cdo-review` — 训练数据权利、数据产品、数据资产
- `/cs:caio-review` — 模型选择、评估、AI 风险、AI 成本
- `/cs:cco-review` — GRR/NRR 分解、流失根因、客户成功覆盖率
- `/cs:vpe-review` — DORA 指标、周期时间、工程招聘漏斗、团队结构

**战略冲刺流程（5 个）：**
- `/cs:brief` → `/cs:boardroom` → `/cs:decide` → `/cs:execute` → `/cs:post-mortem`

**元命令与安全（4 个）：**
- `/cs:founder-mode` — 自动路由至合适的 C-level 角色
- `/cs:onboard` — 创始人访谈 → `company-context.md`
- `/cs:cross-eval` — 多模型共识
- `/cs:freeze` — 对决策进行冷静期锁定

## 快速开始

```
/cs:onboard                          # 先填充公司上下文
/cs:office-hours "should we hire a VP Sales?"
/cs:founder-mode "runway pressure"   # 自动路由至 CFO
/cs:boardroom briefs/pricing-v3.md   # 完整小组
```

## 架构

```
用户问题
   │
   ├─ 单一角色？ → cs-{role}-advisor 代理
   │                     ↓
   │                  /cs:{role}-review 命令（强制性问题）
   │                     ↓
   │                  技能工具 + 参考资料
   │                     ↓
   │                  底线 + 备忘录
   │
   └─ 多个角色？  → /cs:boardroom
                        ↓
                     6 阶段审议（第 2 阶段隔离）
                        ↓
                     /cs:decide → decision-logger（双层记忆）
                        ↓
                     /cs:execute → 90 天计划
```

## 集成点

- **现有的 33 个 c-level 技能** — 封装而非替换
- **decision-logger** — 每次 `/cs:decide` 都会写入此处
- **chief-of-staff** — 代理负责编排的路由层
- **board-meeting** — `/cs:boardroom` 命令运行的协议
- **llm-wiki** — 可选的持久化记忆桥接（参见 `../../references/llm-wiki-bridge.md`）
- **executive-mentor** — 对抗式的 `/em:*` 命令可无缝叠加其上

## 设计原则

1. **语音在开头和结尾，分析保持中立。**
2. **产物优先于聊天。** 每个命令都会生成一个 Markdown 产物，供下一个命令使用。
3. **董事会中的阶段 2 隔离。** 在交叉质询之前进行独立思考。
4. **优雅降级。** `/cs:cross-eval` 会回退到仅使用 Claude。
5. **不依赖付费组件。** 所有 Python 工具仅使用标准库。

## 参考资料

- [persona-voices.md](../../references/persona-voices.md)
- [llm-wiki-bridge.md](../../references/llm-wiki-bridge.md)
- [上级 c-level CLAUDE.md](../../../CLAUDE.md)
- [现有的 executive-mentor 同级目录](../../../c-level-advisor/executive-mentor/)

---

**版本：** 1.0.0
**最后更新：** 2026-05-12
**状态：** 已准备好投入生产使用。