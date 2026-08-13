---
name: "aims-audit"
description: "/cs:aims-audit <scope> — ISO/IEC 42001 AIMS internal-audit 6-question forcing interrogation. Use before certification stage 1, before annual internal audit cycles, or when onboarding a new AI system into an existing AIMS."
---
# /cs:aims-audit — AIMS ISO 42001 强制审查问题

**命令：** `/cs:aims-audit <scope>`

ISO 42001 AIMS 专家会对所有 AI 管理体系工作进行严格检验。在作出任何认证承诺、启动内部审核周期或将新系统纳入管理之前，必须回答以下六个问题。

## 何时运行

- ISO 42001 第一阶段认证审核之前
- 年度内部审核周期（第 9.2 条款）开始之前
- 将新 AI 系统纳入现有 AIMS 范围时
- AI 风险登记册超过 6 个月未更新时
- 模型发生重大变更后（根据第 6.1.2 条款重新评估风险）
- 审核发现表明 AIMS / ISMS / QMS 之间存在重复时

## 六个 AIMS 问题

### 1. AIMS 范围声明是否列出了每个 AI 系统？
**遗漏范围 = 认证审核发现。**
- 包括：嵌入式模型、第三方 AI 服务、“实验性”生产系统
- 运行 `aims_gap_analyzer.py` 以验证第 4.3 条款的证据
- “我们使用的 SaaS 供应商添加的 AI 功能” = 如果这些功能影响公司的服务，则属于范围之内

### 2. AI 政策是否承诺合法使用、有益目的、人工监督以及持续改进？
**缺少其中任何一项 = 第一阶段的严重不符合项。**
- AI 政策并非信息安全政策——它有独立的实质性内容
- 参见 ISO 42001 附录 A.2.2 和第 5.2 条款
- 营销文案式的“AI 伦理”无法通过审核

### 3. 风险登记册的覆盖范围如何，哪些附录 A 控制措施用于应对各项风险？
**识别风险但未映射控制措施 = 不符合第 6.1.3 条款。**
- 按照 ISO 23894 方法运行 `ai_risk_register_builder.py`
- 每项高风险/关键风险必须关联 ≥ 1 项附录 A 控制措施
- “残余风险结论：`additional_treatment_required`”必须在第一阶段之前关闭

### 4. 自上次模型重大变更以来，是否重新执行了 AI 风险评估？
**概念漂移并非一次性事件。**
- 《欧盟 AI 法案》第 9 条和 ISO 42001 第 6.1.2 条款均要求进行迭代式风险评估
- 重大变更 = 使用新数据重新训练、微调、架构变更、部署环境变更
- 如果“我们在 18 个月前做过评估，此后就再也没动过”，则 AIMS 已失效

### 5. 第 9.2 条款要求的内部审核计划是什么，是否遵守了审核员独立性要求？
**没有第 9.2 条款要求的计划，AIMS 就不完整。**
- 使用范围、审核员和以往审核发现运行 `aims_audit_scheduler.py`
- 在滚动的 3 年周期内审核每个条款及每项适用的附录 A 控制措施
- 同一审核员不能审核自己的工作
- 如果与 13485 审核方案集成，请与 cs-quality-regulatory 进行交叉核对

### 6. AIMS 是否已与现有 ISMS / QMS 集成，还是并行构建？
**并行体系 = 持续维护成本增加 5 倍。**
- 第 4 至第 10 条款中 60% 的证据可复用 ISO 27001 / 13485 的证据，并附加 AI 范围
- CAPA 闭环应当只有一个，其中包含带 AI 标签的不符合项，而非单独建立闭环
- 有关复用映射，请参见 `cross_framework_mapping_ai.md`
- 与 cs-ciso-advisor 交叉核对 ISO 27001 对齐情况

## 工作流程

```bash
# 1. AIMS gap analysis
python ra-qm-team/skills/iso42001-specialist/scripts/aims_gap_analyzer.py evidence.json

# 2. AI risk register
python ra-qm-team/skills/iso42001-specialist/scripts/ai_risk_register_builder.py risks.json

# 3. Internal audit plan
python ra-qm-team/skills/iso42001-specialist/scripts/aims_audit_scheduler.py audit_scope.json

# 4. Cross-framework reuse map (via compliance-os)
python ../../skills/compliance-os/scripts/cross_framework_mapper.py program.json
```

## 输出格式

```markdown
# AIMS Audit: <scope>
**Date:** YYYY-MM-DD

## The Decision Being Made
[gap-closure | risk-treatment | audit-scope | new-system-onboarding]

## Gap Analysis (Clauses 4-10)
- Weighted coverage: X%
- Critical gaps: N
- Major gaps: M
- Certification readiness: ready | stage_2_candidate | not_ready

## AI Risk Register
- Total risks: N
- By severity: critical=X, high=Y, medium=Z, low=W
- Requires additional treatment: K
- Top risk requiring action: <description>

## Clause 9.2 Audit Plan
- 12-month coverage: clauses=X, controls=Y
- Auditor independence: clean | issues
- Prior-year follow-up: scheduled in Q1

## Cross-Framework Reuse
- ISO 27001 evidence reused: % of AIMS Clauses 4-10
- 13485 evidence reused: % (if applicable)
- Net-new for AIMS: % (mostly Annex A)

## Verdict
🟢 STAGE-1-READY | 🟡 CLOSE-CRITICALS-FIRST | 🔴 NOT-READY

## Top 3 Actions
[3 concrete next steps with owner + date]
```

## 路由

- `/cs:compliance-readiness` — 用于多框架视图
- `/cs:ai-act-readiness` — 如果欧盟《人工智能法案》也适用
- `/cs:caio-review` — 用于 AI 战略的高管决策
- `/cs:ciso-review` — 用于 ISO 27001 跨框架对齐
- `/cs:decide` — 用于记录结论
- `/cs:freeze 30` — 用于认证承诺

## 相关内容

- 智能体：[`cs-aims-iso42001`](../../agents/cs-aims-iso42001.md)
- 技能：[`iso42001-specialist`](../../../ra-qm-team/skills/iso42001-specialist/SKILL.md)
- 相邻内容：`../../skills/compliance-os/`、`../ai-act-readiness/`、`../compliance-readiness/`

---

**版本：** 1.0.0