---
name: differential-review
description: "Performs security-focused differential review of code changes. Adapts analysis depth to codebase size, uses git blame for context, calculates blast radius by counting callers, checks test coverage of modified code, and generates a markdown report. Use when reviewing a PR, commit, or diff for security vulnerabilities, checking whether a change re-introduces a previously fixed bug, asking what else a change could break, or finding which modified code has no test covering it."
allowed-tools: Read Write Grep Glob Bash
---
# 差异安全审查

面向 PR、提交和差异的安全专项代码审查。

## 核心原则

1. **风险优先**：聚焦认证、加密、价值转移、外部调用
2. **基于证据**：每项发现都要有 git 历史、行号、攻击场景支撑
3. **自适应**：根据代码库规模调整
4. **诚实**：明确说明覆盖范围限制和置信度
5. **以产出为导向**：始终生成完整的 markdown 报告文件

---

## 合理化借口（不可跳过）

| 合理化借口 | 为什么它是错的 | 必须采取的行动 |
|-----------------|----------------|-----------------|
| "小 PR，快速过一遍就行" | Heartbleed 漏洞只有 2 行代码 | 按风险而非规模分类 |
| "我熟悉这个代码库" | 熟悉会滋生盲点 | 建立明确的基线上下文 |
| "查 git 历史太耗时" | 历史会揭示回归问题 | 绝不跳过 Phase 1 |
| "影响范围一目了然" | 你会漏掉传递性调用方 | 进行定量计算 |
| "没有测试 = 不关我的事" | 测试缺失 = 风险评级上调 | 在报告中标记，提升严重程度 |
| "只是重构，没有安全影响" | 重构会破坏不变量 | 在证明为 LOW 之前按 HIGH 分析 |
| "我口头说明一下就行" | 没有产出物 = 发现会丢失 | 始终撰写报告 |

---

## 快速参考

### 代码库规模策略

| 代码库规模 | 策略 | 方法 |
|---------------|----------|----------|
| SMALL（<20 个文件）| DEEP | 阅读所有依赖，完整 git blame |
| MEDIUM（20-200）| FOCUSED | 1 跳依赖，优先文件 |
| LARGE（200+）| SURGICAL | 仅关键路径 |

### 风险级别触发条件

| 风险级别 | 触发条件 |
|------------|----------|
| HIGH | 认证、加密、外部调用、价值转移、移除校验 |
| MEDIUM | 业务逻辑、状态变更、新的公共 API |
| LOW | 注释、测试、UI、日志 |

---

## 工作流概览

```
Pre-Analysis → Phase 0: Triage → Phase 1: Code Analysis → Phase 2: Test Coverage
    ↓              ↓                    ↓                        ↓
Phase 3: Blast Radius → Phase 4: Deep Context → Phase 5: Adversarial → Phase 6: Report
```

---

## 决策树

**开始一次审查？**

```
├─ Need detailed phase-by-phase methodology?
│  └─ Read: methodology.md
│     (Pre-Analysis + Phases 0-4: triage, code analysis, test coverage, blast radius)
│
├─ Analyzing HIGH RISK change?
│  ├─ Read: adversarial.md
│  │  (Phase 5: Attacker modeling, exploit scenarios, exploitability rating)
│  └─ Or delegate to: differential-review:adversarial-modeler agent
│     (Autonomous attacker modeling with concrete exploit scenarios)
│
├─ Writing the final report?
│  └─ Read: reporting.md
│     (Phase 6: Report structure, templates, formatting guidelines)
│
├─ Looking for specific vulnerability patterns?
│  └─ Read: patterns.md
│     (Regressions, reentrancy, access control, overflow, etc.)
│
└─ Quick triage only?
   └─ Use Quick Reference above, skip detailed docs
```

---

## 代理

