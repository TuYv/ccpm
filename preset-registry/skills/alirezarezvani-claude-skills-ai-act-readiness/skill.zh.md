---
name: "ai-act-readiness"
description: "/cs:ai-act-readiness <system> — EU AI Act 6-question forcing interrogation. Use during AI-system intake, before EU deployment, or during annual compliance refresh as Article 113 obligations phase in (2025-02-02 / 2025-08-02 / 2026-08-02 / 2027-08-02)."
---
# /cs:ai-act-readiness — 欧盟《人工智能法案》强制性问题

**命令：** `/cs:ai-act-readiness <system>`

欧盟《人工智能法案》合规操作员会在任何 AI 系统部署到欧盟之前对其进行压力测试。在任何欧盟市场投放、合格评定或年度合规更新之前，须回答六个引用具体条款的问题。

## 何时运行

- 在 AI 系统准入审查期间（针对每个新系统或重大变更）
- 在将 AI 系统投放欧盟市场之前
- 在签署欧盟符合性声明（第 47 条）之前
- 在年度合规更新期间（第 113 条的分阶段实施会带来新的义务）
- 当组织的角色发生变化时（根据第 25(1) 条，部署者因重大修改而成为提供者）
- 当训练算力接近 10^25 FLOPs 时（第 51 条规定的系统性风险阈值）

## 欧盟《人工智能法案》的六个问题

### 1. 第 5 条：这是否属于被禁止的 AI 实践？
**罚款：最高 3500 万欧元或全球营业额的 7%。**
- 8 类：潜意识操纵、利用弱势、社会评分、预测性警务、无针对性抓取人脸图像、在工作场所／教育机构中进行情绪识别、依据敏感属性进行生物特征分类、执法部门在公共场所进行实时远程生物特征识别
- 运行 `ai_system_risk_classifier.py`
- 如果是 → 停止。不得投放欧盟市场。除第 5(2) 条规定的例外情形外，不存在其他例外。

### 2. 第 6 条 + 附件 III：这是否属于高风险？
**符合附件 III 所列情形即构成高风险；第 6(3) 条的排除规则附有条件。**
- 8 类：生物特征、关键基础设施、教育、就业、基本服务、执法、移民、司法
- 仅当同时满足第 6(3)(a)-(d) 条且不涉及对自然人进行画像时，排除规则才适用
- 涉及画像时不得适用排除规则（第 6(3) 条最后一句）
- 运行 `ai_system_risk_classifier.py`

### 3. 第 43 条：对于高风险系统，应采用模块 A 还是模块 H？
**生物特征系统 → 默认采用模块 H（公告机构）；其他系统 → 若采用协调标准，则使用模块 A。**
- 运行 `conformity_assessment_planner.py`
- 模块 A（附件 VI）：若采用第 40 条规定的协调标准，则通过内部控制获得符合性推定
- 模块 H（附件 VII）：对于生物特征系统或缺乏相关标准的情况，采用完整的质量管理体系 + 公告机构
- 附件 IV 技术文档：投放市场前须具备 8 项内容

### 4. 第 25 条：公司扮演什么角色？
**提供者承担的义务最重；重大修改会使部署者转变为提供者。**
- 提供者（第 3(3) 条）：将系统投放市场；承担第三编规定的全部义务 + 第 73 条规定的报告义务
- 部署者（第 3(4) 条）：承担第 26 条规定的义务；若属于公共部门，还须根据第 27 条开展基本权利影响评估
- 进口商（第 3(6) 条）：根据第 23 条核验符合性
- 经销商（第 3(7) 条）：根据第 24 条核验 CE 标志
- 授权代表（第 22 条）：非欧盟提供者必须指定
- 运行 `ai_act_obligation_tracker.py`

### 5. 第 50 条：是否已履行透明度义务？
**自 2025 年 8 月 2 日起施行。**
- 第 50(1) 条：向自然人披露其正在与 AI 交互（聊天机器人、虚拟代理）
- 第 50(2) 条：将合成内容标记为由 AI 生成
- 第 50(3) 条：披露情绪识别／生物特征分类（不属于第 5 条禁止的情形）
- 第 50(4) 条：披露深度伪造内容（图像、音频、视频）由 AI 生成

