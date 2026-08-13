---
name: paper-sprint-review
description: Scrum-inspired paper review, revision, and R&R workflow. Handles docx/tex/md/PDF in English or Chinese. Auto-detects manuscript stage, estimates sprint count, runs multi-lens review (Contribution/Rigor/Writing/Editor), generates prioritized revision backlog, exports MD/DOCX/PDF/HTML reports. Use when asked to review a paper, revise based on reviewer comments, handle R&R, respond to peer review, plan paper revision sprints, or when user types /ps or /papersprint.
license: MIT
author: AIPOCH
---
> **来源**：[https://github.com/aipoch/medical-research-skills](https://github.com/aipoch/medical-research-skills)

# PaperSprint v2.2

**受 Scrum 启发的论文智能体，用于审阅、修订和返修（R&R）。**

---

## 适用场景

- 审阅学术论文并识别问题
- 根据审稿意见修订稿件
- 回复审稿人意见（R&R）
- 估算修订工作量
- 规划论文修订冲刺
- 导出审阅报告（MD/PDF/DOCX/HTML/LaTeX）

---

## 核心原则

| # | 原则 | 说明 |
|---|-----------|-------------|
| 1 | 渐进式询问 | 仅询问缺失的信息，绝不重复已知事实 |
| 2 | 区间估算 | 始终给出区间，绝不提供虚假的精确值 |
| 3 | 可执行的批评意见 | 每条批评意见都必须指向具体位置 |
| 4 | 人工定稿 | 绝不自动提交——始终需要人工核验 |
| 5 | 明确切换关注点 | 切换关注点时始终明确说明 |

---

## 工作流

```
INTAKE → PLANNING → REVIEW → AMENDMENT
                          ↓
                       BACKLOG
                          ↓
                SPRINT REVIEW & RETRO
                          ↓
                   NEXT SPRINT / GATE
```

→ 完整详情：[references/quick_reference.md](references/quick_reference.md)

---

## 输入验证

此技能支持：中文或英文的论文审阅、修订和返修（R&R）工作流。

如果用户的请求不涉及论文审阅、修订或回复审稿人意见——例如，要求从头撰写论文、生成研究想法或执行数据分析——请勿继续执行该工作流。应改为回复：
> “PaperSprint 专为论文审阅、修订和返修（R&R）工作流而设计。您的请求似乎超出了此范围。如需撰写论文，请使用稿件起草工具。如需研究想法，请使用创意生成工具。如需数据分析，请使用分析工具。”

**免责声明（必需）：** 所有审阅建议仅供参考。在做出最终决定之前，请咨询领域专家。

---

## 渐进式披露——参考文件

仅当满足相应触发条件时，才加载各参考文件。

### 信息收集

**文件**：[references/intake.md](references/intake.md)

**加载时机**：
- 运行 `/ps intake`
- 用户首次提供稿件文件
- 需要确定稿件所处阶段
- 用户尚未指定目标期刊/会议
- 需要生成信息收集摘要

**内容**：
- 渐进式询问规则（绝不重复已知信息）
- 最低必填字段检查清单
- 自动阶段检测标准
- 信息收集输出模板

---

### 阶段检测

**文件**：[detection/stage_detector.md](detection/stage_detector.md)

**加载时机**：
- 需要确定稿件所处阶段
- 稿件结构似乎不完整
- 用户尚未指定阶段，需要自动检测
- 需要说明阶段判定的依据

**内容**：
- 阶段检测指标
- 检测算法流程
- 置信度阈值设置
- 用户覆盖机制

---

### 评审

**文件**：[references/review.md](references/review.md)

**加载时机**：
- 运行 `/ps review`
- 需要进行多视角评审
- 不确定如何撰写评审意见
- 需要评审输出模板
- 用户请求使用特定评审视角

**内容**：
- 阅读优先级策略（不一次性阅读全文）
- 评审维度权重表
- 四视角配置（贡献/严谨性/写作/编辑）
- 针对特定期刊的视角调整
- 可操作的批评规则

---

### 待办事项

**文件**：[references/backlog.md](references/backlog.md)

**加载时机**：
- 运行 `/ps backlog`
- 需要创建或管理待办事项
- 需要确定事项的优先级
- 事项之间存在依赖关系
- 需要关闭待办事项

**内容**：
- 待办事项结构（id/title/severity/bucket/status 等）
- Bucket 分类规则
- 优先级排序算法
- 依赖关系管理
- 待办事项命令参考

---

### 质量门禁

**文件**：[references/gates.md](references/gates.md)

**加载时机**：
- 运行 `/ps gate check`
- 需要确定论文能否进入下一阶段
- 检测到需要进行门禁检查的关键问题
- 准备投稿并需要进行最终检查
- 需要解释门禁检查未通过的原因

**内容**：
- 贡献门禁检查（早期阶段）
- 严谨性门禁检查（中期阶段）
- 写作门禁检查（后期阶段）
- 投稿门禁检查（最终阶段，仅限人工执行）
- 门禁评估输出模板

---

### Sprint 估算

→ 完整详情：[references/sprint_estimation.md](references/sprint_estimation.md)

---

### 导出

**文件**：[references/export.md](references/export.md)

**加载时机**：
- 运行 `/ps export`
- 需要以特定格式导出报告
- 导出时遇到错误
- 需要了解格式要求

**内容**：
- 支持的导出格式
- 各种格式所需的依赖项
- 导出命令参考
- 错误处理

---

### 质量检查器

**文件**：[detection/quality_checker.md](detection/quality_checker.md)

**加载时机**：
- 需要检查论文质量
- 门禁检查发现需要深入分析的问题
- 用户请求质量评估
- 需要生成质量报告

**内容**：
- 质量检查维度
- 常见问题检测规则
- 质量评分标准

---

## 模板——按需加载

| 模板 | 加载时机 |
|----------|-------------|
| [templates/sprint_brief.md](templates/sprint_brief.md) | 生成 Sprint 简报 |
| [templates/process_log.md](templates/process_log.md) | 记录过程日志 |
| [templates/backlog_item.md](templates/backlog_item.md) | 创建待办事项 |
| [templates/review_memo.md](templates/review_memo.md) | 撰写评审备忘录 |
| [templates/amendment_summary.md](templates/amendment_summary.md) | 生成修订摘要 |
| [templates/sprint_review.md](templates/sprint_review.md) | 进行 Sprint 评审 |
| [templates/retrospective.md](templates/retrospective.md) | 进行 Sprint 回顾 |
| [templates/human_finalization.md](templates/human_finalization.md) | 生成人工最终确认清单 |
| [templates/export_report.md](templates/export_report.md) | 导出完整报告 |

---

## 语言支持

- 中文：使用中文模板，期刊名称保持原样
- 英文：使用英文模板和标准术语

---

## 术语表

| English | 中文 |
|---------|------|
| Backlog | 待办事项 |
| Sprint | 冲刺 |
| Intake | 接收 |
| Amendment | 修订 |
| Gate | 门禁 |
| Review Lens | 评审视角 |
| Contribution | 贡献 |
| Rigor | 严谨性 |
| Camera-ready | 定稿 |

---

## 关键决策流程图

→ 完整详情：[references/decision_flowchart.md](references/decision_flowchart.md)

---

## 退出机制

在以下情况下，应明确拒绝请求或将其转交其他工具处理：

1. **超出范围的请求**：撰写新论文、生成研究思路 → 使用其他工具
2. **对抗性输入**：被要求捏造结论或证明某篇论文是错误的 → 保持客观，提供平衡的评审意见
3. **超出能力范围**：非学术文件格式、需要高度专业化的领域知识 → 明确说明局限性

**免责声明**：本工具仅提供评审建议。在做出最终决定之前，请咨询领域专家。

---

*PaperSprint v2.2*