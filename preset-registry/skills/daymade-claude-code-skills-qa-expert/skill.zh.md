---
name: qa-expert
description: This skill should be used when establishing comprehensive QA testing processes for any software project. Use when creating test strategies, writing test cases following Google Testing Standards, executing test plans, tracking bugs with P0-P4 classification, calculating quality metrics, or generating progress reports. Includes autonomous execution capability via master prompts and complete documentation templates for third-party QA team handoffs. Implements OWASP security testing and achieves 90% coverage targets.
keywords: [qa, testing, test-cases, bug-tracking, google-standards, owasp, security, automation, quality-gates, metrics]
---
# QA 专家

使用源自 Google 测试标准的成熟方法论和 OWASP 安全最佳实践，为任何软件项目建立世界一流的 QA 测试流程。

## 何时使用此技能

在以下情况下触发此技能：
- 为新项目或现有项目搭建 QA 基础设施
- 编写标准化测试用例（符合 AAA 模式）
- 执行全面的测试计划并跟踪进度
- 实施安全测试（OWASP Top 10）
- 提交缺陷并进行适当的严重程度分级（P0-P4）
- 生成 QA 报告（每日摘要、每周进度）
- 计算质量指标（通过率、覆盖率、质量门禁）
- 准备用于移交给第三方团队的 QA 文档
- 支持由 LLM 驱动的自主测试执行

## 快速开始

**单命令初始化**：
```bash
python scripts/init_qa_project.py <project-name> [output-directory]
```

**将创建的内容**：
- 目录结构（`tests/docs/`、`tests/e2e/`、`tests/fixtures/`）
- 跟踪 CSV（`TEST-EXECUTION-TRACKING.csv`、`BUG-TRACKING-TEMPLATE.csv`）
- 文档模板（`BASELINE-METRICS.md`、`WEEKLY-PROGRESS-REPORT.md`）
- 用于自主执行的 QA 主提示词
- 包含完整快速入门指南的 README

**对于自主执行**（推荐）：请参阅 `references/master_qa_prompt.md`——只需复制粘贴一条命令，即可将速度提升 100 倍。

## 核心能力

### 1. QA 项目初始化

使用所有模板初始化完整的 QA 基础设施：

```bash
python scripts/init_qa_project.py <project-name> [output-directory]
```

创建目录结构、跟踪 CSV、文档模板以及用于自主执行的主提示词。

**适用场景**：从零开始建立 QA，或迁移到结构化 QA 流程时。

### 2. 测试用例编写

按照 AAA 模式（Arrange-Act-Assert）编写标准化、可复现的测试用例：

1. 阅读模板：`assets/templates/TEST-CASE-TEMPLATE.md`
2. 遵循以下结构：前置条件（Arrange）→ 测试步骤（Act）→ 预期结果（Assert）
3. 分配优先级：P0（阻断）→ P4（低）
4. 包括边界情况和潜在缺陷

**测试用例格式**：TC-[CATEGORY]-[NUMBER]（例如 TC-CLI-001、TC-WEB-042、TC-SEC-007）

**参考资料**：有关完整的 AAA 模式指南和覆盖率阈值，请参阅 `references/google_testing_standards.md`。

### 3. 测试执行与跟踪

**事实基准原则**（关键）：
- **测试用例文档**（例如 `02-CLI-TEST-CASES.md`）= 测试步骤的**权威来源**
- **跟踪 CSV** = 仅用于记录执行状态（不要依赖 CSV 获取测试规范）
- 有关如何避免文档与 CSV 同步问题，请参阅 `references/ground_truth_principle.md`

**手动执行**：
1. 从分类文档（例如 `02-CLI-TEST-CASES.md`）中读取测试用例 ← **始终从这里开始**
2. 严格按照文档执行测试步骤
3. 每执行完一个测试后，**立即**更新 `TEST-EXECUTION-TRACKING.csv`（切勿批量更新）
4. 如果测试失败，请在 `BUG-TRACKING-TEMPLATE.csv` 中提交缺陷