**`differential-review:adversarial-modeler`** — 为 HIGH RISK 代码变更构建攻击者视角模型和利用场景。遵循 5 步对抗性方法论（攻击者模型、攻击向量、可利用性评级、利用场景、基线交叉引用），并生成结构化的漏洞报告。当高风险变更需要进行 Phase 5 分析时，将任务委派给该代理，并把带命名空间的完整名称作为 `subagent_type` 传入——单独的 `adversarial-modeler` 未注册，分发时会在运行时失败。

---

## 质量检查清单

交付前：

- [ ] 已分析所有变更文件
- [ ] 已对被移除的安全代码执行 git blame
- [ ] 已为 HIGH 风险计算影响范围
- [ ] 攻击场景具体（而非泛泛而谈）
- [ ] 发现引用了具体的行号 + 提交
- [ ] 已生成报告文件
- [ ] 已向用户发送摘要通知

---

## 集成

**audit-context-building 技能：**
- Pre-Analysis：构建基线上下文
- Phase 4：对 HIGH RISK 变更进行深度上下文分析

**issue-writer 技能：**
- 将发现转化为正式审计报告
- 命令：`issue-writer --input DIFFERENTIAL_REVIEW_REPORT.md --format audit-report`

---

## 使用示例

### 快速分诊（小型 PR）
```
Input: 5 file PR, 2 HIGH RISK files
Strategy: Use Quick Reference
1. Classify risk level per file (2 HIGH, 3 LOW)
2. Focus on 2 HIGH files only
3. Git blame removed code
4. Generate minimal report
Time: ~30 minutes
```

### 标准审查（中型代码库）
```
Input: 80 files, 12 HIGH RISK changes
Strategy: FOCUSED (see methodology.md)
1. Full workflow on HIGH RISK files
2. Surface scan on MEDIUM
3. Skip LOW risk files
4. Complete report with all sections
Time: ~3-4 hours
```

### 深度审计（大型、关键变更）
```
Input: 450 files, auth system rewrite
Strategy: SURGICAL + audit-context-building
1. Baseline context with audit-context-building
2. Deep analysis on auth changes only
3. Blast radius analysis
4. Adversarial modeling
5. Comprehensive report
Time: ~6-8 hours
```

---

## 何时不使用此技能

- **全新编写的代码**（没有可对比的基线）
- **仅文档变更**（无安全影响）
- **格式化/lint**（美化性变更）
- **用户明确只要求快速摘要**（用户接受风险）

对于这些情况，请改用标准代码审查。

---

## 危险信号（停下并调查）

**立即升级的触发条件：**
- 从 "security"、"CVE" 或 "fix" 提交中移除的代码
- 移除了访问控制修饰符（onlyOwner、internal → external）
- 移除了校验且未替换
- 新增未加检查的外部调用
- 高影响范围（50+ 调用方）+ HIGH 风险变更

即使在快速分诊中，这些模式也需要进行对抗性分析。

---

## 获得最佳效果的技巧

**要做：**
- 从对被移除代码执行 git blame 开始
- 尽早计算影响范围以确定优先级
- 生成具体的攻击场景
- 引用具体的行号和提交
- 诚实说明覆盖范围的限制
- 始终生成输出文件

**不要：**
- 跳过 git 历史分析
- 做出没有证据的泛泛发现
- 在时间有限时声称完成了完整分析
- 忘记检查测试覆盖
- 遗漏高影响范围的变更
- 仅在聊天中输出报告（必须生成文件）

---

## 配套文档

- **[methodology.md](methodology.md)** - 详细的分阶段工作流（Phase 0-4）
- **[adversarial.md](adversarial.md)** - 攻击者建模与利用场景（Phase 5）
- **[reporting.md](reporting.md)** - 报告结构与格式（Phase 6）
- **[patterns.md](patterns.md)** - 常见漏洞模式参考

---

**首次使用者：** 从 [methodology.md](methodology.md) 入手，了解完整工作流。

**有经验的用户：** 使用本页的快速参考和决策树，直接导航到所需内容。
