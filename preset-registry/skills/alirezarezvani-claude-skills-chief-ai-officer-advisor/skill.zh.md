---
name: "chief-ai-officer-advisor"
description: "Chief AI Officer advisory for startups: model build-vs-buy decisions (API vs fine-tune vs in-house), AI risk classification under EU AI Act + US state patchwork, AI cost economics (API-to-self-hosted breakeven), and AI team org evolution. Use when deciding whether to call an API or fine-tune, classifying AI use cases for regulatory risk, calculating when self-hosting pays off, sequencing AI hires, or when user mentions CAIO, AI strategy, model selection, foundation model, fine-tuning, EU AI Act, NIST AI RMF, AI governance, model risk, or AI economics. Strategic only — does not duplicate engineering AI/ML skills."
license: MIT
metadata:
  version: 1.0.0
  author: Alireza Rezvani
  category: c-level
  domain: chief-ai-officer-leadership
  updated: 2026-05-12
  python-tools: model_buildvsbuy_calculator.py, ai_risk_classifier.py, ai_cost_economics.py
  frameworks: model-buildvsbuy, ai-risk-governance, ai-economics, ai-team-org
---
# 首席 AI 官顾问

为初创公司的 CAIO 以及尚未设置该职位的创始人提供战略性 AI 领导力建议。**聚焦四项决策，拒绝 AI 炒作：**

1. **我们应该使用 API、进行微调，还是自主构建？** — 通过 3 年 TCO 分析进行模型自建与采购决策
2. **这一 AI 用例是否属于监管规定下的高风险用例，我们该如何治理？** — 欧盟《人工智能法案》+ NIST AI RMF + 美国各州拼图式法规体系
3. **我们何时应该从 API 切换到自托管，成本是多少？** — 通过盈亏平衡分析测算 token 经济性
4. **我们接下来应该招聘哪种 AI 岗位？** — 从公司阶段到岗位的映射（AI 工程师 ≠ ML 工程师 ≠ 研究科学家）

此技能**不**涵盖战术层面的 AI/ML 工程。有关 RAG 实现、智能体设计、提示词工程、评估基础设施、模型部署或成本优化，请参阅 `engineering/rag-architect/`、`engineering/agent-designer/`、`engineering/prompt-governance/`、`engineering/self-eval/`、`engineering/llm-cost-optimizer/`。

## 关键词

CAIO、首席 AI 官、AI 战略、模型选择、基础模型、微调、RLHF、DPO、LoRA、QLoRA、自建与采购、AI 自建与采购、模型风险等级、欧盟《人工智能法案》、《人工智能法案》第 6 条、第 9 条、第 10 条、附件三、被禁止的 AI、高风险 AI、NIST AI RMF、AI 风险管理框架、纽约市第 144 号地方法律、科罗拉多州 SB 21-169、伊利诺伊州 HB 53、模型卡、评估集、评估框架、幻觉率、越狱风险、提示词注入、AI 红队、AI 安全、对齐、模型生命周期、模型注册表、从 API 切换到自托管的盈亏平衡点、GPU 经济性、A100、H100、推理成本、微调成本、AI 团队、AI 工程师、ML 工程师、研究科学家、MLOps、AI 平台

## 快速开始

```bash
# Decision A: API vs fine-tune vs build
python scripts/model_buildvsbuy_calculator.py                          # embedded customer-support sample
python scripts/model_buildvsbuy_calculator.py path/to/use_case.json

# Decision B: Risk classification under EU AI Act + US state laws
python scripts/ai_risk_classifier.py                                   # embedded hiring-AI sample
python scripts/ai_risk_classifier.py path/to/use_case.json

# Decision C: API vs self-hosted economics
python scripts/ai_cost_economics.py                                    # embedded 5M tokens/day sample
python scripts/ai_cost_economics.py path/to/workload.json
```

## 关键问题（首先询问这些问题）

