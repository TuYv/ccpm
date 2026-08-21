---
name: common-skill-creator
description: "Standardizes the creation and evaluation of high-density Agent Skills (Claude, Cursor, Windsurf). Ensures skills achieve high Activation (specificity/completeness) and Implementation (conciseness/actionability) scores. Use when: writing or auditing SKILL.md, improving trigger accuracy, or refactoring skills to reduce redundancy and maximize token ROI."
metadata:
  triggers:
    files:
      - "SKILL.md"
      - "evals/evals.json"
    keywords:
      - create skill
      - audit skill
      - trigger rate
      - optimize description
---
# Agent Skill 创建标准

## **优先级：P0（关键）**

适用于**此注册表中的每个 skill**。最大化 **Token ROI**。SKILL.md 中的每一行都必须提供具体的流程价值。**激活**（如何触发）和**实现**（如何提供帮助）是首要质量指标。

## 三级加载系统

- **第 1 级** Frontmatter：`name` + `description`（激活锚点），≤100 词。
- **第 2 级** SKILL.md 正文：核心规则 + 工作流（实现核心），≤100 行。
- **第 3 级** references/：详细示例、schema 和 "TESTS.md"（按需加载）。

## 工作流（新建或现有 Skill）
**新建 skill：**
1. **研究** — 通过 web 搜索领域最佳实践、检查清单和标准；提取关键术语 → 触发条件，工作流 → 指南，错误 → 反模式。参见 [Web 搜索研究](references/web-search-research.md)。
2. **捕获意图** — 它是什么，何时触发，预期输出格式是什么？
3. **起草 SKILL.md** — 使用 [TEMPLATE.md](references/TEMPLATE.md) 起草
4. **测试** — 并行启动子 agent：一个使用 skill，一个不使用 skill（基线）
5. **评估** — 为断言评分，审查基准测试（通过率、token、时间）
6. **迭代** — 根据反馈重写，在下一个迭代目录中重新运行，重复此过程
7. **优化描述** — 运行触发评估查询，目标准确率 ≥80%
8. **压力测试** — 对于纪律约束类 skill，记录 agent 的借口、危险信号和停止条件
   **现有 skill：**
9. **审计** — 运行下方的质量检查清单；识别违规项
10. **创建快照** — 进行任何编辑前执行 `cp -r <skill-dir> <workspace>/skill-snapshot/`
11. **改进 SKILL.md** — 修复违规项，压缩内容，将过长内容移至 `references/`
12. **测试** — 并行启动子 agent：一个使用新 skill，一个使用快照（基线）
13. **评估与迭代** — 与上述第 4–5 步相同
14. **优化描述** — 如果描述已更改，重新运行触发评估
15. **加固** — 在 agent 承压时仍会失败的地方添加合理化反制措施
    完整测试与迭代详情参见[评估工作流](references/eval-workflow.md)。

## 描述质量（激活）

- **第三人称表述**：使用 `Standardizes...`、`Audits...`、`Encrypts...`。避免使用“I will”或“This skill helps to”。
- **What + When 结构**：
- **What**：定义 5–8 项具体能力（例如，“生成 JWT token、轮换密钥”）。
- **When**：明确界定触发条件（例如，“当用户说‘轮换密钥’时使用”）。
- **具体性**：避免使用“manage”或“handle”等模糊动词。使用“Validate”“Inject”“Refactor”“Sanitize”。
- **触发提示**：技术类 skill 应包含 `(triggers: *.ext, keyword)` 后缀。
## 内容质量（实现）

- **无冗余知识**：**不要**解释 AI 已经掌握的概念（例如 HTTP 状态码、标准库文档、基础 SOLID 原则）。严格聚焦于_项目特定_规则。
- **穴居人式压缩**：规则使用“穴居人模式”以节省 token。删除冠词（, , ），移除填充词（“should”“will”“”），并使用电报式短句。
- _标准版_：“每次查询后都应确保关闭数据库连接，以防止泄漏。”（15 个 token）
- _穴居人版_：“查询后关闭数据库连接。防止泄漏。”（7 个 token）
- **可操作性**：示例必须可直接复制粘贴并执行。
- **工作流清晰度**：多步骤流程使用连续的有序列表。
- **渐进式披露**：将超过 10 行的代码块移至 `references/`。
- **压力加固**：纪律约束类 skill 必须明确指出危险信号、常见借口以及精确的停止/重启条件。
## 行为护栏

- **对规范类 Skill 使用压力测试**：TDD、调试、验证、审查、协议和工作流类 Skill 需要基线失败证据。
- **记录合理化借口**：保存智能体跳过规则时使用的原始借口。
- **添加危险信号**：使用简短语句提示智能体停止并重新执行协议。
- **将行为编码到评测中**：当 Skill 以护栏为导向时，添加 `pressure_scenarios`、`rationalizations`、`red_flags` 和 `behavior_assertions`。
- **保持内容就近存放**：将行为细节放在评测或 `references/` 中；保持 `SKILL.md` 简洁。
## 反模式

- **禁止“AI 式说教”**：除非某个模式是项目独有的约束，否则不要解释它为什么好。
- **禁止模糊触发条件**：切勿使用 `src/**` 或 `**/*`。要精准。
- **禁止描述膨胀**：如果描述超过 100 个单词，则部分能力应放入正文。
- **禁止长代码块**：>10 行 → 提取到 `references/`
- **禁止冗余**：不要在正文中重复 frontmatter 的内容
- **禁止未经测试的护栏**：从未经过压力测试的规则只是推测。
## 质量检查清单（与 Tessl 对齐）

- [ ] **激活率 ≥ 90%**：描述同时涵盖能力（“做什么”）和触发条件（“何时”）。
- [ ] **实现质量 ≥ 90%**：没有通用解释；所有示例均可执行。
- [ ] **结构合规性**：SKILL.md ≤ 100 行；代码块已移至 `references/`。
- [ ] 在应触发查询上的触发率 ≥80%。
- [ ] 护栏类 Skill 包含合理化借口、危险信号、行为评测字段，以及 `should_trigger`/`should_not_trigger` 用例。

## 参考资料

- [Skill 模板](references/TEMPLATE.md) — 从头创建新 Skill 时加载
- [反模式详解](references/anti-patterns.md) — 修复或审查反模式格式时加载
- [大小与限制](references/size-limits.md) — 当 SKILL.md 接近 100 行时加载
- [资源组织](references/resource-organization.md) — 决定内容应放置在何处（scripts/、references/、assets/）时加载
- [测试与触发率](references/testing.md) — 编写评测或测量触发率时加载
- [评测工作流](references/eval-workflow.md) — 运行并行子智能体测试时加载
- [完整生命周期](references/lifecycle.md) — 需要完整的分阶段创建指南时加载
- [Web 搜索研究](references/web-search-research.md) — 为不熟悉或非工程领域创建 Skill 时加载