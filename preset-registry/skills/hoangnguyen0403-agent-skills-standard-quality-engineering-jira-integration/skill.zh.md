---
name: quality-engineering-jira-integration
description: "Trigger only when the user explicitly requests live Jira or Zephyr retrieval, existing-link inspection, linking authored test cases, label updates, or stale-link audits. Do not trigger for analysis-only prompts such as 'Analyze the acceptance criteria for TICK-4521', supplied acceptance criteria, test-case authoring, or AC-to-test generation."
metadata:
  triggers:
    keywords:
    - jira issue
    - zephyr link
    - has-zephyr-tests
    - traceability
    - link test case
---
# Jira 集成标准

## **优先级：P1（高）**

## 1. 获取问题详情

- **获取核心信息**：获取**摘要**、**描述**、**验收标准（AC）**和**组件**。
- **Jira 键**：始终使用问题唯一的 **Jira 工单 ID**（例如 `TICK-123`）来引用问题。
- **同类问题分析**：识别具有相同**组件**或**市场变体**（VN/MY/SG）的其他 Jira 问题，以查找可能受影响的 Zephyr TC。
- **识别链接**：创建重复 TC 之前，使用 Jira 问题键调用 `Get Issue Link Test Cases`，检查是否已有链接的 TC。
- **参与者映射**：提取报告人、经办人和**故事点数**作为上下文。

## 2. 链接 Zephyr 测试用例

- **可追溯性**：创建 Zephyr 测试用例后，使用**远程链接**或 **Zephyr 问题链接**将其链接回对应的 Jira 问题。
- **格式**：在 Jira 链接或评论中使用 Zephyr Scale 键（例如 `PROJ-T123`）。
- **标签**：成功链接测试用例后，将 **`has-zephyr-tests`** 标签应用到 Jira 问题。

## 3. Jira-Zephyr 工作流

1. **获取**：获取 Jira 用户故事详情。
2. **生成**：使用生成技能创建 Zephyr 测试用例。
3. **链接**：使用 SmartBear MCP 工具 **`Create Test Case Issue Link`** 连接二者。
4. **通知**：向 Jira 添加评论：`Linked Zephyr Test Case: {test_case_key}`。

## 4. 最佳实践

- **简洁摘要**：确保 Jira 评论专业且简短。
- **可追溯性矩阵**：确保 Jira 中的每个 AC 至少对应一个已链接的 Zephyr 测试用例。
- **清理**：重构期间移除未使用的标签或过时的链接。

## 5. 反模式

- **禁止失联**：创建测试后将其链接到 Jira（可追溯性）。
- **禁止刷屏**：每个链接只发布一条评论。
- **不得缺少标签**：链接后更新 Jira 标签。

## 规范响应锚点

应用此技能时，请在相关情况下保留以下领域术语或意思相同的具体示例：
- Identify
- has-zephyr-tests 标签