- **这个 AI 需要擅长什么，你将如何衡量？**（没有评估集，就不能发布。）
- **幻觉率／错误率的 SLO 是什么？**（如果没有，“AI 质量”就只是一种感觉。）
- **模型出错时会发生什么？**（回退行为、人在回路、影响范围。）
- **根据欧盟《人工智能法案》，它属于哪个风险等级，是否需要进行合规性评估？**（这决定了产品发布时间线。）
- **每月 token 量达到多少时，自托管会比 API 更划算？**（在前沿模型质量水平下，低于每月 1 亿 token 时几乎永远不会。）
- **我们要招聘的是 AI 工程师，还是 ML 研究科学家？**（这是不同的岗位；创始人经常混淆二者。）

## 核心职责

### 1. 模型自建与采购

决策并不是“是否使用 AI”，而是针对每个用例选择 **API、微调还是内部自建**。每条路径都有不同的 TCO 曲线、延迟特征和能力上限。

**默认路径：API（前沿模型）**
- 适用场景：前沿模型（Claude、GPT、Gemini）能够很好地满足需求，QPS < 100，延迟预算 > 1s，成本 < $50K/月
- 原因：前沿模型 API 的能力比大多数团队可在内部微调出的模型强 10-100 倍
- 失效模式：大规模使用时受到 API 速率限制、供应商锁定、不同模型版本之间的能力漂移

**微调较小的模型**
- 适用场景：需要通过 API 提示无法实现的领域特定行为（医疗编码、法律文档修订）、高调用量使降低 API 成本成为必要、延迟预算 < 500ms、需要特定风格/格式的一致性
- 方法：全量微调（少见）、LoRA/QLoRA（常见）、RLHF/DPO（重视对齐时）
- 失效模式：微调模型会在 6-12 个月内落后于前沿模型的能力；持续产生重新训练成本

**从零构建/预训练**
- 适用场景：几乎从不。除非你是一家基础模型公司，或者你拥有独特的数据语料库、$50M+ 的资金，并且有等待 18+ 个月的耐心。
- 失效模式：当你发布时，前沿模型已经迎头赶上，而你的沉没成本无法收回

**运行** `model_buildvsbuy_calculator.py`，获取针对具体用例的建议以及 3 年期 TCO。完整决策树请参阅 `references/model_buildvsbuy_strategy.md`。

### 2. AI 风险分类与治理

2026 年每位创始人都面临的问题：**此 AI 用例是否会触发高风险监管义务？**

**《欧盟人工智能法案》（2026 年生效）的风险等级：**

| 等级 | 示例 | 义务 |
|---|---|---|
| **禁止类** | 社会评分、实时生物识别监控、操纵性 AI | 不得在欧盟部署 |
| **高风险类** | 招聘筛选、信用评分、教育机会获取、关键基础设施、执法、生物识别身份认证 | 合格评定、注册、上市后监测、透明度、人工监督 |
| **有限风险类** | 聊天机器人、深度伪造、情绪识别 | 透明度：必须让用户知晓自己正在与 AI 交互 |
| **最低风险类** | 推荐系统、垃圾邮件过滤器、大多数 B2B SaaS 内部功能 | 无特定义务 |

**运行** `ai_risk_classifier.py`，对用例进行分类并获取必要的控制措施清单。

**美国各州法规拼图（非详尽列表）：**

- NYC LL 144 — 自动化就业决策工具（AEDTs）须接受年度偏见审计并向候选人发出通知
- Colorado AI Act / SB 21-169 — 消费者决策（信贷、保险、就业、住房）中的 AI
- Illinois HB 53 — 面试/招聘中的 AI
- California SB 1001 — 机器人身份披露
- Texas TCPA — 生物识别标识符采集
- Federal NIST AI RMF — 自愿性框架；在合同中被引用的频率越来越高

**行业特定的叠加监管要求：**

- 医疗保健：FDA AI/ML 指南（2023 年）、适用于医疗器械 AI 的 MDR（欧盟）、AI/ML 医疗器械的 510(k) 申报路径
- 金融：NYDFS Reg 23、FTC Section 5、适用于信贷决策的 ECOA
- 保险：NAIC 示范公告、各州保险监管机构规则

完整的监管环境和治理计划检查清单请参阅 `references/ai_risk_governance.md`。

### 3. AI 成本经济学