**自主执行**（推荐）：
1. 从 `references/master_qa_prompt.md` 复制主提示词
2. 粘贴到 LLM 会话中
3. LLM 自动执行、自动跟踪、自动提交缺陷并自动生成报告

**创新性**：与手动操作相比速度提升 100 倍 + 跟踪过程零人为错误 + 自动恢复能力。

### 4. 缺陷报告

提交缺陷时应正确划分严重级别：

**必填字段**：
- 缺陷 ID：按顺序编号（BUG-001、BUG-002……）
- 严重级别：P0（24 小时内修复）→ P4（可选）
- 复现步骤：编号列出，具体明确
- 环境：操作系统、版本、配置

**严重级别分类**：
- **P0（阻断）**：安全漏洞、核心功能损坏、数据丢失
- **P1（严重）**：主要功能损坏，但存在变通方案
- **P2（高）**：次要功能问题、边缘情况
- **P3（中）**：外观问题
- **P4（低）**：文档拼写错误

**参考**：完整模板及示例请参阅 `BUG-TRACKING-TEMPLATE.csv`。

### 5. 质量指标计算

计算完整的 QA 指标和质量门禁状态：

```bash
python scripts/calculate_metrics.py <path/to/TEST-EXECUTION-TRACKING.csv>
```

**指标仪表板包括**：
- 测试执行进度（X/Y 个测试，完成 Z%）
- 通过率（已通过/已执行 %）
- 缺陷分析（唯一缺陷数、P0/P1/P2 分布）
- 质量门禁状态（每项门禁显示 ✅/❌）

**质量门禁**（发布前必须全部通过）：
| 门禁 | 目标 | 是否阻断 |
|------|--------|---------|
| 测试执行 | 100% | 是 |
| 通过率 | ≥80% | 是 |
| P0 缺陷 | 0 | 是 |
| P1 缺陷 | ≤5 | 是 |
| 代码覆盖率 | ≥80% | 是 |
| 安全性 | 90% OWASP | 是 |

### 6. 进度报告

为利益相关者生成 QA 报告：

**每日摘要**（每日结束时）：
- 已执行的测试、通过率、已提交的缺陷
- 阻断项（如无则填写 None）
- 明日计划

**每周报告**（每周五）：
- 使用模板：`WEEKLY-PROGRESS-REPORT.md`（由初始化脚本创建）
- 与基线比较：`BASELINE-METRICS.md`
- 评估质量门禁和趋势

**参考**：30 多个可直接使用的报告提示词请参阅 `references/llm_prompts_library.md`。

### 7. 安全测试（OWASP）

实施 OWASP 十大安全风险测试：

**覆盖率目标**：
1. **A01：访问控制失效** - RLS 绕过、权限提升
2. **A02：加密机制失效** - 令牌加密、密码哈希
3. **A03：注入** - SQL 注入、XSS、命令注入
4. **A04：不安全设计** - 速率限制、异常检测
5. **A05：安全配置错误** - 过于详细的错误信息、默认凭据
6. **A07：身份认证失效** - 会话劫持、CSRF
7. **其他**：数据完整性、日志记录、SSRF

**目标**：OWASP 覆盖率达到 90%（缓解 10 项威胁中的 9 项）。

每项安全测试均遵循 AAA 模式，并记录具体的攻击向量。

## 第 1 天入职指南

新加入项目的 QA 工程师需完成 5 小时的入职指南：

**阅读**：`references/day1_onboarding.md`

**时间安排**：
- 第 1 小时：环境设置（数据库、开发服务器、依赖项）
- 第 2 小时：文档审阅（测试策略、质量门禁）
- 第 3 小时：测试数据设置（用户、CLI、DevTools）
- 第 4 小时：执行第一个测试用例
- 第 5 小时：团队入职介绍与第 1 周规划

**检查点**：第 1 天结束前，环境正常运行，已执行第一个测试，并为第 1 周做好准备。

## 自主执行（⭐ 推荐）

通过单个主提示词启用由 LLM 驱动的自主 QA 测试：

