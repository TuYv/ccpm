---
name: common-task-complexity-routing
description: Scores a coding task on Spread, Novelty, and Centrality (SNC 0-6) and maps the tier to autonomy, verification depth, review mode, reviewers, model tier. Use when sizing a fix or feature before planning, choosing fast vs deep review, or deciding whether HARD STOP approval is required.
guardrail: true
metadata:
  triggers:
    keywords:
      - task complexity
      - snc score
      - complexity tier
      - difficulty tier
      - autonomy level
      - review depth
      - model tier
      - how big is this change
---
# 任务复杂度路由（SNC）

## **优先级：P1（高）**

相同的工单标签，工程难度可能不同。评估任务，而不是标签，然后按层级路由。

## 评分

| 维度 | 0 | 1 | 2 |
| --- | --- | --- | --- |
| **影响范围**（变更触及的范围） | 一个文件、一个模块 | 多个文件、一个模块 | 跨模块或跨服务 |
| **新颖性**（新行为还是现有行为） | 对现有行为进行小幅编辑或移除 | 修改现有逻辑 | 新增行为或重写 |
| **核心程度**（被触及代码的核心性） | 外围代码 | 共享但非核心 | 核心领域、关键路径、身份验证、资金、信任边界 |

将三个维度相加，不要取平均值。输出行：`SNC: S=[0-2] N=[0-2] C=[0-2] total=[n] tier=[low|medium|high]`。

## 层级

- `tier=low`：总分 0-2
- `tier=medium`：总分 3-4
- `tier=high`：总分 5-6

## 路由

| 层级 | 自主程度 | 验证 | 评审 | 审批 | `model_tier` |
| --- | --- | --- | --- | --- | --- |
| `tier=low` | 自主执行 | 基础：聚焦测试 + lint | `fast` 代码评审 | 无需审批 | `fast` |
| `tier=medium` | 指导执行 | TDD + 自我评审 | `deep` 代码评审 | 计划经评审，无需 HARD STOP | `standard` |
| `tier=high` | 先制定计划 | TDD + 独立评审者（相关时包括 `specialist-architecture-guard`、`specialist-security-reviewer`） | `deep` 代码评审 | **HARD STOP**：编码前必须暂停，合并前需要人工审批 | `strong` |

## 规则

- 在制定计划前评分；在每个 Handoff Payload 中输出 `snc_tier` 和 `model_tier`。
- 如果仅根据工单文本得出评分，将该评分标记为推断；在 `specialist-codebase-scout` 报告影响范围后重新评分。
- 有疑问时向上取整。任何涉及身份验证、资金、信任边界或关键路径的变更，C=2。
- 任务进行期间范围扩大时重新评分；工作开始后，层级只能上升，不能下降。
- 绝不能为了跳过门禁而降低层级。工单类型（缺陷还是功能）永远不能决定层级。

## 危险信号

当听到或想到以下说法时，停止并重新评分：“只是一个缺陷修复”“只改一行”“跳过计划吧，这很小”“我们之后再评审”“把它标为低级，这样今晚就能合并”。每一种说法都是合理化，而不是评分依据。

## 反模式

- **不按工单类型决定层级**：“缺陷”和“功能”无法说明 S、N 或 C。
- **不取平均值**：三个 1 分与一个 2/0/1 只有在求和时才会采用不同的路由。
- **不允许默认为层级**：缺少 `snc_tier` 的计划或交接内容是不完整的。
- **高级层级必须列出指定评审者**：`tier=high` 必须列出合并前负责评审的专家。

## 参考资料

- [SNC 评分标准及示例](references/snc-rubric.md)
- [路由表详情](references/routing-table.md)