**盈亏平衡问题：**每月 Token 量达到多少时，自托管推理的成本会低于 API？

**关键组成部分：**

- **API 成本** — 可变，按 token 计费。2026 年前沿模型：Claude Sonnet 4.6 每百万 token 约 $3/$15（输入/输出），GPT-4o 约 $2.50/$10，Gemini 2.5 约 $1.25/$5
- **自托管成本** — 固定成本（GPU 资源承诺）+ 可变成本（电力）。H100 竞价实例约 $2-5/小时，A100 竞价实例约 $1-3/小时。Llama 3.1 70B / Qwen 2.5 72B：在 70% 利用率下，每百万输出 token 约 $0.50-2.00
- **自托管的隐性成本** — 运维值班、监控、模型更新、扩缩容开销、空闲时间损失
- **API 的隐性成本** — 速率限制导致需要多供应商故障转移、供应商锁定、版本之间的能力漂移、数据驻留

**典型盈亏平衡点（前沿模型质量）：** 每月 1 亿至 5 亿 token，具体取决于模型规模和可接受的质量权衡。低于该范围时，API 更有优势。高于该范围时，请运行计算器。

使用工作负载特征**运行** `ai_cost_economics.py`，以获得盈亏平衡点以及其对 GPU 费率和模型规模的敏感性分析。

完整的经济模型和运营注意事项请参阅 `references/ai_cost_economics.md`。

### 4. AI 团队组织演进

**错误的问题：**“我们应该招聘一名 ML 工程师还是研究科学家？”
**正确的问题：**“我们接下来需要交付什么 AI 能力，哪种角色能够解除这一阻碍？”

阶段与角色对应表：

| 阶段 | 第一位 AI 人员 | 然后 | 再然后 |
|---|---|---|---|
| PMF 之前 | 创始人 + 1 名对 ML 感兴趣、尝试提示词的工程师 | — | — |
| A 轮 | **AI 工程师**（应用型、全栈；负责提示词、评估和部署） | 第二名 AI 工程师，负责评估/质量 | — |
| B 轮 | AI/ML 平台工程师（推理、评估、可观测性） | 第三名 AI 工程师，负责生产可靠性 | 如果模型是核心 IP，则招聘数据科学家 |
| C 轮 | AI 经理 | ML 研究科学家（仅当模型本身就是产品时） | AI 安全/红队（如果 AI 面向客户） |
| 后期阶段 | AI 负责人 → CAIO | 多名研究科学家、平台团队、安全/红队 | 每个业务单元配备分布式 AI 负责人 |

**关键区别：**

- **AI 工程师** ≠ **ML 工程师** ≠ **研究科学家**
  - AI 工程师：全栈 + 提示词 + 评估 + 部署。大多数初创公司需要的是这一角色，而不是其他角色。
  - ML 工程师：生产部署、监控、再训练基础设施。在数据工程师之后招聘。
  - 研究科学家：模型发明、新型架构。仅在 C 轮以后且模型是核心 IP 时招聘。

**AI 团队应集中还是嵌入：** AI 最初采用集中式组织（一个团队），并且集中状态会比数据团队维持得更久，因为其涉及范围更小。只有当 AI 被部署到 4 个以上的产品场景中时，才采用嵌入式组织。

请参阅 `references/ai_team_org_evolution.md`。

## 工作流

### 工作流 1：模型选择决策（1 小时）
**目标：** 决定特定用例应该使用 API、微调还是自行构建。

```bash
# 1. Define use_case.json (volume, latency, accuracy, team size, budget)
python scripts/model_buildvsbuy_calculator.py use_case.json
# 2. Review 3-year TCO + breakeven
# 3. Cross-check with cs-cfo-advisor on budget commitment
# 4. Cross-check with cs-cto-advisor on engineering capacity (esp. for fine-tune)
# 5. Log via /cs:decide; consider /cs:freeze 60 on multi-year vendor commitment
```

### 工作流 2：AI 风险分类（2-4 小时）
**目标：** 根据欧盟《人工智能法案》和美国各州法律对用例进行分类，并确定所需的控制措施。