**阅读**：`references/master_qa_prompt.md`

**功能**：
- 从上次完成的测试处自动恢复（读取跟踪 CSV）
- 自动执行测试用例（按第 1-5 周的进度推进）
- 自动跟踪结果（每次测试后更新 CSV）
- 自动提交缺陷（为失败测试创建缺陷报告）
- 自动生成报告（每日摘要、每周报告）
- 自动升级 P0 缺陷（停止测试并通知利益相关者）

**优势**：
- 执行速度比手动方式快 100 倍
- 跟踪过程零人为错误
- 缺陷文档保持一致
- 可即时查看进度

**用法**：复制主提示词，将其粘贴到 LLM 中，让它自主运行 5 周。

## 针对你的项目进行调整

### 小型项目（50 个测试）
- 时间线：2 周
- 类别：2-3 个（例如，前端、后端）
- 每日：5-7 个测试
- 报告：仅每日摘要

### 中型项目（200 个测试）
- 时间线：4 周
- 类别：4-5 个（CLI、Web、API、DB、安全）
- 每日：10-12 个测试
- 报告：每日 + 每周

### 大型项目（500+ 个测试）
- 时间线：8-10 周
- 类别：6-8 个（多个组件）
- 每日：10-15 个测试
- 报告：每日 + 每周 + 每两周一次的利益相关者报告

## 参考文档

通过随附的参考资料获取详细指南：

- **`references/day1_onboarding.md`** - 面向新 QA 工程师的 5 小时入职指南
- **`references/master_qa_prompt.md`** - 用于 LLM 自主执行的单条命令（速度提升 100 倍）
- **`references/llm_prompts_library.md`** - 30+ 个可直接用于特定 QA 任务的提示词
- **`references/google_testing_standards.md`** - AAA 模式、覆盖率阈值、快速失败验证
- **`references/ground_truth_principle.md`** - 防止文档/CSV 同步问题（对测试套件完整性至关重要）

## 资源与模板

测试用例模板和缺陷报告格式：

- **`assets/templates/TEST-CASE-TEMPLATE.md`** - 包含 CLI 和安全示例的完整模板

## 脚本

用于 QA 基础设施的自动化脚本：

- **`scripts/init_qa_project.py`** - 初始化 QA 基础设施（单条命令完成设置）
- **`scripts/calculate_metrics.py`** - 生成质量指标仪表板

## 常见模式

### 模式 1：从零开始开展 QA
```
1. python scripts/init_qa_project.py my-app ./
2. Fill in BASELINE-METRICS.md (document current state)
3. Write test cases using assets/templates/TEST-CASE-TEMPLATE.md
4. Copy master prompt from references/master_qa_prompt.md
5. Paste to LLM → autonomous execution begins
```

### 模式 2：LLM 驱动的测试（自主执行）
```
1. Read references/master_qa_prompt.md
2. Copy the single master prompt (one paragraph)
3. Paste to LLM conversation
4. LLM executes all 342 test cases over 5 weeks
5. LLM updates tracking CSVs automatically
6. LLM generates weekly reports automatically
```

### 模式 3：添加安全测试
```
1. Read references/google_testing_standards.md (OWASP section)
2. Write TC-SEC-XXX test cases for each OWASP threat
3. Target 90% coverage (9/10 threats)
4. Document mitigations in test cases
```

### 模式 4：第三方 QA 交接
```
1. Ensure all templates populated
2. Verify BASELINE-METRICS.md complete
3. Package tests/docs/ folder
4. Include references/master_qa_prompt.md for autonomous execution
5. QA team can start immediately (Day 1 onboarding → 5 weeks testing)
```

## 成功标准

当满足以下条件时，此技能才算有效：
- ✅ 任何工程师都能复现测试用例
- ✅ 质量门禁得到客观衡量
- ✅ 缺陷得到完整记录，并包含复现步骤
- ✅ 可实时查看进度（CSV 跟踪）
- ✅ 支持自主执行（LLM 可执行完整计划）
- ✅ 第三方 QA 团队可以立即开始测试