### 6. 第 51-55 条：这是 GPAI 吗？是否具有系统性风险？
**GPAI 适用并行监管路径；系统性风险阈值为高于 10^25 FLOPs。**
- 第 3(63) 条：通用人工智能模型的定义
- 第 51 条：系统性风险推定（训练计算量 ≥ 10^25 FLOPs）或由欧盟委员会指定
- 第 53 条：所有 GPAI 提供者——附件 XI 技术文档、附件 XII 下游信息、版权政策、训练数据摘要
- 第 55 条：具有系统性风险的 GPAI 的额外义务——模型评估、对抗性测试、事件报告、网络安全
- 第 54 条：非欧盟 GPAI 提供者必须指定授权代表

## 工作流程

```bash
# 1. Risk classification
python ra-qm-team/skills/eu-ai-act-specialist/scripts/ai_system_risk_classifier.py systems.json

# 2. If high-risk: conformity assessment
python ra-qm-team/skills/eu-ai-act-specialist/scripts/conformity_assessment_planner.py system.json

# 3. Per-role obligation matrix
python ra-qm-team/skills/eu-ai-act-specialist/scripts/ai_act_obligation_tracker.py roles.json

# 4. Cross-framework reuse (ISO 42001 etc.)
python ../../skills/compliance-os/scripts/cross_framework_mapper.py program.json
```

## 输出格式

```markdown
# EU AI Act Readiness: <system>
**Date:** YYYY-MM-DD
**Article Citations:** Every verdict below cites the specific Article.

## The Decision Being Made
[classify | conformity-route | obligation-scope | annual-refresh]

## Risk Classification
- Tier: prohibited | high_risk | limited_risk | minimal_risk
- Citation: Article X(Y) + Annex Z if applicable
- Rationale: <Article-cited rationale>
- GPAI: yes/no
- Systemic-risk GPAI: yes/no (per Article 51 10^25 FLOPs threshold)

## Conformity Assessment (if high-risk)
- Module: A | A_with_caveats | H | sectoral
- Citation: Article 43 + Annex VI/VII
- Notified body required: yes | no | optional
- Annex IV pack status: complete | in-progress | not-started

## Obligation Matrix
- Total obligations: N
- By deadline phase: 2025-02-02=A, 2025-08-02=B, 2026-08-02=C, 2027-08-02=D
- Highest-priority unmet obligation: <Article + description>

## Transparency (Article 50)
- 50(1) interaction disclosure: yes | no
- 50(2) synthetic content marking: yes | no | NA
- 50(3) emotion recognition disclosure: yes | no | NA
- 50(4) deepfake disclosure: yes | no | NA

## Cross-Framework Reuse
- ISO 42001 evidence applicable to Article 17 QMS: yes/no
- ISO 27001 evidence applicable to Article 15 cybersecurity: yes/no
- GDPR DPIA usable for Article 27 FRIA: yes/no

## Verdict
🟢 READY-FOR-EU | 🟡 GAPS-IDENTIFIED | 🔴 NOT-READY | 🚫 PROHIBITED

## Top 3 Actions
[3 concrete next steps with owner + Article-tied deadline]

## Legal Review Required
[Article-level ambiguities flagged for outside counsel: novel cases, GPAI threshold disputes, Article 5 boundary cases, Article 25 substantial-modification questions]
```

## 路由

- `/cs:compliance-readiness` — 用于多框架视图（与 ISO 42001 + GDPR 结合使用）
- `/cs:aims-audit` — 用于深入审查 ISO 42001
- `/cs:caio-review` — 用于 AI 战略高管决策
- `/cs:gc-review` — 用于新颖案例的法律审查（GPAI 阈值、第 5 条边界、实质性修改）
- `/cs:decide` — 用于记录结论
- `/cs:freeze 30` — 用于欧盟上线承诺（监管风险敞口）

## 相关内容

- Agent：[`cs-ai-act-compliance`](../../agents/cs-ai-act-compliance.md)
- Skill：[`eu-ai-act-specialist`](../../../ra-qm-team/skills/eu-ai-act-specialist/SKILL.md)
- 相邻项：`../../skills/compliance-os/`、`../aims-audit/`、`../compliance-readiness/`、`../../../ra-qm-team/skills/gdpr-dsgvo-expert/`

---

**版本：** 1.0.0