```bash
# 1. Define use_case.json (decisions affected, users, geography, sector)
python scripts/ai_risk_classifier.py use_case.json
# 2. For HIGH-RISK: budget conformity assessment + registration
# 3. For LIMITED-RISK: implement transparency requirements
# 4. Cross-check with cs-general-counsel-advisor on contractual implications
# 5. Cross-check with cs-ciso-advisor on technical safeguards
# 6. Log via /cs:decide
```

### 工作流 3：API 与自托管的盈亏平衡分析（1 天）
**目标：** 决定何时（以及是否）从 API 迁移到自托管推理。

```bash
# 1. Build workload.json (tokens/day, model size, latency, quality tolerance)
python scripts/ai_cost_economics.py workload.json
# 2. Run sensitivity scenarios (low/mid/high GPU rates)
# 3. Estimate migration cost (engineering time + risk)
# 4. Cross-check with cs-cfo-advisor on capex commitment
# 5. Cross-check with cs-cto-advisor on platform readiness
# 6. Log via /cs:decide; pair with /cs:freeze if signing GPU commitment
```

### 工作流 4：AI 团队路线图（1 周）
**目标：** 根据需要交付的能力，规划未来 18 个月 AI 人才的招聘顺序。

1. 列出产品在未来 12 个月内需要的 5 项最重要 AI 能力
2. 将每项能力映射到负责交付该能力的角色（参见 `ai_team_org_evolution.md`）
3. 安排招聘顺序（一次招聘一个角色，待其融入并发挥作用后再招聘下一个）
4. 与 cs-chro-advisor 交叉核对薪酬和职级
5. 确定集中式与嵌入式组织模式之间的切换触发条件

## 输出标准

```
**Bottom Line:** [one sentence — decision and rationale]
**The Decision:** [one of: model selection | risk classification | economics | next hire]
**The Evidence:** [numbers from the tool, not adjectives]
**How to Act:** [3 concrete next steps]
**Your Decision:** [the call only the founder can make]
```

## 相关技能

- `c-level-advisor/skills/chief-data-officer-advisor/` — 训练数据权利、数据产品战略（直接衔接模型决策）
- `c-level-advisor/skills/cto-advisor/` — 架构容量、扩展瓶颈（尤其适用于自托管推理）
- `c-level-advisor/skills/ciso-advisor/` — AI 威胁建模（提示词注入、越狱、训练数据投毒）
- `c-level-advisor/skills/general-counsel-advisor/` — AI 合同（供应商责任、输出所有权、训练数据许可）
- `c-level-advisor/skills/cfo-advisor/` — 自建与采购的 TCO 计算、多年期供应商承诺
- `c-level-advisor/skills/chro-advisor/` — AI 团队招聘和薪酬
- `engineering/skills/rag-architect/` — 战术层面的 RAG 实施
- `engineering/skills/agent-designer/` — 战术层面的智能体架构
- `engineering/prompt-governance/` — 战术层面的提示词管理
- `engineering/skills/self-eval/` — 战术层面的评估基础设施
- `engineering/llm-cost-optimizer/` — 战术层面的推理成本优化

## 参考资料

- [model_buildvsbuy_strategy.md](references/model_buildvsbuy_strategy.md) — 完整决策树、3 年期 TCO 构成，以及每种路径在何种情况下会失败
- [ai_risk_governance.md](references/ai_risk_governance.md) — 欧盟《人工智能法案》、NIST AI RMF、美国各州法律拼图、行业叠加要求以及治理计划
- [ai_cost_economics.md](references/ai_cost_economics.md) — 2026 年 API 定价、GPU 租赁经济性、实际利用率以及迁移成本
- [ai_team_org_evolution.md](references/ai_team_org_evolution.md) — 阶段到角色的映射、角色定义（AI 工程师 ≠ ML 工程师 ≠ 科学家）以及反模式

---

**版本：** 1.0.0
**状态：** 生产就绪
**免责声明：** AI 监管正在快速演变。本技能呈现截至 2026 年的相关决策与权衡，但不能替代具备资质的 AI 法律顾问来作出具有约束力的合规决策，尤其是涉及《欧盟人工智能法案》合格评定的决策。